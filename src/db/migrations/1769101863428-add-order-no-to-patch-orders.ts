import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOrderNoToPatchOrders1769101863428 implements MigrationInterface {
    name = 'AddOrderNoToPatchOrders1769101863428'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patch_orders" ADD "order_no" character varying`);
        await queryRunner.query(`ALTER TABLE "patch_orders" ADD CONSTRAINT "UQ_d7ecf2d4aa7b33472d700f1b56c" UNIQUE ("order_no")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patch_orders" DROP CONSTRAINT "UQ_d7ecf2d4aa7b33472d700f1b56c"`);
        await queryRunner.query(`ALTER TABLE "patch_orders" DROP COLUMN "order_no"`);
    }

}
