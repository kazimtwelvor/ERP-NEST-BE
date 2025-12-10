import { MigrationInterface, QueryRunner } from "typeorm";

export class OrderVisibility1764955200996 implements MigrationInterface {
    name = 'OrderVisibility1764955200996'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "role_visibilities" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "role_id" uuid NOT NULL, "visible_role_id" uuid NOT NULL, "display_order" integer NOT NULL DEFAULT '0', "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_fab4ac3b91a508719c906540a7f" UNIQUE ("role_id", "visible_role_id"), CONSTRAINT "PK_ca3af95dcbd54409a6552f9f80f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_fab4ac3b91a508719c906540a7" ON "role_visibilities" ("role_id", "visible_role_id") `);
        await queryRunner.query(`ALTER TABLE "role_visibilities" ADD CONSTRAINT "FK_c53b23dd0a61923b9a4483680dc" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "role_visibilities" ADD CONSTRAINT "FK_44b2b33467b6ede23f70ca59706" FOREIGN KEY ("visible_role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "role_visibilities" DROP CONSTRAINT "FK_44b2b33467b6ede23f70ca59706"`);
        await queryRunner.query(`ALTER TABLE "role_visibilities" DROP CONSTRAINT "FK_c53b23dd0a61923b9a4483680dc"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fab4ac3b91a508719c906540a7"`);
        await queryRunner.query(`DROP TABLE "role_visibilities"`);
    }

}
