from __future__ import annotations
"""LinkedIn cross-posting service."""

import logging
from typing import Optional

import httpx

from src.config import config
from src.crosspost.orchestrator import CrossPostResult

logger = logging.getLogger(__name__)


class LinkedInService:
    """Handles LinkedIn post creation with video/image."""

    def __init__(self):
        self.access_token = config.linkedin.access_token
        self.person_id = config.linkedin.person_id
        self.base_url = "https://api.linkedin.com/v2"

    async def post_article(
        self,
        title: str,
        description: str,
        youtube_url: str,
        thumbnail_path: Optional[str] = None,
    ) -> CrossPostResult:
        """
        Create a LinkedIn post about the YouTube video.

        Creates a text post with the YouTube link and optional image.

        Args:
            title: Video title.
            description: Video description.
            youtube_url: YouTube video URL.
            thumbnail_path: Optional thumbnail to attach as image.

        Returns:
            CrossPostResult with the outcome.
        """
        if not self.access_token:
            return CrossPostResult(
                platform="linkedin",
                success=False,
                error="LinkedIn access token not configured",
            )

        try:
            # Truncate description for LinkedIn (3000 char limit)
            post_text = f"🎬 {title}\n\n"
            post_text += description[:500]
            if len(description) > 500:
                post_text += "..."
            post_text += f"\n\n▶️ Watch the full video: {youtube_url}"

            # Create the share/post
            share_url = await self._create_share(post_text, thumbnail_path)

            return CrossPostResult(
                platform="linkedin",
                success=True,
                url=share_url,
                external_id=share_url.split("/")[-1] if "/" in share_url else "",
            )

        except Exception as e:
            logger.error("LinkedIn post failed: %s", e)
            return CrossPostResult(platform="linkedin", success=False, error=str(e))

    async def _create_share(self, text: str, thumbnail_path: Optional[str] = None) -> str:
        """Create a LinkedIn share post."""
        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json",
            "X-Restli-Protocol-Version": "2.0.0",
        }

        # Build the post body
        body = {
            "author": f"urn:li:person:{self.person_id}",
            "lifecycleState": "PUBLISHED",
            "specificContent": {
                "com.linkedin.ugc.ShareContent": {
                    "shareCommentary": {
                        "text": text,
                    },
                    "shareMediaCategory": "NONE",
                },
            },
            "visibility": {
                "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
            },
        }

        # If we have a thumbnail, register it as an image first
        if thumbnail_path:
            media_urn = await self._register_image(thumbnail_path)
            if media_urn:
                body["specificContent"]["com.linkedin.ugc.ShareContent"][
                    "shareMediaCategory"
                ] = "IMAGE"
                body["specificContent"]["com.linkedin.ugc.ShareContent"]["media"] = [
                    {
                        "status": "READY",
                        "media": media_urn,
                    }
                ]

        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{self.base_url}/ugcPosts",
                headers=headers,
                json=body,
            )
            resp.raise_for_status()
            data = resp.json()

            # Extract the post URL
            activity_urn = data.get("id", "")
            # activity_urn is like "urn:li:share:7123456789"
            share_id = activity_urn.split(":")[-1] if ":" in activity_urn else ""
            return f"https://www.linkedin.com/feed/update/{activity_urn}"

    async def _register_image(self, image_path: str) -> Optional[str]:
        """Register an image asset on LinkedIn."""
        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json",
            "X-Restli-Protocol-Version": "2.0.0",
        }

        try:
            # Step 1: Register upload
            resp = await httpx.AsyncClient().post(
                f"{self.base_url}/images?action=initializeUpload",
                headers=headers,
                json={
                    "initializeUploadRequest": {
                        "owner": f"urn:li:person:{self.person_id}",
                    },
                },
            )
            resp.raise_for_status()
            data = resp.json()

            upload_url = data["value"]["uploadUrl"]
            image_urn = data["value"]["image"]

            # Step 2: Upload the image
            with open(image_path, "rb") as f:
                await httpx.AsyncClient().put(
                    upload_url,
                    content=f.read(),
                    headers={"Content-Type": "image/jpeg"},
                )

            return image_urn

        except Exception as e:
            logger.warning("Failed to register image on LinkedIn: %s", e)
            return None
