CREATE TABLE "parent_child" (
	"parent_id" uuid NOT NULL,
	"child_id" uuid NOT NULL,
	"is_adopted" boolean DEFAULT false,
	CONSTRAINT "parent_child_parent_id_child_id_pk" PRIMARY KEY("parent_id","child_id"),
	CONSTRAINT "parent_child_no_self" CHECK ("parent_child"."parent_id" <> "parent_child"."child_id")
);
--> statement-breakpoint
CREATE TABLE "partnerships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"person_a" uuid NOT NULL,
	"person_b" uuid NOT NULL,
	"married_at" date,
	"divorced_at" date,
	CONSTRAINT "partnerships_no_self" CHECK ("partnerships"."person_a" <> "partnerships"."person_b")
);
--> statement-breakpoint
CREATE TABLE "persons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" varchar(150) NOT NULL,
	"nickname" varchar(50),
	"gender" char(1),
	"birth_date" date,
	"death_date" date,
	"birth_place" varchar(100),
	"photo_url" text,
	"bio" text,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tree_members" (
	"tree_id" uuid NOT NULL,
	"person_id" uuid NOT NULL,
	"is_root" boolean DEFAULT false,
	CONSTRAINT "tree_members_tree_id_person_id_pk" PRIMARY KEY("tree_id","person_id")
);
--> statement-breakpoint
CREATE TABLE "trees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"owner_id" uuid NOT NULL,
	"is_public" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(150) NOT NULL,
	"name" varchar(100),
	"avatar_url" text,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "parent_child" ADD CONSTRAINT "parent_child_parent_id_persons_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."persons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parent_child" ADD CONSTRAINT "parent_child_child_id_persons_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."persons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partnerships" ADD CONSTRAINT "partnerships_person_a_persons_id_fk" FOREIGN KEY ("person_a") REFERENCES "public"."persons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partnerships" ADD CONSTRAINT "partnerships_person_b_persons_id_fk" FOREIGN KEY ("person_b") REFERENCES "public"."persons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "persons" ADD CONSTRAINT "persons_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tree_members" ADD CONSTRAINT "tree_members_tree_id_trees_id_fk" FOREIGN KEY ("tree_id") REFERENCES "public"."trees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tree_members" ADD CONSTRAINT "tree_members_person_id_persons_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."persons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trees" ADD CONSTRAINT "trees_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_partnerships_unique_pair" ON "partnerships" (LEAST("person_a"::text, "person_b"::text), GREATEST("person_a"::text, "person_b"::text));