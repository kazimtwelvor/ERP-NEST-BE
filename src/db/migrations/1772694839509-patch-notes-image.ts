import { MigrationInterface, QueryRunner } from "typeorm";

export class PatchNotesImage1772694839509 implements MigrationInterface {
    name = 'PatchNotesImage1772694839509'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patch_order_notes" ADD "image_url" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patch_order_notes" DROP COLUMN "image_url"`);
    }

}
