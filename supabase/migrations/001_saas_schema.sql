-- SemeStudio SaaS Schema
-- Full database schema with RLS policies

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  plan text not null default 'free' check (plan in ('free', 'starter', 'pro', 'agency')),
  credits_remaining int not null default 10,
  credits_reset_at timestamptz not null default (now() + interval '30 days'),
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- YouTube Channels
create table public.yt_channels (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  youtube_channel_id text not null,
  title text not null,
  thumbnail_url text,
  subscriber_count int not null default 0,
  video_count int not null default 0,
  connected_at timestamptz not null default now(),
  access_token_encrypted text,
  refresh_token_encrypted text,
  unique(user_id, youtube_channel_id)
);

-- Credit Transactions
create table public.credit_transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  amount int not null,
  type text not null check (type in (
    'ai_script', 'ai_thumbnail', 'ai_seo', 'transcription',
    'research', 'shorts_factory', 'purchase', 'subscription_reset', 'bonus'
  )),
  description text not null default '',
  created_at timestamptz not null default now()
);

-- YouTube Videos
create table public.yt_videos (
  id uuid primary key default uuid_generate_v4(),
  channel_id uuid references public.yt_channels(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  youtube_video_id text,
  title text not null,
  description text,
  thumbnail_url text,
  status text not null default 'draft' check (status in ('draft', 'scripting', 'editing', 'scheduled', 'published', 'archived')),
  views int not null default 0,
  likes int not null default 0,
  comments int not null default 0,
  watch_time_hours numeric not null default 0,
  ctr numeric not null default 0,
  revenue numeric not null default 0,
  published_at timestamptz,
  scheduled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Scripts
create table public.yt_scripts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  video_id uuid references public.yt_videos(id) on delete set null,
  topic text not null,
  target_audience text not null default '',
  duration_minutes int not null default 10,
  style text not null default 'educational' check (style in ('educational', 'tutorial', 'opinion', 'story', 'review', 'news')),
  content text,
  word_count int not null default 0,
  status text not null default 'draft' check (status in ('draft', 'in_progress', 'complete', 'archived')),
  credits_used int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Thumbnails
create table public.yt_thumbnails (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  video_id uuid references public.yt_videos(id) on delete set null,
  title text not null,
  style text not null default 'bold' check (style in ('minimal', 'bold', 'face_text', 'cinematic', 'meme', 'tutorial')),
  color_theme text not null default '#FF0000',
  image_url text not null default '',
  variant_index int not null default 0,
  selected boolean not null default false,
  credits_used int not null default 0,
  created_at timestamptz not null default now()
);

-- SEO Configs
create table public.yt_seo_configs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  video_id uuid references public.yt_videos(id) on delete set null,
  input_topic text not null,
  titles jsonb not null default '[]',
  description text not null default '',
  tags jsonb not null default '[]',
  chapters jsonb not null default '[]',
  ctr_score int not null default 0,
  credits_used int not null default 0,
  created_at timestamptz not null default now()
);

-- Research Topics
create table public.yt_research_topics (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  query text not null,
  topics jsonb not null default '[]',
  credits_used int not null default 0,
  created_at timestamptz not null default now()
);

-- Analytics Snapshots
create table public.yt_analytics (
  id uuid primary key default uuid_generate_v4(),
  channel_id uuid references public.yt_channels(id) on delete cascade not null,
  date date not null,
  views int not null default 0,
  watch_time_hours numeric not null default 0,
  subscribers_gained int not null default 0,
  revenue numeric not null default 0,
  top_video_id uuid references public.yt_videos(id) on delete set null,
  unique(channel_id, date)
);

-- Indexes
create index idx_credit_tx_user on public.credit_transactions(user_id, created_at desc);
create index idx_videos_channel on public.yt_videos(channel_id, created_at desc);
create index idx_videos_user on public.yt_videos(user_id, status);
create index idx_scripts_user on public.yt_scripts(user_id, status);
create index idx_thumbnails_user on public.yt_thumbnails(user_id, created_at desc);
create index idx_seo_user on public.yt_seo_configs(user_id, created_at desc);
create index idx_research_user on public.yt_research_topics(user_id, created_at desc);
create index idx_analytics_channel on public.yt_analytics(channel_id, date desc);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.yt_channels enable row level security;
alter table public.credit_transactions enable row level security;
alter table public.yt_videos enable row level security;
alter table public.yt_scripts enable row level security;
alter table public.yt_thumbnails enable row level security;
alter table public.yt_seo_configs enable row level security;
alter table public.yt_research_topics enable row level security;
alter table public.yt_analytics enable row level security;

-- RLS Policies: Users can only access their own data
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can view own channels"
  on public.yt_channels for select using (auth.uid() = user_id);
create policy "Users can insert own channels"
  on public.yt_channels for insert with check (auth.uid() = user_id);
create policy "Users can update own channels"
  on public.yt_channels for update using (auth.uid() = user_id);
create policy "Users can delete own channels"
  on public.yt_channels for delete using (auth.uid() = user_id);

create policy "Users can view own transactions"
  on public.credit_transactions for select using (auth.uid() = user_id);
create policy "Users can insert own transactions"
  on public.credit_transactions for insert with check (auth.uid() = user_id);

create policy "Users can view own videos"
  on public.yt_videos for select using (auth.uid() = user_id);
create policy "Users can insert own videos"
  on public.yt_videos for insert with check (auth.uid() = user_id);
create policy "Users can update own videos"
  on public.yt_videos for update using (auth.uid() = user_id);
create policy "Users can delete own videos"
  on public.yt_videos for delete using (auth.uid() = user_id);

create policy "Users can view own scripts"
  on public.yt_scripts for select using (auth.uid() = user_id);
create policy "Users can insert own scripts"
  on public.yt_scripts for insert with check (auth.uid() = user_id);
create policy "Users can update own scripts"
  on public.yt_scripts for update using (auth.uid() = user_id);
create policy "Users can delete own scripts"
  on public.yt_scripts for delete using (auth.uid() = user_id);

create policy "Users can view own thumbnails"
  on public.yt_thumbnails for select using (auth.uid() = user_id);
create policy "Users can insert own thumbnails"
  on public.yt_thumbnails for insert with check (auth.uid() = user_id);

create policy "Users can view own seo configs"
  on public.yt_seo_configs for select using (auth.uid() = user_id);
create policy "Users can insert own seo configs"
  on public.yt_seo_configs for insert with check (auth.uid() = user_id);

create policy "Users can view own research"
  on public.yt_research_topics for select using (auth.uid() = user_id);
create policy "Users can insert own research"
  on public.yt_research_topics for insert with check (auth.uid() = user_id);

create policy "Users can view own analytics"
  on public.yt_analytics for select using (
    channel_id in (
      select id from public.yt_channels where user_id = auth.uid()
    )
  );

-- Trigger: auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', '')
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Trigger: update updated_at timestamp
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.update_updated_at();

create trigger videos_updated_at
  before update on public.yt_videos
  for each row execute procedure public.update_updated_at();

create trigger scripts_updated_at
  before update on public.yt_scripts
  for each row execute procedure public.update_updated_at();
