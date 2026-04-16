from __future__ import annotations
"""Instagram cross-posting service — creates Reels from video content."""

import logging
import subprocess
from pathlib import Path
from typing import Optional

import httpx

from src.config import config
from src.crosspost.orchestrator import CrossPostResult

logger = logging.getLogger(__name__)


class InstagramService:
    """Handles Instagram Reel creation and upload via Graph API."""

    def __init__(self):
        self.access_token = config.instagram.access_token
        self.account_id = config.instagram.account_id
        self.base_url = f"https://graph.facebook.com/v18.0/{self.account_id}"

    async def post_reel(
        self,
        video_path: str,
        title: str,
        description: str,
        youtube_url: str,
        thumbnail_path: Optional[str] = None,
    ) -> CrossPostResult:
        """
        Create and publish an Instagram Reel.

        Uses the Instagram Graph API Content Publishing workflow:
        1. Upload video to get a container ID
        2. Publish the container

        Args:
            video_path: Path to the video file.
            title: Video title.
            description: Video description.
            youtube_url: YouTube URL to reference.
            thumbnail_path: Optional cover image.

        Returns:
            CrossPostResult with the outcome.
        """
        if not self.access_token or not self.account_id:
            return CrossPostResult(
                platform="instagram",
                success=False,
                error="Instagram credentials not configured",
            )

        try:
            # Step 1: Create a short reel version (90 seconds max for API)
            reel_path = self._create_reel_clip(video_path)

            # Step 2: Upload the video to get a container ID
            caption = f"{title}\n\n{description[:2000]}"
            if youtube_url:
                caption += f"\n\nFull video: {youtube_url}"

            container_id = await self._create_container(
                video_url_or_path=reel_path or video_path,
                caption=caption,
                thumbnail_path=thumbnail_path,
            )

            if not container_id:
                return CrossPostResult(
                    platform="instagram",
                    success=False,
                    error="Failed to create Instagram container",
                )

            # Step 3: Publish the container
            reel_url = await self._publish_container(container_id)

            return CrossPostResult(
                platform="instagram",
                success=True,
                url=reel_url or f"https://www.instagram.com/reel/{container_id}",
                external_id=container_id,
            )

        except Exception as e:
            logger.error("Instagram Reel failed: %s", e)
            return CrossPostResult(platform="instagram", success=False, error=str(e))
        finally:
            # Clean up temp reel clip
            if reel_path and Path(reel_path).exists():
                Path(reel_path).unlink(missing_ok=True)

    def _create_reel_clip(self, video_path: str, duration: int = 60) -> Optional[str]:
        """Create a short clip suitable for Instagram Reels (9:16 aspect ratio)."""
        video_path_obj = Path(video_path)
        reel_path = video_path_obj.with_suffix(f".ig_reel{video_path_obj.suffix}")

        try:
            # Create a 9:16 cropped version, max 60 seconds
            cmd = [
                "ffmpeg",
                "-y",
                "-i",
                str(video_path_obj),
                "-t",
                str(duration),
                "-vf",
                "crop=ih*9/16:ih,scale=1080:1920",
                "-c:v",
                "libx264",
                "-preset",
                "fast",
                "-c:a",
                "aac",
                str(reel_path),
            ]
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
            if result.returncode != 0:
                logger.error("ffmpeg failed for IG Reel: %s", result.stderr)
                return None

            logger.info("Created Instagram Reel clip: %s", reel_path)
            return str(reel_path)

        except FileNotFoundError:
            logger.warning("ffmpeg not found — Instagram Reel requires ffmpeg")
            return None

    async def _create_container(
        self,
        video_url_or_path: str,
        caption: str,
        thumbnail_path: Optional[str] = None,
    ) -> Optional[str]:
        """Create a media container on Instagram."""
        params = {
            "access_token": self.access_token,
            "video_url": video_url_or_path,
            "caption": caption[:2200],
            "media_type": "REELS",
        }

        if thumbnail_path:
            # Upload cover image first, then reference it
            # Note: Instagram API uses the thumbnail_url parameter
            params["thumb_offset"] = "0"

        try:
            async with httpx.AsyncClient(timeout=60) as client:
                resp = await client.post(
                    f"{self.base_url}/media",
                    params=params,
                )
                resp.raise_for_status()
                data = resp.json()
                return data.get("id")

        except Exception as e:
            logger.error("Failed to create Instagram container: %s", e)
            return None

    async def _publish_container(self, container_id: str) -> Optional[str]:
        """Publish a media container on Instagram."""
        try:
            # Wait for container to be ready (poll status)
            await self._wait_for_container_ready(container_id)

            async with httpx.AsyncClient() as client:
                resp = await client.post(
                    f"{self.base_url}/media_publish",
                    params={
                        "access_token": self.access_token,
                        "creation_id": container_id,
                    },
                )
                resp.raise_for_status()
                data = resp.json()
                return data.get("id")

        except Exception as e:
            logger.error("Failed to publish Instagram container: %s", e)
            return None

    async def _wait_for_container_ready(
        self, container_id: str, max_wait: int = 60, poll_interval: int = 5
    ) -> bool:
        """Wait for the media container to be ready for publishing."""
        import asyncio

        elapsed = 0
        while elapsed < max_wait:
            try:
                async with httpx.AsyncClient() as client:
                    resp = await client.get(
                        f"{self.base_url}/{container_id}",
                        params={
                            "access_token": self.access_token,
                            "fields": "status_code",
                        },
                    )
                    resp.raise_for_status()
                    data = resp.json()

                    status = data.get("status_code")
                    if status == "FINISHED":
                        return True
                    if status == "ERROR":
                        logger.error("Instagram container processing failed")
                        return False

                    logger.info("Instagram container status: %s, waiting...", status)

            except Exception as e:
                logger.warning("Error checking container status: %s", e)

            await asyncio.sleep(poll_interval)
            elapsed += poll_interval

        logger.warning("Timed out waiting for Instagram container to be ready")
        return False
