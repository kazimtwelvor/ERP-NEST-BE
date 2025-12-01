import { MigrationInterface, QueryRunner } from "typeorm";

export class OrderTrackingStatusUpdt1764601165037 implements MigrationInterface {
    name = 'OrderTrackingStatusUpdt1764601165037'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_items" ADD "last_department_id" uuid`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD "handed_over_department_id" uuid`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD "current_department_status" character varying`);
        await queryRunner.query(`CREATE TYPE "public"."order_items_preparation_type_enum" AS ENUM('in-house', 'outsourced')`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD "preparation_type" "public"."order_items_preparation_type_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."order_item_tracking_preparation_type_enum" AS ENUM('in-house', 'outsourced')`);
        await queryRunner.query(`ALTER TABLE "order_item_tracking" ADD "preparation_type" "public"."order_item_tracking_preparation_type_enum"`);
        await queryRunner.query(`ALTER TABLE "order_item_tracking" ADD "department_status" character varying`);
        await queryRunner.query(`ALTER TYPE "public"."order_items_current_status_enum" RENAME TO "order_items_current_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."order_items_current_status_enum" AS ENUM('pending', 'checked-in', 'in-progress', 'checked-out', 'completed', 'shipped', 'delivered')`);
        await queryRunner.query(`ALTER TABLE "order_items" ALTER COLUMN "current_status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "order_items" ALTER COLUMN "current_status" TYPE "public"."order_items_current_status_enum" USING "current_status"::"text"::"public"."order_items_current_status_enum"`);
        await queryRunner.query(`ALTER TABLE "order_items" ALTER COLUMN "current_status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."order_items_current_status_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."order_item_tracking_status_enum" RENAME TO "order_item_tracking_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."order_item_tracking_status_enum" AS ENUM('pending', 'checked-in', 'in-progress', 'checked-out', 'completed', 'shipped', 'delivered')`);
        await queryRunner.query(`ALTER TABLE "order_item_tracking" ALTER COLUMN "status" TYPE "public"."order_item_tracking_status_enum" USING "status"::"text"::"public"."order_item_tracking_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."order_item_tracking_status_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."order_item_tracking_status_enum_old" AS ENUM('pending', 'checked-in', 'in-progress', 'checked-out', 'completed')`);
        await queryRunner.query(`ALTER TABLE "order_item_tracking" ALTER COLUMN "status" TYPE "public"."order_item_tracking_status_enum_old" USING "status"::"text"::"public"."order_item_tracking_status_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."order_item_tracking_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."order_item_tracking_status_enum_old" RENAME TO "order_item_tracking_status_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."order_items_current_status_enum_old" AS ENUM('pending', 'checked-in', 'in-progress', 'checked-out', 'completed')`);
        await queryRunner.query(`ALTER TABLE "order_items" ALTER COLUMN "current_status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "order_items" ALTER COLUMN "current_status" TYPE "public"."order_items_current_status_enum_old" USING "current_status"::"text"::"public"."order_items_current_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "order_items" ALTER COLUMN "current_status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."order_items_current_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."order_items_current_status_enum_old" RENAME TO "order_items_current_status_enum"`);
        await queryRunner.query(`ALTER TABLE "order_item_tracking" DROP COLUMN "department_status"`);
        await queryRunner.query(`ALTER TABLE "order_item_tracking" DROP COLUMN "preparation_type"`);
        await queryRunner.query(`DROP TYPE "public"."order_item_tracking_preparation_type_enum"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN "preparation_type"`);
        await queryRunner.query(`DROP TYPE "public"."order_items_preparation_type_enum"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN "current_department_status"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN "handed_over_department_id"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN "last_department_id"`);
    }

}
