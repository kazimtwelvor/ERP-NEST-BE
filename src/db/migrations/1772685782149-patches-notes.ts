import { MigrationInterface, QueryRunner } from "typeorm";

export class PatchesNotes1772685782149 implements MigrationInterface {
    name = 'PatchesNotes1772685782149'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "patch_order_notes" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "patch_order_id" uuid NOT NULL, "user_id" uuid NOT NULL, "note" text NOT NULL, "order_status" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9302a2034fee557443cf6196ec0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "patch_order_notes" ADD CONSTRAINT "FK_4dfddeb56265cd0734db43df330" FOREIGN KEY ("patch_order_id") REFERENCES "patch_orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "patch_order_notes" ADD CONSTRAINT "FK_da80e06ae1ca57cb06b43a56b59" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patch_order_notes" DROP CONSTRAINT "FK_da80e06ae1ca57cb06b43a56b59"`);
        await queryRunner.query(`ALTER TABLE "patch_order_notes" DROP CONSTRAINT "FK_4dfddeb56265cd0734db43df330"`);
        await queryRunner.query(`DROP TABLE "patch_order_notes"`);
    }

}
