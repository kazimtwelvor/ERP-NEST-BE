import { MigrationInterface, QueryRunner } from "typeorm";

export class OrderTrackVisibility1764612719844 implements MigrationInterface {
    name = 'OrderTrackVisibility1764612719844'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_items" ADD "visibility_status" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN "visibility_status"`);
    }

}
