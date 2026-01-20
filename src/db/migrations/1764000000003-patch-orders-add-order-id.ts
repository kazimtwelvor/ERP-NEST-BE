import { MigrationInterface, QueryRunner } from 'typeorm';

export class PatchOrdersAddOrderId1764000000003 implements MigrationInterface {
  name = 'PatchOrdersAddOrderId1764000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "patch_orders" ADD "order_id" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "patch_orders" DROP COLUMN "order_id"`,
    );
  }
}
