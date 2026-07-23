CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"expires_at" timestamp with time zone,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"user_id" text PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"display_name" text NOT NULL,
	"bio" text,
	"avatar_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vektor_id" uuid NOT NULL,
	"reporter_user_id" text,
	"reason" text NOT NULL,
	"details" text,
	"status" text DEFAULT 'open' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "vektor_memories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vektor_id" uuid NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"importance" real DEFAULT 0.5 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vektor_parents" (
	"child_id" uuid NOT NULL,
	"parent_id" uuid NOT NULL,
	"relationship_type" text NOT NULL,
	"weight" real NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "vektor_parents_child_id_parent_id_pk" PRIMARY KEY("child_id","parent_id")
);
--> statement-breakpoint
CREATE TABLE "vektor_reactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vektor_id" uuid NOT NULL,
	"user_id" text,
	"anonymous_session_id" text,
	"type" text DEFAULT 'pulse' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vektor_state" (
	"vektor_id" uuid PRIMARY KEY NOT NULL,
	"current_biome" text NOT NULL,
	"energy" real NOT NULL,
	"stability" real NOT NULL,
	"evolution_path" text,
	"evolution_stage" integer DEFAULT 0 NOT NULL,
	"active_mutation_id" uuid,
	"status" text DEFAULT 'active' NOT NULL,
	"last_simulation_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vektors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"owner_id" text,
	"anonymous_session_id" text,
	"name" text NOT NULL,
	"description" text,
	"archetype" text NOT NULL,
	"dna_version" integer DEFAULT 1 NOT NULL,
	"dna" jsonb NOT NULL,
	"preview_image_url" text,
	"preview_video_url" text,
	"visibility" text DEFAULT 'public' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"generation" integer DEFAULT 1 NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"reaction_count" integer DEFAULT 0 NOT NULL,
	"remix_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"published_at" timestamp with time zone,
	CONSTRAINT "vektors_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_vektor_id_vektors_id_fk" FOREIGN KEY ("vektor_id") REFERENCES "public"."vektors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_user_id_users_id_fk" FOREIGN KEY ("reporter_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vektor_memories" ADD CONSTRAINT "vektor_memories_vektor_id_vektors_id_fk" FOREIGN KEY ("vektor_id") REFERENCES "public"."vektors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vektor_parents" ADD CONSTRAINT "vektor_parents_child_id_vektors_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."vektors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vektor_parents" ADD CONSTRAINT "vektor_parents_parent_id_vektors_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."vektors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vektor_reactions" ADD CONSTRAINT "vektor_reactions_vektor_id_vektors_id_fk" FOREIGN KEY ("vektor_id") REFERENCES "public"."vektors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vektor_reactions" ADD CONSTRAINT "vektor_reactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vektor_state" ADD CONSTRAINT "vektor_state_vektor_id_vektors_id_fk" FOREIGN KEY ("vektor_id") REFERENCES "public"."vektors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vektors" ADD CONSTRAINT "vektors_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "accounts_user_idx" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "profiles_username_ci" ON "profiles" USING btree ("username");--> statement-breakpoint
CREATE INDEX "reports_status_idx" ON "reports" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "vektor_memories_vektor_idx" ON "vektor_memories" USING btree ("vektor_id","created_at");--> statement-breakpoint
CREATE INDEX "parents_parent_idx" ON "vektor_parents" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "reactions_vektor_idx" ON "vektor_reactions" USING btree ("vektor_id");--> statement-breakpoint
CREATE UNIQUE INDEX "reactions_user_unique" ON "vektor_reactions" USING btree ("vektor_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "reactions_anon_unique" ON "vektor_reactions" USING btree ("vektor_id","anonymous_session_id");--> statement-breakpoint
CREATE INDEX "vektor_state_biome_idx" ON "vektor_state" USING btree ("current_biome","status");--> statement-breakpoint
CREATE INDEX "vektors_explore_idx" ON "vektors" USING btree ("status","published_at");--> statement-breakpoint
CREATE INDEX "vektors_owner_idx" ON "vektors" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "vektors_anonymous_idx" ON "vektors" USING btree ("anonymous_session_id");