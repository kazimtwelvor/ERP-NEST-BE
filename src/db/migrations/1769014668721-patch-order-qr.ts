import { MigrationInterface, QueryRunner } from "typeorm";

export class PatchOrderQr1769014668721 implements MigrationInterface {
    name = 'PatchOrderQr1769014668721'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patch_orders" ADD "qr_code" character varying`);
        await queryRunner.query(`ALTER TABLE "patch_orders" ADD CONSTRAINT "UQ_f7c1d8d4fdaeeb25462d35a3feb" UNIQUE ("qr_code")`);
        await queryRunner.query(`ALTER TABLE "patch_orders" ADD "qr_code_url" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patch_orders" DROP COLUMN "qr_code_url"`);
        await queryRunner.query(`ALTER TABLE "patch_orders" DROP CONSTRAINT "UQ_f7c1d8d4fdaeeb25462d35a3feb"`);
        await queryRunner.query(`ALTER TABLE "patch_orders" DROP COLUMN "qr_code"`);
    }

}
