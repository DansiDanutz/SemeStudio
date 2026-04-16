export type PlanTier = "free" | "starter" | "pro" | "agency";

/** Sentinel value stored in profiles.plan when the last payment failed. */
export type PlanStatus = PlanTier | "payment_failed";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  plan: PlanTier;
  credits_remaining: number;
  credits_reset_at: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Channel {
  id: string;
  user_id: string;
  youtube_channel_id: string;
  title: string;
  thumbnail_url: string | null;
  subscriber_count: number;
  video_count: number;
  connected_at: string;
  access_token_encrypted: string | null;
  refresh_token_encrypted: string | null;
}

export type VideoStatus =
  | "draft"
  | "scripting"
  | "editing"
  | "scheduled"
  | "published"
  | "archived";

export interface Video {
  id: string;
  channel_id: string;
  user_id: string;
  youtube_video_id: string | null;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  status: VideoStatus;
  views: number;
  likes: number;
  comments: number;
  watch_time_hours: number;
  ctr: number;
  revenue: number;
  published_at: string | null;
  scheduled_at: string | null;
  created_at: string;
  updated_at: string;
}

export type ScriptStatus = "draft" | "in_progress" | "complete" | "archived";
export type ScriptStyle =
  | "educational"
  | "tutorial"
  | "opinion"
  | "story"
  | "review"
  | "news";

export interface Script {
  id: string;
  user_id: string;
  video_id: string | null;
  topic: string;
  target_audience: string;
  duration_minutes: number;
  style: ScriptStyle;
  content: string | null;
  word_count: number;
  status: ScriptStatus;
  credits_used: number;
  created_at: string;
  updated_at: string;
}

export type ThumbnailStyle =
  | "minimal"
  | "bold"
  | "face_text"
  | "cinematic"
  | "meme"
  | "tutorial";

export interface Thumbnail {
  id: string;
  user_id: string;
  video_id: string | null;
  title: string;
  style: ThumbnailStyle;
  color_theme: string;
  image_url: string;
  variant_index: number;
  selected: boolean;
  credits_used: number;
  created_at: string;
}

export interface SeoConfig {
  id: string;
  user_id: string;
  video_id: string | null;
  input_topic: string;
  titles: string[];
  description: string;
  tags: string[];
  chapters: string[];
  ctr_score: number;
  credits_used: number;
  created_at: string;
}

export interface ResearchTopic {
  id: string;
  user_id: string;
  query: string;
  topics: ResearchResult[];
  credits_used: number;
  created_at: string;
}

export interface ResearchResult {
  title: string;
  search_volume: number;
  competition: "low" | "medium" | "high";
  trend: "rising" | "stable" | "declining";
  score: number;
}

export interface AnalyticsSnapshot {
  id: string;
  channel_id: string;
  date: string;
  views: number;
  watch_time_hours: number;
  subscribers_gained: number;
  revenue: number;
  top_video_id: string | null;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number;
  type:
    | "ai_script"
    | "ai_thumbnail"
    | "ai_seo"
    | "transcription"
    | "research"
    | "shorts_factory"
    | "purchase"
    | "subscription_reset"
    | "bonus";
  description: string;
  created_at: string;
}

export type CreditActionType =
  | "ai_script"
  | "ai_thumbnail"
  | "ai_seo"
  | "transcription"
  | "research"
  | "shorts_factory";
