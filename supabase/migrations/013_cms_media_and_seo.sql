-- 013_cms_media_and_seo.sql
-- Urgent Taxis Platform - Migration 013: CMS, Banners, Media and SEO Meta Management

CREATE TABLE cms_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  content_markdown TEXT,
  meta_title VARCHAR(255),
  meta_description TEXT,
  canonical_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  bucket_name VARCHAR(100) NOT NULL,
  file_type VARCHAR(50),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_cms_pages_slug ON cms_pages(slug);
