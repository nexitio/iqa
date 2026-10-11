CREATE TYPE "public"."oauth_client_auth" AS ENUM('body', 'basic');--> statement-breakpoint
CREATE TYPE "public"."oauth_state_purpose" AS ENUM('login', 'link');--> statement-breakpoint
CREATE TYPE "public"."oauth_token_method" AS ENUM('get', 'post');--> statement-breakpoint
CREATE TYPE "public"."oauth_userinfo_auth" AS ENUM('bearer', 'query');--> statement-breakpoint
CREATE TABLE "social_identities" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"subject" text NOT NULL,
	"email" text,
	"display_name" text,
	"picture" text,
	"created_at" timestamp with time zone NOT NULL,
	"last_login_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "social_login_states" (
	"state_hash" text PRIMARY KEY NOT NULL,
	"provider_id" text NOT NULL,
	"purpose" "oauth_state_purpose" NOT NULL,
	"link_user_id" text,
	"return_to" text,
	"created_at" timestamp with time zone NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"consumed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "social_providers" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" jsonb NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"client_id" text NOT NULL,
	"client_secret_encrypted" text NOT NULL,
	"redirect_uri" text NOT NULL,
	"authorization_url" text NOT NULL,
	"token_url" text NOT NULL,
	"userinfo_url" text NOT NULL,
	"extra_authorize_params" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"userinfo_params" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"scopes" text[] DEFAULT '{}'::text[] NOT NULL,
	"token_method" "oauth_token_method" DEFAULT 'post' NOT NULL,
	"client_auth" "oauth_client_auth" DEFAULT 'body' NOT NULL,
	"userinfo_auth" "oauth_userinfo_auth" DEFAULT 'bearer' NOT NULL,
	"send_app_secret_proof" boolean DEFAULT false NOT NULL,
	"claim_subject" text DEFAULT 'sub' NOT NULL,
	"claim_email" text,
	"claim_name" text,
	"claim_picture" text,
	"claim_email_verified" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"updated_by" text
);
--> statement-breakpoint
ALTER TABLE "social_identities" ADD CONSTRAINT "social_identities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_identities" ADD CONSTRAINT "social_identities_provider_id_social_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."social_providers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_login_states" ADD CONSTRAINT "social_login_states_provider_id_social_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."social_providers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_login_states" ADD CONSTRAINT "social_login_states_link_user_id_users_id_fk" FOREIGN KEY ("link_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_providers" ADD CONSTRAINT "social_providers_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "social_identities_provider_subject_key" ON "social_identities" USING btree ("provider_id","subject");--> statement-breakpoint
CREATE INDEX "social_identities_user_idx" ON "social_identities" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "social_login_states_provider_idx" ON "social_login_states" USING btree ("provider_id");--> statement-breakpoint
CREATE INDEX "social_login_states_expires_idx" ON "social_login_states" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "social_providers_slug_key" ON "social_providers" USING btree ("slug");