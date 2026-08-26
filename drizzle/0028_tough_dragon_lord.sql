CREATE TABLE `employeeGoalUpdates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`goalId` int NOT NULL,
	`trainingProgramId` int,
	`progressPercent` int NOT NULL,
	`note` varchar(600),
	`createdByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `employeeGoalUpdates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `employeeGoals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`employeeUserId` int NOT NULL,
	`title` varchar(180) NOT NULL,
	`description` varchar(600),
	`status` enum('not_started','in_progress','completed','cancelled') NOT NULL DEFAULT 'not_started',
	`progressPercent` int NOT NULL DEFAULT 0,
	`targetAt` timestamp,
	`createdByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `employeeGoals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `employeeGoalUpdates` ADD CONSTRAINT `goalUpdate_company_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employeeGoalUpdates` ADD CONSTRAINT `goalUpdate_goal_fk` FOREIGN KEY (`goalId`) REFERENCES `employeeGoals`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employeeGoalUpdates` ADD CONSTRAINT `goalUpdate_training_fk` FOREIGN KEY (`trainingProgramId`) REFERENCES `trainingPrograms`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employeeGoalUpdates` ADD CONSTRAINT `goalUpdate_created_by_fk` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employeeGoals` ADD CONSTRAINT `goal_company_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employeeGoals` ADD CONSTRAINT `goal_employee_fk` FOREIGN KEY (`employeeUserId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employeeGoals` ADD CONSTRAINT `goal_created_by_fk` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `employeeGoalUpdates_company_goal_idx` ON `employeeGoalUpdates` (`companyId`,`goalId`);--> statement-breakpoint
CREATE INDEX `employeeGoalUpdates_company_training_idx` ON `employeeGoalUpdates` (`companyId`,`trainingProgramId`);--> statement-breakpoint
CREATE INDEX `employeeGoals_company_employee_status_idx` ON `employeeGoals` (`companyId`,`employeeUserId`,`status`);
