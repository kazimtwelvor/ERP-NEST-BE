import { MigrationInterface, QueryRunner } from 'typeorm';

export class PatchOrders1764000000000 implements MigrationInterface {
  name = 'PatchOrders1764000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."patch_orders_form_type_enum" AS ENUM('contactForm', 'quoteForm', 'detailedForm', 'callbackForm', 'newsletterForm', 'forCategoryFor')`,
    );
    await queryRunner.query(
      `CREATE TABLE "patch_orders" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "customer_name" character varying NOT NULL, "customer_email" character varying NOT NULL, "customer_phone" character varying, "form_type" "public"."patch_orders_form_type_enum" NOT NULL, "shape" character varying NOT NULL, "size" character varying NOT NULL, "quantity" integer NOT NULL, "backing_type" character varying NOT NULL, "embroidery_coverage" character varying NOT NULL, "border" character varying NOT NULL, "color" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_patch_orders_id" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "patch_orders"`);
    await queryRunner.query(`DROP TYPE "public"."patch_orders_form_type_enum"`);
  }
}
