import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_projects_admin_status" AS ENUM('none', 'terminated', 'admin-completed');
  CREATE TYPE "public"."enum_projects_priority" AS ENUM('critical', 'high', 'medium', 'low');
  ALTER TABLE "projects" ALTER COLUMN "color" SET DEFAULT '#00f0ff';
  ALTER TABLE "projects" ADD COLUMN "featured_image_id" integer;
  ALTER TABLE "projects" ADD COLUMN "video_resource_id" integer;
  ALTER TABLE "projects" ADD COLUMN "video_title" varchar;
  ALTER TABLE "projects" ADD COLUMN "admin_status" "enum_projects_admin_status" DEFAULT 'none';
  ALTER TABLE "projects" ADD COLUMN "computed_progress" numeric DEFAULT 0;
  ALTER TABLE "projects" ADD COLUMN "admin_forced_progress" numeric;
  ALTER TABLE "projects" ADD COLUMN "start_date" timestamp(3) with time zone;
  ALTER TABLE "projects" ADD COLUMN "planner_id" varchar;
  ALTER TABLE "projects" ADD COLUMN "notes" varchar;
  ALTER TABLE "projects" ADD COLUMN "priority" "enum_projects_priority" DEFAULT 'medium';
  ALTER TABLE "projects" ADD CONSTRAINT "projects_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_video_resource_id_media_id_fk" FOREIGN KEY ("video_resource_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "projects_featured_image_idx" ON "projects" USING btree ("featured_image_id");
  CREATE INDEX "projects_video_resource_idx" ON "projects" USING btree ("video_resource_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "projects" DROP CONSTRAINT "projects_featured_image_id_media_id_fk";
  
  ALTER TABLE "projects" DROP CONSTRAINT "projects_video_resource_id_media_id_fk";
  
  DROP INDEX "projects_featured_image_idx";
  DROP INDEX "projects_video_resource_idx";
  ALTER TABLE "projects" ALTER COLUMN "color" DROP DEFAULT;
  ALTER TABLE "projects" DROP COLUMN "featured_image_id";
  ALTER TABLE "projects" DROP COLUMN "video_resource_id";
  ALTER TABLE "projects" DROP COLUMN "video_title";
  ALTER TABLE "projects" DROP COLUMN "admin_status";
  ALTER TABLE "projects" DROP COLUMN "computed_progress";
  ALTER TABLE "projects" DROP COLUMN "admin_forced_progress";
  ALTER TABLE "projects" DROP COLUMN "start_date";
  ALTER TABLE "projects" DROP COLUMN "planner_id";
  ALTER TABLE "projects" DROP COLUMN "notes";
  ALTER TABLE "projects" DROP COLUMN "priority";
  DROP TYPE "public"."enum_projects_admin_status";
  DROP TYPE "public"."enum_projects_priority";`)
}
