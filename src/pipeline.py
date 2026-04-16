from __future__ import annotations
"""Main pipeline orchestrator — coordinates the full upload → cross-post flow."""

import asyncio
import logging
from datetime import datetime, timezone
from typing import Optional

from google.oauth2.credentials import Credentials

from src.config import config
from src.supabase.client import (
    ChannelAnalyticsService,
    UploadQueueService,
    UploadStatusService,
    get_supabase_client,
)
from src.upload.youtube import YouTubeUploader
from src.seo.metadata import SEOMetadataGenerator
from src.analytics.best_time import BestTimePredictor
from src.crosspost.orchestrator import CrossPostOrchestrator
from src.crosspost.tiktok import TikTokService
from src.crosspost.linkedin import LinkedInService
from src.crosspost.twitter import TwitterService
from src.crosspost.instagram import InstagramService

logger = logging.getLogger(__name__)


class UploadPipeline:
    """
    Orchestrates the full pipeline:
    1. Fetch pending uploads from Supabase queue
    2. Generate SEO metadata
    3. Determine optimal publish time
    4. Upload to YouTube (resumable)
    5. Set thumbnail
    6. Schedule or publish
    7. Cross-post to TikTok, LinkedIn, Twitter, Instagram
    8. Update status in Supabase
    """

    def __init__(
        self,
        youtube_credentials: Optional[Credentials] = None,
        channel_name: str = "",
        channel_default_tags: Optional[list[str]] = None,
    ):
        self.supabase = get_supabase_client()
        self.queue_service = UploadQueueService(self.supabase)
        self.status_service = UploadStatusService(self.supabase)
        self.analytics_service = ChannelAnalyticsService(self.supabase)

        self.seo = SEOMetadataGenerator(
            channel_name=channel_name,
            default_tags=channel_default_tags,
        )

        self.predictor = BestTimePredictor()
        self._load_historical_analytics()

        self.youtube: Optional[YouTubeUploader] = None
        if youtube_credentials:
            self.youtube = YouTubeUploader(youtube_credentials)

        self.crosspost = CrossPostOrchestrator()
        self._init_crosspost_services()

    def _load_historical_analytics(self) -> None:
        """Load historical data into the best-time predictor."""
        try:
            records = self.analytics_service.get_historical(limit=200)
            if records:
                self.predictor.ingest_analytics(records)
                summary = self.predictor.get_summary()
                logger.info("Analytics loaded: %s", summary)
        except Exception as e:
            logger.warning("Could not load historical analytics: %s", e)

    def _init_crosspost_services(self) -> None:
        """Initialize cross-posting platform services."""
        self.crosspost.enable_platform("tiktok", TikTokService())
        self.crosspost.enable_platform("linkedin", LinkedInService())
        self.crosspost.enable_platform("twitter", TwitterService())
        self.crosspost.enable_platform("instagram", InstagramService())

    async def process_queue(self) -> list[dict]:
        """
        Process all pending and ready-to-publish queue items.

        Returns:
            List of processed queue item results.
        """
        results = []

        # Process immediately-queued items
        pending = self.queue_service.get_pending()
        for item in pending:
            result = await self._process_single(item)
            results.append(result)

        # Process scheduled items whose time has arrived
        scheduled = self.queue_service.get_scheduled()
        for item in scheduled:
            result = await self._process_single(item)
            results.append(result)

        logger.info("Processed %d queue items", len(results))
        return results

    async def _process_single(self, queue_item: dict) -> dict:
        """Process a single queue item through the pipeline."""
        queue_id = queue_item["id"]
        video_path = queue_item["video_path"]
        metadata = queue_item.get("metadata", {})

        result = {
            "queue_id": queue_id,
            "video_path": video_path,
            "status": "failed",
            "youtube_url": None,
            "crosspost_results": [],
            "error": None,
        }

        try:
            # Step 1: Generate SEO metadata
            logger.info("[%s] Generating SEO metadata...", queue_id)
            seo_metadata = self._generate_seo(metadata, queue_id)
            self.queue_service.update_metadata(queue_id, seo_metadata)

            # Step 2: Determine publish time
            logger.info("[%s] Determining publish time...", queue_id)
            metadata_entry = metadata.get("metadata", metadata)
            schedule = metadata_entry.get("schedule", "immediate")

            if schedule == "optimal":
                scheduled_at = self.predictor.get_best_publish_time()
                if scheduled_at > datetime.now(timezone.utc):
                    self.queue_service.update_status(
                        queue_id, "scheduled", scheduled_at=scheduled_at.isoformat()
                    )
                    result["status"] = "scheduled"
                    result["scheduled_at"] = scheduled_at.isoformat()
                    logger.info(
                        "[%s] Scheduled for %s", queue_id, scheduled_at.isoformat()
                    )
                    return result

            # Step 3: Upload to YouTube
            logger.info("[%s] Uploading to YouTube...", queue_id)
            self.queue_service.update_status(queue_id, "uploading")
            upload_result = await self._upload_to_youtube(
                queue_id, video_path, seo_metadata
            )

            result["youtube_url"] = upload_result.get("url")
            result["youtube_video_id"] = upload_result.get("video_id")

            # Step 4: Cross-post to other platforms
            logger.info("[%s] Starting cross-posting...", queue_id)
            self.queue_service.update_status(queue_id, "crossposting")

            crosspost_results = await self.crosspost.cross_post_all(
                queue_id=queue_id,
                video_path=video_path,
                youtube_url=upload_result["url"],
                youtube_video_id=upload_result["video_id"],
                title=seo_metadata["title"],
                description=seo_metadata["description"],
                thumbnail_path=seo_metadata.get("thumbnail_path"),
            )

            result["crosspost_results"] = [r.to_dict() for r in crosspost_results]

            # Step 5: Mark as completed
            self.queue_service.update_status(
                queue_id,
                "completed",
                youtube_video_id=upload_result["video_id"],
            )
            result["status"] = "completed"

            logger.info("[%s] Pipeline complete: %s", queue_id, upload_result["url"])

        except Exception as e:
            logger.error("[%s] Pipeline failed: %s", queue_id, e)
            self.queue_service.update_status(queue_id, "failed", error=str(e))
            result["status"] = "failed"
            result["error"] = str(e)

        return result

    def _generate_seo(self, metadata: dict, queue_id: str) -> dict:
        """Generate SEO metadata from queue item metadata."""
        meta = metadata.get("metadata", metadata)

        return self.seo.generate_full_metadata(
            title=meta.get("title", "Untitled Video"),
            description=meta.get("description", ""),
            tags=meta.get("tags"),
            topic=meta.get("topic", ""),
            category_id=meta.get("category_id", "22"),
            thumbnail_path=meta.get("thumbnail_path"),
            timestamps=meta.get("timestamps"),
            links=meta.get("links"),
            hashtags=meta.get("hashtags"),
            prefix=meta.get("prefix", ""),
            suffix=meta.get("suffix", ""),
        )

    async def _upload_to_youtube(
        self, queue_id: str, video_path: str, seo_metadata: dict
    ) -> dict:
        """Upload a video to YouTube."""
        if not self.youtube:
            raise RuntimeError("YouTube credentials not configured")

        # Use event loop to run blocking YouTube upload
        loop = asyncio.get_event_loop()

        def _upload():
            return self.youtube.upload_video(
                video_path=video_path,
                title=seo_metadata["title"],
                description=seo_metadata["description"],
                tags=seo_metadata["tags"],
                category_id=seo_metadata["category_id"],
                privacy_status=seo_metadata.get("privacy_status", "private"),
                thumbnail_path=seo_metadata.get("thumbnail_path"),
            )

        result = await loop.run_in_executor(None, _upload)

        # Record upload status
        self.status_service.create_record(
            queue_id=queue_id,
            platform="youtube",
            status="published",
            url=result["url"],
            external_id=result["video_id"],
        )

        return result

    async def enqueue_upload(
        self,
        video_path: str,
        metadata: Optional[dict] = None,
        schedule: str = "immediate",
    ) -> dict:
        """
        Manually enqueue a video for upload.

        Args:
            video_path: Path to the video file.
            metadata: SEO metadata dict.
            schedule: 'immediate' or 'optimal'.

        Returns:
            The created queue entry.
        """
        if metadata is None:
            metadata = {}
        metadata["schedule"] = schedule

        return self.queue_service.enqueue(video_path, metadata=metadata)
