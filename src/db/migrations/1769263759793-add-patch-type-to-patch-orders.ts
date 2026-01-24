import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPatchTypeToPatchOrders1769263759793 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patch_orders" ADD "patch_type" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patch_orders" DROP COLUMN "patch_type"`);
    }

}
