import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_mission_types_blocks_time_slot_tracking_slots_slot_name" AS ENUM('morning', 'afternoon', 'evening', 'night', 'custom');
  CREATE TYPE "public"."enum_mission_types_icon_mode" AS ENUM('preset', 'upload');
  CREATE TYPE "public"."enum_mission_types_preset_icon" AS ENUM('study', 'habit', 'hobby', 'coding', 'lead-gen', 'writing', 'music', 'meditation', 'communication', 'research', 'analytics', 'general');
  CREATE TYPE "public"."enum_missions_target_config_weekly_active_days" AS ENUM('mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun');
  CREATE TYPE "public"."enum_missions_target_config_time_slots_slot_name" AS ENUM('morning', 'afternoon', 'evening', 'night', 'custom');
  CREATE TYPE "public"."enum_missions_admin_status" AS ENUM('none', 'terminated', 'admin-completed');
  CREATE TYPE "public"."enum_missions_target_config_mode" AS ENUM('total', 'daily', 'weekly', 'time-slots', 'custom');
  CREATE TYPE "public"."enum_missions_priority" AS ENUM('critical', 'high', 'medium', 'low');
  CREATE TYPE "public"."enum_mission_planners_checklist_items_priority" AS ENUM('high', 'medium', 'low');
  CREATE TYPE "public"."enum_mission_planners_status" AS ENUM('draft', 'active', 'completed', 'archived');
  CREATE TYPE "public"."enum_mission_planners_plan_type" AS ENUM('checklist', 'outline', 'mindmap', 'freeform');
  ALTER TYPE "public"."enum_missions_type" ADD VALUE 'coding';
  ALTER TYPE "public"."enum_missions_type" ADD VALUE 'lead-gen';
  ALTER TYPE "public"."enum_missions_status" ADD VALUE 'planning' BEFORE 'active';
  ALTER TYPE "public"."enum_missions_status" ADD VALUE 'archived';
  CREATE TABLE "mission_types_blocks_timer_hours" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar DEFAULT 'Time Logged',
  	"weight" numeric DEFAULT 50,
  	"description" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "mission_types_blocks_streak_tracking" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar DEFAULT 'Streak Score',
  	"weight" numeric DEFAULT 50,
  	"track_cheated_days" boolean DEFAULT true,
  	"description" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "mission_types_blocks_note_tracking" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar DEFAULT 'Notes Progress',
  	"weight" numeric DEFAULT 30,
  	"track_created" boolean DEFAULT true,
  	"track_read" boolean DEFAULT true,
  	"track_edited" boolean DEFAULT false,
  	"description" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "mission_types_blocks_task_completion" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar DEFAULT 'Tasks Completed',
  	"weight" numeric DEFAULT 40,
  	"description" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "mission_types_blocks_time_slot_tracking_slots" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"slot_name" "enum_mission_types_blocks_time_slot_tracking_slots_slot_name" NOT NULL,
  	"custom_slot_name" varchar,
  	"target_minutes" numeric DEFAULT 60 NOT NULL,
  	"start_hour" numeric,
  	"end_hour" numeric
  );
  
  CREATE TABLE "mission_types_blocks_time_slot_tracking" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar DEFAULT 'Schedule Adherence',
  	"weight" numeric DEFAULT 60,
  	"description" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "mission_types" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"icon_mode" "enum_mission_types_icon_mode" DEFAULT 'preset',
  	"preset_icon" "enum_mission_types_preset_icon",
  	"icon_id" integer,
  	"owner_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "missions_target_config_weekly_active_days" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_missions_target_config_weekly_active_days",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "missions_target_config_time_slots" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"slot_name" "enum_missions_target_config_time_slots_slot_name",
  	"custom_slot_label" varchar,
  	"target_minutes" numeric DEFAULT 60,
  	"start_hour" numeric,
  	"end_hour" numeric
  );
  
  CREATE TABLE "mission_planners_checklist_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"is_completed" boolean DEFAULT false,
  	"priority" "enum_mission_planners_checklist_items_priority" DEFAULT 'medium',
  	"due_date" timestamp(3) with time zone
  );
  
  CREATE TABLE "mission_planners_outline_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"step_title" varchar,
  	"step_description" varchar,
  	"is_completed" boolean DEFAULT false,
  	"estimated_hours" numeric
  );
  
  CREATE TABLE "mission_planners_mindmap_nodes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"node_id" varchar,
  	"parent_node_id" varchar,
  	"text" varchar,
  	"color" varchar,
  	"is_expanded" boolean DEFAULT true
  );
  
  CREATE TABLE "mission_planners" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"mission_id" integer NOT NULL,
  	"status" "enum_mission_planners_status" DEFAULT 'draft' NOT NULL,
  	"plan_type" "enum_mission_planners_plan_type" DEFAULT 'checklist',
  	"freeform_content" varchar,
  	"color" varchar DEFAULT '#00f0ff',
  	"sort_order" numeric DEFAULT 0,
  	"owner_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "missions" ALTER COLUMN "type" DROP NOT NULL;
  ALTER TABLE "missions" ADD COLUMN "mission_type_id" integer;
  ALTER TABLE "missions" ADD COLUMN "admin_status" "enum_missions_admin_status" DEFAULT 'none';
  ALTER TABLE "missions" ADD COLUMN "target_config_mode" "enum_missions_target_config_mode" DEFAULT 'total' NOT NULL;
  ALTER TABLE "missions" ADD COLUMN "target_config_total_target_hours" numeric;
  ALTER TABLE "missions" ADD COLUMN "target_config_daily_target_hours" numeric;
  ALTER TABLE "missions" ADD COLUMN "target_config_hours_per_active_day" numeric;
  ALTER TABLE "missions" ADD COLUMN "target_config_weekly_total_target" numeric;
  ALTER TABLE "missions" ADD COLUMN "target_config_custom_target_description" varchar;
  ALTER TABLE "missions" ADD COLUMN "computed_progress" numeric DEFAULT 0;
  ALTER TABLE "missions" ADD COLUMN "admin_forced_progress" numeric;
  ALTER TABLE "missions" ADD COLUMN "streak_data_current_streak" numeric DEFAULT 0;
  ALTER TABLE "missions" ADD COLUMN "streak_data_longest_streak" numeric DEFAULT 0;
  ALTER TABLE "missions" ADD COLUMN "streak_data_total_followed" numeric DEFAULT 0;
  ALTER TABLE "missions" ADD COLUMN "streak_data_total_missed" numeric DEFAULT 0;
  ALTER TABLE "missions" ADD COLUMN "streak_data_streak_history" jsonb DEFAULT '[]'::jsonb;
  ALTER TABLE "missions" ADD COLUMN "deadline" timestamp(3) with time zone;
  ALTER TABLE "missions" ADD COLUMN "start_date" timestamp(3) with time zone;
  ALTER TABLE "missions" ADD COLUMN "priority" "enum_missions_priority" DEFAULT 'medium';
  ALTER TABLE "missions" ADD COLUMN "notes" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "mission_types_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "mission_planners_id" integer;
  ALTER TABLE "mission_types_blocks_timer_hours" ADD CONSTRAINT "mission_types_blocks_timer_hours_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."mission_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "mission_types_blocks_streak_tracking" ADD CONSTRAINT "mission_types_blocks_streak_tracking_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."mission_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "mission_types_blocks_note_tracking" ADD CONSTRAINT "mission_types_blocks_note_tracking_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."mission_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "mission_types_blocks_task_completion" ADD CONSTRAINT "mission_types_blocks_task_completion_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."mission_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "mission_types_blocks_time_slot_tracking_slots" ADD CONSTRAINT "mission_types_blocks_time_slot_tracking_slots_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."mission_types_blocks_time_slot_tracking"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "mission_types_blocks_time_slot_tracking" ADD CONSTRAINT "mission_types_blocks_time_slot_tracking_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."mission_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "mission_types" ADD CONSTRAINT "mission_types_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "mission_types" ADD CONSTRAINT "mission_types_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "missions_target_config_weekly_active_days" ADD CONSTRAINT "missions_target_config_weekly_active_days_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."missions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "missions_target_config_time_slots" ADD CONSTRAINT "missions_target_config_time_slots_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."missions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "mission_planners_checklist_items" ADD CONSTRAINT "mission_planners_checklist_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."mission_planners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "mission_planners_outline_steps" ADD CONSTRAINT "mission_planners_outline_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."mission_planners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "mission_planners_mindmap_nodes" ADD CONSTRAINT "mission_planners_mindmap_nodes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."mission_planners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "mission_planners" ADD CONSTRAINT "mission_planners_mission_id_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."missions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "mission_planners" ADD CONSTRAINT "mission_planners_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "mission_types_blocks_timer_hours_order_idx" ON "mission_types_blocks_timer_hours" USING btree ("_order");
  CREATE INDEX "mission_types_blocks_timer_hours_parent_id_idx" ON "mission_types_blocks_timer_hours" USING btree ("_parent_id");
  CREATE INDEX "mission_types_blocks_timer_hours_path_idx" ON "mission_types_blocks_timer_hours" USING btree ("_path");
  CREATE INDEX "mission_types_blocks_streak_tracking_order_idx" ON "mission_types_blocks_streak_tracking" USING btree ("_order");
  CREATE INDEX "mission_types_blocks_streak_tracking_parent_id_idx" ON "mission_types_blocks_streak_tracking" USING btree ("_parent_id");
  CREATE INDEX "mission_types_blocks_streak_tracking_path_idx" ON "mission_types_blocks_streak_tracking" USING btree ("_path");
  CREATE INDEX "mission_types_blocks_note_tracking_order_idx" ON "mission_types_blocks_note_tracking" USING btree ("_order");
  CREATE INDEX "mission_types_blocks_note_tracking_parent_id_idx" ON "mission_types_blocks_note_tracking" USING btree ("_parent_id");
  CREATE INDEX "mission_types_blocks_note_tracking_path_idx" ON "mission_types_blocks_note_tracking" USING btree ("_path");
  CREATE INDEX "mission_types_blocks_task_completion_order_idx" ON "mission_types_blocks_task_completion" USING btree ("_order");
  CREATE INDEX "mission_types_blocks_task_completion_parent_id_idx" ON "mission_types_blocks_task_completion" USING btree ("_parent_id");
  CREATE INDEX "mission_types_blocks_task_completion_path_idx" ON "mission_types_blocks_task_completion" USING btree ("_path");
  CREATE INDEX "mission_types_blocks_time_slot_tracking_slots_order_idx" ON "mission_types_blocks_time_slot_tracking_slots" USING btree ("_order");
  CREATE INDEX "mission_types_blocks_time_slot_tracking_slots_parent_id_idx" ON "mission_types_blocks_time_slot_tracking_slots" USING btree ("_parent_id");
  CREATE INDEX "mission_types_blocks_time_slot_tracking_order_idx" ON "mission_types_blocks_time_slot_tracking" USING btree ("_order");
  CREATE INDEX "mission_types_blocks_time_slot_tracking_parent_id_idx" ON "mission_types_blocks_time_slot_tracking" USING btree ("_parent_id");
  CREATE INDEX "mission_types_blocks_time_slot_tracking_path_idx" ON "mission_types_blocks_time_slot_tracking" USING btree ("_path");
  CREATE INDEX "mission_types_icon_idx" ON "mission_types" USING btree ("icon_id");
  CREATE INDEX "mission_types_owner_idx" ON "mission_types" USING btree ("owner_id");
  CREATE INDEX "mission_types_updated_at_idx" ON "mission_types" USING btree ("updated_at");
  CREATE INDEX "mission_types_created_at_idx" ON "mission_types" USING btree ("created_at");
  CREATE INDEX "missions_target_config_weekly_active_days_order_idx" ON "missions_target_config_weekly_active_days" USING btree ("order");
  CREATE INDEX "missions_target_config_weekly_active_days_parent_idx" ON "missions_target_config_weekly_active_days" USING btree ("parent_id");
  CREATE INDEX "missions_target_config_time_slots_order_idx" ON "missions_target_config_time_slots" USING btree ("_order");
  CREATE INDEX "missions_target_config_time_slots_parent_id_idx" ON "missions_target_config_time_slots" USING btree ("_parent_id");
  CREATE INDEX "mission_planners_checklist_items_order_idx" ON "mission_planners_checklist_items" USING btree ("_order");
  CREATE INDEX "mission_planners_checklist_items_parent_id_idx" ON "mission_planners_checklist_items" USING btree ("_parent_id");
  CREATE INDEX "mission_planners_outline_steps_order_idx" ON "mission_planners_outline_steps" USING btree ("_order");
  CREATE INDEX "mission_planners_outline_steps_parent_id_idx" ON "mission_planners_outline_steps" USING btree ("_parent_id");
  CREATE INDEX "mission_planners_mindmap_nodes_order_idx" ON "mission_planners_mindmap_nodes" USING btree ("_order");
  CREATE INDEX "mission_planners_mindmap_nodes_parent_id_idx" ON "mission_planners_mindmap_nodes" USING btree ("_parent_id");
  CREATE INDEX "mission_planners_mission_idx" ON "mission_planners" USING btree ("mission_id");
  CREATE INDEX "mission_planners_owner_idx" ON "mission_planners" USING btree ("owner_id");
  CREATE INDEX "mission_planners_updated_at_idx" ON "mission_planners" USING btree ("updated_at");
  CREATE INDEX "mission_planners_created_at_idx" ON "mission_planners" USING btree ("created_at");
  ALTER TABLE "missions" ADD CONSTRAINT "missions_mission_type_id_mission_types_id_fk" FOREIGN KEY ("mission_type_id") REFERENCES "public"."mission_types"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_mission_types_fk" FOREIGN KEY ("mission_types_id") REFERENCES "public"."mission_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_mission_planners_fk" FOREIGN KEY ("mission_planners_id") REFERENCES "public"."mission_planners"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "missions_mission_type_idx" ON "missions" USING btree ("mission_type_id");
  CREATE INDEX "payload_locked_documents_rels_mission_types_id_idx" ON "payload_locked_documents_rels" USING btree ("mission_types_id");
  CREATE INDEX "payload_locked_documents_rels_mission_planners_id_idx" ON "payload_locked_documents_rels" USING btree ("mission_planners_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "mission_types_blocks_timer_hours" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "mission_types_blocks_streak_tracking" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "mission_types_blocks_note_tracking" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "mission_types_blocks_task_completion" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "mission_types_blocks_time_slot_tracking_slots" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "mission_types_blocks_time_slot_tracking" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "mission_types" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "missions_target_config_weekly_active_days" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "missions_target_config_time_slots" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "mission_planners_checklist_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "mission_planners_outline_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "mission_planners_mindmap_nodes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "mission_planners" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "mission_types_blocks_timer_hours" CASCADE;
  DROP TABLE "mission_types_blocks_streak_tracking" CASCADE;
  DROP TABLE "mission_types_blocks_note_tracking" CASCADE;
  DROP TABLE "mission_types_blocks_task_completion" CASCADE;
  DROP TABLE "mission_types_blocks_time_slot_tracking_slots" CASCADE;
  DROP TABLE "mission_types_blocks_time_slot_tracking" CASCADE;
  DROP TABLE "mission_types" CASCADE;
  DROP TABLE "missions_target_config_weekly_active_days" CASCADE;
  DROP TABLE "missions_target_config_time_slots" CASCADE;
  DROP TABLE "mission_planners_checklist_items" CASCADE;
  DROP TABLE "mission_planners_outline_steps" CASCADE;
  DROP TABLE "mission_planners_mindmap_nodes" CASCADE;
  DROP TABLE "mission_planners" CASCADE;
  ALTER TABLE "missions" DROP CONSTRAINT "missions_mission_type_id_mission_types_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_mission_types_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_mission_planners_fk";
  
  ALTER TABLE "missions" ALTER COLUMN "type" SET DATA TYPE text;
  DROP TYPE "public"."enum_missions_type";
  CREATE TYPE "public"."enum_missions_type" AS ENUM('study', 'habit', 'hobby');
  ALTER TABLE "missions" ALTER COLUMN "type" SET DATA TYPE "public"."enum_missions_type" USING "type"::"public"."enum_missions_type";
  ALTER TABLE "missions" ALTER COLUMN "status" SET DATA TYPE text;
  ALTER TABLE "missions" ALTER COLUMN "status" SET DEFAULT 'active'::text;
  DROP TYPE "public"."enum_missions_status";
  CREATE TYPE "public"."enum_missions_status" AS ENUM('active', 'paused', 'completed');
  ALTER TABLE "missions" ALTER COLUMN "status" SET DEFAULT 'active'::"public"."enum_missions_status";
  ALTER TABLE "missions" ALTER COLUMN "status" SET DATA TYPE "public"."enum_missions_status" USING "status"::"public"."enum_missions_status";
  DROP INDEX "missions_mission_type_idx";
  DROP INDEX "payload_locked_documents_rels_mission_types_id_idx";
  DROP INDEX "payload_locked_documents_rels_mission_planners_id_idx";
  ALTER TABLE "missions" ALTER COLUMN "type" SET NOT NULL;
  ALTER TABLE "missions" DROP COLUMN "mission_type_id";
  ALTER TABLE "missions" DROP COLUMN "admin_status";
  ALTER TABLE "missions" DROP COLUMN "target_config_mode";
  ALTER TABLE "missions" DROP COLUMN "target_config_total_target_hours";
  ALTER TABLE "missions" DROP COLUMN "target_config_daily_target_hours";
  ALTER TABLE "missions" DROP COLUMN "target_config_hours_per_active_day";
  ALTER TABLE "missions" DROP COLUMN "target_config_weekly_total_target";
  ALTER TABLE "missions" DROP COLUMN "target_config_custom_target_description";
  ALTER TABLE "missions" DROP COLUMN "computed_progress";
  ALTER TABLE "missions" DROP COLUMN "admin_forced_progress";
  ALTER TABLE "missions" DROP COLUMN "streak_data_current_streak";
  ALTER TABLE "missions" DROP COLUMN "streak_data_longest_streak";
  ALTER TABLE "missions" DROP COLUMN "streak_data_total_followed";
  ALTER TABLE "missions" DROP COLUMN "streak_data_total_missed";
  ALTER TABLE "missions" DROP COLUMN "streak_data_streak_history";
  ALTER TABLE "missions" DROP COLUMN "deadline";
  ALTER TABLE "missions" DROP COLUMN "start_date";
  ALTER TABLE "missions" DROP COLUMN "priority";
  ALTER TABLE "missions" DROP COLUMN "notes";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "mission_types_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "mission_planners_id";
  DROP TYPE "public"."enum_mission_types_blocks_time_slot_tracking_slots_slot_name";
  DROP TYPE "public"."enum_mission_types_icon_mode";
  DROP TYPE "public"."enum_mission_types_preset_icon";
  DROP TYPE "public"."enum_missions_target_config_weekly_active_days";
  DROP TYPE "public"."enum_missions_target_config_time_slots_slot_name";
  DROP TYPE "public"."enum_missions_admin_status";
  DROP TYPE "public"."enum_missions_target_config_mode";
  DROP TYPE "public"."enum_missions_priority";
  DROP TYPE "public"."enum_mission_planners_checklist_items_priority";
  DROP TYPE "public"."enum_mission_planners_status";
  DROP TYPE "public"."enum_mission_planners_plan_type";`)
}
