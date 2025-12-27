import { MigrationInterface, QueryRunner } from "typeorm";

export class Inventory1766599467115 implements MigrationInterface {
    name = 'Inventory1766599467115'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "name" character varying NOT NULL, "sku" character varying, "description" text, "price" numeric(10,2), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_c44ac33a05b144dd0d9ddcf9327" UNIQUE ("sku"), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`);
        
        await queryRunner.query(`CREATE TABLE "inventory_items" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "product_id" uuid NOT NULL, "quantity" integer NOT NULL DEFAULT '0', "reorder_level" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_8e17955a29e8b63bb8cec3d32c5" UNIQUE ("product_id"), CONSTRAINT "PK_cf2f451407242e132547ac19169" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_8e17955a29e8b63bb8cec3d32c" ON "inventory_items" ("product_id") `);
        
        await queryRunner.query(`ALTER TABLE "inventory_items" ADD CONSTRAINT "FK_8e17955a29e8b63bb8cec3d32c5" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "inventory_items" DROP CONSTRAINT "FK_8e17955a29e8b63bb8cec3d32c5"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8e17955a29e8b63bb8cec3d32c"`);
        await queryRunner.query(`DROP TABLE "inventory_items"`);
        await queryRunner.query(`DROP TABLE "products"`);
    }

}
