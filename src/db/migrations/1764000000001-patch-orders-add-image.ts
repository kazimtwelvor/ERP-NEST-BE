import { MigrationInterface, QueryRunner } from 'typeorm';

export class PatchOrdersAddImage1764000000001 implements MigrationInterface {
  name = 'PatchOrdersAddImage1764000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "patch_orders" ADD "image" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "patch_orders" DROP COLUMN "image"`);
  }
}
