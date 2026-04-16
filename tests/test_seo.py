from __future__ import annotations
"""Tests for the SEO metadata generator."""

from src.seo.metadata import SEOMetadataGenerator, MAX_TITLE_LENGTH, MAX_DESCRIPTION_LENGTH, MAX_TAGS_LENGTH, MAX_TAG_COUNT


class TestSEOMetadataGenerator:
    def setup_method(self):
        self.generator = SEOMetadataGenerator(
            channel_name="TestChannel",
            default_tags=["test", "demo"],
        )

    def test_generate_title_basic(self):
        title = self.generator.generate_title("My Video")
        assert title == "My Video"

    def test_generate_title_with_prefix_suffix(self):
        title = self.generator.generate_title(
            "My Video", prefix="Series 1", suffix="TestChannel"
        )
        assert "Series 1" in title
        assert "My Video" in title
        assert "TestChannel" in title
        assert len(title) <= MAX_TITLE_LENGTH

    def test_generate_title_truncation(self):
        long_title = "A" * 200
        title = self.generator.generate_title(long_title)
        assert len(title) <= MAX_TITLE_LENGTH
        assert title.endswith("...")

    def test_generate_description_basic(self):
        desc = self.generator.generate_description("This is a test description")
        assert "This is a test description" in desc

    def test_generate_description_with_timestamps(self):
        desc = self.generator.generate_description(
            "Main description",
            timestamps=[("0:00", "Intro"), ("5:00", "Main Topic")],
        )
        assert "0:00 - Intro" in desc
        assert "5:00 - Main Topic" in desc
        assert "Chapters" in desc

    def test_generate_description_with_links(self):
        desc = self.generator.generate_description(
            "Main description",
            links=[("Website", "https://example.com")],
        )
        assert "https://example.com" in desc
        assert "Links" in desc

    def test_generate_description_with_hashtags(self):
        desc = self.generator.generate_description(
            "Main description",
            hashtags=["python", "tutorial", "coding"],
        )
        assert "#python" in desc
        assert "#tutorial" in desc
        assert "#coding" in desc

    def test_generate_description_truncation(self):
        long_desc = "A" * 6000
        desc = self.generator.generate_description(long_desc)
        assert len(desc) <= MAX_DESCRIPTION_LENGTH

    def test_generate_tags_basic(self):
        tags = self.generator.generate_tags(["python", "programming"])
        assert "python" in tags
        assert "programming" in tags
        assert "TestChannel" in tags
        assert "test" in tags
        assert "demo" in tags

    def test_generate_tags_no_duplicates(self):
        tags = self.generator.generate_tags(["test", "python"])
        assert tags.count("test") == 1

    def test_generate_tags_with_topic(self):
        tags = self.generator.generate_tags(topic="machine learning tutorial")
        # Should include topic-based tags
        assert len(tags) > 0
        total_len = sum(len(t) + 1 for t in tags)
        assert total_len <= MAX_TAGS_LENGTH
        assert len(tags) <= MAX_TAG_COUNT

    def test_generate_tags_limit(self):
        many_tags = [f"tag{i}" for i in range(50)]
        tags = self.generator.generate_tags(many_tags)
        assert len(tags) <= MAX_TAG_COUNT
        total_len = sum(len(t) + 1 for t in tags)
        assert total_len <= MAX_TAGS_LENGTH

    def test_generate_full_metadata(self):
        metadata = self.generator.generate_full_metadata(
            title="My Video",
            description="A great video",
            tags=["python"],
            topic="python tutorial",
            category_id="28",
            timestamps=[("0:00", "Intro")],
            hashtags=["python", "tutorial"],
        )
        assert metadata["title"] == "My Video"
        assert isinstance(metadata["description"], str)
        assert isinstance(metadata["tags"], list)
        assert metadata["category_id"] == "28"
        assert metadata["privacy_status"] == "private"
