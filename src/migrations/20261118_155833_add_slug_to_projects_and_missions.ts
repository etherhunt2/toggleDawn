import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "projects" ADD COLUMN "generate_slug" boolean DEFAULT true;
  ALTER TABLE "projects" ADD COLUMN "slug" varchar;
  ALTER TABLE "missions" ADD COLUMN "generate_slug" boolean DEFAULT true;
  ALTER TABLE "missions" ADD COLUMN "slug" varchar;

  UPDATE "projects" SET "slug" = trim(both '-' from lower(regexp_replace(regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g'), '-+', '-', 'g'))) WHERE "slug" IS NULL;
  UPDATE "projects" SET "slug" = 'project-' || id WHERE "slug" IS NULL OR "slug" = '';

  UPDATE "missions" SET "slug" = trim(both '-' from lower(regexp_replace(regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g'), '-+', '-', 'g'))) WHERE "slug" IS NULL;
  UPDATE "missions" SET "slug" = 'mission-' || id WHERE "slug" IS NULL OR "slug" = '';

  ALTER TABLE "projects" ALTER COLUMN "slug" SET NOT NULL;
  ALTER TABLE "missions" ALTER COLUMN "slug" SET NOT NULL;

  CREATE UNIQUE INDEX "projects_slug_idx" ON "projects" USING btree ("slug");
  CREATE UNIQUE INDEX "missions_slug_idx" ON "missions" USING btree ("slug");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "projects_slug_idx";
  DROP INDEX "missions_slug_idx";
  ALTER TABLE "projects" DROP COLUMN "generate_slug";
  ALTER TABLE "projects" DROP COLUMN "slug";
  ALTER TABLE "missions" DROP COLUMN "generate_slug";
  ALTER TABLE "missions" DROP COLUMN "slug";`)
}
