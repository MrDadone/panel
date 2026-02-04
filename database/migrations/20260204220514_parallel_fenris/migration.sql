ALTER TABLE "backup_configurations" ADD COLUMN "maintenance" boolean DEFAULT false NOT NULL;
ALTER TABLE "database_hosts" ADD COLUMN "maintenance" boolean DEFAULT false NOT NULL;