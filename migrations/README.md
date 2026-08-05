# Production migrations

This directory is intentionally empty until an owning product change introduces
its first production table. Use ordered `13-digit_description.mjs` forward
migrations. Never put test fixtures here; the disposable foundation schema lives
under `tests/fixtures/postgres/migrations/`.
