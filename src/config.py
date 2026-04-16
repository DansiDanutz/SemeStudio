"""Central configuration for the upload automation pipeline."""

import os
from pathlib import Path

from dotenv import load_dotenv
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent


class SupabaseConfig(BaseSettings):
    url: str = Field(default="", alias="SUPABASE_URL")
    service_key: str = Field(default="", alias="SUPABASE_SERVICE_KEY")
    anon_key: str = Field(default="", alias="SUPABASE_ANON_KEY")

    model_config = {"env_prefix": ""}


class YouTubeConfig(BaseSettings):
    client_id: str = Field(default="", alias="YOUTUBE_CLIENT_ID")
    client_secret: str = Field(default="", alias="YOUTUBE_CLIENT_SECRET")
    credentials_file: str = Field(
        default=str(BASE_DIR / "credentials" / "youtube_credentials.json"),
        alias="YOUTUBE_CREDENTIALS_FILE",
    )

    model_config = {"env_prefix": ""}


class TikTokConfig(BaseSettings):
    access_token: str = Field(default="", alias="TIKTOK_ACCESS_TOKEN")
    client_key: str = Field(default="", alias="TIKTOK_CLIENT_KEY")
    client_secret: str = Field(default="", alias="TIKTOK_CLIENT_SECRET")

    model_config = {"env_prefix": ""}


class LinkedInConfig(BaseSettings):
    access_token: str = Field(default="", alias="LINKEDIN_ACCESS_TOKEN")
    person_id: str = Field(default="", alias="LINKEDIN_PERSON_ID")

    model_config = {"env_prefix": ""}


class TwitterConfig(BaseSettings):
    api_key: str = Field(default="", alias="TWITTER_API_KEY")
    api_secret: str = Field(default="", alias="TWITTER_API_SECRET")
    access_token: str = Field(default="", alias="TWITTER_ACCESS_TOKEN")
    access_secret: str = Field(default="", alias="TWITTER_ACCESS_SECRET")
    bearer_token: str = Field(default="", alias="TWITTER_BEARER_TOKEN")

    model_config = {"env_prefix": ""}


class InstagramConfig(BaseSettings):
    access_token: str = Field(default="", alias="INSTAGRAM_ACCESS_TOKEN")
    account_id: str = Field(default="", alias="INSTAGRAM_ACCOUNT_ID")

    model_config = {"env_prefix": ""}


class UploadThingConfig(BaseSettings):
    token: str = Field(default="", alias="UPLOADTHING_TOKEN")

    model_config = {"env_prefix": ""}


class AppConfig(BaseSettings):
    log_level: str = Field(default="INFO", alias="LOG_LEVEL")
    max_retries: int = 3
    chunk_size_bytes: int = 50 * 1024 * 1024  # 50MB chunks for resumable uploads
    tiktok_clip_duration: int = 60  # seconds
    tiktok_max_duration: int = 180  # TikTok max for API uploads (3 min)
    poll_interval_seconds: int = 30  # polling interval for queue

    @field_validator("log_level")
    @classmethod
    def validate_log_level(cls, v: str) -> str:
        valid = {"DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"}
        if v.upper() not in valid:
            raise ValueError(f"log_level must be one of {valid}")
        return v.upper()

    supabase: SupabaseConfig = Field(default_factory=SupabaseConfig)
    youtube: YouTubeConfig = Field(default_factory=YouTubeConfig)
    tiktok: TikTokConfig = Field(default_factory=TikTokConfig)
    linkedin: LinkedInConfig = Field(default_factory=LinkedInConfig)
    twitter: TwitterConfig = Field(default_factory=TwitterConfig)
    instagram: InstagramConfig = Field(default_factory=InstagramConfig)
    uploadthing: UploadThingConfig = Field(default_factory=UploadThingConfig)

    model_config = {"env_prefix": ""}


config = AppConfig()
