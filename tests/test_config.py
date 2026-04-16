from __future__ import annotations
"""Tests for the configuration module."""

import pytest
from unittest.mock import patch


class TestAppConfig:
    def test_default_log_level(self):
        with patch.dict("os.environ", {}, clear=False):
            from src.config import AppConfig
            # Remove any cached config
            config = AppConfig()
            assert config.log_level == "INFO"

    def test_invalid_log_level(self):
        from src.config import AppConfig
        with pytest.raises(Exception):
            AppConfig(log_level="INVALID")

    def test_chunk_size_default(self):
        from src.config import AppConfig
        config = AppConfig()
        assert config.chunk_size_bytes == 50 * 1024 * 1024  # 50MB

    def test_tiktok_clip_duration(self):
        from src.config import AppConfig
        config = AppConfig()
        assert config.tiktok_clip_duration == 60

    def test_poll_interval_default(self):
        from src.config import AppConfig
        config = AppConfig()
        assert config.poll_interval_seconds == 30
