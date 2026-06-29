# Supabase Setup Guide

This project has been migrated from SQLite and local filesystem storage to Supabase PostgreSQL and Supabase Storage.

## 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com/) and create a new project.
2. Under project settings, find your **Project URL** and **Anon/Public API Key**.
3. Under database settings, find your **PostgreSQL Connection String**.

## 2. Set Up the Storage Bucket

1. In the Supabase dashboard, navigate to **Storage**.
2. Click **New Bucket**.
3. Name the bucket `issues`.
4. Ensure the bucket is set to **Public**.
5. Save the bucket.

## 3. Environment Variables

Create or update the `backend/.env` file with the credentials from your Supabase dashboard:

```env
DATABASE_URL=postgresql+psycopg2://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:5432/postgres
SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
SUPABASE_KEY=[YOUR-ANON-API-KEY]
```

## 4. Database Migrations

Ensure the database schema is initialized by running Alembic migrations:

```bash
cd backend
alembic upgrade head
```

This will create all the necessary tables in your new Supabase PostgreSQL database.
