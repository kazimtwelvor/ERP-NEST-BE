import { MigrationInterface, QueryRunner } from "typeorm";

export class PatchOrderStatus1769004858911 implements MigrationInterface {
    name = 'PatchOrderStatus1769004858911'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patch_orders" ADD "status" character varying NOT NULL DEFAULT 'pending'`);
        await queryRunner.query(`ALTER TABLE "patch_orders" ADD "order_status" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patch_orders" DROP COLUMN "order_status"`);
        await queryRunner.query(`ALTER TABLE "patch_orders" DROP COLUMN "status"`);
    }

}
