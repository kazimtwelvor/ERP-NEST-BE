import { MigrationInterface, QueryRunner } from "typeorm";

export class NotificationInfo1770895303062 implements MigrationInterface {
    name = 'NotificationInfo1770895303062'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "notification_reads" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "read_at" TIMESTAMP NOT NULL, "notification_id" uuid NOT NULL, "user_id" uuid NOT NULL, CONSTRAINT "PK_c49ec541db45925cfb4e5c8dfbd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_5c38c21e1fb176c9f55575cd67" ON "notification_reads" ("notification_id", "user_id") `);
        await queryRunner.query(`ALTER TABLE "notifications" DROP COLUMN "is_read"`);
        await queryRunner.query(`ALTER TABLE "notification_reads" ADD CONSTRAINT "FK_30122217fe6ea5e114793efd4d5" FOREIGN KEY ("notification_id") REFERENCES "notifications"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notification_reads" ADD CONSTRAINT "FK_8a89aac7f3083b0fceadc99c404" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification_reads" DROP CONSTRAINT "FK_8a89aac7f3083b0fceadc99c404"`);
        await queryRunner.query(`ALTER TABLE "notification_reads" DROP CONSTRAINT "FK_30122217fe6ea5e114793efd4d5"`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD "is_read" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5c38c21e1fb176c9f55575cd67"`);
        await queryRunner.query(`DROP TABLE "notification_reads"`);
    }

}
