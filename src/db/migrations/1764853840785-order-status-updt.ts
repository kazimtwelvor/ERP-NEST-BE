import { MigrationInterface, QueryRunner } from "typeorm";

export class OrderStatusUpdt1764853840785 implements MigrationInterface {
    name = 'OrderStatusUpdt1764853840785'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_items" RENAME COLUMN "current_department_status" TO "order_status"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_items" RENAME COLUMN "order_status" TO "current_department_status"`);
    }

}
