from __future__ import annotations
"""Cross-posting orchestrator for multi-platform publishing."""

import logging
from pathlib import Path
from typing import Optional

from src.config import config

logger = logging.getLogger(__name__)

# Supported platforms
PLATFORMS = ["tiktok", "linkedin", "twitter", "instagram"]


class CrossPostResult:
    """Result of a cross-post operation."""

    def __init__(self, platform: str, success: bool, url: str = "", error: str = "", external_id: str = ""):
        self.platform = platform
        self.success = success
        self.url = url
        self.error = error
        self.external_id = external_id

    def to_dict(self) -> dict:
        return {
            "platform": self.platform,
            "success": self.success,
            "url": self.url,
            "error": self.error,
            "external_id": self.external_id,
        }


class CrossPostOrchestrator:
    """Coordinates cross-platform posting after YouTube upload."""

    def __init__(self):
        self.enabled_platforms: set[str] = set()
        self._services: dict = {}

    def enable_platform(self, platform: str, service):
        """Register a platform service for posting."""
        if platform not in PLATFORMS:
            raise ValueError(f"Unsupported platform: {platform}. Must be one of {PLATFORMS}")
        self._services[platform] = service
        self.enabled_platforms.add(platform)
        logger.info("Enabled platform: %s", platform)

    async def cross_post_all(
        self,
        queue_id: str,
        video_path: str,
        youtube_url: str,
        youtube_video_id: str,
        title: str,
        description: str,
        thumbnail_path: Optional[str] = None,
        platforms: Optional[list[str]] = None,
    ) -> list[CrossPostResult]:
        """
        Post to all enabled platforms.

        Args:
            queue_id: The yt_upload_queue record ID.
            video_path: Path to the original video file.
            youtube_url: URL of the published YouTube video.
            youtube_video_id: YouTube video ID.
            title: Video title.
            description: Video description.
            thumbnail_path: Optional thumbnail image path.
            platforms: Specific platforms to post to (defaults to all enabled).

        Returns:
            List of CrossPostResult objects.
        """
        target_platforms = platforms or list(self.enabled_platforms)
        results = []

        for platform in target_platforms:
            service = self._services.get(platform)
            if not service:
                logger.warning("No service registered for platform: %s", platform)
                results.append(
                    CrossPostResult(platform=platform, success=False, error="No service configured")
                )
                continue

            try:
                logger.info("Cross-posting to %s...", platform)

                if platform == "tiktok":
                    result = await service.post_clip(
                        video_path=video_path,
                        title=title,
                        description=description,
                        youtube_url=youtube_url,
                    )
                elif platform == "linkedin":
                    result = await service.post_article(
                        title=title,
                        description=description,
                        youtube_url=youtube_url,
                        thumbnail_path=thumbnail_path,
                    )
                elif platform == "twitter":
                    result = await service.post_thread(
                        title=title,
                        description=description,
                        youtube_url=youtube_url,
                    )
                elif platform == "instagram":
                    result = await service.post_reel(
                        video_path=video_path,
                        title=title,
                        description=description,
                        youtube_url=youtube_url,
                        thumbnail_path=thumbnail_path,
                    )
                else:
                    result = CrossPostResult(
                        platform=platform, success=False, error="Unknown platform"
                    )

                results.append(result)

            except Exception as e:
                logger.error("Failed to cross-post to %s: %s", platform, e)
                results.append(
                    CrossPostResult(platform=platform, success=False, error=str(e))
                )

        return results
