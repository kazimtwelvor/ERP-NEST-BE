import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDocumentFieldsToPatchOrders1769500000000 implements MigrationInterface {
  name = 'AddDocumentFieldsToPatchOrders1769500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "patch_orders" 
      ADD COLUMN "dig_document" text,
      ADD COLUMN "sim_document" text
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "patch_orders" 
      DROP COLUMN "dig_document",
      DROP COLUMN "sim_document"
    `);
  }
}