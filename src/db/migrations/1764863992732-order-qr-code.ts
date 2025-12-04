import { MigrationInterface, QueryRunner } from "typeorm";

export class OrderQrCode1764863992732 implements MigrationInterface {
    name = 'OrderQrCode1764863992732'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_items" ADD "qr_code_url" text`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD "qr_code_image" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN "qr_code_image"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN "qr_code_url"`);
    }

}
