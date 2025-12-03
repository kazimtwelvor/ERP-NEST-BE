import { MigrationInterface, QueryRunner } from "typeorm";

export class OrderRoleStatusUpdt1764791136117 implements MigrationInterface {
    name = 'OrderRoleStatusUpdt1764791136117'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "order_statuses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "role_id" uuid NOT NULL, "status" character varying NOT NULL, "display_order" integer NOT NULL DEFAULT '0', "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_08626a602c9f35f03d0544fd93c" UNIQUE ("role_id", "status"), CONSTRAINT "PK_76c6dc5bccb3ef1a4a8510cab3a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_08626a602c9f35f03d0544fd93" ON "order_statuses" ("role_id", "status") `);
        await queryRunner.query(`ALTER TABLE "order_statuses" ADD CONSTRAINT "FK_1eb334795242fe9e199f79f3b7b" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_statuses" DROP CONSTRAINT "FK_1eb334795242fe9e199f79f3b7b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_08626a602c9f35f03d0544fd93"`);
        await queryRunner.query(`DROP TABLE "order_statuses"`);
    }

}
