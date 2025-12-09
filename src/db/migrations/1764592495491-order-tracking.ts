import { MigrationInterface, QueryRunner } from "typeorm";

export class OrderTracking1764592495491 implements MigrationInterface {
    name = 'OrderTracking1764592495491'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."order_items_current_status_enum" AS ENUM('pending', 'checked-in', 'in-progress', 'checked-out', 'completed')`);
        await queryRunner.query(`CREATE TABLE "order_items" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "external_order_id" character varying NOT NULL, "external_item_id" character varying NOT NULL, "store_name" character varying NOT NULL, "product_name" character varying, "sku" character varying, "quantity" integer NOT NULL, "qr_code" character varying, "current_department_id" uuid, "current_status" "public"."order_items_current_status_enum" NOT NULL DEFAULT 'pending', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_bf33a1fa48a71428d93f433a283" UNIQUE ("qr_code"), CONSTRAINT "PK_005269d8574e6fac0493715c308" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_9a98e6715d9ea3257200e6da0c" ON "order_items" ("external_order_id", "external_item_id") `);
        await queryRunner.query(`CREATE TYPE "public"."order_item_tracking_action_type_enum" AS ENUM('check-in', 'check-out', 'status-update')`);
        await queryRunner.query(`CREATE TYPE "public"."order_item_tracking_status_enum" AS ENUM('pending', 'checked-in', 'in-progress', 'checked-out', 'completed')`);
        await queryRunner.query(`CREATE TABLE "order_item_tracking" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "order_item_id" uuid NOT NULL, "department_id" uuid NOT NULL, "user_id" uuid NOT NULL, "action_type" "public"."order_item_tracking_action_type_enum" NOT NULL, "status" "public"."order_item_tracking_status_enum" NOT NULL, "previous_status" character varying, "notes" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_06f323a5eb8f45a6816efc8ce21" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_e13c157b66485f313eeb943ff7" ON "order_item_tracking" ("order_item_id", "created_at") `);
        await queryRunner.query(`ALTER TABLE "order_item_tracking" ADD CONSTRAINT "FK_8c549ca7d0146d06c2a4643f444" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_item_tracking" ADD CONSTRAINT "FK_e9dfc0f33741e76430080efa581" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_item_tracking" ADD CONSTRAINT "FK_157df2027a42b0738711c6ed4d0" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_item_tracking" DROP CONSTRAINT "FK_157df2027a42b0738711c6ed4d0"`);
        await queryRunner.query(`ALTER TABLE "order_item_tracking" DROP CONSTRAINT "FK_e9dfc0f33741e76430080efa581"`);
        await queryRunner.query(`ALTER TABLE "order_item_tracking" DROP CONSTRAINT "FK_8c549ca7d0146d06c2a4643f444"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e13c157b66485f313eeb943ff7"`);
        await queryRunner.query(`DROP TABLE "order_item_tracking"`);
        await queryRunner.query(`DROP TYPE "public"."order_item_tracking_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."order_item_tracking_action_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9a98e6715d9ea3257200e6da0c"`);
        await queryRunner.query(`DROP TABLE "order_items"`);
        await queryRunner.query(`DROP TYPE "public"."order_items_current_status_enum"`);
    }

}
