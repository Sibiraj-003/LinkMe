-- Create cards table
CREATE TABLE public.cards (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    name TEXT,
    designation TEXT,
    company TEXT,
    email TEXT,
    mobile TEXT,
    bio TEXT,
    "resumeUrl" TEXT,
    "profilePic" TEXT,
    github TEXT,
    linkedin TEXT,
    twitter TEXT,
    instagram TEXT,
    youtube TEXT,
    hackerrank TEXT,
    behance TEXT,
    dribbble TEXT,
    "themeData" JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create portfolios table
CREATE TABLE public.portfolios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    items JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;

-- Cards Policies
CREATE POLICY "Public cards are viewable by everyone."
ON public.cards FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own card."
ON public.cards FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own card."
ON public.cards FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can delete own card."
ON public.cards FOR DELETE
USING (auth.uid() = id);

-- Portfolios Policies
CREATE POLICY "Public portfolios are viewable by everyone."
ON public.portfolios FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own portfolio."
ON public.portfolios FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own portfolio."
ON public.portfolios FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can delete own portfolio."
ON public.portfolios FOR DELETE
USING (auth.uid() = id);

-- Create indexes
CREATE INDEX idx_cards_username ON public.cards(username);
CREATE INDEX idx_cards_user_id ON public.cards(user_id);
CREATE INDEX idx_portfolios_user_id ON public.portfolios(user_id);

-- Set up storage
insert into storage.buckets (id, name, public) values ('resumes', 'resumes', true);

create policy "Resumes are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'resumes' );

create policy "Users can upload their own resumes"
  on storage.objects for insert
  with check ( bucket_id = 'resumes' and auth.uid()::text = (storage.foldername(name))[1] );

create policy "Users can update their own resumes"
  on storage.objects for update
  using ( bucket_id = 'resumes' and auth.uid()::text = (storage.foldername(name))[1] );

create policy "Users can delete their own resumes"
  on storage.objects for delete
  using ( bucket_id = 'resumes' and auth.uid()::text = (storage.foldername(name))[1] );
