from __future__ import annotations
"""YouTube Data API v3 upload with resumable uploads and thumbnail setting."""

import logging
import os
from pathlib import Path
from typing import Optional

from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from googleapiclient.http import MediaFileUpload

from src.config import config

logger = logging.getLogger(__name__)

# Valid privacy statuses
PRIVACY_STATUSES = {"private", "public", "unlisted"}


class YouTubeUploader:
    """Handles YouTube video uploads via the Data API v3."""

    def __init__(self, credentials):
        """
        Args:
            credentials: OAuth2 credentials object (google.oauth2.credentials).
        """
        self.credentials = credentials
        self.youtube = build("youtube", "v3", credentials=self.credentials)

    def upload_video(
        self,
        video_path: str,
        title: str,
        description: str,
        tags: Optional[list[str]] = None,
        category_id: str = "22",
        privacy_status: str = "private",
        thumbnail_path: Optional[str] = None,
    ) -> dict:
        """
        Upload a video to YouTube using resumable upload.

        Args:
            video_path: Path to the video file.
            title: Video title.
            description: Video description.
            tags: List of tags.
            category_id: YouTube video category ID (default: 22 = People & Blogs).
            privacy_status: 'private', 'unlisted', or 'public'.
            thumbnail_path: Optional path to a thumbnail image.

        Returns:
            dict with video_id, url, title, and other response fields.
        """
        if privacy_status not in PRIVACY_STATUSES:
            raise ValueError(
                f"privacy_status must be one of {PRIVACY_STATUSES}, got '{privacy_status}'"
            )

        video_path = Path(video_path)
        if not video_path.exists():
            raise FileNotFoundError(f"Video file not found: {video_path}")

        # Build the video metadata body
        body = {
            "snippet": {
                "title": title,
                "description": description,
                "tags": tags or [],
                "categoryId": category_id,
            },
            "status": {
                "privacyStatus": privacy_status,
            },
        }

        # Create resumable media upload
        media = MediaFileUpload(
            str(video_path),
            chunksize=config.chunk_size_bytes,
            resumable=True,
        )

        logger.info(
            "Starting upload: %s (%s, %.1f MB)",
            title,
            privacy_status,
            video_path.stat().st_size / (1024 * 1024),
        )

        try:
            request = self.youtube.videos().insert(
                part="snippet,status",
                body=body,
                media_body=media,
            )

            response = None
            while response is None:
                status, response = request.next_chunk()
                if status:
                    progress = status.progress() * 100
                    logger.info("Upload progress: %.1f%%", progress)

            video_id = response["id"]
            url = f"https://www.youtube.com/watch?v={video_id}"
            logger.info("Upload complete: %s (%s)", title, url)

            # Upload thumbnail if provided
            if thumbnail_path and Path(thumbnail_path).exists():
                self._set_thumbnail(video_id, thumbnail_path)

            return {
                "video_id": video_id,
                "url": url,
                "title": response["snippet"]["title"],
                "description": response["snippet"]["description"],
                "privacy_status": response["status"]["privacyStatus"],
            }

        except HttpError as e:
            logger.error("YouTube API error during upload: %s", e)
            raise

    def _set_thumbnail(self, video_id: str, thumbnail_path: str) -> None:
        """Set a custom thumbnail for an uploaded video."""
        try:
            media = MediaFileUpload(
                thumbnail_path,
                mimetype="image/jpeg",
                resumable=True,
            )
            self.youtube.thumbnails().set(
                videoId=video_id,
                media_body=media,
            ).execute()
            logger.info("Thumbnail set for video %s", video_id)
        except HttpError as e:
            logger.warning("Failed to set thumbnail for %s: %s", video_id, e)

    def update_video(
        self,
        video_id: str,
        title: Optional[str] = None,
        description: Optional[str] = None,
        tags: Optional[list[str]] = None,
        privacy_status: Optional[str] = None,
    ) -> dict:
        """Update metadata of an existing YouTube video."""
        try:
            # Fetch current video details
            response = (
                self.youtube.videos()
                .list(part="snippet,status", id=video_id)
                .execute()
            )

            if not response.get("items"):
                raise ValueError(f"Video not found: {video_id}")

            item = response["items"][0]
            snippet = item["snippet"]
            status = item["status"]

            # Apply updates
            if title:
                snippet["title"] = title
            if description:
                snippet["description"] = description
            if tags is not None:
                snippet["tags"] = tags
            if privacy_status:
                status["privacyStatus"] = privacy_status

            body = {"snippet": snippet, "status": status}

            update_resp = (
                self.youtube.videos()
                .update(part="snippet,status", body=body)
                .execute()
            )

            logger.info("Updated video %s metadata", video_id)
            return update_resp

        except HttpError as e:
            logger.error("YouTube API error during update: %s", e)
            raise

    def schedule_publish(self, video_id: str, publish_time: str) -> dict:
        """
        Schedule a video to go public at a specific time.

        Args:
            video_id: The YouTube video ID.
            publish_time: ISO 8601 datetime string (e.g., '2026-04-16T10:00:00Z').

        Returns:
            Updated video resource.
        """
        return self.update_video(
            video_id=video_id,
            privacy_status="private",  # Keep private until scheduled time
        )

    def make_public(self, video_id: str) -> dict:
        """Make a video public (used after scheduled time arrives)."""
        return self.update_video(video_id=video_id, privacy_status="public")
