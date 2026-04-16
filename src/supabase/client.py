from __future__ import annotations
"""Supabase client wrapper for all database operations."""

import logging
from datetime import datetime
from typing import Optional

from supabase import Client, create_client

from src.config import config

logger = logging.getLogger(__name__)


def get_supabase_client() -> Client:
    """Create and return a Supabase client instance."""
    if not config.supabase.url or not config.supabase.service_key:
        raise ValueError(
            "SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in environment."
        )
    return create_client(config.supabase.url, config.supabase.service_key)


# ---------------------------------------------------------------------------
# yt_upload_queue table operations
# ---------------------------------------------------------------------------

class UploadQueueService:
    """Operations on the yt_upload_queue table."""

    def __init__(self, client: Client):
        self.client = client

    def enqueue(self, video_path: str, metadata: Optional[dict] = None) -> dict:
        """Insert a new row into yt_upload_queue."""
        payload = {
            "video_path": video_path,
            "status": "queued",
            "metadata": metadata or {},
            "created_at": datetime.utcnow().isoformat(),
        }
        resp = (
            self.client.table("yt_upload_queue")
            .insert(payload)
            .execute()
        )
        logger.info("Enqueued upload: %s (id=%s)", video_path, resp.data[0]["id"])
        return resp.data[0]

    def get_pending(self, limit: int = 10) -> list[dict]:
        """Fetch queued or pending items awaiting processing."""
        resp = (
            self.client.table("yt_upload_queue")
            .select("*")
            .eq("status", "queued")
            .order("created_at", desc=False)
            .limit(limit)
            .execute()
        )
        return resp.data

    def get_scheduled(self) -> list[dict]:
        """Fetch items scheduled for future upload whose time has passed."""
        now = datetime.utcnow().isoformat()
        resp = (
            self.client.table("yt_upload_queue")
            .select("*")
            .eq("status", "scheduled")
            .lte("scheduled_at", now)
            .order("scheduled_at", desc=False)
            .execute()
        )
        return resp.data

    def update_status(
        self,
        queue_id: str,
        status: str,
        youtube_video_id: Optional[str] = None,
        error: Optional[str] = None,
    ) -> dict:
        """Update the status of a queue entry."""
        payload: dict = {"status": status, "updated_at": datetime.utcnow().isoformat()}
        if youtube_video_id:
            payload["youtube_video_id"] = youtube_video_id
        if error:
            payload["error"] = error
        resp = (
            self.client.table("yt_upload_queue")
            .update(payload)
            .eq("id", queue_id)
            .execute()
        )
        return resp.data[0]

    def update_metadata(self, queue_id: str, metadata: dict) -> dict:
        """Update metadata (SEO fields) on a queue entry."""
        resp = (
            self.client.table("yt_upload_queue")
            .update({"metadata": metadata, "updated_at": datetime.utcnow().isoformat()})
            .eq("id", queue_id)
            .execute()
        )
        return resp.data[0]


# ---------------------------------------------------------------------------
# upload_status table operations
# ---------------------------------------------------------------------------

class UploadStatusService:
    """Operations on the upload_status table."""

    def __init__(self, client: Client):
        self.client = client

    def create_record(
        self,
        queue_id: str,
        platform: str,
        status: str,
        url: Optional[str] = None,
        external_id: Optional[str] = None,
    ) -> dict:
        """Create a new upload status record."""
        payload = {
            "queue_id": queue_id,
            "platform": platform,
            "status": status,
            "url": url,
            "external_id": external_id,
            "created_at": datetime.utcnow().isoformat(),
        }
        resp = (
            self.client.table("upload_status")
            .insert(payload)
            .execute()
        )
        return resp.data[0]

    def update_record(
        self,
        record_id: str,
        status: str,
        url: Optional[str] = None,
        error: Optional[str] = None,
    ) -> dict:
        """Update an existing upload status record."""
        payload: dict = {"status": status, "updated_at": datetime.utcnow().isoformat()}
        if url:
            payload["url"] = url
        if error:
            payload["error"] = error
        resp = (
            self.client.table("upload_status")
            .update(payload)
            .eq("id", record_id)
            .execute()
        )
        return resp.data[0]


# ---------------------------------------------------------------------------
# performance table operations
# ---------------------------------------------------------------------------

class PerformanceService:
    """Operations on the performance table."""

    def __init__(self, client: Client):
        self.client = client

    def record(
        self,
        queue_id: str,
        platform: str,
        external_id: str,
        metrics: dict,
    ) -> dict:
        """Record performance metrics for a published post."""
        payload = {
            "queue_id": queue_id,
            "platform": platform,
            "external_id": external_id,
            "metrics": metrics,
            "recorded_at": datetime.utcnow().isoformat(),
        }
        resp = (
            self.client.table("performance")
            .insert(payload)
            .execute()
        )
        return resp.data[0]

    def get_for_video(self, queue_id: str) -> list[dict]:
        """Get all performance records for a given video upload."""
        resp = (
            self.client.table("performance")
            .select("*")
            .eq("queue_id", queue_id)
            .order("recorded_at", desc=True)
            .execute()
        )
        return resp.data


# ---------------------------------------------------------------------------
# channel_analytics table (for best-time prediction)
# ---------------------------------------------------------------------------

class ChannelAnalyticsService:
    """Operations on the channel_analytics table."""

    def __init__(self, client: Client):
        self.client = client

    def get_historical(self, limit: int = 100) -> list[dict]:
        """Fetch historical performance data for best-time prediction."""
        resp = (
            self.client.table("channel_analytics")
            .select("*")
            .order("publish_time", desc=True)
            .limit(limit)
            .execute()
        )
        return resp.data

    def upsert(self, record: dict) -> dict:
        """Insert or update an analytics record."""
        resp = (
            self.client.table("channel_analytics")
            .upsert(record)
            .execute()
        )
        return resp.data[0]
