import { MigrationInterface, QueryRunner } from "typeorm";

export class DepartmentStatus1764772771854 implements MigrationInterface {
    name = 'DepartmentStatus1764772771854'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "department_statuses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "department_id" uuid NOT NULL, "status" character varying NOT NULL, "display_order" integer NOT NULL DEFAULT '0', "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_39d54ef1a4d2acdc98796fd42c7" UNIQUE ("department_id", "status"), CONSTRAINT "PK_ab0ba0ca92624822317cf034a81" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_39d54ef1a4d2acdc98796fd42c" ON "department_statuses" ("department_id", "status") `);
        await queryRunner.query(`ALTER TABLE "department_statuses" ADD CONSTRAINT "FK_7ac261f7033ad6638b435eec6dc" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "department_statuses" DROP CONSTRAINT "FK_7ac261f7033ad6638b435eec6dc"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_39d54ef1a4d2acdc98796fd42c"`);
        await queryRunner.query(`DROP TABLE "department_statuses"`);
    }

}
