CREATE TYPE "public"."activity_kind" AS ENUM('publish', 'scholar', 'moderation', 'user', 'system');--> statement-breakpoint
CREATE TYPE "public"."application_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."bookmark_kind" AS ENUM('ayah', 'hadith', 'dua', 'article', 'fatwa', 'answer', 'question', 'discussion');--> statement-breakpoint
CREATE TYPE "public"."content_status" AS ENUM('draft', 'in-review', 'published', 'changes-requested');--> statement-breakpoint
CREATE TYPE "public"."fatwa_status" AS ENUM('draft', 'in-review', 'published');--> statement-breakpoint
CREATE TYPE "public"."feed_kind" AS ENUM('daily-ayah', 'daily-hadith', 'answer', 'article', 'fatwa', 'discussion', 'question', 'journey');--> statement-breakpoint
CREATE TYPE "public"."fiqh" AS ENUM('hanafi', 'comparative');--> statement-breakpoint
CREATE TYPE "public"."fiqh_focus" AS ENUM('hanafi', 'general', 'usul', 'comparative');--> statement-breakpoint
CREATE TYPE "public"."hadith_grade" AS ENUM('sahih', 'hasan', 'daif', 'muttafaqun-alaih');--> statement-breakpoint
CREATE TYPE "public"."moderation_state" AS ENUM('clean', 'under-review', 'locked');--> statement-breakpoint
CREATE TYPE "public"."notification_kind" AS ENUM('answer', 'mention', 'follow', 'reshare', 'moderation', 'daily', 'journey', 'system');--> statement-breakpoint
CREATE TYPE "public"."question_status" AS ENUM('open', 'routed', 'answered', 'closed');--> statement-breakpoint
CREATE TYPE "public"."question_visibility" AS ENUM('public', 'anonymous', 'private');--> statement-breakpoint
CREATE TYPE "public"."reading_kind" AS ENUM('quran', 'article', 'hadith', 'journey');--> statement-breakpoint
CREATE TYPE "public"."reference_kind" AS ENUM('ayah', 'hadith');--> statement-breakpoint
CREATE TYPE "public"."report_reason" AS ENUM('misinformation', 'sectarian', 'abuse', 'spam', 'off-topic', 'copyright');--> statement-breakpoint
CREATE TYPE "public"."report_severity" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."report_status" AS ENUM('pending', 'resolved', 'dismissed');--> statement-breakpoint
CREATE TYPE "public"."report_target" AS ENUM('question', 'answer', 'article', 'fatwa', 'discussion', 'comment');--> statement-breakpoint
CREATE TYPE "public"."revelation_place" AS ENUM('meccan', 'medinan');--> statement-breakpoint
CREATE TYPE "public"."review_kind" AS ENUM('article', 'fatwa');--> statement-breakpoint
CREATE TYPE "public"."review_status" AS ENUM('pending', 'in-review', 'changes-requested');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('admin', 'scholar', 'user');--> statement-breakpoint
CREATE TYPE "public"."urgency" AS ENUM('normal', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'suspended', 'pending');--> statement-breakpoint
CREATE TABLE "content_reports" (
	"id" text PRIMARY KEY NOT NULL,
	"content_type" "report_target" NOT NULL,
	"content_title_bn" text NOT NULL,
	"content_href" text NOT NULL,
	"reason" "report_reason" NOT NULL,
	"reason_label_bn" text NOT NULL,
	"reported_by_bn" text NOT NULL,
	"reported_at" timestamp with time zone NOT NULL,
	"severity" "report_severity" DEFAULT 'low' NOT NULL,
	"status" "report_status" DEFAULT 'pending' NOT NULL,
	"assigned_to_bn" text
);
--> statement-breakpoint
CREATE TABLE "platform_activity" (
	"id" text PRIMARY KEY NOT NULL,
	"actor_bn" text NOT NULL,
	"action_bn" text NOT NULL,
	"target_bn" text NOT NULL,
	"at" timestamp with time zone NOT NULL,
	"kind" "activity_kind" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "review_items" (
	"id" text PRIMARY KEY NOT NULL,
	"kind" "review_kind" NOT NULL,
	"title_bn" text NOT NULL,
	"author_id" text NOT NULL,
	"author_name_bn" text NOT NULL,
	"submitted_at" timestamp with time zone NOT NULL,
	"departments" text[] DEFAULT '{}'::text[] NOT NULL,
	"reference_count" integer DEFAULT 0 NOT NULL,
	"word_count" integer DEFAULT 0 NOT NULL,
	"status" "review_status" DEFAULT 'pending' NOT NULL,
	"flagged_references" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "discussion_departments" (
	"discussion_id" text NOT NULL,
	"department_id" text NOT NULL,
	CONSTRAINT "discussion_departments_discussion_id_department_id_pk" PRIMARY KEY("discussion_id","department_id")
);
--> statement-breakpoint
CREATE TABLE "discussion_replies" (
	"id" text PRIMARY KEY NOT NULL,
	"discussion_id" text NOT NULL,
	"author_id" text NOT NULL,
	"body_bn" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"upvotes" integer DEFAULT 0 NOT NULL,
	"is_scholar_reply" boolean DEFAULT false NOT NULL,
	"accepted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "discussions" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title_bn" text NOT NULL,
	"body_bn" text NOT NULL,
	"author_id" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"reply_count" integer DEFAULT 0 NOT NULL,
	"upvotes" integer DEFAULT 0 NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"pinned" boolean DEFAULT false NOT NULL,
	"moderation_state" "moderation_state" DEFAULT 'clean' NOT NULL,
	"moderation_note_bn" text,
	"tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"topic_ids" text[] DEFAULT '{}'::text[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE "article_departments" (
	"article_id" text NOT NULL,
	"department_id" text NOT NULL,
	CONSTRAINT "article_departments_article_id_department_id_pk" PRIMARY KEY("article_id","department_id")
);
--> statement-breakpoint
CREATE TABLE "article_references" (
	"article_id" text NOT NULL,
	"reference_id" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "article_references_article_id_reference_id_pk" PRIMARY KEY("article_id","reference_id")
);
--> statement-breakpoint
CREATE TABLE "articles" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" jsonb NOT NULL,
	"excerpt" jsonb NOT NULL,
	"body_bn" text[] NOT NULL,
	"author_id" text NOT NULL,
	"cover_tone" text NOT NULL,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"reading_minutes" integer DEFAULT 1 NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"bookmark_count" integer DEFAULT 0 NOT NULL,
	"like_count" integer DEFAULT 0 NOT NULL,
	"comment_count" integer DEFAULT 0 NOT NULL,
	"reference_count" integer DEFAULT 0 NOT NULL,
	"topic_ids" text[] DEFAULT '{}'::text[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_references" (
	"id" text PRIMARY KEY NOT NULL,
	"kind" "reference_kind" NOT NULL,
	"ref" text NOT NULL,
	"arabic" text NOT NULL,
	"translation_bn" text NOT NULL,
	"ref_bn" text NOT NULL,
	"note" text
);
--> statement-breakpoint
CREATE TABLE "fatwa_cosigners" (
	"fatwa_id" text NOT NULL,
	"user_id" text NOT NULL,
	CONSTRAINT "fatwa_cosigners_fatwa_id_user_id_pk" PRIMARY KEY("fatwa_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "fatwa_departments" (
	"fatwa_id" text NOT NULL,
	"department_id" text NOT NULL,
	CONSTRAINT "fatwa_departments_fatwa_id_department_id_pk" PRIMARY KEY("fatwa_id","department_id")
);
--> statement-breakpoint
CREATE TABLE "fatwa_references" (
	"fatwa_id" text NOT NULL,
	"reference_id" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "fatwa_references_fatwa_id_reference_id_pk" PRIMARY KEY("fatwa_id","reference_id")
);
--> statement-breakpoint
CREATE TABLE "fatwas" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"question_bn" text NOT NULL,
	"ruling_bn" text NOT NULL,
	"body_bn" text[] NOT NULL,
	"questioner_district" text NOT NULL,
	"mufti_id" text NOT NULL,
	"fiqh" "fiqh" DEFAULT 'hanafi' NOT NULL,
	"status" "fatwa_status" DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone NOT NULL,
	"reference_count" integer DEFAULT 0 NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"bookmark_count" integer DEFAULT 0 NOT NULL,
	"pinned" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dua_categories" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" jsonb NOT NULL,
	"description" jsonb NOT NULL,
	"icon" text NOT NULL,
	"tone" text NOT NULL,
	CONSTRAINT "dua_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "duas" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"category_slug" text NOT NULL,
	"title" jsonb NOT NULL,
	"arabic" text NOT NULL,
	"transliteration_bn" text NOT NULL,
	"meaning" jsonb NOT NULL,
	"reference" jsonb NOT NULL,
	"occasion" jsonb NOT NULL,
	"repeat" jsonb,
	"virtue" jsonb,
	"tags" text[] DEFAULT '{}'::text[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hadith_books" (
	"id" text PRIMARY KEY NOT NULL,
	"collection_slug" text NOT NULL,
	"number" integer NOT NULL,
	"name" jsonb NOT NULL,
	"hadith_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hadith_collections" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" jsonb NOT NULL,
	"author" jsonb NOT NULL,
	"name_arabic" text NOT NULL,
	"description" jsonb NOT NULL,
	"hadith_count" integer NOT NULL,
	"authentic" boolean DEFAULT false NOT NULL,
	"book_count" integer DEFAULT 0 NOT NULL,
	"tone" text NOT NULL,
	CONSTRAINT "hadith_collections_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "hadiths" (
	"id" text PRIMARY KEY NOT NULL,
	"collection_slug" text NOT NULL,
	"collection_name" jsonb NOT NULL,
	"book_number" integer NOT NULL,
	"book_name" jsonb NOT NULL,
	"number" integer NOT NULL,
	"ref_bn" text NOT NULL,
	"ref_en" text NOT NULL,
	"arabic" text NOT NULL,
	"translation_bn" text NOT NULL,
	"translation_en" text NOT NULL,
	"narrator" jsonb NOT NULL,
	"grade" "hadith_grade" NOT NULL,
	"lesson_bn" text,
	"topic_ids" text[] DEFAULT '{}'::text[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE "departments" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" jsonb NOT NULL,
	"short_name" jsonb NOT NULL,
	"description" jsonb NOT NULL,
	"icon" text NOT NULL,
	"tone" text NOT NULL,
	"trending" boolean DEFAULT false NOT NULL,
	"stats" jsonb NOT NULL,
	CONSTRAINT "departments_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "districts" (
	"id" text PRIMARY KEY NOT NULL,
	"name" jsonb NOT NULL,
	"division" jsonb NOT NULL,
	"lat" double precision NOT NULL,
	"lng" double precision NOT NULL,
	"timezone" text DEFAULT 'Asia/Dhaka' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "topic_departments" (
	"topic_id" text NOT NULL,
	"department_slug" text NOT NULL,
	CONSTRAINT "topic_departments_topic_id_department_slug_pk" PRIMARY KEY("topic_id","department_slug")
);
--> statement-breakpoint
CREATE TABLE "topics" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" jsonb NOT NULL,
	"description" jsonb NOT NULL,
	"content_count" integer DEFAULT 0 NOT NULL,
	"trending" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scholar_applications" (
	"id" text PRIMARY KEY NOT NULL,
	"name_bn" text NOT NULL,
	"name_en" text NOT NULL,
	"madrasah_bn" text NOT NULL,
	"district" text NOT NULL,
	"departments" text[] DEFAULT '{}'::text[] NOT NULL,
	"credentials_bn" text[] DEFAULT '{}'::text[] NOT NULL,
	"submitted_at" timestamp with time zone NOT NULL,
	"status" "application_status" DEFAULT 'pending' NOT NULL,
	"experience_years" integer DEFAULT 0 NOT NULL,
	"email" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scholar_biographies" (
	"scholar_id" text PRIMARY KEY NOT NULL,
	"born" jsonb NOT NULL,
	"family" jsonb NOT NULL,
	"narrative" jsonb NOT NULL,
	"now" jsonb NOT NULL,
	"teachers" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"ijazah" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"service" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"works" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"students" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"awards" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"sources" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scholar_departments" (
	"scholar_id" text NOT NULL,
	"department_id" text NOT NULL,
	CONSTRAINT "scholar_departments_scholar_id_department_id_pk" PRIMARY KEY("scholar_id","department_id")
);
--> statement-breakpoint
CREATE TABLE "scholars" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" jsonb NOT NULL,
	"honorific" jsonb NOT NULL,
	"avatar_color" text NOT NULL,
	"short_bio" jsonb NOT NULL,
	"bio" jsonb NOT NULL,
	"primary_department_id" text NOT NULL,
	"specialization" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"languages" text[] DEFAULT '{}'::text[] NOT NULL,
	"credentials" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"madrasah" jsonb NOT NULL,
	"district" text NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"available_for_questions" boolean DEFAULT true NOT NULL,
	"response_time_hours" double precision DEFAULT 0 NOT NULL,
	"rating" double precision DEFAULT 0 NOT NULL,
	"stats" jsonb NOT NULL,
	"joined_at" timestamp with time zone NOT NULL,
	"fiqh_focus" "fiqh_focus"[] DEFAULT '{}' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_following_departments" (
	"user_id" text NOT NULL,
	"department_slug" text NOT NULL,
	CONSTRAINT "user_following_departments_user_id_department_slug_pk" PRIMARY KEY("user_id","department_slug")
);
--> statement-breakpoint
CREATE TABLE "user_following_scholars" (
	"user_id" text NOT NULL,
	"scholar_id" text NOT NULL,
	CONSTRAINT "user_following_scholars_user_id_scholar_id_pk" PRIMARY KEY("user_id","scholar_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"role" "role" DEFAULT 'user' NOT NULL,
	"avatar_color" text NOT NULL,
	"district" text NOT NULL,
	"joined_at" timestamp with time zone NOT NULL,
	"scholar_id" text,
	"interests" text[] DEFAULT '{}'::text[] NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"status" "user_status" DEFAULT 'active' NOT NULL,
	"contributions" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quran_ayahs" (
	"surah" integer NOT NULL,
	"number" integer NOT NULL,
	"ref" text NOT NULL,
	"arabic" text NOT NULL,
	"translation_bn" text NOT NULL,
	"translation_en" text NOT NULL,
	"transliteration_bn" text NOT NULL,
	"tafsir_bn" text,
	"sajda" boolean DEFAULT false NOT NULL,
	CONSTRAINT "quran_ayahs_surah_number_pk" PRIMARY KEY("surah","number")
);
--> statement-breakpoint
CREATE TABLE "quran_surahs" (
	"number" integer PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name_arabic" text NOT NULL,
	"name" jsonb NOT NULL,
	"meaning" jsonb NOT NULL,
	"ayah_count" integer NOT NULL,
	"revelation" "revelation_place" NOT NULL,
	"has_text" boolean DEFAULT false NOT NULL,
	"juz" integer NOT NULL,
	"about" jsonb
);
--> statement-breakpoint
CREATE TABLE "answer_references" (
	"answer_id" text NOT NULL,
	"reference_id" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "answer_references_answer_id_reference_id_pk" PRIMARY KEY("answer_id","reference_id")
);
--> statement-breakpoint
CREATE TABLE "answers" (
	"id" text PRIMARY KEY NOT NULL,
	"question_id" text NOT NULL,
	"scholar_id" text NOT NULL,
	"body_bn" text NOT NULL,
	"accepted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"upvotes" integer DEFAULT 0 NOT NULL,
	"downvotes" integer DEFAULT 0 NOT NULL,
	"became_fatwa_slug" text
);
--> statement-breakpoint
CREATE TABLE "question_departments" (
	"question_id" text NOT NULL,
	"department_id" text NOT NULL,
	CONSTRAINT "question_departments_question_id_department_id_pk" PRIMARY KEY("question_id","department_id")
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title_bn" text NOT NULL,
	"body_bn" text NOT NULL,
	"asker_id" text NOT NULL,
	"asker_district" text NOT NULL,
	"visibility" "question_visibility" DEFAULT 'public' NOT NULL,
	"status" "question_status" DEFAULT 'open' NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"answered_at" timestamp with time zone,
	"views" integer DEFAULT 0 NOT NULL,
	"follower_count" integer DEFAULT 0 NOT NULL,
	"answer_count" integer DEFAULT 0 NOT NULL,
	"fatwa_requested" boolean DEFAULT false NOT NULL,
	"urgency" "urgency" DEFAULT 'normal' NOT NULL,
	"topic_ids" text[] DEFAULT '{}'::text[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"kind" "notification_kind" NOT NULL,
	"title_bn" text NOT NULL,
	"body_bn" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"href" text NOT NULL,
	"actor_id" text
);
--> statement-breakpoint
CREATE TABLE "bookmark_collections" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name_bn" text NOT NULL,
	"tone" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookmarks" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"kind" "bookmark_kind" NOT NULL,
	"title_bn" text NOT NULL,
	"preview_bn" text NOT NULL,
	"ref_bn" text NOT NULL,
	"href" text NOT NULL,
	"saved_at" timestamp with time zone NOT NULL,
	"collection_id" text
);
--> statement-breakpoint
CREATE TABLE "daily_highlights" (
	"id" text PRIMARY KEY NOT NULL,
	"ayah_refs" text[] DEFAULT '{}'::text[] NOT NULL,
	"hadith_ids" text[] DEFAULT '{}'::text[] NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dhikr_items" (
	"id" text PRIMARY KEY NOT NULL,
	"arabic" text NOT NULL,
	"transliteration_bn" text NOT NULL,
	"meaning_bn" text NOT NULL,
	"count" text NOT NULL,
	"virtue_bn" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feed_items" (
	"id" text PRIMARY KEY NOT NULL,
	"kind" "feed_kind" NOT NULL,
	"reason_bn" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"article_id" text,
	"fatwa_id" text,
	"question_id" text,
	"discussion_id" text,
	"scholar_id" text,
	"ayah_ref" text,
	"hadith_id" text,
	"journey_id" text
);
--> statement-breakpoint
CREATE TABLE "feed_sections" (
	"id" text PRIMARY KEY NOT NULL,
	"title_bn" text NOT NULL,
	"title_en" text NOT NULL,
	"kinds" "feed_kind"[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE "focus_themes" (
	"id" text PRIMARY KEY NOT NULL,
	"title_bn" text NOT NULL,
	"emoji" text NOT NULL,
	"description_bn" text NOT NULL,
	"department_slugs" text[] DEFAULT '{}'::text[] NOT NULL,
	"target_minutes" integer DEFAULT 15 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "journey_enrollments" (
	"user_id" text NOT NULL,
	"journey_id" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"completed_days" integer DEFAULT 0 NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	CONSTRAINT "journey_enrollments_user_id_journey_id_pk" PRIMARY KEY("user_id","journey_id")
);
--> statement-breakpoint
CREATE TABLE "journeys" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title_bn" text NOT NULL,
	"description_bn" text NOT NULL,
	"duration_label_bn" text NOT NULL,
	"enrolled" integer DEFAULT 0 NOT NULL,
	"completed_days" integer DEFAULT 0 NOT NULL,
	"total_days" integer NOT NULL,
	"days" jsonb NOT NULL,
	"tone" text NOT NULL,
	"category_bn" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learning_daily_minutes" (
	"user_id" text NOT NULL,
	"day" date NOT NULL,
	"minutes" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "learning_daily_minutes_user_id_day_pk" PRIMARY KEY("user_id","day")
);
--> statement-breakpoint
CREATE TABLE "reading_progress" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"kind" "reading_kind" NOT NULL,
	"title_bn" text NOT NULL,
	"subtitle_bn" text NOT NULL,
	"href" text NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"last_read_at" timestamp with time zone NOT NULL,
	"resume_label_bn" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "review_items" ADD CONSTRAINT "review_items_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discussion_departments" ADD CONSTRAINT "discussion_departments_discussion_id_discussions_id_fk" FOREIGN KEY ("discussion_id") REFERENCES "public"."discussions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discussion_departments" ADD CONSTRAINT "discussion_departments_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discussion_replies" ADD CONSTRAINT "discussion_replies_discussion_id_discussions_id_fk" FOREIGN KEY ("discussion_id") REFERENCES "public"."discussions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discussion_replies" ADD CONSTRAINT "discussion_replies_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discussions" ADD CONSTRAINT "discussions_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_departments" ADD CONSTRAINT "article_departments_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_departments" ADD CONSTRAINT "article_departments_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_references" ADD CONSTRAINT "article_references_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_references" ADD CONSTRAINT "article_references_reference_id_content_references_id_fk" FOREIGN KEY ("reference_id") REFERENCES "public"."content_references"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fatwa_cosigners" ADD CONSTRAINT "fatwa_cosigners_fatwa_id_fatwas_id_fk" FOREIGN KEY ("fatwa_id") REFERENCES "public"."fatwas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fatwa_cosigners" ADD CONSTRAINT "fatwa_cosigners_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fatwa_departments" ADD CONSTRAINT "fatwa_departments_fatwa_id_fatwas_id_fk" FOREIGN KEY ("fatwa_id") REFERENCES "public"."fatwas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fatwa_departments" ADD CONSTRAINT "fatwa_departments_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fatwa_references" ADD CONSTRAINT "fatwa_references_fatwa_id_fatwas_id_fk" FOREIGN KEY ("fatwa_id") REFERENCES "public"."fatwas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fatwa_references" ADD CONSTRAINT "fatwa_references_reference_id_content_references_id_fk" FOREIGN KEY ("reference_id") REFERENCES "public"."content_references"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fatwas" ADD CONSTRAINT "fatwas_mufti_id_users_id_fk" FOREIGN KEY ("mufti_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "duas" ADD CONSTRAINT "duas_category_slug_dua_categories_slug_fk" FOREIGN KEY ("category_slug") REFERENCES "public"."dua_categories"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hadith_books" ADD CONSTRAINT "hadith_books_collection_slug_hadith_collections_slug_fk" FOREIGN KEY ("collection_slug") REFERENCES "public"."hadith_collections"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hadiths" ADD CONSTRAINT "hadiths_collection_slug_hadith_collections_slug_fk" FOREIGN KEY ("collection_slug") REFERENCES "public"."hadith_collections"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topic_departments" ADD CONSTRAINT "topic_departments_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topic_departments" ADD CONSTRAINT "topic_departments_department_slug_departments_slug_fk" FOREIGN KEY ("department_slug") REFERENCES "public"."departments"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scholar_biographies" ADD CONSTRAINT "scholar_biographies_scholar_id_scholars_id_fk" FOREIGN KEY ("scholar_id") REFERENCES "public"."scholars"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scholar_departments" ADD CONSTRAINT "scholar_departments_scholar_id_scholars_id_fk" FOREIGN KEY ("scholar_id") REFERENCES "public"."scholars"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scholar_departments" ADD CONSTRAINT "scholar_departments_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scholars" ADD CONSTRAINT "scholars_primary_department_id_departments_id_fk" FOREIGN KEY ("primary_department_id") REFERENCES "public"."departments"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_following_departments" ADD CONSTRAINT "user_following_departments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_following_scholars" ADD CONSTRAINT "user_following_scholars_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quran_ayahs" ADD CONSTRAINT "quran_ayahs_surah_quran_surahs_number_fk" FOREIGN KEY ("surah") REFERENCES "public"."quran_surahs"("number") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "answer_references" ADD CONSTRAINT "answer_references_answer_id_answers_id_fk" FOREIGN KEY ("answer_id") REFERENCES "public"."answers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "answer_references" ADD CONSTRAINT "answer_references_reference_id_content_references_id_fk" FOREIGN KEY ("reference_id") REFERENCES "public"."content_references"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "answers" ADD CONSTRAINT "answers_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "answers" ADD CONSTRAINT "answers_scholar_id_users_id_fk" FOREIGN KEY ("scholar_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_departments" ADD CONSTRAINT "question_departments_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_departments" ADD CONSTRAINT "question_departments_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_asker_id_users_id_fk" FOREIGN KEY ("asker_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_notifications" ADD CONSTRAINT "app_notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_notifications" ADD CONSTRAINT "app_notifications_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookmark_collections" ADD CONSTRAINT "bookmark_collections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_collection_id_bookmark_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."bookmark_collections"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journey_enrollments" ADD CONSTRAINT "journey_enrollments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journey_enrollments" ADD CONSTRAINT "journey_enrollments_journey_id_journeys_id_fk" FOREIGN KEY ("journey_id") REFERENCES "public"."journeys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_daily_minutes" ADD CONSTRAINT "learning_daily_minutes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reading_progress" ADD CONSTRAINT "reading_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "content_reports_status_severity_idx" ON "content_reports" USING btree ("status","severity");--> statement-breakpoint
CREATE INDEX "content_reports_reported_at_idx" ON "content_reports" USING btree ("reported_at");--> statement-breakpoint
CREATE INDEX "platform_activity_at_idx" ON "platform_activity" USING btree ("at");--> statement-breakpoint
CREATE INDEX "review_items_status_idx" ON "review_items" USING btree ("status","submitted_at");--> statement-breakpoint
CREATE INDEX "discussion_departments_department_idx" ON "discussion_departments" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX "discussion_replies_discussion_idx" ON "discussion_replies" USING btree ("discussion_id","created_at");--> statement-breakpoint
CREATE INDEX "discussion_replies_author_idx" ON "discussion_replies" USING btree ("author_id");--> statement-breakpoint
CREATE UNIQUE INDEX "discussions_slug_key" ON "discussions" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "discussions_created_idx" ON "discussions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "discussions_author_idx" ON "discussions" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "discussions_pinned_idx" ON "discussions" USING btree ("pinned");--> statement-breakpoint
CREATE INDEX "discussions_topic_ids_idx" ON "discussions" USING gin ("topic_ids");--> statement-breakpoint
CREATE INDEX "article_departments_department_idx" ON "article_departments" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX "article_references_reference_idx" ON "article_references" USING btree ("reference_id");--> statement-breakpoint
CREATE UNIQUE INDEX "articles_slug_key" ON "articles" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "articles_status_published_idx" ON "articles" USING btree ("status","published_at");--> statement-breakpoint
CREATE INDEX "articles_author_idx" ON "articles" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "articles_topic_ids_idx" ON "articles" USING gin ("topic_ids");--> statement-breakpoint
CREATE INDEX "content_references_kind_ref_idx" ON "content_references" USING btree ("kind","ref");--> statement-breakpoint
CREATE INDEX "fatwa_departments_department_idx" ON "fatwa_departments" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX "fatwa_references_reference_idx" ON "fatwa_references" USING btree ("reference_id");--> statement-breakpoint
CREATE UNIQUE INDEX "fatwas_slug_key" ON "fatwas" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "fatwas_status_published_idx" ON "fatwas" USING btree ("status","published_at");--> statement-breakpoint
CREATE INDEX "fatwas_mufti_idx" ON "fatwas" USING btree ("mufti_id");--> statement-breakpoint
CREATE INDEX "fatwas_pinned_idx" ON "fatwas" USING btree ("pinned");--> statement-breakpoint
CREATE UNIQUE INDEX "duas_slug_key" ON "duas" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "duas_category_idx" ON "duas" USING btree ("category_slug");--> statement-breakpoint
CREATE UNIQUE INDEX "hadith_books_collection_number_key" ON "hadith_books" USING btree ("collection_slug","number");--> statement-breakpoint
CREATE INDEX "hadith_books_collection_idx" ON "hadith_books" USING btree ("collection_slug");--> statement-breakpoint
CREATE UNIQUE INDEX "hadiths_collection_number_key" ON "hadiths" USING btree ("collection_slug","number");--> statement-breakpoint
CREATE INDEX "hadiths_collection_book_idx" ON "hadiths" USING btree ("collection_slug","book_number");--> statement-breakpoint
CREATE INDEX "hadiths_grade_idx" ON "hadiths" USING btree ("grade");--> statement-breakpoint
CREATE INDEX "hadiths_topic_ids_idx" ON "hadiths" USING gin ("topic_ids");--> statement-breakpoint
CREATE INDEX "departments_trending_idx" ON "departments" USING btree ("trending");--> statement-breakpoint
CREATE INDEX "topic_departments_slug_idx" ON "topic_departments" USING btree ("department_slug");--> statement-breakpoint
CREATE UNIQUE INDEX "topics_slug_key" ON "topics" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "topics_trending_idx" ON "topics" USING btree ("trending");--> statement-breakpoint
CREATE INDEX "scholar_applications_status_idx" ON "scholar_applications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "scholar_departments_department_idx" ON "scholar_departments" USING btree ("department_id");--> statement-breakpoint
CREATE UNIQUE INDEX "scholars_slug_key" ON "scholars" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "scholars_district_idx" ON "scholars" USING btree ("district");--> statement-breakpoint
CREATE INDEX "scholars_primary_department_idx" ON "scholars" USING btree ("primary_department_id");--> statement-breakpoint
CREATE INDEX "scholars_available_idx" ON "scholars" USING btree ("available_for_questions");--> statement-breakpoint
CREATE INDEX "user_following_scholars_scholar_idx" ON "user_following_scholars" USING btree ("scholar_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_key" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "users_district_idx" ON "users" USING btree ("district");--> statement-breakpoint
CREATE UNIQUE INDEX "quran_ayahs_ref_key" ON "quran_ayahs" USING btree ("ref");--> statement-breakpoint
CREATE UNIQUE INDEX "quran_surahs_slug_key" ON "quran_surahs" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "quran_surahs_juz_idx" ON "quran_surahs" USING btree ("juz");--> statement-breakpoint
CREATE INDEX "answer_references_reference_idx" ON "answer_references" USING btree ("reference_id");--> statement-breakpoint
CREATE INDEX "answers_question_idx" ON "answers" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "answers_scholar_idx" ON "answers" USING btree ("scholar_id");--> statement-breakpoint
CREATE INDEX "answers_accepted_idx" ON "answers" USING btree ("accepted");--> statement-breakpoint
CREATE INDEX "question_departments_department_idx" ON "question_departments" USING btree ("department_id");--> statement-breakpoint
CREATE UNIQUE INDEX "questions_slug_key" ON "questions" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "questions_status_created_idx" ON "questions" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "questions_asker_idx" ON "questions" USING btree ("asker_id");--> statement-breakpoint
CREATE INDEX "questions_urgency_idx" ON "questions" USING btree ("urgency");--> statement-breakpoint
CREATE INDEX "questions_topic_ids_idx" ON "questions" USING gin ("topic_ids");--> statement-breakpoint
CREATE INDEX "app_notifications_user_created_idx" ON "app_notifications" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "bookmark_collections_user_idx" ON "bookmark_collections" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "bookmarks_user_saved_idx" ON "bookmarks" USING btree ("user_id","saved_at");--> statement-breakpoint
CREATE INDEX "bookmarks_collection_idx" ON "bookmarks" USING btree ("collection_id");--> statement-breakpoint
CREATE INDEX "feed_items_created_idx" ON "feed_items" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "feed_items_kind_idx" ON "feed_items" USING btree ("kind");--> statement-breakpoint
CREATE INDEX "focus_themes_title_idx" ON "focus_themes" USING btree ("title_bn");--> statement-breakpoint
CREATE UNIQUE INDEX "journeys_slug_key" ON "journeys" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "reading_progress_user_idx" ON "reading_progress" USING btree ("user_id","last_read_at");