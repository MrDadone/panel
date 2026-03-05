ALTER TABLE "users" ALTER COLUMN "language" SET DEFAULT 'en';
UPDATE "users" SET "language" = 'en' WHERE "language" = 'en-US';
UPDATE "users" SET "language" = 'de' WHERE "language" = 'de-DE';
UPDATE "users" SET "language" = 'ro' WHERE "language" = 'ro-RO';
UPDATE "users" SET "language" = 'it' WHERE "language" = 'it-IT';
UPDATE "settings" SET "value" = 'en' WHERE "key" = 'app::language' AND "value" = 'en-US';
UPDATE "settings" SET "value" = 'de' WHERE "key" = 'app::language' AND "value" = 'de-DE';
UPDATE "settings" SET "value" = 'ro' WHERE "key" = 'app::language' AND "value" = 'ro-RO';
UPDATE "settings" SET "value" = 'it' WHERE "key" = 'app::language' AND "value" = 'it-IT';