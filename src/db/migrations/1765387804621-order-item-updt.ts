import { MigrationInterface, QueryRunner } from "typeorm";

export class OrderItemUpdt1765387804621 implements MigrationInterface {
    name = 'OrderItemUpdt1765387804621'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add columns with default values first to handle existing rows
        await queryRunner.query(`ALTER TABLE "order_items" ADD "color" character varying NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD "size" character varying NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD "gender" character varying NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD "product_image" character varying NOT NULL DEFAULT ''`);
        
        // Remove default constraints after setting values (optional, keeps schema clean)
        await queryRunner.query(`ALTER TABLE "order_items" ALTER COLUMN "color" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "order_items" ALTER COLUMN "size" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "order_items" ALTER COLUMN "gender" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "order_items" ALTER COLUMN "product_image" DROP DEFAULT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN "product_image"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN "gender"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN "size"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN "color"`);
    }

}
