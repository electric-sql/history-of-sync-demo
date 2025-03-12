ALTER TABLE "audit_logs" ALTER COLUMN "timestamp" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "todos" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "todos" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;