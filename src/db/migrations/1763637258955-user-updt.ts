import { MigrationInterface, QueryRunner } from "typeorm";

export class UserUpdt1763637258955 implements MigrationInterface {
    name = 'UserUpdt1763637258955'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "country" TO "verification_code"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "verification_code" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "verification_code" SET DEFAULT ''`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "verification_code" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "verification_code" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "verification_code" TO "country"`);
    }

}
