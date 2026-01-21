import { MigrationInterface, QueryRunner } from "typeorm";

export class PatchOrderTracking1769018138097 implements MigrationInterface {
    name = 'PatchOrderTracking1769018138097'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "patch_order_tracking" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "patch_order_id" uuid NOT NULL, "department_id" uuid NOT NULL, "user_id" uuid NOT NULL, "status" character varying NOT NULL, "previous_status" character varying, "notes" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_c6cfa03c848bbd54b25cb561c33" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "patch_order_tracking" ADD CONSTRAINT "FK_6363a00c311853ef281bc917177" FOREIGN KEY ("patch_order_id") REFERENCES "patch_orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "patch_order_tracking" ADD CONSTRAINT "FK_99a509dc011b271d5cb32054603" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "patch_order_tracking" ADD CONSTRAINT "FK_89a8c41c7505b65598a1772efd1" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patch_order_tracking" DROP CONSTRAINT "FK_89a8c41c7505b65598a1772efd1"`);
        await queryRunner.query(`ALTER TABLE "patch_order_tracking" DROP CONSTRAINT "FK_99a509dc011b271d5cb32054603"`);
        await queryRunner.query(`ALTER TABLE "patch_order_tracking" DROP CONSTRAINT "FK_6363a00c311853ef281bc917177"`);
        await queryRunner.query(`DROP TABLE "patch_order_tracking"`);
    }

}
