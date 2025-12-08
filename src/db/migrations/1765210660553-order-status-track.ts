import { MigrationInterface, QueryRunner } from "typeorm";

export class OrderStatusTrack1765210660553 implements MigrationInterface {
    name = 'OrderStatusTrack1765210660553'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_item_tracking" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."order_item_tracking_status_enum"`);
        await queryRunner.query(`ALTER TABLE "order_item_tracking" ADD "status" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_item_tracking" DROP COLUMN "status"`);
        await queryRunner.query(`CREATE TYPE "public"."order_item_tracking_status_enum" AS ENUM('pending', 'checked-in', 'in-progress', 'checked-out', 'completed', 'shipped', 'delivered')`);
        await queryRunner.query(`ALTER TABLE "order_item_tracking" ADD "status" "public"."order_item_tracking_status_enum" NOT NULL`);
    }

}
