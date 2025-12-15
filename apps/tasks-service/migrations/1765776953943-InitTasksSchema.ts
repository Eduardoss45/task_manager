import { MigrationInterface, QueryRunner } from "typeorm";

export class InitTasksSchema1765776953943 implements MigrationInterface {
    name = 'InitTasksSchema1765776953943'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task_audit_logs" ADD "actorName" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task_audit_logs" DROP COLUMN "actorName"`);
    }

}
