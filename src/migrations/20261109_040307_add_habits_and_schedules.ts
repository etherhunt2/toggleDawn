import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_habits_frequency" AS ENUM('daily', 'weekly', 'custom');
  CREATE TYPE "public"."enum_schedules_category" AS ENUM('study', 'work', 'exercise', 'social', 'rest', 'other');
  CREATE TABLE "habits" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"frequency" "enum_habits_frequency" DEFAULT 'daily' NOT NULL,
  	"streak" numeric DEFAULT 0,
  	"best_streak" numeric DEFAULT 0,
  	"completed_dates" jsonb DEFAULT '[]'::jsonb,
  	"color" varchar DEFAULT '#00ff9d',
  	"is_active" boolean DEFAULT true,
  	"mission_id" integer,
  	"owner_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "schedules" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"date" timestamp(3) with time zone NOT NULL,
  	"start_time" varchar NOT NULL,
  	"end_time" varchar NOT NULL,
  	"category" "enum_schedules_category" DEFAULT 'study' NOT NULL,
  	"is_recurring" boolean DEFAULT false,
  	"recurring_days" jsonb DEFAULT '[]'::jsonb,
  	"color" varchar DEFAULT '#00ff9d',
  	"is_completed" boolean DEFAULT false,
  	"mission_id" integer,
  	"owner_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "habits_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "schedules_id" integer;
  ALTER TABLE "habits" ADD CONSTRAINT "habits_mission_id_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."missions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "habits" ADD CONSTRAINT "habits_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "schedules" ADD CONSTRAINT "schedules_mission_id_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."missions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "schedules" ADD CONSTRAINT "schedules_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "habits_mission_idx" ON "habits" USING btree ("mission_id");
  CREATE INDEX "habits_owner_idx" ON "habits" USING btree ("owner_id");
  CREATE INDEX "habits_updated_at_idx" ON "habits" USING btree ("updated_at");
  CREATE INDEX "habits_created_at_idx" ON "habits" USING btree ("created_at");
  CREATE INDEX "schedules_mission_idx" ON "schedules" USING btree ("mission_id");
  CREATE INDEX "schedules_owner_idx" ON "schedules" USING btree ("owner_id");
  CREATE INDEX "schedules_updated_at_idx" ON "schedules" USING btree ("updated_at");
  CREATE INDEX "schedules_created_at_idx" ON "schedules" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_habits_fk" FOREIGN KEY ("habits_id") REFERENCES "public"."habits"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_schedules_fk" FOREIGN KEY ("schedules_id") REFERENCES "public"."schedules"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_habits_id_idx" ON "payload_locked_documents_rels" USING btree ("habits_id");
  CREATE INDEX "payload_locked_documents_rels_schedules_id_idx" ON "payload_locked_documents_rels" USING btree ("schedules_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "habits" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "schedules" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "habits" CASCADE;
  DROP TABLE "schedules" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_habits_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_schedules_fk";
  
  DROP INDEX "payload_locked_documents_rels_habits_id_idx";
  DROP INDEX "payload_locked_documents_rels_schedules_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "habits_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "schedules_id";
  DROP TYPE "public"."enum_habits_frequency";
  DROP TYPE "public"."enum_schedules_category";`)
}
