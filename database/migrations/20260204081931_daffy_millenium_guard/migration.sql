ALTER TABLE "nodes" ADD COLUMN "maintenance" boolean DEFAULT false NOT NULL;
ALTER TABLE "nodes" DROP COLUMN "maintenance_message";
ALTER TABLE "nodes" ALTER COLUMN "public" SET DEFAULT false;