CREATE TABLE `employeeTrainingAssignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`employeeUserId` int NOT NULL,
	`trainingProgramId` int NOT NULL,
	`status` enum('assigned','completed') NOT NULL DEFAULT 'assigned',
	`dueAt` timestamp,
	`completedAt` timestamp,
	`assignedByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `employeeTrainingAssignments_id` PRIMARY KEY(`id`),
	CONSTRAINT `employeeTrainingAssignments_company_employee_program_unique` UNIQUE(`companyId`,`employeeUserId`,`trainingProgramId`)
);
--> statement-breakpoint
CREATE TABLE `trainingPrograms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`title` varchar(180) NOT NULL,
	`description` varchar(800),
	`durationMinutes` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `trainingPrograms_id` PRIMARY KEY(`id`),
	CONSTRAINT `trainingPrograms_company_title_unique` UNIQUE(`companyId`,`title`)
);
--> statement-breakpoint
ALTER TABLE `employeeTrainingAssignments` ADD CONSTRAINT `training_assignment_company_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employeeTrainingAssignments` ADD CONSTRAINT `training_assignment_employee_fk` FOREIGN KEY (`employeeUserId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employeeTrainingAssignments` ADD CONSTRAINT `training_assignment_program_fk` FOREIGN KEY (`trainingProgramId`) REFERENCES `trainingPrograms`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employeeTrainingAssignments` ADD CONSTRAINT `training_assignment_assigned_by_fk` FOREIGN KEY (`assignedByUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trainingPrograms` ADD CONSTRAINT `trainingPrograms_companyId_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trainingPrograms` ADD CONSTRAINT `trainingPrograms_createdByUserId_users_id_fk` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `employeeTrainingAssignments_company_status_idx` ON `employeeTrainingAssignments` (`companyId`,`status`);--> statement-breakpoint
CREATE INDEX `trainingPrograms_company_active_idx` ON `trainingPrograms` (`companyId`,`isActive`);
