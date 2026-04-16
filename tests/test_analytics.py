from __future__ import annotations
"""Tests for the best-time prediction module."""

from datetime import datetime, timezone, timedelta

from src.analytics.best_time import BestTimePredictor


class TestBestTimePredictor:
    def setup_method(self):
        self.predictor = BestTimePredictor()

    def test_ingest_analytics(self):
        records = [
            {
                "publish_time": "2026-04-01T10:00:00Z",
                "views_24h": 1000,
                "views_7d": 5000,
                "engagement_rate": 0.05,
            },
            {
                "publish_time": "2026-04-02T14:00:00Z",
                "views_24h": 2000,
                "views_7d": 8000,
                "engagement_rate": 0.08,
            },
        ]
        count = self.predictor.ingest_analytics(records)
        assert count == 2
        assert 10 in self.predictor.hour_performance
        assert 14 in self.predictor.hour_performance

    def test_ingest_skips_malformed(self):
        records = [
            {"publish_time": "invalid-date", "views_24h": 1000},
            {
                "publish_time": "2026-04-01T10:00:00Z",
                "views_24h": 1000,
                "views_7d": 5000,
            },
        ]
        count = self.predictor.ingest_analytics(records)
        assert count == 1  # Only the valid one

    def test_get_best_publish_time_no_data(self):
        # With no data, should return a fallback time
        result = self.predictor.get_best_publish_time()
        assert isinstance(result, datetime)

    def test_get_best_publish_time_with_data(self):
        # Create records all at hour 15 (best performance)
        records = []
        for i in range(10):
            records.append({
                "publish_time": f"2026-04-{i+1:02d}T15:00:00Z",
                "views_24h": 5000,
                "views_7d": 20000,
                "engagement_rate": 0.1,
            })
        # Add some at hour 10 with worse performance
        for i in range(5):
            records.append({
                "publish_time": f"2026-04-{i+1:02d}T10:00:00Z",
                "views_24h": 100,
                "views_7d": 500,
                "engagement_rate": 0.01,
            })

        self.predictor.ingest_analytics(records)
        best_time = self.predictor.get_best_publish_time()

        # Should pick hour 15
        assert best_time.hour == 15

    def test_get_summary_no_data(self):
        summary = self.predictor.get_summary()
        assert summary["status"] == "no_data"

    def test_get_summary_with_data(self):
        records = [
            {
                "publish_time": "2026-04-01T10:00:00Z",
                "views_24h": 1000,
                "views_7d": 5000,
                "engagement_rate": 0.05,
            },
        ]
        self.predictor.ingest_analytics(records)
        summary = self.predictor.get_summary()

        assert summary["status"] == "ok"
        assert summary["records_analyzed"] == 1
        assert summary["best_hour_utc"] == 10
        assert "hour_scores" in summary
        assert "day_scores" in summary

    def test_earliest_constraint(self):
        records = [
            {
                "publish_time": "2026-04-01T10:00:00Z",
                "views_24h": 1000,
                "views_7d": 5000,
                "engagement_rate": 0.05,
            },
        ]
        self.predictor.ingest_analytics(records)

        # Set earliest to far in the future
        earliest = datetime.now(timezone.utc) + timedelta(days=30)
        best_time = self.predictor.get_best_publish_time(earliest=earliest)

        assert best_time >= earliest

    def test_composite_score_weights_views(self):
        """Verify that views_24h is weighted more than views_7d in the composite score."""
        # Use values where the 70% weight on 24h clearly dominates
        # Hour 10: 24h=50000, 7d=100 -> score = 0.7*50000 + 0.3*100 = 35030
        # Hour 14: 24h=100, 7d=50000 -> score = 0.7*100 + 0.3*50000 = 15070
        records = [
            {
                "publish_time": "2026-04-01T10:00:00Z",
                "views_24h": 50000,
                "views_7d": 100,
                "engagement_rate": 0.0,
            },
            {
                "publish_time": "2026-04-02T10:00:00Z",
                "views_24h": 50000,
                "views_7d": 100,
                "engagement_rate": 0.0,
            },
            {
                "publish_time": "2026-04-01T14:00:00Z",
                "views_24h": 100,
                "views_7d": 50000,
                "engagement_rate": 0.0,
            },
            {
                "publish_time": "2026-04-02T14:00:00Z",
                "views_24h": 100,
                "views_7d": 50000,
                "engagement_rate": 0.0,
            },
        ]
        self.predictor.ingest_analytics(records)
        summary = self.predictor.get_summary()

        # Hour 10 should score higher: 35030 > 15070
        assert summary["hour_scores"][10] > summary["hour_scores"][14]
