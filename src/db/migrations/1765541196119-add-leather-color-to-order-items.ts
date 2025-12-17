import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLeatherColorToOrderItems1765541196119 implements MigrationInterface {
    name = 'AddLeatherColorToOrderItems1765541196119'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("order_items");
        const column = table?.findColumnByName("leather_color");
        
        if (!column) {
            await queryRunner.query(`ALTER TABLE "order_items" ADD "leather_color" character varying`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("order_items");
        const column = table?.findColumnByName("leather_color");
        
        if (column) {
            await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN "leather_color"`);
        }
    }
}

