from __future__ import annotations
"""FastAPI server for the upload pipeline — called by n8n workflows."""

import asyncio
import logging
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from src.config import config
from src.pipeline import UploadPipeline

logging.basicConfig(
    level=getattr(logging, config.log_level),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

# Global pipeline instance (initialized on startup)
pipeline: Optional[UploadPipeline] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize the pipeline on startup."""
    global pipeline
    logger.info("Initializing upload pipeline...")
    pipeline = UploadPipeline(
        channel_name=config.__dict__.get("channel_name", ""),
        channel_default_tags=config.__dict__.get("default_tags"),
    )
    logger.info("Pipeline initialized")
    yield
    logger.info("Shutting down pipeline...")


app = FastAPI(
    title="YouTube Upload & Cross-Post Pipeline API",
    description="API for automated YouTube uploads and cross-platform posting",
    version="1.0.0",
    lifespan=lifespan,
)


class ProcessRequest(BaseModel):
    """Request to process a specific queue item."""
    queue_id: str
    video_path: str
    metadata: dict = {}


class EnqueueRequest(BaseModel):
    """Request to enqueue a new video."""
    video_path: str
    metadata: dict = {}
    schedule: str = "immediate"


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "version": "1.0.0"}


@app.post("/api/process")
async def process_queue_item(req: ProcessRequest):
    """
    Process a single queue item through the upload pipeline.

    Called by n8n when a new row is inserted into yt_upload_queue.
    """
    if not pipeline:
        raise HTTPException(status_code=503, detail="Pipeline not initialized")

    try:
        queue_item = {
            "id": req.queue_id,
            "video_path": req.video_path,
            "metadata": req.metadata,
        }
        result = await pipeline._process_single(queue_item)
        return result
    except Exception as e:
        logger.error("Process failed: %s", e)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/process-all")
async def process_all():
    """Process all pending and ready queue items."""
    if not pipeline:
        raise HTTPException(status_code=503, detail="Pipeline not initialized")

    results = await pipeline.process_queue()
    return {"processed": len(results), "results": results}


@app.post("/api/enqueue")
async def enqueue_video(req: EnqueueRequest):
    """
    Enqueue a new video for upload.

    Can be called directly or by external systems.
    """
    if not pipeline:
        raise HTTPException(status_code=503, detail="Pipeline not initialized")

    try:
        result = await pipeline.enqueue_upload(
            video_path=req.video_path,
            metadata=req.metadata,
            schedule=req.schedule,
        )
        return result
    except Exception as e:
        logger.error("Enqueue failed: %s", e)
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/analytics/predict")
async def predict_best_time():
    """Get the best time prediction based on historical analytics."""
    if not pipeline:
        raise HTTPException(status_code=503, detail="Pipeline not initialized")

    summary = pipeline.predictor.get_summary()
    best_time = pipeline.predictor.get_best_publish_time()

    return {
        "summary": summary,
        "best_publish_time": best_time.isoformat(),
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
