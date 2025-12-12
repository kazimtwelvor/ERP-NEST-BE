import { MigrationInterface, QueryRunner } from "typeorm";

export class ConvertCurrentStatusToVarchar1765541196118 implements MigrationInterface {
    name = 'ConvertCurrentStatusToVarchar1765541196118'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN "current_status"`);
        await queryRunner.query(`DROP TYPE "public"."order_items_current_status_enum"`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD "current_status" character varying NOT NULL DEFAULT 'pending'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN "current_status"`);
        await queryRunner.query(`CREATE TYPE "public"."order_items_current_status_enum" AS ENUM('pending', 'checked-in', 'in-progress', 'checked-out', 'completed', 'shipped', 'delivered')`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD "current_status" "public"."order_items_current_status_enum" NOT NULL DEFAULT 'pending'`);
    }

}
