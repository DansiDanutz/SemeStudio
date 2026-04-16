from __future__ import annotations
"""Tests for cross-posting services."""

import pytest

from src.crosspost.orchestrator import CrossPostOrchestrator, CrossPostResult
from src.crosspost.tiktok import TikTokService
from src.crosspost.linkedin import LinkedInService
from src.crosspost.twitter import TwitterService
from src.crosspost.instagram import InstagramService


class TestCrossPostResult:
    def test_to_dict(self):
        result = CrossPostResult(
            platform="tiktok",
            success=True,
            url="https://tiktok.com/@user/video/123",
            external_id="123",
        )
        d = result.to_dict()
        assert d["platform"] == "tiktok"
        assert d["success"] is True
        assert "123" in d["url"]


class TestCrossPostOrchestrator:
    def setup_method(self):
        self.orchestrator = CrossPostOrchestrator()

    def test_enable_platform(self):
        class FakeService:
            pass
        self.orchestrator.enable_platform("tiktok", FakeService())
        assert "tiktok" in self.orchestrator.enabled_platforms

    def test_enable_invalid_platform(self):
        with pytest.raises(ValueError, match="Unsupported platform"):
            self.orchestrator.enable_platform("facebook", None)

    def test_cross_post_unconfigured(self):
        """Cross-posting to an unconfigured platform should fail gracefully."""
        import asyncio
        results = asyncio.get_event_loop().run_until_complete(
            self.orchestrator.cross_post_all(
                queue_id="test-id",
                video_path="/tmp/test.mp4",
                youtube_url="https://youtube.com/watch?v=abc",
                youtube_video_id="abc",
                title="Test Video",
                description="A test video",
                platforms=["tiktok"],
            )
        )
        assert len(results) == 1
        assert results[0].platform == "tiktok"
        assert results[0].success is False


class TestTikTokService:
    def test_no_token_returns_error(self):
        service = TikTokService()
        # Without token configured, post_clip should return an error result
        import asyncio
        result = asyncio.get_event_loop().run_until_complete(
            service.post_clip(
                video_path="/tmp/test.mp4",
                title="Test",
                description="Test desc",
            )
        )
        assert result.success is False
        assert "token" in result.error.lower()


class TestLinkedInService:
    def test_no_token_returns_error(self):
        service = LinkedInService()
        import asyncio
        result = asyncio.get_event_loop().run_until_complete(
            service.post_article(
                title="Test",
                description="Test desc",
                youtube_url="https://youtube.com/watch?v=abc",
            )
        )
        assert result.success is False
        assert "token" in result.error.lower()


class TestTwitterService:
    def test_no_token_returns_error(self):
        service = TwitterService()
        import asyncio
        result = asyncio.get_event_loop().run_until_complete(
            service.post_thread(
                title="Test",
                description="Test desc",
                youtube_url="https://youtube.com/watch?v=abc",
            )
        )
        assert result.success is False


class TestInstagramService:
    def test_no_token_returns_error(self):
        service = InstagramService()
        import asyncio
        result = asyncio.get_event_loop().run_until_complete(
            service.post_reel(
                video_path="/tmp/test.mp4",
                title="Test",
                description="Test desc",
                youtube_url="https://youtube.com/watch?v=abc",
            )
        )
        assert result.success is False
