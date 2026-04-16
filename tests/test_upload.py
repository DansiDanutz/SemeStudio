"""Tests for the YouTube upload module."""

import pytest
import sys
from unittest.mock import MagicMock, patch


class TestYouTubeUploader:
    """Tests for YouTubeUploader - mocks googleapiclient to avoid dependency."""

    def test_privacy_statuses_constant(self):
        """PRIVACY_STATUSES should contain private, public, unlisted."""
        # Read the source file directly to test the constant
        with open("src/upload/youtube.py") as f:
            source = f.read()
        assert '"private"' in source
        assert '"public"' in source
        assert '"unlisted"' in source

    def test_upload_validates_privacy_status(self):
        """Invalid privacy status should raise ValueError before API calls."""
        # Mock googleapiclient to avoid import errors
        mock_google = MagicMock()
        mock_google.discovery.build.return_value = MagicMock()
        mock_google.errors.HttpError = Exception
        mock_google.http.MediaFileUpload = MagicMock()

        with patch.dict(sys.modules, {
            "googleapiclient": mock_google,
            "googleapiclient.discovery": mock_google.discovery,
            "googleapiclient.errors": mock_google.errors,
            "googleapiclient.http": mock_google.http,
        }):
            from src.upload.youtube import YouTubeUploader

            uploader = YouTubeUploader(credentials=MagicMock())

            with pytest.raises(ValueError, match="privacy_status must be one of"):
                uploader.upload_video(
                    video_path="/tmp/fake.mp4",
                    title="Test",
                    description="Test",
                    privacy_status="invalid",
                )

    def test_upload_raises_file_not_found(self):
        """Non-existent video file should raise FileNotFoundError."""
        mock_google = MagicMock()
        mock_google.discovery.build.return_value = MagicMock()
        mock_google.errors.HttpError = Exception
        mock_google.http.MediaFileUpload = MagicMock()

        with patch.dict(sys.modules, {
            "googleapiclient": mock_google,
            "googleapiclient.discovery": mock_google.discovery,
            "googleapiclient.errors": mock_google.errors,
            "googleapiclient.http": mock_google.http,
        }):
            from src.upload.youtube import YouTubeUploader

            uploader = YouTubeUploader(credentials=MagicMock())

            with pytest.raises(FileNotFoundError):
                uploader.upload_video(
                    video_path="/tmp/this_file_does_not_exist_12345.mp4",
                    title="Test",
                    description="Test",
                    privacy_status="private",
                )

    def test_make_public_calls_update(self):
        """make_public should call update_video with public status."""
        mock_google = MagicMock()
        mock_google.discovery.build.return_value = MagicMock()
        mock_google.errors.HttpError = Exception
        mock_google.http.MediaFileUpload = MagicMock()

        with patch.dict(sys.modules, {
            "googleapiclient": mock_google,
            "googleapiclient.discovery": mock_google.discovery,
            "googleapiclient.errors": mock_google.errors,
            "googleapiclient.http": mock_google.http,
        }):
            from src.upload.youtube import YouTubeUploader

            uploader = YouTubeUploader(credentials=MagicMock())
            uploader.update_video = MagicMock()
            uploader.make_public("abc123")
            uploader.update_video.assert_called_once_with(
                video_id="abc123", privacy_status="public"
            )

    def test_schedule_publish_calls_update(self):
        """schedule_publish should call update_video."""
        mock_google = MagicMock()
        mock_google.discovery.build.return_value = MagicMock()
        mock_google.errors.HttpError = Exception
        mock_google.http.MediaFileUpload = MagicMock()

        with patch.dict(sys.modules, {
            "googleapiclient": mock_google,
            "googleapiclient.discovery": mock_google.discovery,
            "googleapiclient.errors": mock_google.errors,
            "googleapiclient.http": mock_google.http,
        }):
            from src.upload.youtube import YouTubeUploader

            uploader = YouTubeUploader(credentials=MagicMock())
            uploader.update_video = MagicMock()
            uploader.schedule_publish(
                "abc123", publish_time="2026-04-20T10:00:00Z"
            )
            uploader.update_video.assert_called_once()
