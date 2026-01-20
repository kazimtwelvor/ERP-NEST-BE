import { MigrationInterface, QueryRunner } from 'typeorm';

export class PatchOrdersMakeFieldsNullable1764000000002
  implements MigrationInterface
{
  name = 'PatchOrdersMakeFieldsNullable1764000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "patch_orders" ALTER COLUMN "customer_name" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "patch_orders" ALTER COLUMN "customer_email" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "patch_orders" ALTER COLUMN "form_type" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "patch_orders" ALTER COLUMN "shape" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "patch_orders" ALTER COLUMN "size" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "patch_orders" ALTER COLUMN "quantity" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "patch_orders" ALTER COLUMN "backing_type" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "patch_orders" ALTER COLUMN "embroidery_coverage" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "patch_orders" ALTER COLUMN "border" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "patch_orders" ALTER COLUMN "color" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "patch_orders" SET "customer_name" = '' WHERE "customer_name" IS NULL`,
    );
    await queryRunner.query(
      `UPDATE "patch_orders" SET "customer_email" = '' WHERE "customer_email" IS NULL`,
    );
    await queryRunner.query(
      `UPDATE "patch_orders" SET "form_type" = 'contactForm' WHERE "form_type" IS NULL`,
    );
    await queryRunner.query(
      `UPDATE "patch_orders" SET "shape" = '' WHERE "shape" IS NULL`,
    );
    await queryRunner.query(
      `UPDATE "patch_orders" SET "size" = '' WHERE "size" IS NULL`,
    );
    await queryRunner.query(
      `UPDATE "patch_orders" SET "quantity" = 0 WHERE "quantity" IS NULL`,
    );
    await queryRunner.query(
      `UPDATE "patch_orders" SET "backing_type" = '' WHERE "backing_type" IS NULL`,
    );
    await queryRunner.query(
      `UPDATE "patch_orders" SET "embroidery_coverage" = '' WHERE "embroidery_coverage" IS NULL`,
    );
    await queryRunner.query(
      `UPDATE "patch_orders" SET "border" = '' WHERE "border" IS NULL`,
    );
    await queryRunner.query(
      `UPDATE "patch_orders" SET "color" = '' WHERE "color" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "patch_orders" ALTER COLUMN "color" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "patch_orders" ALTER COLUMN "border" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "patch_orders" ALTER COLUMN "embroidery_coverage" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "patch_orders" ALTER COLUMN "backing_type" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "patch_orders" ALTER COLUMN "quantity" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "patch_orders" ALTER COLUMN "size" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "patch_orders" ALTER COLUMN "shape" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "patch_orders" ALTER COLUMN "form_type" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "patch_orders" ALTER COLUMN "customer_email" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "patch_orders" ALTER COLUMN "customer_name" SET NOT NULL`,
    );
  }
}
