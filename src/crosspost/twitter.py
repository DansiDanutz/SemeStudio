from __future__ import annotations
"""Twitter/X cross-posting service — creates thread posts."""

import logging

import httpx

from src.config import config
from src.crosspost.orchestrator import CrossPostResult

logger = logging.getLogger(__name__)

# Twitter limits
MAX_TWEET_LENGTH = 280


class TwitterService:
    """Handles Twitter thread creation about YouTube videos."""

    def __init__(self):
        self.api_key = config.twitter.api_key
        self.api_secret = config.twitter.api_secret
        self.access_token = config.twitter.access_token
        self.access_secret = config.twitter.access_secret
        self.bearer_token = config.twitter.bearer_token
        self.base_url = "https://api.twitter.com/2"

    async def post_thread(
        self,
        title: str,
        description: str,
        youtube_url: str,
    ) -> CrossPostResult:
        """
        Create a Twitter thread about the YouTube video.

        Thread structure:
        - Tweet 1: Hook + title + YouTube link
        - Tweet 2: Key takeaways from description
        - Tweet 3: Call to action

        Args:
            title: Video title.
            description: Video description.
            youtube_url: YouTube video URL.

        Returns:
            CrossPostResult with the outcome.
        """
        if not self.bearer_token:
            return CrossPostResult(
                platform="twitter",
                success=False,
                error="Twitter bearer token not configured",
            )

        try:
            # Build the thread tweets
            tweets = self._build_thread(title, description, youtube_url)

            # Post the thread (first tweet, then replies)
            thread_url = await self._post_thread(tweets)

            return CrossPostResult(
                platform="twitter",
                success=True,
                url=thread_url,
                external_id=thread_url.split("/")[-1] if "/" in thread_url else "",
            )

        except Exception as e:
            logger.error("Twitter thread failed: %s", e)
            return CrossPostResult(platform="twitter", success=False, error=str(e))

    def _build_thread(
        self, title: str, description: str, youtube_url: str
    ) -> list[str]:
        """Build a list of tweets for the thread."""
        tweets = []

        # Tweet 1: Hook + link
        tweet1 = f"🎬 New video: {title}\n\n"
        remaining = MAX_TWEET_LENGTH - len(tweet1) - len(youtube_url) - 2
        if description:
            tweet1 += description[:remaining] + "\n"
        tweet1 += f"\n{youtube_url}"
        tweets.append(tweet1[:MAX_TWEET_LENGTH])

        # Tweet 2: Key takeaways (if description is long enough)
        if len(description) > MAX_TWEET_LENGTH:
            takeaways = self._extract_takeaways(description)
            if takeaways:
                tweet2 = "🔑 Key takeaways:\n\n" + "\n".join(
                    f"• {t}" for t in takeaways[:5]
                )
                tweets.append(tweet2[:MAX_TWEET_LENGTH])

        # Tweet 3: CTA
        tweet3 = (
            "💡 Subscribe for more content like this!\n\n"
            f"Full video on YouTube: {youtube_url}\n\n"
            "#YouTube #NewVideo"
        )
        tweets.append(tweet3[:MAX_TWEET_LENGTH])

        return tweets

    def _extract_takeaways(self, description: str, max_count: int = 5) -> list[str]:
        """Extract key takeaways from a description."""
        # Split by newlines and look for bullet-point-like lines
        lines = description.split("\n")
        takeaways = []

        for line in lines:
            line = line.strip()
            if not line:
                continue
            # Skip lines that are URLs or hashtags
            if line.startswith("http") or line.startswith("#"):
                continue
            if len(line) > 10:  # Meaningful lines only
                takeaways.append(line)
                if len(takeaways) >= max_count:
                    break

        return takeaways

    async def _post_thread(self, tweets: list[str]) -> str:
        """Post a thread of tweets. First tweet, then replies."""
        headers = {
            "Authorization": f"Bearer {self.bearer_token}",
            "Content-Type": "application/json",
        }

        # Post first tweet
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{self.base_url}/tweets",
                headers=headers,
                json={"text": tweets[0]},
            )
            resp.raise_for_status()
            data = resp.json()
            first_tweet_id = data["data"]["id"]

        thread_url = f"https://twitter.com/user/status/{first_tweet_id}"

        # Post subsequent tweets as replies
        for tweet_text in tweets[1:]:
            async with httpx.AsyncClient() as client:
                resp = await client.post(
                    f"{self.base_url}/tweets",
                    headers=headers,
                    json={
                        "text": tweet_text,
                        "reply": {"in_reply_to_tweet_id": first_tweet_id},
                    },
                )
                resp.raise_for_status()

        return thread_url
