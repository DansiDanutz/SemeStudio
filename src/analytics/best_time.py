from __future__ import annotations
"""Best-time prediction module based on channel analytics."""

import logging
from collections import defaultdict
from datetime import datetime, timezone
from typing import Optional

logger = logging.getLogger(__name__)


class BestTimePredictor:
    """Predict the best time to publish based on historical channel analytics."""

    def __init__(self):
        self.hour_performance: dict[int, list[float]] = defaultdict(list)
        self.day_performance: dict[int, list[float]] = defaultdict(list)

    def ingest_analytics(self, records: list[dict]) -> int:
        """
        Ingest historical analytics data.

        Args:
            records: List of dicts with keys:
                - publish_time: ISO 8601 or datetime
                - views_24h: integer (views in first 24 hours)
                - views_7d: integer
                - engagement_rate: float

        Returns:
            Number of records ingested.
        """
        count = 0
        for record in records:
            try:
                pub_time = record.get("publish_time")
                if isinstance(pub_time, str):
                    pub_time = datetime.fromisoformat(pub_time.replace("Z", "+00:00"))
                if pub_time.tzinfo is None:
                    pub_time = pub_time.replace(tzinfo=timezone.utc)

                # Use views_24h as primary success metric, fall back to views_7d
                views_24h = record.get("views_24h", 0) or 0
                views_7d = record.get("views_7d", 0) or 0
                engagement = record.get("engagement_rate", 0) or 0

                # Composite score: 70% views, 30% engagement
                score = (0.7 * views_24h + 0.3 * views_7d) * (1 + engagement)

                hour = pub_time.hour
                day = pub_time.weekday()  # 0=Monday

                self.hour_performance[hour].append(score)
                self.day_performance[day].append(score)
                count += 1

            except Exception as e:
                logger.warning("Skipping malformed analytics record: %s", e)

        logger.info("Ingested %d analytics records", count)
        return count

    def get_best_publish_time(
        self,
        timezone_offset: int = 0,
        earliest: Optional[datetime] = None,
    ) -> datetime:
        """
        Determine the optimal publish time.

        Args:
            timezone_offset: UTC offset in hours (e.g., -5 for EST).
            earliest: Earliest acceptable publish time.

        Returns:
            datetime for optimal publishing.
        """
        if not self.hour_performance:
            # Default: publish in 1 hour from now
            fallback = (datetime.now(timezone.utc).replace(microsecond=0)
                        + __import__("datetime").timedelta(hours=1))
            logger.warning("No analytics data, using fallback: %s", fallback)
            return fallback

        # Find best hour by average score
        best_hour = max(
            self.hour_performance.keys(),
            key=lambda h: sum(self.hour_performance[h]) / len(self.hour_performance[h]),
        )

        # Find best day
        best_day = max(
            self.day_performance.keys(),
            key=lambda d: sum(self.day_performance[d]) / len(self.day_performance[d]),
        )

        # Calculate the next occurrence of best_day/best_hour
        now = datetime.now(timezone.utc)
        candidate = now.replace(
            hour=best_hour,
            minute=0,
            second=0,
            microsecond=0,
        )

        # Adjust for timezone
        candidate = candidate.replace(tzinfo=timezone.utc)

        # If today's best time has passed, find the next occurrence
        days_ahead = best_day - now.weekday()
        if days_ahead < 0:
            days_ahead += 7

        from datetime import timedelta

        if days_ahead == 0 and candidate <= now:
            days_ahead = 7  # Next week

        optimal = now + timedelta(days=days_ahead)
        optimal = optimal.replace(hour=best_hour, minute=0, second=0, microsecond=0)

        if earliest and optimal < earliest:
            optimal = earliest

        logger.info(
            "Best publish time: %s (day=%d, hour=%d UTC)",
            optimal.isoformat(),
            best_day,
            best_hour,
        )
        return optimal

    def get_summary(self) -> dict:
        """Return a summary of the analysis."""
        if not self.hour_performance:
            return {"status": "no_data"}

        best_hour = max(
            self.hour_performance.keys(),
            key=lambda h: sum(self.hour_performance[h]) / len(self.hour_performance[h]),
        )
        best_hour_score = sum(self.hour_performance[best_hour]) / len(
            self.hour_performance[best_hour]
        )

        best_day = max(
            self.day_performance.keys(),
            key=lambda d: sum(self.day_performance[d]) / len(self.day_performance[d]),
        )
        day_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

        return {
            "status": "ok",
            "records_analyzed": sum(len(v) for v in self.hour_performance.values()),
            "best_hour_utc": best_hour,
            "best_hour_score": round(best_hour_score, 2),
            "best_day": day_names[best_day],
            "best_day_index": best_day,
            "hour_scores": {
                h: round(sum(scores) / len(scores), 2)
                for h, scores in sorted(self.hour_performance.items())
            },
            "day_scores": {
                day_names[d]: round(sum(scores) / len(scores), 2)
                for d, scores in sorted(self.day_performance.items())
            },
        }
