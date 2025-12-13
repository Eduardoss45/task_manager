import { MigrationInterface, QueryRunner } from "typeorm";

export class InitTasksSchema1765589242380 implements MigrationInterface {
    name = 'InitTasksSchema1765589242380'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "comments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "content" character varying NOT NULL, "authorId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "taskId" uuid, CONSTRAINT "PK_8bf68bc960f2b69e818bdb90dcb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."tasks_priority_enum" AS ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT')`);
        await queryRunner.query(`CREATE TYPE "public"."tasks_status_enum" AS ENUM('TODO', 'IN_PROGRESS', 'REVIEW', 'DONE')`);
        await queryRunner.query(`CREATE TABLE "tasks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "authorId" uuid NOT NULL, "description" character varying, "dueDate" TIMESTAMP NOT NULL, "priority" "public"."tasks_priority_enum" NOT NULL DEFAULT 'LOW', "status" "public"."tasks_status_enum" NOT NULL DEFAULT 'TODO', "assignedUserIds" uuid array NOT NULL DEFAULT '{}', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8d12ff38fcc62aaba2cab748772" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "task_audit_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "taskId" uuid NOT NULL, "action" character varying NOT NULL, "before" jsonb, "after" jsonb, "authorId" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d535688da295a45639801474f16" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "comments" ADD CONSTRAINT "FK_9adf2d3106c6dc87d6262ccadfe" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_9adf2d3106c6dc87d6262ccadfe"`);
        await queryRunner.query(`DROP TABLE "task_audit_logs"`);
        await queryRunner.query(`DROP TABLE "tasks"`);
        await queryRunner.query(`DROP TYPE "public"."tasks_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."tasks_priority_enum"`);
        await queryRunner.query(`DROP TABLE "comments"`);
    }

}
