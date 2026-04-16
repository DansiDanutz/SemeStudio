from __future__ import annotations
"""SEO module for generating optimized YouTube metadata."""

import logging
import re
from typing import Optional

logger = logging.getLogger(__name__)

# YouTube limits
MAX_TITLE_LENGTH = 100
MAX_DESCRIPTION_LENGTH = 5000
MAX_TAGS_LENGTH = 500  # Total character limit for all tags
MAX_TAG_COUNT = 15


class SEOMetadataGenerator:
    """Generate SEO-optimized metadata for YouTube videos."""

    def __init__(self, channel_name: str = "", default_tags: Optional[list[str]] = None):
        self.channel_name = channel_name
        self.default_tags = default_tags or []

    def generate_title(self, raw_title: str, prefix: str = "", suffix: str = "") -> str:
        """
        Generate an optimized YouTube title.

        Args:
            raw_title: The original/base title.
            prefix: Optional prefix (e.g., series name).
            suffix: Optional suffix (e.g., channel branding).

        Returns:
            Optimized title within YouTube's 100-character limit.
        """
        parts = []
        if prefix:
            parts.append(prefix)
        parts.append(raw_title.strip())
        if suffix:
            parts.append(suffix)

        title = " | ".join(parts) if len(parts) > 1 else parts[0]

        # Truncate if too long
        if len(title) > MAX_TITLE_LENGTH:
            title = title[: MAX_TITLE_LENGTH - 3] + "..."

        logger.info("Generated title: %s", title)
        return title

    def generate_description(
        self,
        main_description: str,
        timestamps: Optional[list[tuple[str, str]]] = None,
        links: Optional[list[tuple[str, str]]] = None,
        hashtags: Optional[list[str]] = None,
    ) -> str:
        """
        Generate a structured, SEO-optimized description.

        Args:
            main_description: Core video description.
            timestamps: List of (time, label) tuples for chapter markers.
            links: List of (label, url) tuples for related links.
            hashtags: List of hashtags to append.

        Returns:
            Formatted description string.
        """
        sections = []

        # Main description
        if main_description:
            sections.append(main_description.strip())

        # Timestamps / Chapters
        if timestamps:
            sections.append("\n⏱️ Chapters:\n")
            for time_code, label in timestamps:
                sections.append(f"{time_code} - {label}")

        # Related links
        if links:
            sections.append("\n🔗 Links:\n")
            for label, url in links:
                sections.append(f"• {label}: {url}")

        # Hashtags (YouTube shows first 3 above title)
        if hashtags:
            # Only first 3 hashtags are shown above the title
            tag_str = " ".join(f"#{h}" for h in hashtags[:10])
            sections.append(f"\n{tag_str}")

        description = "\n\n".join(sections)

        # Truncate if exceeds limit
        if len(description) > MAX_DESCRIPTION_LENGTH:
            description = description[: MAX_DESCRIPTION_LENGTH - 3] + "..."

        logger.info("Generated description (%d chars)", len(description))
        return description

    def generate_tags(
        self,
        raw_tags: Optional[list[str]] = None,
        topic: str = "",
    ) -> list[str]:
        """
        Generate a list of optimized tags.

        Args:
            raw_tags: Base tags provided by the user.
            topic: Topic/category for generating additional tags.

        Returns:
            List of tags within YouTube's limits.
        """
        tags = []

        # Start with user-provided tags
        if raw_tags:
            tags.extend(raw_tags)

        # Add channel name as a tag
        if self.channel_name and self.channel_name not in tags:
            tags.append(self.channel_name)

        # Add default tags
        for tag in self.default_tags:
            if tag not in tags:
                tags.append(tag)

        # Generate topic-based tags if topic is provided
        if topic:
            topic_tags = self._generate_topic_tags(topic)
            for tag in topic_tags:
                if tag not in tags:
                    tags.append(tag)

        # Enforce limits
        tags = self._enforce_tag_limits(tags)

        logger.info("Generated %d tags: %s", len(tags), tags)
        return tags

    def _generate_topic_tags(self, topic: str) -> list[str]:
        """Generate relevant tags from a topic string."""
        # Simple keyword extraction: split topic into words and create variations
        words = re.findall(r"\b\w+\b", topic.lower())
        tags = []

        # Individual keywords
        tags.extend(words)

        # Bigrams
        for i in range(len(words) - 1):
            tags.append(f"{words[i]} {words[i+1]}")

        # Topic as a whole
        tags.append(topic.lower())

        return tags

    def _enforce_tag_limits(self, tags: list[str]) -> list[str]:
        """Trim tags to fit YouTube's limits."""
        result = []
        total_length = 0

        for tag in tags:
            tag = tag.strip()
            if not tag:
                continue

            # +1 for comma separator
            tag_cost = len(tag) + 1
            if total_length + tag_cost > MAX_TAGS_LENGTH:
                break
            if len(result) >= MAX_TAG_COUNT:
                break

            result.append(tag)
            total_length += tag_cost

        return result

    def generate_full_metadata(
        self,
        title: str,
        description: str,
        tags: Optional[list[str]] = None,
        topic: str = "",
        category_id: str = "22",
        thumbnail_path: Optional[str] = None,
        timestamps: Optional[list[tuple[str, str]]] = None,
        links: Optional[list[tuple[str, str]]] = None,
        hashtags: Optional[list[str]] = None,
        prefix: str = "",
        suffix: str = "",
    ) -> dict:
        """
        Generate complete SEO metadata for a YouTube upload.

        Returns:
            dict with title, description, tags, category_id, thumbnail_path.
        """
        optimized_title = self.generate_title(title, prefix=prefix, suffix=suffix)
        optimized_description = self.generate_description(
            description,
            timestamps=timestamps,
            links=links,
            hashtags=hashtags,
        )
        optimized_tags = self.generate_tags(tags, topic=topic)

        return {
            "title": optimized_title,
            "description": optimized_description,
            "tags": optimized_tags,
            "category_id": category_id,
            "thumbnail_path": thumbnail_path,
            "privacy_status": "private",  # Default: upload as private
        }
