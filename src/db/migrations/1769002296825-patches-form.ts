import { MigrationInterface, QueryRunner } from "typeorm";

export class PatchesForm1769002296825 implements MigrationInterface {
    name = 'PatchesForm1769002296825'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."patch_orders_form_type_enum" AS ENUM('contactForm', 'quoteForm', 'detailedForm', 'callbackForm', 'newsletterForm', 'forCategoryFor')`);
        await queryRunner.query(`CREATE TABLE "patch_orders" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "customer_name" character varying, "customer_email" character varying, "customer_phone" character varying, "order_id" character varying, "form_type" "public"."patch_orders_form_type_enum", "shape" character varying, "size" character varying, "quantity" integer, "backing_type" character varying, "embroidery_coverage" character varying, "border" character varying, "color" character varying, "image" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7b8dcb1abc980d44f03b854a0ce" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "patch_orders"`);
        await queryRunner.query(`DROP TYPE "public"."patch_orders_form_type_enum"`);
    }

}
