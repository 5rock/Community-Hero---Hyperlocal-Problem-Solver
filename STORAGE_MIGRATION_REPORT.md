# Storage Migration Report

**Date:** 2026-06-29
**From:** Local Filesystem (`/uploads`)
**To:** Supabase Storage (`issues` bucket)

## Overview
This report details the migration of user-uploaded images from the local FastAPI static directory to a cloud-based Supabase Storage bucket.

## Changes Made
- Added the `supabase` Python client library to `requirements.txt`.
- Created a new module `backend/app/supabase_client.py` for initializing and managing the connection to the Supabase API.
- Updated `backend/app/api/issues.py` to route uploads in `/analyze-preview` and `/upload` directly to Supabase Storage.
- Modified the application to store public Supabase URLs in the database `image_url` column instead of local file paths.
- Removed the local `StaticFiles` mounting for the `/uploads` directory in `backend/app/main.py`.

## Instructions for Verification
1. Ensure `SUPABASE_URL` and `SUPABASE_KEY` are present in `backend/.env`.
2. Ensure a public storage bucket named `issues` exists in the Supabase project.
3. Upload a new issue from the frontend. The image should be successfully pushed to the bucket, and the API should return a public `xyz.supabase.co/storage/v1/object/public/issues/...` URL.
