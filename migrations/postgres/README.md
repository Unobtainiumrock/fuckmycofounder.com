# PostgreSQL migrations

This isolated forward migration chain owns the server-backed network schema.
The legacy root `migrations/0001_threads.sql` remains the deployed Cloudflare/D1
schema and is intentionally not consumed by the PostgreSQL runner.
