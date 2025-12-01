import { MigrationInterface, QueryRunner } from "typeorm";

export class OrderTrackUpdt1764611635673 implements MigrationInterface {
    name = 'OrderTrackUpdt1764611635673'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_items" ADD "is_leather" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD "is_pattern" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN "is_pattern"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN "is_leather"`);
    }

}
