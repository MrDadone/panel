ALTER TABLE "backup_configurations" RENAME COLUMN "maintenance" TO "maintenance_enabled";
ALTER TABLE "database_hosts" RENAME COLUMN "public" TO "deployment_enabled";
ALTER TABLE "database_hosts" RENAME COLUMN "maintenance" TO "maintenance_enabled";
ALTER TABLE "nodes" RENAME COLUMN "public" TO "deployment_enabled";
ALTER TABLE "nodes" RENAME COLUMN "maintenance" TO "maintenance_enabled";
ALTER TABLE "servers" ADD COLUMN "kvm_passthrough_enabled" boolean DEFAULT false NOT NULL;