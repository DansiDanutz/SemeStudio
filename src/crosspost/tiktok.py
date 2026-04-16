from __future__ import annotations
"""TikTok cross-posting service — creates and uploads short clips."""

import logging
import subprocess
from pathlib import Path
from typing import Optional

import httpx

from src.config import config
from src.crosspost.orchestrator import CrossPostResult

logger = logging.getLogger(__name__)


class TikTokService:
    """Handles TikTok clip creation and upload."""

    def __init__(self):
        self.access_token = config.tiktok.access_token
        self.client_key = config.tiktok.client_key
        self.base_url = "https://open.tiktokapis.com/v2"

    async def post_clip(
        self,
        video_path: str,
        title: str,
        description: str,
        youtube_url: str = "",
    ) -> CrossPostResult:
        """
        Create a 60-second clip from the video and upload to TikTok.

        Args:
            video_path: Path to the full video file.
            title: Video title (used as caption).
            description: Description (appended to caption).
            youtube_url: YouTube URL to reference.

        Returns:
            CrossPostResult with the outcome.
        """
        if not self.access_token:
            return CrossPostResult(
                platform="tiktok", success=False, error="TikTok access token not configured"
            )

        # Step 1: Create the short clip (first 60 seconds)
        clip_path = self._create_clip(video_path)
        if not clip_path:
            return CrossPostResult(
                platform="tiktok", success=False, error="Failed to create TikTok clip"
            )

        try:
            # Step 2: Initiate upload to TikTok
            upload_url = await self._initiate_upload(clip_path)

            # Step 3: Upload the video file
            await self._upload_video(upload_url, clip_path)

            # Step 4: Publish with caption
            result = await self._publish(
                title=title,
                description=description,
                youtube_url=youtube_url,
            )

            return result

        except Exception as e:
            logger.error("TikTok upload failed: %s", e)
            return CrossPostResult(platform="tiktok", success=False, error=str(e))
        finally:
            # Clean up the temporary clip
            if clip_path and Path(clip_path).exists():
                Path(clip_path).unlink(missing_ok=True)

    def _create_clip(self, video_path: str, duration: int = 60) -> Optional[str]:
        """
        Extract the first N seconds of the video as a TikTok clip.

        Uses ffmpeg to create a short clip.
        """
        video_path = Path(video_path)
        clip_path = video_path.with_suffix(f".tiktok_clip{video_path.suffix}")

        try:
            cmd = [
                "ffmpeg",
                "-y",
                "-i",
                str(video_path),
                "-t",
                str(duration),
                "-c",
                "copy",
                "-an",  # Try without re-encoding audio first
                str(clip_path),
            ]
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)

            if result.returncode != 0:
                # Retry with re-encoding (some formats need it)
                cmd = [
                    "ffmpeg",
                    "-y",
                    "-i",
                    str(video_path),
                    "-t",
                    str(duration),
                    "-c:v",
                    "libx264",
                    "-preset",
                    "fast",
                    "-c:a",
                    "aac",
                    str(clip_path),
                ]
                result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
                if result.returncode != 0:
                    logger.error("ffmpeg failed: %s", result.stderr)
                    return None

            logger.info("Created TikTok clip: %s (%d seconds)", clip_path, duration)
            return str(clip_path)

        except FileNotFoundError:
            logger.warning(
                "ffmpeg not found — TikTok clip creation requires ffmpeg installed"
            )
            return None
        except subprocess.TimeoutExpired:
            logger.error("ffmpeg timed out creating TikTok clip")
            return None

    async def _initiate_upload(self, clip_path: str) -> str:
        """Initiate a chunked upload session with TikTok API."""
        file_size = Path(clip_path).stat().st_size
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{self.base_url}/video/upload/",
                headers={
                    "Authorization": f"Bearer {self.access_token}",
                    "Content-Type": "application/json",
                },
                json={
                    "source_info": {
                        "source": "FILE_UPLOAD",
                        "video_size": file_size,
                    },
                    "post_info": {
                        "title": "",
                        "privacy_level": "SELF_ONLY",  # Start private, publish after
                    },
                },
            )
            resp.raise_for_status()
            data = resp.json()
            return data.get("upload_url", "")

    async def _upload_video(self, upload_url: str, clip_path: str) -> None:
        """Upload the video file to TikTok."""
        async with httpx.AsyncClient(timeout=300) as client:
            with open(clip_path, "rb") as f:
                resp = await client.put(
                    upload_url,
                    content=f.read(),
                    headers={"Content-Type": "video/mp4"},
                )
                resp.raise_for_status()

    async def _publish(
        self, title: str, description: str, youtube_url: str
    ) -> CrossPostResult:
        """Publish the uploaded video on TikTok."""
        caption = f"{title}\n\n{description[:100]}"
        if youtube_url:
            caption += f"\n\nFull video: {youtube_url}"

        # TikTok API: create the post
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{self.base_url}/video/publish/",
                headers={
                    "Authorization": f"Bearer {self.access_token}",
                    "Content-Type": "application/json",
                },
                json={
                    "post_info": {
                        "title": caption[:2200],  # TikTok caption limit
                        "privacy_level": "PUBLIC",
                    },
                },
            )
            resp.raise_for_status()
            data = resp.json()
            video_id = data.get("video_id", "")
            share_url = data.get("share_url", "")

            return CrossPostResult(
                platform="tiktok",
                success=True,
                url=share_url or f"https://www.tiktok.com/@user/video/{video_id}",
                external_id=video_id,
            )
