import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddResetTokenToUser1732037100000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('users', [
      new TableColumn({
        name: 'resetToken',
        type: 'varchar',
        isNullable: true,
      }),
      new TableColumn({
        name: 'resetTokenExpiry',
        type: 'timestamp',
        isNullable: true,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns('users', ['resetToken', 'resetTokenExpiry']);
  }
}