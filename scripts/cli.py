"""CLI entry point for the upload automation pipeline."""

import argparse
import asyncio
import json
import logging
import sys
from pathlib import Path

from src.config import config
from src.pipeline import UploadPipeline
from src.supabase.client import get_supabase_client, UploadQueueService


def setup_logging(level: str = "INFO") -> None:
    """Configure logging for the pipeline."""
    logging.basicConfig(
        level=getattr(logging, level),
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )


def cmd_process(args: argparse.Namespace) -> None:
    """Process the upload queue."""
    setup_logging(config.log_level)
    pipeline = UploadPipeline(
        channel_name=args.channel_name or "",
        channel_default_tags=args.default_tags,
    )
    results = asyncio.run(pipeline.process_queue())
    print(json.dumps(results, indent=2, default=str))


def cmd_enqueue(args: argparse.Namespace) -> None:
    """Enqueue a new video for upload."""
    setup_logging(config.log_level)
    client = get_supabase_client()
    queue = UploadQueueService(client)

    metadata = {}
    if args.metadata_file:
        with open(args.metadata_file) as f:
            metadata = json.load(f)

    result = queue.enqueue(args.video_path, metadata=metadata)
    print(json.dumps(result, indent=2, default=str))


def cmd_predict(args: argparse.Namespace) -> None:
    """Show best-time prediction based on analytics."""
    setup_logging(config.log_level)
    from src.analytics.best_time import BestTimePredictor
    from src.supabase.client import ChannelAnalyticsService

    client = get_supabase_client()
    analytics = ChannelAnalyticsService(client)
    predictor = BestTimePredictor()

    records = analytics.get_historical(limit=200)
    predictor.ingest_analytics(records)

    summary = predictor.get_summary()
    print(json.dumps(summary, indent=2))

    best_time = predictor.get_best_publish_time()
    print(f"\nBest publish time: {best_time.isoformat()}")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="YouTube Upload & Cross-Post Automation Pipeline"
    )
    parser.add_argument(
        "--channel-name",
        default="",
        help="YouTube channel name for SEO tagging",
    )
    parser.add_argument(
        "--default-tags",
        nargs="*",
        default=None,
        help="Default tags to apply to all uploads",
    )

    subparsers = parser.add_subparsers(dest="command", help="Command to run")

    # process - process the queue
    process_parser = subparsers.add_parser("process", help="Process upload queue")
    process_parser.set_defaults(func=cmd_process)

    # enqueue - add a video to the queue
    enqueue_parser = subparsers.add_parser("enqueue", help="Enqueue a video")
    enqueue_parser.add_argument("video_path", help="Path to the video file")
    enqueue_parser.add_argument(
        "--metadata-file",
        help="Path to a JSON file with metadata (title, description, tags, etc.)",
    )
    enqueue_parser.set_defaults(func=cmd_enqueue)

    # predict - show best-time prediction
    predict_parser = subparsers.add_parser("predict", help="Predict best publish time")
    predict_parser.set_defaults(func=cmd_predict)

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(1)

    args.func(args)


if __name__ == "__main__":
    main()
