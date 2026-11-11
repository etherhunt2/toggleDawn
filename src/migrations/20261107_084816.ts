import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_projects_status" AS ENUM('planning', 'active', 'on-hold', 'completed', 'archived');
  CREATE TYPE "public"."enum_missions_type" AS ENUM('study', 'habit', 'hobby');
  CREATE TYPE "public"."enum_missions_status" AS ENUM('active', 'paused', 'completed');
  CREATE TYPE "public"."enum_books_progress_status" AS ENUM('not-started', 'in-progress', 'completed');
  CREATE TYPE "public"."enum_books_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__books_v_version_progress_status" AS ENUM('not-started', 'in-progress', 'completed');
  CREATE TYPE "public"."enum__books_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_chapters_progress_status" AS ENUM('not-started', 'in-progress', 'completed');
  CREATE TYPE "public"."enum_chapters_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__chapters_v_version_progress_status" AS ENUM('not-started', 'in-progress', 'completed');
  CREATE TYPE "public"."enum__chapters_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_notes_note_type" AS ENUM('note', 'flashcard', 'summary', 'formula');
  CREATE TYPE "public"."enum_notes_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__notes_v_version_note_type" AS ENUM('note', 'flashcard', 'summary', 'formula');
  CREATE TYPE "public"."enum__notes_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_flash_cards_content_type" AS ENUM('text', 'image', 'pdf');
  CREATE TYPE "public"."enum_time_logs_category" AS ENUM('study', 'work', 'exercise', 'hobby', 'rest', 'social', 'chores', 'commute', 'sleep', 'other');
  CREATE TYPE "public"."enum_test_scores_exam_type" AS ENUM('quiz', 'test', 'midterm', 'final', 'mock', 'practice');
  CREATE TYPE "public"."enum_pages_hero_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_hero_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_pages_blocks_hero_block_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_hero_block_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_pages_blocks_hero_block_alignment" AS ENUM('center', 'left');
  CREATE TYPE "public"."enum_pages_blocks_rich_content_layout" AS ENUM('standard', 'mediaRight', 'mediaLeft');
  CREATE TYPE "public"."enum_pages_blocks_feature_grid_features_icon" AS ENUM('zap', 'target', 'clock', 'book', 'brain', 'check', 'barChart', 'sparkles');
  CREATE TYPE "public"."enum_pages_blocks_feature_grid_columns" AS ENUM('2', '3', '4');
  CREATE TYPE "public"."enum_pages_blocks_cta_block_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_cta_block_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_pages_blocks_cta_block_style" AS ENUM('glow', 'minimal', 'dark');
  CREATE TYPE "public"."enum_pages_blocks_card_grid_cards_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_spacer_block_size" AS ENUM('small', 'medium', 'large', 'xlarge');
  CREATE TYPE "public"."enum_pages_blocks_banner_style" AS ENUM('info', 'warning', 'error', 'success');
  CREATE TYPE "public"."enum_pages_blocks_code_language" AS ENUM('typescript', 'javascript', 'css');
  CREATE TYPE "public"."enum_pages_blocks_cta_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_cta_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_pages_blocks_content_columns_size" AS ENUM('oneThird', 'half', 'twoThirds', 'full');
  CREATE TYPE "public"."enum_pages_blocks_content_columns_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_content_columns_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_pages_hero_type" AS ENUM('none', 'highImpact', 'mediumImpact', 'lowImpact');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_version_hero_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_version_hero_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_block_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_block_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_block_alignment" AS ENUM('center', 'left');
  CREATE TYPE "public"."enum__pages_v_blocks_rich_content_layout" AS ENUM('standard', 'mediaRight', 'mediaLeft');
  CREATE TYPE "public"."enum__pages_v_blocks_feature_grid_features_icon" AS ENUM('zap', 'target', 'clock', 'book', 'brain', 'check', 'barChart', 'sparkles');
  CREATE TYPE "public"."enum__pages_v_blocks_feature_grid_columns" AS ENUM('2', '3', '4');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_block_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_block_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_block_style" AS ENUM('glow', 'minimal', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_card_grid_cards_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_spacer_block_size" AS ENUM('small', 'medium', 'large', 'xlarge');
  CREATE TYPE "public"."enum__pages_v_blocks_banner_style" AS ENUM('info', 'warning', 'error', 'success');
  CREATE TYPE "public"."enum__pages_v_blocks_code_language" AS ENUM('typescript', 'javascript', 'css');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__pages_v_blocks_content_columns_size" AS ENUM('oneThird', 'half', 'twoThirds', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_content_columns_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_content_columns_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__pages_v_version_hero_type" AS ENUM('none', 'highImpact', 'mediumImpact', 'lowImpact');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_categories_type" AS ENUM('project', 'mission', 'exam', 'book', 'chapter', 'note', 'general');
  CREATE TYPE "public"."enum_users_preferences_theme" AS ENUM('light', 'dark', 'system');
  CREATE TYPE "public"."enum_users_preferences_default_project_view" AS ENUM('grid', 'list');
  CREATE TYPE "public"."enum_redirects_to_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TYPE "public"."enum_payload_jobs_log_state" AS ENUM('failed', 'succeeded');
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TYPE "public"."enum_payload_folders_folder_type" AS ENUM('media');
  CREATE TYPE "public"."enum_header_nav_items_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_footer_nav_items_link_type" AS ENUM('reference', 'custom');
  CREATE TABLE "projects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"status" "enum_projects_status" DEFAULT 'active' NOT NULL,
  	"deadline" timestamp(3) with time zone,
  	"color" varchar,
  	"owner_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "projects_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categories_id" integer
  );
  
  CREATE TABLE "missions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"type" "enum_missions_type" NOT NULL,
  	"description" varchar,
  	"target_hours" numeric,
  	"status" "enum_missions_status" DEFAULT 'active' NOT NULL,
  	"project_id" integer NOT NULL,
  	"owner_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "missions_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categories_id" integer
  );
  
  CREATE TABLE "books" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"author" varchar,
  	"subject" varchar,
  	"total_pages" numeric,
  	"description" varchar,
  	"cover_image_id" integer,
  	"mission_id" integer,
  	"meta_title" varchar,
  	"meta_image_id" integer,
  	"meta_description" varchar,
  	"completion_percent" numeric DEFAULT 0,
  	"progress_status" "enum_books_progress_status" DEFAULT 'not-started',
  	"owner_id" integer,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_books_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "books_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categories_id" integer
  );
  
  CREATE TABLE "_books_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_author" varchar,
  	"version_subject" varchar,
  	"version_total_pages" numeric,
  	"version_description" varchar,
  	"version_cover_image_id" integer,
  	"version_mission_id" integer,
  	"version_meta_title" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_description" varchar,
  	"version_completion_percent" numeric DEFAULT 0,
  	"version_progress_status" "enum__books_v_version_progress_status" DEFAULT 'not-started',
  	"version_owner_id" integer,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__books_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_books_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categories_id" integer
  );
  
  CREATE TABLE "chapters" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"page_count" numeric,
  	"sort_order" numeric DEFAULT 0,
  	"book_id" integer,
  	"meta_title" varchar,
  	"meta_image_id" integer,
  	"meta_description" varchar,
  	"progress_status" "enum_chapters_progress_status" DEFAULT 'not-started',
  	"completion_percent" numeric DEFAULT 0,
  	"owner_id" integer,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_chapters_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "chapters_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categories_id" integer
  );
  
  CREATE TABLE "_chapters_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_description" varchar,
  	"version_page_count" numeric,
  	"version_sort_order" numeric DEFAULT 0,
  	"version_book_id" integer,
  	"version_meta_title" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_description" varchar,
  	"version_progress_status" "enum__chapters_v_version_progress_status" DEFAULT 'not-started',
  	"version_completion_percent" numeric DEFAULT 0,
  	"version_owner_id" integer,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__chapters_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_chapters_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categories_id" integer
  );
  
  CREATE TABLE "notes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"content" jsonb,
  	"note_type" "enum_notes_note_type" DEFAULT 'note',
  	"sort_order" numeric DEFAULT 0,
  	"chapter_id" integer,
  	"meta_title" varchar,
  	"meta_image_id" integer,
  	"meta_description" varchar,
  	"is_completed" boolean DEFAULT false,
  	"owner_id" integer,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_notes_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "notes_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categories_id" integer
  );
  
  CREATE TABLE "_notes_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_content" jsonb,
  	"version_note_type" "enum__notes_v_version_note_type" DEFAULT 'note',
  	"version_sort_order" numeric DEFAULT 0,
  	"version_chapter_id" integer,
  	"version_meta_title" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_description" varchar,
  	"version_is_completed" boolean DEFAULT false,
  	"version_owner_id" integer,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__notes_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_notes_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categories_id" integer
  );
  
  CREATE TABLE "flash_cards" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"content_type" "enum_flash_cards_content_type" DEFAULT 'text' NOT NULL,
  	"text_content" jsonb,
  	"image_id" integer,
  	"pdf_id" integer,
  	"book_id" integer NOT NULL,
  	"chapter_id" integer,
  	"sort_order" numeric DEFAULT 0,
  	"owner_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "time_logs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"start_time" timestamp(3) with time zone NOT NULL,
  	"end_time" timestamp(3) with time zone NOT NULL,
  	"duration" numeric,
  	"category" "enum_time_logs_category" NOT NULL,
  	"description" varchar,
  	"mission_id" integer,
  	"is_retroactive" boolean DEFAULT false,
  	"owner_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "test_scores" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"exam_name" varchar NOT NULL,
  	"subject" varchar NOT NULL,
  	"score_obtained" numeric NOT NULL,
  	"total_score" numeric NOT NULL,
  	"percentage" numeric,
  	"exam_date" timestamp(3) with time zone NOT NULL,
  	"exam_type" "enum_test_scores_exam_type" DEFAULT 'test',
  	"notes" varchar,
  	"mission_id" integer,
  	"owner_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "test_scores_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categories_id" integer
  );
  
  CREATE TABLE "pages_hero_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_pages_hero_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_pages_hero_links_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "pages_blocks_hero_block_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_pages_blocks_hero_block_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_pages_blocks_hero_block_links_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "pages_blocks_hero_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"badge" varchar,
  	"heading" varchar,
  	"subheading" varchar,
  	"alignment" "enum_pages_blocks_hero_block_alignment" DEFAULT 'center',
  	"media_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_rich_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"rich_text" jsonb,
  	"layout" "enum_pages_blocks_rich_content_layout" DEFAULT 'standard',
  	"media_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_feature_grid_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_pages_blocks_feature_grid_features_icon" DEFAULT 'zap',
  	"title" varchar,
  	"description" varchar,
  	"tag" varchar
  );
  
  CREATE TABLE "pages_blocks_feature_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"badge" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"columns" "enum_pages_blocks_feature_grid_columns" DEFAULT '3',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_cta_block_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_pages_blocks_cta_block_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_pages_blocks_cta_block_links_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "pages_blocks_cta_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"badge" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"style" "enum_pages_blocks_cta_block_style" DEFAULT 'glow',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_faq_block_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "pages_blocks_faq_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"badge" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_testimonial_block_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"quote" varchar,
  	"author_name" varchar,
  	"author_role" varchar,
  	"avatar_id" integer,
  	"rating" numeric DEFAULT 5
  );
  
  CREATE TABLE "pages_blocks_testimonial_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"badge" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_stats_block_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "pages_blocks_stats_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"badge" varchar,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_card_grid_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"badge" varchar,
  	"media_id" integer,
  	"link_type" "enum_pages_blocks_card_grid_cards_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar
  );
  
  CREATE TABLE "pages_blocks_card_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"badge" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_spacer_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"size" "enum_pages_blocks_spacer_block_size" DEFAULT 'medium',
  	"show_divider" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_banner" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"style" "enum_pages_blocks_banner_style" DEFAULT 'info',
  	"content" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_code" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"language" "enum_pages_blocks_code_language" DEFAULT 'typescript',
  	"code" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_media_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_cta_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_pages_blocks_cta_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_pages_blocks_cta_links_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "pages_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"rich_text" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_content_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"size" "enum_pages_blocks_content_columns_size" DEFAULT 'oneThird',
  	"rich_text" jsonb,
  	"enable_link" boolean,
  	"link_type" "enum_pages_blocks_content_columns_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_pages_blocks_content_columns_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "pages_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"hero_type" "enum_pages_hero_type" DEFAULT 'lowImpact',
  	"hero_rich_text" jsonb,
  	"hero_media_id" integer,
  	"meta_title" varchar,
  	"meta_image_id" integer,
  	"meta_description" varchar,
  	"published_at" timestamp(3) with time zone,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "pages_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"books_id" integer,
  	"chapters_id" integer,
  	"notes_id" integer
  );
  
  CREATE TABLE "_pages_v_version_hero_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__pages_v_version_hero_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__pages_v_version_hero_links_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_hero_block_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__pages_v_blocks_hero_block_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__pages_v_blocks_hero_block_links_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_hero_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"badge" varchar,
  	"heading" varchar,
  	"subheading" varchar,
  	"alignment" "enum__pages_v_blocks_hero_block_alignment" DEFAULT 'center',
  	"media_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_rich_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"rich_text" jsonb,
  	"layout" "enum__pages_v_blocks_rich_content_layout" DEFAULT 'standard',
  	"media_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_feature_grid_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" "enum__pages_v_blocks_feature_grid_features_icon" DEFAULT 'zap',
  	"title" varchar,
  	"description" varchar,
  	"tag" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_feature_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"badge" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"columns" "enum__pages_v_blocks_feature_grid_columns" DEFAULT '3',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cta_block_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__pages_v_blocks_cta_block_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__pages_v_blocks_cta_block_links_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cta_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"badge" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"style" "enum__pages_v_blocks_cta_block_style" DEFAULT 'glow',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_faq_block_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_faq_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"badge" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_testimonial_block_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"quote" varchar,
  	"author_name" varchar,
  	"author_role" varchar,
  	"avatar_id" integer,
  	"rating" numeric DEFAULT 5,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_testimonial_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"badge" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_stats_block_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_stats_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"badge" varchar,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_card_grid_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"badge" varchar,
  	"media_id" integer,
  	"link_type" "enum__pages_v_blocks_card_grid_cards_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_card_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"badge" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_spacer_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"size" "enum__pages_v_blocks_spacer_block_size" DEFAULT 'medium',
  	"show_divider" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_banner" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"style" "enum__pages_v_blocks_banner_style" DEFAULT 'info',
  	"content" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_code" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"language" "enum__pages_v_blocks_code_language" DEFAULT 'typescript',
  	"code" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_media_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cta_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__pages_v_blocks_cta_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__pages_v_blocks_cta_links_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"rich_text" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_content_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"size" "enum__pages_v_blocks_content_columns_size" DEFAULT 'oneThird',
  	"rich_text" jsonb,
  	"enable_link" boolean,
  	"link_type" "enum__pages_v_blocks_content_columns_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__pages_v_blocks_content_columns_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_hero_type" "enum__pages_v_version_hero_type" DEFAULT 'lowImpact',
  	"version_hero_rich_text" jsonb,
  	"version_hero_media_id" integer,
  	"version_meta_title" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_description" varchar,
  	"version_published_at" timestamp(3) with time zone,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_pages_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"books_id" integer,
  	"chapters_id" integer,
  	"notes_id" integer
  );
  
  CREATE TABLE "categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"type" "enum_categories_type" DEFAULT 'general' NOT NULL,
  	"description" varchar,
  	"color" varchar,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"caption" jsonb,
  	"folder_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_square_url" varchar,
  	"sizes_square_width" numeric,
  	"sizes_square_height" numeric,
  	"sizes_square_mime_type" varchar,
  	"sizes_square_filesize" numeric,
  	"sizes_square_filename" varchar,
  	"sizes_small_url" varchar,
  	"sizes_small_width" numeric,
  	"sizes_small_height" numeric,
  	"sizes_small_mime_type" varchar,
  	"sizes_small_filesize" numeric,
  	"sizes_small_filename" varchar,
  	"sizes_medium_url" varchar,
  	"sizes_medium_width" numeric,
  	"sizes_medium_height" numeric,
  	"sizes_medium_mime_type" varchar,
  	"sizes_medium_filesize" numeric,
  	"sizes_medium_filename" varchar,
  	"sizes_large_url" varchar,
  	"sizes_large_width" numeric,
  	"sizes_large_height" numeric,
  	"sizes_large_mime_type" varchar,
  	"sizes_large_filesize" numeric,
  	"sizes_large_filename" varchar,
  	"sizes_xlarge_url" varchar,
  	"sizes_xlarge_width" numeric,
  	"sizes_xlarge_height" numeric,
  	"sizes_xlarge_mime_type" varchar,
  	"sizes_xlarge_filesize" numeric,
  	"sizes_xlarge_filename" varchar,
  	"sizes_og_url" varchar,
  	"sizes_og_width" numeric,
  	"sizes_og_height" numeric,
  	"sizes_og_mime_type" varchar,
  	"sizes_og_filesize" numeric,
  	"sizes_og_filename" varchar
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"preferences_theme" "enum_users_preferences_theme" DEFAULT 'system',
  	"preferences_default_project_view" "enum_users_preferences_default_project_view" DEFAULT 'grid',
  	"preferences_timezone" varchar DEFAULT 'Asia/Kolkata',
  	"preferences_daily_goal_hours" numeric DEFAULT 8,
  	"preferences_enable_notifications" boolean DEFAULT true,
  	"preferences_streak_forgiveness_buffer" numeric DEFAULT 1,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "redirects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"from" varchar NOT NULL,
  	"to_type" "enum_redirects_to_type" DEFAULT 'reference',
  	"to_url" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "redirects_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"books_id" integer,
  	"chapters_id" integer,
  	"notes_id" integer
  );
  
  CREATE TABLE "search_categories" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"relation_to" varchar,
  	"category_i_d" varchar,
  	"title" varchar
  );
  
  CREATE TABLE "search" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"priority" numeric,
  	"slug" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "search_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"books_id" integer,
  	"chapters_id" integer,
  	"notes_id" integer
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_jobs_log" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"executed_at" timestamp(3) with time zone NOT NULL,
  	"completed_at" timestamp(3) with time zone NOT NULL,
  	"task_slug" "enum_payload_jobs_log_task_slug" NOT NULL,
  	"task_i_d" varchar NOT NULL,
  	"input" jsonb,
  	"output" jsonb,
  	"state" "enum_payload_jobs_log_state" NOT NULL,
  	"error" jsonb
  );
  
  CREATE TABLE "payload_jobs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"input" jsonb,
  	"completed_at" timestamp(3) with time zone,
  	"total_tried" numeric DEFAULT 0,
  	"has_error" boolean DEFAULT false,
  	"error" jsonb,
  	"task_slug" "enum_payload_jobs_task_slug",
  	"queue" varchar DEFAULT 'default',
  	"wait_until" timestamp(3) with time zone,
  	"processing" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_folders_folder_type" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_payload_folders_folder_type",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "payload_folders" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"folder_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"projects_id" integer,
  	"missions_id" integer,
  	"books_id" integer,
  	"chapters_id" integer,
  	"notes_id" integer,
  	"flash_cards_id" integer,
  	"time_logs_id" integer,
  	"test_scores_id" integer,
  	"pages_id" integer,
  	"categories_id" integer,
  	"media_id" integer,
  	"users_id" integer,
  	"redirects_id" integer,
  	"search_id" integer,
  	"payload_folders_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "header_nav_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_header_nav_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar NOT NULL
  );
  
  CREATE TABLE "header" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "header_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"books_id" integer,
  	"chapters_id" integer,
  	"notes_id" integer
  );
  
  CREATE TABLE "footer_nav_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_footer_nav_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar NOT NULL
  );
  
  CREATE TABLE "footer" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "footer_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"books_id" integer,
  	"chapters_id" integer,
  	"notes_id" integer
  );
  
  ALTER TABLE "projects" ADD CONSTRAINT "projects_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "missions" ADD CONSTRAINT "missions_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "missions" ADD CONSTRAINT "missions_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "missions_rels" ADD CONSTRAINT "missions_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."missions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "missions_rels" ADD CONSTRAINT "missions_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "books" ADD CONSTRAINT "books_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "books" ADD CONSTRAINT "books_mission_id_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."missions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "books" ADD CONSTRAINT "books_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "books" ADD CONSTRAINT "books_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "books_rels" ADD CONSTRAINT "books_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "books_rels" ADD CONSTRAINT "books_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_books_v" ADD CONSTRAINT "_books_v_parent_id_books_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."books"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_books_v" ADD CONSTRAINT "_books_v_version_cover_image_id_media_id_fk" FOREIGN KEY ("version_cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_books_v" ADD CONSTRAINT "_books_v_version_mission_id_missions_id_fk" FOREIGN KEY ("version_mission_id") REFERENCES "public"."missions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_books_v" ADD CONSTRAINT "_books_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_books_v" ADD CONSTRAINT "_books_v_version_owner_id_users_id_fk" FOREIGN KEY ("version_owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_books_v_rels" ADD CONSTRAINT "_books_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_books_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_books_v_rels" ADD CONSTRAINT "_books_v_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "chapters" ADD CONSTRAINT "chapters_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "chapters" ADD CONSTRAINT "chapters_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "chapters" ADD CONSTRAINT "chapters_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "chapters_rels" ADD CONSTRAINT "chapters_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."chapters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "chapters_rels" ADD CONSTRAINT "chapters_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_chapters_v" ADD CONSTRAINT "_chapters_v_parent_id_chapters_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."chapters"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_chapters_v" ADD CONSTRAINT "_chapters_v_version_book_id_books_id_fk" FOREIGN KEY ("version_book_id") REFERENCES "public"."books"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_chapters_v" ADD CONSTRAINT "_chapters_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_chapters_v" ADD CONSTRAINT "_chapters_v_version_owner_id_users_id_fk" FOREIGN KEY ("version_owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_chapters_v_rels" ADD CONSTRAINT "_chapters_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_chapters_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_chapters_v_rels" ADD CONSTRAINT "_chapters_v_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "notes" ADD CONSTRAINT "notes_chapter_id_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."chapters"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "notes" ADD CONSTRAINT "notes_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "notes" ADD CONSTRAINT "notes_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "notes_rels" ADD CONSTRAINT "notes_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."notes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "notes_rels" ADD CONSTRAINT "notes_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_notes_v" ADD CONSTRAINT "_notes_v_parent_id_notes_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."notes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_notes_v" ADD CONSTRAINT "_notes_v_version_chapter_id_chapters_id_fk" FOREIGN KEY ("version_chapter_id") REFERENCES "public"."chapters"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_notes_v" ADD CONSTRAINT "_notes_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_notes_v" ADD CONSTRAINT "_notes_v_version_owner_id_users_id_fk" FOREIGN KEY ("version_owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_notes_v_rels" ADD CONSTRAINT "_notes_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_notes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_notes_v_rels" ADD CONSTRAINT "_notes_v_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "flash_cards" ADD CONSTRAINT "flash_cards_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "flash_cards" ADD CONSTRAINT "flash_cards_pdf_id_media_id_fk" FOREIGN KEY ("pdf_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "flash_cards" ADD CONSTRAINT "flash_cards_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "flash_cards" ADD CONSTRAINT "flash_cards_chapter_id_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."chapters"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "flash_cards" ADD CONSTRAINT "flash_cards_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "time_logs" ADD CONSTRAINT "time_logs_mission_id_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."missions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "time_logs" ADD CONSTRAINT "time_logs_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "test_scores" ADD CONSTRAINT "test_scores_mission_id_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."missions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "test_scores" ADD CONSTRAINT "test_scores_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "test_scores_rels" ADD CONSTRAINT "test_scores_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."test_scores"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "test_scores_rels" ADD CONSTRAINT "test_scores_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_hero_links" ADD CONSTRAINT "pages_hero_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero_block_links" ADD CONSTRAINT "pages_blocks_hero_block_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_hero_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero_block" ADD CONSTRAINT "pages_blocks_hero_block_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero_block" ADD CONSTRAINT "pages_blocks_hero_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_rich_content" ADD CONSTRAINT "pages_blocks_rich_content_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_rich_content" ADD CONSTRAINT "pages_blocks_rich_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_grid_features" ADD CONSTRAINT "pages_blocks_feature_grid_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_feature_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_grid" ADD CONSTRAINT "pages_blocks_feature_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta_block_links" ADD CONSTRAINT "pages_blocks_cta_block_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_cta_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta_block" ADD CONSTRAINT "pages_blocks_cta_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq_block_items" ADD CONSTRAINT "pages_blocks_faq_block_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_faq_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq_block" ADD CONSTRAINT "pages_blocks_faq_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_testimonial_block_testimonials" ADD CONSTRAINT "pages_blocks_testimonial_block_testimonials_avatar_id_media_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_testimonial_block_testimonials" ADD CONSTRAINT "pages_blocks_testimonial_block_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_testimonial_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_testimonial_block" ADD CONSTRAINT "pages_blocks_testimonial_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_stats_block_stats" ADD CONSTRAINT "pages_blocks_stats_block_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_stats_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_stats_block" ADD CONSTRAINT "pages_blocks_stats_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_card_grid_cards" ADD CONSTRAINT "pages_blocks_card_grid_cards_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_card_grid_cards" ADD CONSTRAINT "pages_blocks_card_grid_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_card_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_card_grid" ADD CONSTRAINT "pages_blocks_card_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_spacer_block" ADD CONSTRAINT "pages_blocks_spacer_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_banner" ADD CONSTRAINT "pages_blocks_banner_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_code" ADD CONSTRAINT "pages_blocks_code_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_media_block" ADD CONSTRAINT "pages_blocks_media_block_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_media_block" ADD CONSTRAINT "pages_blocks_media_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta_links" ADD CONSTRAINT "pages_blocks_cta_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta" ADD CONSTRAINT "pages_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_content_columns" ADD CONSTRAINT "pages_blocks_content_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_content" ADD CONSTRAINT "pages_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_hero_media_id_media_id_fk" FOREIGN KEY ("hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_books_fk" FOREIGN KEY ("books_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_chapters_fk" FOREIGN KEY ("chapters_id") REFERENCES "public"."chapters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_notes_fk" FOREIGN KEY ("notes_id") REFERENCES "public"."notes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_hero_links" ADD CONSTRAINT "_pages_v_version_hero_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero_block_links" ADD CONSTRAINT "_pages_v_blocks_hero_block_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_hero_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero_block" ADD CONSTRAINT "_pages_v_blocks_hero_block_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero_block" ADD CONSTRAINT "_pages_v_blocks_hero_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_rich_content" ADD CONSTRAINT "_pages_v_blocks_rich_content_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_rich_content" ADD CONSTRAINT "_pages_v_blocks_rich_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_grid_features" ADD CONSTRAINT "_pages_v_blocks_feature_grid_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_feature_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_grid" ADD CONSTRAINT "_pages_v_blocks_feature_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta_block_links" ADD CONSTRAINT "_pages_v_blocks_cta_block_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_cta_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta_block" ADD CONSTRAINT "_pages_v_blocks_cta_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq_block_items" ADD CONSTRAINT "_pages_v_blocks_faq_block_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_faq_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq_block" ADD CONSTRAINT "_pages_v_blocks_faq_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_testimonial_block_testimonials" ADD CONSTRAINT "_pages_v_blocks_testimonial_block_testimonials_avatar_id_media_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_testimonial_block_testimonials" ADD CONSTRAINT "_pages_v_blocks_testimonial_block_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_testimonial_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_testimonial_block" ADD CONSTRAINT "_pages_v_blocks_testimonial_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_stats_block_stats" ADD CONSTRAINT "_pages_v_blocks_stats_block_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_stats_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_stats_block" ADD CONSTRAINT "_pages_v_blocks_stats_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_card_grid_cards" ADD CONSTRAINT "_pages_v_blocks_card_grid_cards_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_card_grid_cards" ADD CONSTRAINT "_pages_v_blocks_card_grid_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_card_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_card_grid" ADD CONSTRAINT "_pages_v_blocks_card_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_spacer_block" ADD CONSTRAINT "_pages_v_blocks_spacer_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_banner" ADD CONSTRAINT "_pages_v_blocks_banner_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_code" ADD CONSTRAINT "_pages_v_blocks_code_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_media_block" ADD CONSTRAINT "_pages_v_blocks_media_block_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_media_block" ADD CONSTRAINT "_pages_v_blocks_media_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta_links" ADD CONSTRAINT "_pages_v_blocks_cta_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta" ADD CONSTRAINT "_pages_v_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_content_columns" ADD CONSTRAINT "_pages_v_blocks_content_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_content" ADD CONSTRAINT "_pages_v_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_hero_media_id_media_id_fk" FOREIGN KEY ("version_hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_books_fk" FOREIGN KEY ("books_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_chapters_fk" FOREIGN KEY ("chapters_id") REFERENCES "public"."chapters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_notes_fk" FOREIGN KEY ("notes_id") REFERENCES "public"."notes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media" ADD CONSTRAINT "media_folder_id_payload_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."payload_folders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_books_fk" FOREIGN KEY ("books_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_chapters_fk" FOREIGN KEY ("chapters_id") REFERENCES "public"."chapters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_notes_fk" FOREIGN KEY ("notes_id") REFERENCES "public"."notes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_categories" ADD CONSTRAINT "search_categories_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."search"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search" ADD CONSTRAINT "search_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."search"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_books_fk" FOREIGN KEY ("books_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_chapters_fk" FOREIGN KEY ("chapters_id") REFERENCES "public"."chapters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_notes_fk" FOREIGN KEY ("notes_id") REFERENCES "public"."notes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_jobs_log" ADD CONSTRAINT "payload_jobs_log_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payload_jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_folders_folder_type" ADD CONSTRAINT "payload_folders_folder_type_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_folders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_folders" ADD CONSTRAINT "payload_folders_folder_id_payload_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."payload_folders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_missions_fk" FOREIGN KEY ("missions_id") REFERENCES "public"."missions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_books_fk" FOREIGN KEY ("books_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_chapters_fk" FOREIGN KEY ("chapters_id") REFERENCES "public"."chapters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_notes_fk" FOREIGN KEY ("notes_id") REFERENCES "public"."notes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_flash_cards_fk" FOREIGN KEY ("flash_cards_id") REFERENCES "public"."flash_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_time_logs_fk" FOREIGN KEY ("time_logs_id") REFERENCES "public"."time_logs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_test_scores_fk" FOREIGN KEY ("test_scores_id") REFERENCES "public"."test_scores"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_redirects_fk" FOREIGN KEY ("redirects_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_search_fk" FOREIGN KEY ("search_id") REFERENCES "public"."search"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_payload_folders_fk" FOREIGN KEY ("payload_folders_id") REFERENCES "public"."payload_folders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_nav_items" ADD CONSTRAINT "header_nav_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_books_fk" FOREIGN KEY ("books_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_chapters_fk" FOREIGN KEY ("chapters_id") REFERENCES "public"."chapters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_notes_fk" FOREIGN KEY ("notes_id") REFERENCES "public"."notes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_nav_items" ADD CONSTRAINT "footer_nav_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_books_fk" FOREIGN KEY ("books_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_chapters_fk" FOREIGN KEY ("chapters_id") REFERENCES "public"."chapters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_notes_fk" FOREIGN KEY ("notes_id") REFERENCES "public"."notes"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "projects_owner_idx" ON "projects" USING btree ("owner_id");
  CREATE INDEX "projects_updated_at_idx" ON "projects" USING btree ("updated_at");
  CREATE INDEX "projects_created_at_idx" ON "projects" USING btree ("created_at");
  CREATE INDEX "projects_rels_order_idx" ON "projects_rels" USING btree ("order");
  CREATE INDEX "projects_rels_parent_idx" ON "projects_rels" USING btree ("parent_id");
  CREATE INDEX "projects_rels_path_idx" ON "projects_rels" USING btree ("path");
  CREATE INDEX "projects_rels_categories_id_idx" ON "projects_rels" USING btree ("categories_id");
  CREATE INDEX "missions_project_idx" ON "missions" USING btree ("project_id");
  CREATE INDEX "missions_owner_idx" ON "missions" USING btree ("owner_id");
  CREATE INDEX "missions_updated_at_idx" ON "missions" USING btree ("updated_at");
  CREATE INDEX "missions_created_at_idx" ON "missions" USING btree ("created_at");
  CREATE INDEX "missions_rels_order_idx" ON "missions_rels" USING btree ("order");
  CREATE INDEX "missions_rels_parent_idx" ON "missions_rels" USING btree ("parent_id");
  CREATE INDEX "missions_rels_path_idx" ON "missions_rels" USING btree ("path");
  CREATE INDEX "missions_rels_categories_id_idx" ON "missions_rels" USING btree ("categories_id");
  CREATE INDEX "books_cover_image_idx" ON "books" USING btree ("cover_image_id");
  CREATE INDEX "books_mission_idx" ON "books" USING btree ("mission_id");
  CREATE INDEX "books_meta_meta_image_idx" ON "books" USING btree ("meta_image_id");
  CREATE INDEX "books_owner_idx" ON "books" USING btree ("owner_id");
  CREATE UNIQUE INDEX "books_slug_idx" ON "books" USING btree ("slug");
  CREATE INDEX "books_updated_at_idx" ON "books" USING btree ("updated_at");
  CREATE INDEX "books_created_at_idx" ON "books" USING btree ("created_at");
  CREATE INDEX "books__status_idx" ON "books" USING btree ("_status");
  CREATE INDEX "books_rels_order_idx" ON "books_rels" USING btree ("order");
  CREATE INDEX "books_rels_parent_idx" ON "books_rels" USING btree ("parent_id");
  CREATE INDEX "books_rels_path_idx" ON "books_rels" USING btree ("path");
  CREATE INDEX "books_rels_categories_id_idx" ON "books_rels" USING btree ("categories_id");
  CREATE INDEX "_books_v_parent_idx" ON "_books_v" USING btree ("parent_id");
  CREATE INDEX "_books_v_version_version_cover_image_idx" ON "_books_v" USING btree ("version_cover_image_id");
  CREATE INDEX "_books_v_version_version_mission_idx" ON "_books_v" USING btree ("version_mission_id");
  CREATE INDEX "_books_v_version_meta_version_meta_image_idx" ON "_books_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_books_v_version_version_owner_idx" ON "_books_v" USING btree ("version_owner_id");
  CREATE INDEX "_books_v_version_version_slug_idx" ON "_books_v" USING btree ("version_slug");
  CREATE INDEX "_books_v_version_version_updated_at_idx" ON "_books_v" USING btree ("version_updated_at");
  CREATE INDEX "_books_v_version_version_created_at_idx" ON "_books_v" USING btree ("version_created_at");
  CREATE INDEX "_books_v_version_version__status_idx" ON "_books_v" USING btree ("version__status");
  CREATE INDEX "_books_v_created_at_idx" ON "_books_v" USING btree ("created_at");
  CREATE INDEX "_books_v_updated_at_idx" ON "_books_v" USING btree ("updated_at");
  CREATE INDEX "_books_v_latest_idx" ON "_books_v" USING btree ("latest");
  CREATE INDEX "_books_v_autosave_idx" ON "_books_v" USING btree ("autosave");
  CREATE INDEX "_books_v_rels_order_idx" ON "_books_v_rels" USING btree ("order");
  CREATE INDEX "_books_v_rels_parent_idx" ON "_books_v_rels" USING btree ("parent_id");
  CREATE INDEX "_books_v_rels_path_idx" ON "_books_v_rels" USING btree ("path");
  CREATE INDEX "_books_v_rels_categories_id_idx" ON "_books_v_rels" USING btree ("categories_id");
  CREATE INDEX "chapters_book_idx" ON "chapters" USING btree ("book_id");
  CREATE INDEX "chapters_meta_meta_image_idx" ON "chapters" USING btree ("meta_image_id");
  CREATE INDEX "chapters_owner_idx" ON "chapters" USING btree ("owner_id");
  CREATE UNIQUE INDEX "chapters_slug_idx" ON "chapters" USING btree ("slug");
  CREATE INDEX "chapters_updated_at_idx" ON "chapters" USING btree ("updated_at");
  CREATE INDEX "chapters_created_at_idx" ON "chapters" USING btree ("created_at");
  CREATE INDEX "chapters__status_idx" ON "chapters" USING btree ("_status");
  CREATE INDEX "chapters_rels_order_idx" ON "chapters_rels" USING btree ("order");
  CREATE INDEX "chapters_rels_parent_idx" ON "chapters_rels" USING btree ("parent_id");
  CREATE INDEX "chapters_rels_path_idx" ON "chapters_rels" USING btree ("path");
  CREATE INDEX "chapters_rels_categories_id_idx" ON "chapters_rels" USING btree ("categories_id");
  CREATE INDEX "_chapters_v_parent_idx" ON "_chapters_v" USING btree ("parent_id");
  CREATE INDEX "_chapters_v_version_version_book_idx" ON "_chapters_v" USING btree ("version_book_id");
  CREATE INDEX "_chapters_v_version_meta_version_meta_image_idx" ON "_chapters_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_chapters_v_version_version_owner_idx" ON "_chapters_v" USING btree ("version_owner_id");
  CREATE INDEX "_chapters_v_version_version_slug_idx" ON "_chapters_v" USING btree ("version_slug");
  CREATE INDEX "_chapters_v_version_version_updated_at_idx" ON "_chapters_v" USING btree ("version_updated_at");
  CREATE INDEX "_chapters_v_version_version_created_at_idx" ON "_chapters_v" USING btree ("version_created_at");
  CREATE INDEX "_chapters_v_version_version__status_idx" ON "_chapters_v" USING btree ("version__status");
  CREATE INDEX "_chapters_v_created_at_idx" ON "_chapters_v" USING btree ("created_at");
  CREATE INDEX "_chapters_v_updated_at_idx" ON "_chapters_v" USING btree ("updated_at");
  CREATE INDEX "_chapters_v_latest_idx" ON "_chapters_v" USING btree ("latest");
  CREATE INDEX "_chapters_v_autosave_idx" ON "_chapters_v" USING btree ("autosave");
  CREATE INDEX "_chapters_v_rels_order_idx" ON "_chapters_v_rels" USING btree ("order");
  CREATE INDEX "_chapters_v_rels_parent_idx" ON "_chapters_v_rels" USING btree ("parent_id");
  CREATE INDEX "_chapters_v_rels_path_idx" ON "_chapters_v_rels" USING btree ("path");
  CREATE INDEX "_chapters_v_rels_categories_id_idx" ON "_chapters_v_rels" USING btree ("categories_id");
  CREATE INDEX "notes_chapter_idx" ON "notes" USING btree ("chapter_id");
  CREATE INDEX "notes_meta_meta_image_idx" ON "notes" USING btree ("meta_image_id");
  CREATE INDEX "notes_owner_idx" ON "notes" USING btree ("owner_id");
  CREATE UNIQUE INDEX "notes_slug_idx" ON "notes" USING btree ("slug");
  CREATE INDEX "notes_updated_at_idx" ON "notes" USING btree ("updated_at");
  CREATE INDEX "notes_created_at_idx" ON "notes" USING btree ("created_at");
  CREATE INDEX "notes__status_idx" ON "notes" USING btree ("_status");
  CREATE INDEX "notes_rels_order_idx" ON "notes_rels" USING btree ("order");
  CREATE INDEX "notes_rels_parent_idx" ON "notes_rels" USING btree ("parent_id");
  CREATE INDEX "notes_rels_path_idx" ON "notes_rels" USING btree ("path");
  CREATE INDEX "notes_rels_categories_id_idx" ON "notes_rels" USING btree ("categories_id");
  CREATE INDEX "_notes_v_parent_idx" ON "_notes_v" USING btree ("parent_id");
  CREATE INDEX "_notes_v_version_version_chapter_idx" ON "_notes_v" USING btree ("version_chapter_id");
  CREATE INDEX "_notes_v_version_meta_version_meta_image_idx" ON "_notes_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_notes_v_version_version_owner_idx" ON "_notes_v" USING btree ("version_owner_id");
  CREATE INDEX "_notes_v_version_version_slug_idx" ON "_notes_v" USING btree ("version_slug");
  CREATE INDEX "_notes_v_version_version_updated_at_idx" ON "_notes_v" USING btree ("version_updated_at");
  CREATE INDEX "_notes_v_version_version_created_at_idx" ON "_notes_v" USING btree ("version_created_at");
  CREATE INDEX "_notes_v_version_version__status_idx" ON "_notes_v" USING btree ("version__status");
  CREATE INDEX "_notes_v_created_at_idx" ON "_notes_v" USING btree ("created_at");
  CREATE INDEX "_notes_v_updated_at_idx" ON "_notes_v" USING btree ("updated_at");
  CREATE INDEX "_notes_v_latest_idx" ON "_notes_v" USING btree ("latest");
  CREATE INDEX "_notes_v_autosave_idx" ON "_notes_v" USING btree ("autosave");
  CREATE INDEX "_notes_v_rels_order_idx" ON "_notes_v_rels" USING btree ("order");
  CREATE INDEX "_notes_v_rels_parent_idx" ON "_notes_v_rels" USING btree ("parent_id");
  CREATE INDEX "_notes_v_rels_path_idx" ON "_notes_v_rels" USING btree ("path");
  CREATE INDEX "_notes_v_rels_categories_id_idx" ON "_notes_v_rels" USING btree ("categories_id");
  CREATE INDEX "flash_cards_image_idx" ON "flash_cards" USING btree ("image_id");
  CREATE INDEX "flash_cards_pdf_idx" ON "flash_cards" USING btree ("pdf_id");
  CREATE INDEX "flash_cards_book_idx" ON "flash_cards" USING btree ("book_id");
  CREATE INDEX "flash_cards_chapter_idx" ON "flash_cards" USING btree ("chapter_id");
  CREATE INDEX "flash_cards_owner_idx" ON "flash_cards" USING btree ("owner_id");
  CREATE INDEX "flash_cards_updated_at_idx" ON "flash_cards" USING btree ("updated_at");
  CREATE INDEX "flash_cards_created_at_idx" ON "flash_cards" USING btree ("created_at");
  CREATE INDEX "time_logs_mission_idx" ON "time_logs" USING btree ("mission_id");
  CREATE INDEX "time_logs_owner_idx" ON "time_logs" USING btree ("owner_id");
  CREATE INDEX "time_logs_updated_at_idx" ON "time_logs" USING btree ("updated_at");
  CREATE INDEX "time_logs_created_at_idx" ON "time_logs" USING btree ("created_at");
  CREATE INDEX "test_scores_mission_idx" ON "test_scores" USING btree ("mission_id");
  CREATE INDEX "test_scores_owner_idx" ON "test_scores" USING btree ("owner_id");
  CREATE INDEX "test_scores_updated_at_idx" ON "test_scores" USING btree ("updated_at");
  CREATE INDEX "test_scores_created_at_idx" ON "test_scores" USING btree ("created_at");
  CREATE INDEX "test_scores_rels_order_idx" ON "test_scores_rels" USING btree ("order");
  CREATE INDEX "test_scores_rels_parent_idx" ON "test_scores_rels" USING btree ("parent_id");
  CREATE INDEX "test_scores_rels_path_idx" ON "test_scores_rels" USING btree ("path");
  CREATE INDEX "test_scores_rels_categories_id_idx" ON "test_scores_rels" USING btree ("categories_id");
  CREATE INDEX "pages_hero_links_order_idx" ON "pages_hero_links" USING btree ("_order");
  CREATE INDEX "pages_hero_links_parent_id_idx" ON "pages_hero_links" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_block_links_order_idx" ON "pages_blocks_hero_block_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_block_links_parent_id_idx" ON "pages_blocks_hero_block_links" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_block_order_idx" ON "pages_blocks_hero_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_block_parent_id_idx" ON "pages_blocks_hero_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_block_path_idx" ON "pages_blocks_hero_block" USING btree ("_path");
  CREATE INDEX "pages_blocks_hero_block_media_idx" ON "pages_blocks_hero_block" USING btree ("media_id");
  CREATE INDEX "pages_blocks_rich_content_order_idx" ON "pages_blocks_rich_content" USING btree ("_order");
  CREATE INDEX "pages_blocks_rich_content_parent_id_idx" ON "pages_blocks_rich_content" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_rich_content_path_idx" ON "pages_blocks_rich_content" USING btree ("_path");
  CREATE INDEX "pages_blocks_rich_content_media_idx" ON "pages_blocks_rich_content" USING btree ("media_id");
  CREATE INDEX "pages_blocks_feature_grid_features_order_idx" ON "pages_blocks_feature_grid_features" USING btree ("_order");
  CREATE INDEX "pages_blocks_feature_grid_features_parent_id_idx" ON "pages_blocks_feature_grid_features" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_feature_grid_order_idx" ON "pages_blocks_feature_grid" USING btree ("_order");
  CREATE INDEX "pages_blocks_feature_grid_parent_id_idx" ON "pages_blocks_feature_grid" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_feature_grid_path_idx" ON "pages_blocks_feature_grid" USING btree ("_path");
  CREATE INDEX "pages_blocks_cta_block_links_order_idx" ON "pages_blocks_cta_block_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_cta_block_links_parent_id_idx" ON "pages_blocks_cta_block_links" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cta_block_order_idx" ON "pages_blocks_cta_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_cta_block_parent_id_idx" ON "pages_blocks_cta_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cta_block_path_idx" ON "pages_blocks_cta_block" USING btree ("_path");
  CREATE INDEX "pages_blocks_faq_block_items_order_idx" ON "pages_blocks_faq_block_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_faq_block_items_parent_id_idx" ON "pages_blocks_faq_block_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_faq_block_order_idx" ON "pages_blocks_faq_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_faq_block_parent_id_idx" ON "pages_blocks_faq_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_faq_block_path_idx" ON "pages_blocks_faq_block" USING btree ("_path");
  CREATE INDEX "pages_blocks_testimonial_block_testimonials_order_idx" ON "pages_blocks_testimonial_block_testimonials" USING btree ("_order");
  CREATE INDEX "pages_blocks_testimonial_block_testimonials_parent_id_idx" ON "pages_blocks_testimonial_block_testimonials" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_testimonial_block_testimonials_avatar_idx" ON "pages_blocks_testimonial_block_testimonials" USING btree ("avatar_id");
  CREATE INDEX "pages_blocks_testimonial_block_order_idx" ON "pages_blocks_testimonial_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_testimonial_block_parent_id_idx" ON "pages_blocks_testimonial_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_testimonial_block_path_idx" ON "pages_blocks_testimonial_block" USING btree ("_path");
  CREATE INDEX "pages_blocks_stats_block_stats_order_idx" ON "pages_blocks_stats_block_stats" USING btree ("_order");
  CREATE INDEX "pages_blocks_stats_block_stats_parent_id_idx" ON "pages_blocks_stats_block_stats" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_stats_block_order_idx" ON "pages_blocks_stats_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_stats_block_parent_id_idx" ON "pages_blocks_stats_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_stats_block_path_idx" ON "pages_blocks_stats_block" USING btree ("_path");
  CREATE INDEX "pages_blocks_card_grid_cards_order_idx" ON "pages_blocks_card_grid_cards" USING btree ("_order");
  CREATE INDEX "pages_blocks_card_grid_cards_parent_id_idx" ON "pages_blocks_card_grid_cards" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_card_grid_cards_media_idx" ON "pages_blocks_card_grid_cards" USING btree ("media_id");
  CREATE INDEX "pages_blocks_card_grid_order_idx" ON "pages_blocks_card_grid" USING btree ("_order");
  CREATE INDEX "pages_blocks_card_grid_parent_id_idx" ON "pages_blocks_card_grid" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_card_grid_path_idx" ON "pages_blocks_card_grid" USING btree ("_path");
  CREATE INDEX "pages_blocks_spacer_block_order_idx" ON "pages_blocks_spacer_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_spacer_block_parent_id_idx" ON "pages_blocks_spacer_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_spacer_block_path_idx" ON "pages_blocks_spacer_block" USING btree ("_path");
  CREATE INDEX "pages_blocks_banner_order_idx" ON "pages_blocks_banner" USING btree ("_order");
  CREATE INDEX "pages_blocks_banner_parent_id_idx" ON "pages_blocks_banner" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_banner_path_idx" ON "pages_blocks_banner" USING btree ("_path");
  CREATE INDEX "pages_blocks_code_order_idx" ON "pages_blocks_code" USING btree ("_order");
  CREATE INDEX "pages_blocks_code_parent_id_idx" ON "pages_blocks_code" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_code_path_idx" ON "pages_blocks_code" USING btree ("_path");
  CREATE INDEX "pages_blocks_media_block_order_idx" ON "pages_blocks_media_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_media_block_parent_id_idx" ON "pages_blocks_media_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_media_block_path_idx" ON "pages_blocks_media_block" USING btree ("_path");
  CREATE INDEX "pages_blocks_media_block_media_idx" ON "pages_blocks_media_block" USING btree ("media_id");
  CREATE INDEX "pages_blocks_cta_links_order_idx" ON "pages_blocks_cta_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_cta_links_parent_id_idx" ON "pages_blocks_cta_links" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cta_order_idx" ON "pages_blocks_cta" USING btree ("_order");
  CREATE INDEX "pages_blocks_cta_parent_id_idx" ON "pages_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cta_path_idx" ON "pages_blocks_cta" USING btree ("_path");
  CREATE INDEX "pages_blocks_content_columns_order_idx" ON "pages_blocks_content_columns" USING btree ("_order");
  CREATE INDEX "pages_blocks_content_columns_parent_id_idx" ON "pages_blocks_content_columns" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_content_order_idx" ON "pages_blocks_content" USING btree ("_order");
  CREATE INDEX "pages_blocks_content_parent_id_idx" ON "pages_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_content_path_idx" ON "pages_blocks_content" USING btree ("_path");
  CREATE INDEX "pages_hero_hero_media_idx" ON "pages" USING btree ("hero_media_id");
  CREATE INDEX "pages_meta_meta_image_idx" ON "pages" USING btree ("meta_image_id");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE INDEX "pages_rels_order_idx" ON "pages_rels" USING btree ("order");
  CREATE INDEX "pages_rels_parent_idx" ON "pages_rels" USING btree ("parent_id");
  CREATE INDEX "pages_rels_path_idx" ON "pages_rels" USING btree ("path");
  CREATE INDEX "pages_rels_pages_id_idx" ON "pages_rels" USING btree ("pages_id");
  CREATE INDEX "pages_rels_books_id_idx" ON "pages_rels" USING btree ("books_id");
  CREATE INDEX "pages_rels_chapters_id_idx" ON "pages_rels" USING btree ("chapters_id");
  CREATE INDEX "pages_rels_notes_id_idx" ON "pages_rels" USING btree ("notes_id");
  CREATE INDEX "_pages_v_version_hero_links_order_idx" ON "_pages_v_version_hero_links" USING btree ("_order");
  CREATE INDEX "_pages_v_version_hero_links_parent_id_idx" ON "_pages_v_version_hero_links" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_block_links_order_idx" ON "_pages_v_blocks_hero_block_links" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_hero_block_links_parent_id_idx" ON "_pages_v_blocks_hero_block_links" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_block_order_idx" ON "_pages_v_blocks_hero_block" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_hero_block_parent_id_idx" ON "_pages_v_blocks_hero_block" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_block_path_idx" ON "_pages_v_blocks_hero_block" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_hero_block_media_idx" ON "_pages_v_blocks_hero_block" USING btree ("media_id");
  CREATE INDEX "_pages_v_blocks_rich_content_order_idx" ON "_pages_v_blocks_rich_content" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_rich_content_parent_id_idx" ON "_pages_v_blocks_rich_content" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_rich_content_path_idx" ON "_pages_v_blocks_rich_content" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_rich_content_media_idx" ON "_pages_v_blocks_rich_content" USING btree ("media_id");
  CREATE INDEX "_pages_v_blocks_feature_grid_features_order_idx" ON "_pages_v_blocks_feature_grid_features" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_feature_grid_features_parent_id_idx" ON "_pages_v_blocks_feature_grid_features" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_feature_grid_order_idx" ON "_pages_v_blocks_feature_grid" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_feature_grid_parent_id_idx" ON "_pages_v_blocks_feature_grid" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_feature_grid_path_idx" ON "_pages_v_blocks_feature_grid" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_cta_block_links_order_idx" ON "_pages_v_blocks_cta_block_links" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cta_block_links_parent_id_idx" ON "_pages_v_blocks_cta_block_links" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cta_block_order_idx" ON "_pages_v_blocks_cta_block" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cta_block_parent_id_idx" ON "_pages_v_blocks_cta_block" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cta_block_path_idx" ON "_pages_v_blocks_cta_block" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_faq_block_items_order_idx" ON "_pages_v_blocks_faq_block_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_faq_block_items_parent_id_idx" ON "_pages_v_blocks_faq_block_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_faq_block_order_idx" ON "_pages_v_blocks_faq_block" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_faq_block_parent_id_idx" ON "_pages_v_blocks_faq_block" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_faq_block_path_idx" ON "_pages_v_blocks_faq_block" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_testimonial_block_testimonials_order_idx" ON "_pages_v_blocks_testimonial_block_testimonials" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_testimonial_block_testimonials_parent_id_idx" ON "_pages_v_blocks_testimonial_block_testimonials" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_testimonial_block_testimonials_avatar_idx" ON "_pages_v_blocks_testimonial_block_testimonials" USING btree ("avatar_id");
  CREATE INDEX "_pages_v_blocks_testimonial_block_order_idx" ON "_pages_v_blocks_testimonial_block" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_testimonial_block_parent_id_idx" ON "_pages_v_blocks_testimonial_block" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_testimonial_block_path_idx" ON "_pages_v_blocks_testimonial_block" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_stats_block_stats_order_idx" ON "_pages_v_blocks_stats_block_stats" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_stats_block_stats_parent_id_idx" ON "_pages_v_blocks_stats_block_stats" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_stats_block_order_idx" ON "_pages_v_blocks_stats_block" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_stats_block_parent_id_idx" ON "_pages_v_blocks_stats_block" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_stats_block_path_idx" ON "_pages_v_blocks_stats_block" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_card_grid_cards_order_idx" ON "_pages_v_blocks_card_grid_cards" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_card_grid_cards_parent_id_idx" ON "_pages_v_blocks_card_grid_cards" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_card_grid_cards_media_idx" ON "_pages_v_blocks_card_grid_cards" USING btree ("media_id");
  CREATE INDEX "_pages_v_blocks_card_grid_order_idx" ON "_pages_v_blocks_card_grid" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_card_grid_parent_id_idx" ON "_pages_v_blocks_card_grid" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_card_grid_path_idx" ON "_pages_v_blocks_card_grid" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_spacer_block_order_idx" ON "_pages_v_blocks_spacer_block" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_spacer_block_parent_id_idx" ON "_pages_v_blocks_spacer_block" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_spacer_block_path_idx" ON "_pages_v_blocks_spacer_block" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_banner_order_idx" ON "_pages_v_blocks_banner" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_banner_parent_id_idx" ON "_pages_v_blocks_banner" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_banner_path_idx" ON "_pages_v_blocks_banner" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_code_order_idx" ON "_pages_v_blocks_code" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_code_parent_id_idx" ON "_pages_v_blocks_code" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_code_path_idx" ON "_pages_v_blocks_code" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_media_block_order_idx" ON "_pages_v_blocks_media_block" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_media_block_parent_id_idx" ON "_pages_v_blocks_media_block" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_media_block_path_idx" ON "_pages_v_blocks_media_block" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_media_block_media_idx" ON "_pages_v_blocks_media_block" USING btree ("media_id");
  CREATE INDEX "_pages_v_blocks_cta_links_order_idx" ON "_pages_v_blocks_cta_links" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cta_links_parent_id_idx" ON "_pages_v_blocks_cta_links" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cta_order_idx" ON "_pages_v_blocks_cta" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cta_parent_id_idx" ON "_pages_v_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cta_path_idx" ON "_pages_v_blocks_cta" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_content_columns_order_idx" ON "_pages_v_blocks_content_columns" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_content_columns_parent_id_idx" ON "_pages_v_blocks_content_columns" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_content_order_idx" ON "_pages_v_blocks_content" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_content_parent_id_idx" ON "_pages_v_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_content_path_idx" ON "_pages_v_blocks_content" USING btree ("_path");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_hero_version_hero_media_idx" ON "_pages_v" USING btree ("version_hero_media_id");
  CREATE INDEX "_pages_v_version_meta_version_meta_image_idx" ON "_pages_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v" USING btree ("version_slug");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE INDEX "_pages_v_autosave_idx" ON "_pages_v" USING btree ("autosave");
  CREATE INDEX "_pages_v_rels_order_idx" ON "_pages_v_rels" USING btree ("order");
  CREATE INDEX "_pages_v_rels_parent_idx" ON "_pages_v_rels" USING btree ("parent_id");
  CREATE INDEX "_pages_v_rels_path_idx" ON "_pages_v_rels" USING btree ("path");
  CREATE INDEX "_pages_v_rels_pages_id_idx" ON "_pages_v_rels" USING btree ("pages_id");
  CREATE INDEX "_pages_v_rels_books_id_idx" ON "_pages_v_rels" USING btree ("books_id");
  CREATE INDEX "_pages_v_rels_chapters_id_idx" ON "_pages_v_rels" USING btree ("chapters_id");
  CREATE INDEX "_pages_v_rels_notes_id_idx" ON "_pages_v_rels" USING btree ("notes_id");
  CREATE UNIQUE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");
  CREATE INDEX "categories_updated_at_idx" ON "categories" USING btree ("updated_at");
  CREATE INDEX "categories_created_at_idx" ON "categories" USING btree ("created_at");
  CREATE INDEX "media_folder_idx" ON "media" USING btree ("folder_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_square_sizes_square_filename_idx" ON "media" USING btree ("sizes_square_filename");
  CREATE INDEX "media_sizes_small_sizes_small_filename_idx" ON "media" USING btree ("sizes_small_filename");
  CREATE INDEX "media_sizes_medium_sizes_medium_filename_idx" ON "media" USING btree ("sizes_medium_filename");
  CREATE INDEX "media_sizes_large_sizes_large_filename_idx" ON "media" USING btree ("sizes_large_filename");
  CREATE INDEX "media_sizes_xlarge_sizes_xlarge_filename_idx" ON "media" USING btree ("sizes_xlarge_filename");
  CREATE INDEX "media_sizes_og_sizes_og_filename_idx" ON "media" USING btree ("sizes_og_filename");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "redirects_from_idx" ON "redirects" USING btree ("from");
  CREATE INDEX "redirects_updated_at_idx" ON "redirects" USING btree ("updated_at");
  CREATE INDEX "redirects_created_at_idx" ON "redirects" USING btree ("created_at");
  CREATE INDEX "redirects_rels_order_idx" ON "redirects_rels" USING btree ("order");
  CREATE INDEX "redirects_rels_parent_idx" ON "redirects_rels" USING btree ("parent_id");
  CREATE INDEX "redirects_rels_path_idx" ON "redirects_rels" USING btree ("path");
  CREATE INDEX "redirects_rels_pages_id_idx" ON "redirects_rels" USING btree ("pages_id");
  CREATE INDEX "redirects_rels_books_id_idx" ON "redirects_rels" USING btree ("books_id");
  CREATE INDEX "redirects_rels_chapters_id_idx" ON "redirects_rels" USING btree ("chapters_id");
  CREATE INDEX "redirects_rels_notes_id_idx" ON "redirects_rels" USING btree ("notes_id");
  CREATE INDEX "search_categories_order_idx" ON "search_categories" USING btree ("_order");
  CREATE INDEX "search_categories_parent_id_idx" ON "search_categories" USING btree ("_parent_id");
  CREATE INDEX "search_slug_idx" ON "search" USING btree ("slug");
  CREATE INDEX "search_meta_meta_image_idx" ON "search" USING btree ("meta_image_id");
  CREATE INDEX "search_updated_at_idx" ON "search" USING btree ("updated_at");
  CREATE INDEX "search_created_at_idx" ON "search" USING btree ("created_at");
  CREATE INDEX "search_rels_order_idx" ON "search_rels" USING btree ("order");
  CREATE INDEX "search_rels_parent_idx" ON "search_rels" USING btree ("parent_id");
  CREATE INDEX "search_rels_path_idx" ON "search_rels" USING btree ("path");
  CREATE INDEX "search_rels_pages_id_idx" ON "search_rels" USING btree ("pages_id");
  CREATE INDEX "search_rels_books_id_idx" ON "search_rels" USING btree ("books_id");
  CREATE INDEX "search_rels_chapters_id_idx" ON "search_rels" USING btree ("chapters_id");
  CREATE INDEX "search_rels_notes_id_idx" ON "search_rels" USING btree ("notes_id");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_jobs_log_order_idx" ON "payload_jobs_log" USING btree ("_order");
  CREATE INDEX "payload_jobs_log_parent_id_idx" ON "payload_jobs_log" USING btree ("_parent_id");
  CREATE INDEX "payload_jobs_completed_at_idx" ON "payload_jobs" USING btree ("completed_at");
  CREATE INDEX "payload_jobs_total_tried_idx" ON "payload_jobs" USING btree ("total_tried");
  CREATE INDEX "payload_jobs_has_error_idx" ON "payload_jobs" USING btree ("has_error");
  CREATE INDEX "payload_jobs_task_slug_idx" ON "payload_jobs" USING btree ("task_slug");
  CREATE INDEX "payload_jobs_queue_idx" ON "payload_jobs" USING btree ("queue");
  CREATE INDEX "payload_jobs_wait_until_idx" ON "payload_jobs" USING btree ("wait_until");
  CREATE INDEX "payload_jobs_processing_idx" ON "payload_jobs" USING btree ("processing");
  CREATE INDEX "payload_jobs_updated_at_idx" ON "payload_jobs" USING btree ("updated_at");
  CREATE INDEX "payload_jobs_created_at_idx" ON "payload_jobs" USING btree ("created_at");
  CREATE INDEX "payload_folders_folder_type_order_idx" ON "payload_folders_folder_type" USING btree ("order");
  CREATE INDEX "payload_folders_folder_type_parent_idx" ON "payload_folders_folder_type" USING btree ("parent_id");
  CREATE INDEX "payload_folders_name_idx" ON "payload_folders" USING btree ("name");
  CREATE INDEX "payload_folders_folder_idx" ON "payload_folders" USING btree ("folder_id");
  CREATE INDEX "payload_folders_updated_at_idx" ON "payload_folders" USING btree ("updated_at");
  CREATE INDEX "payload_folders_created_at_idx" ON "payload_folders" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_projects_id_idx" ON "payload_locked_documents_rels" USING btree ("projects_id");
  CREATE INDEX "payload_locked_documents_rels_missions_id_idx" ON "payload_locked_documents_rels" USING btree ("missions_id");
  CREATE INDEX "payload_locked_documents_rels_books_id_idx" ON "payload_locked_documents_rels" USING btree ("books_id");
  CREATE INDEX "payload_locked_documents_rels_chapters_id_idx" ON "payload_locked_documents_rels" USING btree ("chapters_id");
  CREATE INDEX "payload_locked_documents_rels_notes_id_idx" ON "payload_locked_documents_rels" USING btree ("notes_id");
  CREATE INDEX "payload_locked_documents_rels_flash_cards_id_idx" ON "payload_locked_documents_rels" USING btree ("flash_cards_id");
  CREATE INDEX "payload_locked_documents_rels_time_logs_id_idx" ON "payload_locked_documents_rels" USING btree ("time_logs_id");
  CREATE INDEX "payload_locked_documents_rels_test_scores_id_idx" ON "payload_locked_documents_rels" USING btree ("test_scores_id");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("categories_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_redirects_id_idx" ON "payload_locked_documents_rels" USING btree ("redirects_id");
  CREATE INDEX "payload_locked_documents_rels_search_id_idx" ON "payload_locked_documents_rels" USING btree ("search_id");
  CREATE INDEX "payload_locked_documents_rels_payload_folders_id_idx" ON "payload_locked_documents_rels" USING btree ("payload_folders_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "header_nav_items_order_idx" ON "header_nav_items" USING btree ("_order");
  CREATE INDEX "header_nav_items_parent_id_idx" ON "header_nav_items" USING btree ("_parent_id");
  CREATE INDEX "header_rels_order_idx" ON "header_rels" USING btree ("order");
  CREATE INDEX "header_rels_parent_idx" ON "header_rels" USING btree ("parent_id");
  CREATE INDEX "header_rels_path_idx" ON "header_rels" USING btree ("path");
  CREATE INDEX "header_rels_pages_id_idx" ON "header_rels" USING btree ("pages_id");
  CREATE INDEX "header_rels_books_id_idx" ON "header_rels" USING btree ("books_id");
  CREATE INDEX "header_rels_chapters_id_idx" ON "header_rels" USING btree ("chapters_id");
  CREATE INDEX "header_rels_notes_id_idx" ON "header_rels" USING btree ("notes_id");
  CREATE INDEX "footer_nav_items_order_idx" ON "footer_nav_items" USING btree ("_order");
  CREATE INDEX "footer_nav_items_parent_id_idx" ON "footer_nav_items" USING btree ("_parent_id");
  CREATE INDEX "footer_rels_order_idx" ON "footer_rels" USING btree ("order");
  CREATE INDEX "footer_rels_parent_idx" ON "footer_rels" USING btree ("parent_id");
  CREATE INDEX "footer_rels_path_idx" ON "footer_rels" USING btree ("path");
  CREATE INDEX "footer_rels_pages_id_idx" ON "footer_rels" USING btree ("pages_id");
  CREATE INDEX "footer_rels_books_id_idx" ON "footer_rels" USING btree ("books_id");
  CREATE INDEX "footer_rels_chapters_id_idx" ON "footer_rels" USING btree ("chapters_id");
  CREATE INDEX "footer_rels_notes_id_idx" ON "footer_rels" USING btree ("notes_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "projects" CASCADE;
  DROP TABLE "projects_rels" CASCADE;
  DROP TABLE "missions" CASCADE;
  DROP TABLE "missions_rels" CASCADE;
  DROP TABLE "books" CASCADE;
  DROP TABLE "books_rels" CASCADE;
  DROP TABLE "_books_v" CASCADE;
  DROP TABLE "_books_v_rels" CASCADE;
  DROP TABLE "chapters" CASCADE;
  DROP TABLE "chapters_rels" CASCADE;
  DROP TABLE "_chapters_v" CASCADE;
  DROP TABLE "_chapters_v_rels" CASCADE;
  DROP TABLE "notes" CASCADE;
  DROP TABLE "notes_rels" CASCADE;
  DROP TABLE "_notes_v" CASCADE;
  DROP TABLE "_notes_v_rels" CASCADE;
  DROP TABLE "flash_cards" CASCADE;
  DROP TABLE "time_logs" CASCADE;
  DROP TABLE "test_scores" CASCADE;
  DROP TABLE "test_scores_rels" CASCADE;
  DROP TABLE "pages_hero_links" CASCADE;
  DROP TABLE "pages_blocks_hero_block_links" CASCADE;
  DROP TABLE "pages_blocks_hero_block" CASCADE;
  DROP TABLE "pages_blocks_rich_content" CASCADE;
  DROP TABLE "pages_blocks_feature_grid_features" CASCADE;
  DROP TABLE "pages_blocks_feature_grid" CASCADE;
  DROP TABLE "pages_blocks_cta_block_links" CASCADE;
  DROP TABLE "pages_blocks_cta_block" CASCADE;
  DROP TABLE "pages_blocks_faq_block_items" CASCADE;
  DROP TABLE "pages_blocks_faq_block" CASCADE;
  DROP TABLE "pages_blocks_testimonial_block_testimonials" CASCADE;
  DROP TABLE "pages_blocks_testimonial_block" CASCADE;
  DROP TABLE "pages_blocks_stats_block_stats" CASCADE;
  DROP TABLE "pages_blocks_stats_block" CASCADE;
  DROP TABLE "pages_blocks_card_grid_cards" CASCADE;
  DROP TABLE "pages_blocks_card_grid" CASCADE;
  DROP TABLE "pages_blocks_spacer_block" CASCADE;
  DROP TABLE "pages_blocks_banner" CASCADE;
  DROP TABLE "pages_blocks_code" CASCADE;
  DROP TABLE "pages_blocks_media_block" CASCADE;
  DROP TABLE "pages_blocks_cta_links" CASCADE;
  DROP TABLE "pages_blocks_cta" CASCADE;
  DROP TABLE "pages_blocks_content_columns" CASCADE;
  DROP TABLE "pages_blocks_content" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "pages_rels" CASCADE;
  DROP TABLE "_pages_v_version_hero_links" CASCADE;
  DROP TABLE "_pages_v_blocks_hero_block_links" CASCADE;
  DROP TABLE "_pages_v_blocks_hero_block" CASCADE;
  DROP TABLE "_pages_v_blocks_rich_content" CASCADE;
  DROP TABLE "_pages_v_blocks_feature_grid_features" CASCADE;
  DROP TABLE "_pages_v_blocks_feature_grid" CASCADE;
  DROP TABLE "_pages_v_blocks_cta_block_links" CASCADE;
  DROP TABLE "_pages_v_blocks_cta_block" CASCADE;
  DROP TABLE "_pages_v_blocks_faq_block_items" CASCADE;
  DROP TABLE "_pages_v_blocks_faq_block" CASCADE;
  DROP TABLE "_pages_v_blocks_testimonial_block_testimonials" CASCADE;
  DROP TABLE "_pages_v_blocks_testimonial_block" CASCADE;
  DROP TABLE "_pages_v_blocks_stats_block_stats" CASCADE;
  DROP TABLE "_pages_v_blocks_stats_block" CASCADE;
  DROP TABLE "_pages_v_blocks_card_grid_cards" CASCADE;
  DROP TABLE "_pages_v_blocks_card_grid" CASCADE;
  DROP TABLE "_pages_v_blocks_spacer_block" CASCADE;
  DROP TABLE "_pages_v_blocks_banner" CASCADE;
  DROP TABLE "_pages_v_blocks_code" CASCADE;
  DROP TABLE "_pages_v_blocks_media_block" CASCADE;
  DROP TABLE "_pages_v_blocks_cta_links" CASCADE;
  DROP TABLE "_pages_v_blocks_cta" CASCADE;
  DROP TABLE "_pages_v_blocks_content_columns" CASCADE;
  DROP TABLE "_pages_v_blocks_content" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "_pages_v_rels" CASCADE;
  DROP TABLE "categories" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "redirects" CASCADE;
  DROP TABLE "redirects_rels" CASCADE;
  DROP TABLE "search_categories" CASCADE;
  DROP TABLE "search" CASCADE;
  DROP TABLE "search_rels" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_jobs_log" CASCADE;
  DROP TABLE "payload_jobs" CASCADE;
  DROP TABLE "payload_folders_folder_type" CASCADE;
  DROP TABLE "payload_folders" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "header_nav_items" CASCADE;
  DROP TABLE "header" CASCADE;
  DROP TABLE "header_rels" CASCADE;
  DROP TABLE "footer_nav_items" CASCADE;
  DROP TABLE "footer" CASCADE;
  DROP TABLE "footer_rels" CASCADE;
  DROP TYPE "public"."enum_projects_status";
  DROP TYPE "public"."enum_missions_type";
  DROP TYPE "public"."enum_missions_status";
  DROP TYPE "public"."enum_books_progress_status";
  DROP TYPE "public"."enum_books_status";
  DROP TYPE "public"."enum__books_v_version_progress_status";
  DROP TYPE "public"."enum__books_v_version_status";
  DROP TYPE "public"."enum_chapters_progress_status";
  DROP TYPE "public"."enum_chapters_status";
  DROP TYPE "public"."enum__chapters_v_version_progress_status";
  DROP TYPE "public"."enum__chapters_v_version_status";
  DROP TYPE "public"."enum_notes_note_type";
  DROP TYPE "public"."enum_notes_status";
  DROP TYPE "public"."enum__notes_v_version_note_type";
  DROP TYPE "public"."enum__notes_v_version_status";
  DROP TYPE "public"."enum_flash_cards_content_type";
  DROP TYPE "public"."enum_time_logs_category";
  DROP TYPE "public"."enum_test_scores_exam_type";
  DROP TYPE "public"."enum_pages_hero_links_link_type";
  DROP TYPE "public"."enum_pages_hero_links_link_appearance";
  DROP TYPE "public"."enum_pages_blocks_hero_block_links_link_type";
  DROP TYPE "public"."enum_pages_blocks_hero_block_links_link_appearance";
  DROP TYPE "public"."enum_pages_blocks_hero_block_alignment";
  DROP TYPE "public"."enum_pages_blocks_rich_content_layout";
  DROP TYPE "public"."enum_pages_blocks_feature_grid_features_icon";
  DROP TYPE "public"."enum_pages_blocks_feature_grid_columns";
  DROP TYPE "public"."enum_pages_blocks_cta_block_links_link_type";
  DROP TYPE "public"."enum_pages_blocks_cta_block_links_link_appearance";
  DROP TYPE "public"."enum_pages_blocks_cta_block_style";
  DROP TYPE "public"."enum_pages_blocks_card_grid_cards_link_type";
  DROP TYPE "public"."enum_pages_blocks_spacer_block_size";
  DROP TYPE "public"."enum_pages_blocks_banner_style";
  DROP TYPE "public"."enum_pages_blocks_code_language";
  DROP TYPE "public"."enum_pages_blocks_cta_links_link_type";
  DROP TYPE "public"."enum_pages_blocks_cta_links_link_appearance";
  DROP TYPE "public"."enum_pages_blocks_content_columns_size";
  DROP TYPE "public"."enum_pages_blocks_content_columns_link_type";
  DROP TYPE "public"."enum_pages_blocks_content_columns_link_appearance";
  DROP TYPE "public"."enum_pages_hero_type";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum__pages_v_version_hero_links_link_type";
  DROP TYPE "public"."enum__pages_v_version_hero_links_link_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_hero_block_links_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_hero_block_links_link_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_hero_block_alignment";
  DROP TYPE "public"."enum__pages_v_blocks_rich_content_layout";
  DROP TYPE "public"."enum__pages_v_blocks_feature_grid_features_icon";
  DROP TYPE "public"."enum__pages_v_blocks_feature_grid_columns";
  DROP TYPE "public"."enum__pages_v_blocks_cta_block_links_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_cta_block_links_link_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_cta_block_style";
  DROP TYPE "public"."enum__pages_v_blocks_card_grid_cards_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_spacer_block_size";
  DROP TYPE "public"."enum__pages_v_blocks_banner_style";
  DROP TYPE "public"."enum__pages_v_blocks_code_language";
  DROP TYPE "public"."enum__pages_v_blocks_cta_links_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_cta_links_link_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_content_columns_size";
  DROP TYPE "public"."enum__pages_v_blocks_content_columns_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_content_columns_link_appearance";
  DROP TYPE "public"."enum__pages_v_version_hero_type";
  DROP TYPE "public"."enum__pages_v_version_status";
  DROP TYPE "public"."enum_categories_type";
  DROP TYPE "public"."enum_users_preferences_theme";
  DROP TYPE "public"."enum_users_preferences_default_project_view";
  DROP TYPE "public"."enum_redirects_to_type";
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  DROP TYPE "public"."enum_payload_jobs_log_state";
  DROP TYPE "public"."enum_payload_jobs_task_slug";
  DROP TYPE "public"."enum_payload_folders_folder_type";
  DROP TYPE "public"."enum_header_nav_items_link_type";
  DROP TYPE "public"."enum_footer_nav_items_link_type";`)
}
