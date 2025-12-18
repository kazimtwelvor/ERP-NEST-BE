import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIssuesOrderItems1766065770644 implements MigrationInterface {
    name = 'AddIssuesOrderItems1766065770644'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_items" ADD "issues" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN "issues"`);
    }

}
