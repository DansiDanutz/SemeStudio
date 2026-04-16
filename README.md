# YouTube Upload & Cross-Post Automation Pipeline

Automated pipeline for uploading videos to YouTube and cross-posting to TikTok, LinkedIn, Twitter/X, and Instagram.

## Architecture

```
n8n (trigger) → Supabase (yt_upload_queue insert) → Pipeline API → YouTube Upload → Cross-Post
```

## Components

| Module | Description |
|--------|-------------|
| `src/upload/youtube.py` | YouTube Data API v3 upload with resumable uploads |
| `src/seo/metadata.py` | SEO-optimized title, description, tags, thumbnail generation |
| `src/analytics/best_time.py` | Best-time prediction from channel analytics |
| `src/crosspost/` | Cross-posting to TikTok, LinkedIn, Twitter, Instagram |
| `src/supabase/client.py` | Supabase database operations |
| `src/pipeline.py` | Main orchestrator coordinating the full pipeline |
| `src/api.py` | FastAPI server for n8n integration |

## Setup

### 1. Install dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your API credentials
```

### 3. Set up the database

Run `supabase_schema.sql` in your Supabase SQL editor to create all required tables.

### 4. OAuth for YouTube

```bash
# Generate OAuth2 credentials from Google Cloud Console
# Save as credentials/youtube_credentials.json
```

## Usage

### Enqueue a video

```bash
python scripts/cli.py enqueue /path/to/video.mp4 --metadata-file metadata.json
```

Example `metadata.json`:

```json
{
  "title": "How to Build AI Agents",
  "description": "A comprehensive guide to building AI agents...",
  "tags": ["ai", "agents", "tutorial"],
  "topic": "artificial intelligence agents",
  "category_id": "28",
  "hashtags": ["AI", "Agents", "Tutorial"],
  "timestamps": [
    ["0:00", "Introduction"],
    ["2:00", "Setup"],
    ["10:00", "Building the Agent"]
  ],
  "schedule": "optimal"
}
```

### Process the queue

```bash
python scripts/cli.py process --channel-name "My Channel"
```

### Predict best publish time

```bash
python scripts/cli.py predict
```

### Run the API server (for n8n)

```bash
python -m src.api
```

## n8n Workflow

Import `n8n-workflows/youtube-upload-crosspost.json` into your n8n instance.

The workflow:
1. **Supabase Trigger**: Listens for INSERT on `yt_upload_queue`
2. **HTTP Request**: Calls the pipeline API to process the upload
3. **Status Check**: Routes to success/error handlers
4. **Supabase Update**: Updates the queue entry status
5. **Notification**: Sends Slack/Telegram notification

## Database Schema

### Tables

- **yt_upload_queue**: Upload queue with status tracking
- **upload_status**: Per-platform upload status
- **performance**: Performance metrics (views, likes, etc.)
- **channel_analytics**: Historical analytics for best-time prediction
- **crosspost_queue**: Cross-platform posting queue

See `supabase_schema.sql` for the full schema.

## Cross-Posting Features

### TikTok
- Automatically creates 60-second clip from video (via ffmpeg)
- Uploads via TikTok Content Posting API
- Includes YouTube link in caption

### LinkedIn
- Creates text post with video thumbnail
- Includes YouTube link and description excerpt

### Twitter/X
- Creates a thread: hook + takeaways + CTA
- Respects 280-character limit per tweet

### Instagram
- Creates 9:16 Reel clip (via ffmpeg)
- Uploads via Instagram Graph API
- Includes YouTube link in caption

## Environment Variables

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Supabase service role key |
| `YOUTUBE_CLIENT_ID` | Google OAuth client ID |
| `YOUTUBE_CLIENT_SECRET` | Google OAuth client secret |
| `TIKTOK_ACCESS_TOKEN` | TikTok API access token |
| `LINKEDIN_ACCESS_TOKEN` | LinkedIn API access token |
| `TWITTER_BEARER_TOKEN` | Twitter API bearer token |
| `INSTAGRAM_ACCESS_TOKEN` | Instagram Graph API token |
| `INSTAGRAM_ACCOUNT_ID` | Instagram Business Account ID |

## Running Tests

```bash
pytest tests/ -v
```

## Dependencies

- **google-api-python-client**: YouTube Data API v3
- **supabase**: Supabase Python client
- **httpx**: Async HTTP client for API calls
- **moviepy** / **ffmpeg**: Video clipping for TikTok/Instagram
- **pydantic**: Configuration validation
- **fastapi**: API server for n8n integration
