import { MigrationInterface, QueryRunner } from 'typeorm';

export class PatchOrdersAddOrderIdIfMissing1764000000004 implements MigrationInterface {
  name = 'PatchOrdersAddOrderIdIfMissing1764000000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'patch_orders'
            AND column_name = 'order_id'
        ) THEN
          ALTER TABLE "patch_orders" ADD "order_id" character varying;
        END IF;
      END;
      $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Only drop if present to avoid errors on down
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'patch_orders'
            AND column_name = 'order_id'
        ) THEN
          ALTER TABLE "patch_orders" DROP COLUMN "order_id";
        END IF;
      END;
      $$;
    `);
  }
}
