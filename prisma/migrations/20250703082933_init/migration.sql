-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CreateEnum
CREATE TYPE "plan" AS ENUM ('free', 'paid', 'custom');

-- CreateEnum
CREATE TYPE "role" AS ENUM ('public', 'user', 'custom', 'admin');

-- CreateEnum
CREATE TYPE "status" AS ENUM ('active', 'inactive', 'banned');

-- CreateTable
CREATE TABLE "associates" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "name" VARCHAR,
    "prefix" VARCHAR,
    "image" VARCHAR,
    "sequence" INTEGER DEFAULT 0,
    "type" VARCHAR,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "associates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "background_template" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "name" VARCHAR,
    "image_url" VARCHAR NOT NULL,
    "description" VARCHAR,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "background_template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "communities" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "name" VARCHAR,
    "image_url" VARCHAR,
    "website" VARCHAR,
    "description" VARCHAR,
    "sequence" INTEGER DEFAULT 0,
    "status" "status" DEFAULT 'active',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "communities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "profile_id" UUID NOT NULL,
    "connector_id" UUID NOT NULL,
    "favourite" BOOLEAN DEFAULT false,
    "pin" INTEGER,
    "remark" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "profile_id" UUID NOT NULL,
    "type" VARCHAR(50) DEFAULT 'feedback',
    "title" VARCHAR(255),
    "description" TEXT,
    "status" VARCHAR(50) DEFAULT 'active',
    "remark" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flyway_schema_history" (
    "installed_rank" INTEGER NOT NULL,
    "version" VARCHAR(50),
    "description" VARCHAR(200) NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "script" VARCHAR(1000) NOT NULL,
    "checksum" INTEGER,
    "installed_by" VARCHAR(100) NOT NULL,
    "installed_on" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "execution_time" INTEGER NOT NULL,
    "success" BOOLEAN NOT NULL,

    CONSTRAINT "flyway_schema_history_pk" PRIMARY KEY ("installed_rank")
);

-- CreateTable
CREATE TABLE "links" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "name" VARCHAR,
    "prefix" VARCHAR,
    "description" VARCHAR,
    "custom_logo" VARCHAR,
    "native_logo" VARCHAR,
    "sequence" INTEGER DEFAULT 0,
    "status" "status" DEFAULT 'active',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_associations" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "profile_id" UUID,
    "associated_id" UUID,
    "label" VARCHAR,
    "sequence" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profile_associations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_colors" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "profile_id" UUID,
    "primary_color" VARCHAR,
    "secondary_color" VARCHAR,
    "text_color" VARCHAR,
    "background_color" VARCHAR,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profile_colors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_communities" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "profile_id" UUID,
    "community_id" UUID,
    "sequence" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profile_communities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_config" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "profile_id" UUID,
    "name" VARCHAR,
    "config_code" VARCHAR,
    "value" VARCHAR,
    "description" VARCHAR,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profile_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_links" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "profile_id" UUID,
    "link_id" UUID,
    "label" VARCHAR,
    "value" VARCHAR,
    "sequence" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "type" VARCHAR(50) DEFAULT 'default',
    "link_url" VARCHAR(250),

    CONSTRAINT "profile_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_medias" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "profile_id" UUID,
    "image" VARCHAR,
    "type" VARCHAR,
    "sequence" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profile_medias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_statistics" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "profile_id" UUID,
    "device_id" VARCHAR,
    "platform" VARCHAR,
    "entity_id" UUID,
    "entity_name" VARCHAR,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profile_statistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_visits" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "profile_id" UUID NOT NULL,
    "device_id" VARCHAR(255),
    "platform" VARCHAR(100),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profile_visits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID,
    "username" VARCHAR,
    "name" VARCHAR,
    "about" VARCHAR,
    "title" VARCHAR,
    "dob" DATE,
    "position" VARCHAR,
    "cover_image" VARCHAR,
    "profile_image" VARCHAR,
    "background_image" VARCHAR,
    "theme" INTEGER DEFAULT 1,
    "tier" "plan" DEFAULT 'free',
    "status" "status" DEFAULT 'active',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "use_native_icon" BOOLEAN DEFAULT true,
    "header_style" VARCHAR(50) DEFAULT 'default',
    "ai_credit" INTEGER DEFAULT 20,
    "deactivate" BOOLEAN DEFAULT false,
    "link_config" JSON,
    "qrcode_config" JSON,
    "qrcode_url" VARCHAR,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "statistics" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "profile_id" UUID,
    "associate_id" UUID,
    "counting" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "statistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "temp_users" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID,
    "verify_type" VARCHAR,
    "verify_code" VARCHAR,
    "verified_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "temp_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "profile_id" UUID NOT NULL,
    "device_id" VARCHAR(50),
    "platform" VARCHAR(50),
    "status" VARCHAR(20),
    "type" VARCHAR(20),
    "remark" VARCHAR,
    "amount" INTEGER,
    "total_amount" INTEGER,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transaction_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "username" VARCHAR,
    "password" VARCHAR,
    "email" VARCHAR,
    "phone_number" VARCHAR,
    "social_id" VARCHAR,
    "social_token" VARCHAR,
    "login_type" VARCHAR,
    "last_login" TIMESTAMP(6),
    "role" "role" DEFAULT 'user',
    "status" "status" DEFAULT 'active',
    "verified_at" TIMESTAMP(6),
    "new_password" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "count_resend_otp" INTEGER DEFAULT 0,
    "created_by" VARCHAR(50) DEFAULT 'auto',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "unique_profile_id_connector_id" ON "contacts"("profile_id", "connector_id");

-- CreateIndex
CREATE INDEX "flyway_schema_history_s_idx" ON "flyway_schema_history"("success");

-- CreateIndex
CREATE INDEX "idx_profile_visits_profile_id" ON "profile_visits"("profile_id");

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_connector_id_fkey" FOREIGN KEY ("connector_id") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "profile_associations" ADD CONSTRAINT "profile_associations_associated_id_fkey" FOREIGN KEY ("associated_id") REFERENCES "associates"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "profile_associations" ADD CONSTRAINT "profile_associations_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "profile_colors" ADD CONSTRAINT "profile_colors_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "profile_communities" ADD CONSTRAINT "profile_communities_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "communities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "profile_communities" ADD CONSTRAINT "profile_communities_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "profile_config" ADD CONSTRAINT "profile_config_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "profile_links" ADD CONSTRAINT "profile_links_link_id_fkey" FOREIGN KEY ("link_id") REFERENCES "links"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "profile_links" ADD CONSTRAINT "profile_links_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "profile_medias" ADD CONSTRAINT "profile_medias_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "profile_statistics" ADD CONSTRAINT "profile_statistics_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "profile_visits" ADD CONSTRAINT "profile_visits_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "statistics" ADD CONSTRAINT "statistics_associate_id_fkey" FOREIGN KEY ("associate_id") REFERENCES "associates"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "statistics" ADD CONSTRAINT "statistics_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "temp_users" ADD CONSTRAINT "temp_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "transaction_logs" ADD CONSTRAINT "transaction_logs_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
