import { MigrationInterface, QueryRunner } from "typeorm";

export class InitTasksSchema1765654133456 implements MigrationInterface {
    name = 'InitTasksSchema1765654133456'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "comments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "content" character varying NOT NULL, "authorId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "taskId" uuid, CONSTRAINT "PK_8bf68bc960f2b69e818bdb90dcb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."tasks_priority_enum" AS ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT')`);
        await queryRunner.query(`CREATE TYPE "public"."tasks_status_enum" AS ENUM('TODO', 'IN_PROGRESS', 'REVIEW', 'DONE')`);
        await queryRunner.query(`CREATE TABLE "tasks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "authorId" uuid NOT NULL, "description" character varying, "dueDate" TIMESTAMP, "priority" "public"."tasks_priority_enum" NOT NULL DEFAULT 'LOW', "status" "public"."tasks_status_enum" NOT NULL DEFAULT 'TODO', "assignedUserIds" uuid array NOT NULL DEFAULT '{}', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8d12ff38fcc62aaba2cab748772" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "task_audit_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "taskId" uuid NOT NULL, "action" character varying NOT NULL, "before" jsonb, "after" jsonb, "actorId" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d535688da295a45639801474f16" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_5ee411cfbfadf635dcb7f86248" ON "task_audit_logs" ("taskId", "createdAt") `);
        await queryRunner.query(`ALTER TABLE "comments" ADD CONSTRAINT "FK_9adf2d3106c6dc87d6262ccadfe" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task_audit_logs" ADD CONSTRAINT "FK_d2c6ca0f2ddbf24d34360a8064d" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task_audit_logs" DROP CONSTRAINT "FK_d2c6ca0f2ddbf24d34360a8064d"`);
        await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_9adf2d3106c6dc87d6262ccadfe"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5ee411cfbfadf635dcb7f86248"`);
        await queryRunner.query(`DROP TABLE "task_audit_logs"`);
        await queryRunner.query(`DROP TABLE "tasks"`);
        await queryRunner.query(`DROP TYPE "public"."tasks_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."tasks_priority_enum"`);
        await queryRunner.query(`DROP TABLE "comments"`);
    }

}
