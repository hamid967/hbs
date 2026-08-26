CREATE TABLE `employeeOffboardingTasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`offboardingId` int NOT NULL,
	`taskKey` varchar(64) NOT NULL,
	`label` varchar(160) NOT NULL,
	`status` enum('pending','completed') NOT NULL DEFAULT 'pending',
	`completedAt` timestamp,
	`completedByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `employeeOffboardingTasks_id` PRIMARY KEY(`id`),
	CONSTRAINT `employeeOffboardingTasks_offboarding_key_unique` UNIQUE(`offboardingId`,`taskKey`)
);
--> statement-breakpoint
CREATE TABLE `employeeOffboardings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`employeeUserId` int NOT NULL,
	`status` enum('in_progress','completed','cancelled') NOT NULL DEFAULT 'in_progress',
	`lastWorkingAt` timestamp,
	`createdByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `employeeOffboardings_id` PRIMARY KEY(`id`),
	CONSTRAINT `employeeOffboardings_company_employee_unique` UNIQUE(`companyId`,`employeeUserId`)
);
--> statement-breakpoint
ALTER TABLE `employeeOffboardingTasks` ADD CONSTRAINT `offTask_company_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employeeOffboardingTasks` ADD CONSTRAINT `offTask_offboarding_fk` FOREIGN KEY (`offboardingId`) REFERENCES `employeeOffboardings`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employeeOffboardingTasks` ADD CONSTRAINT `offTask_completed_by_fk` FOREIGN KEY (`completedByUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employeeOffboardings` ADD CONSTRAINT `offboard_company_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employeeOffboardings` ADD CONSTRAINT `offboard_employee_fk` FOREIGN KEY (`employeeUserId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employeeOffboardings` ADD CONSTRAINT `offboard_created_by_fk` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `employeeOffboardingTasks_company_offboarding_idx` ON `employeeOffboardingTasks` (`companyId`,`offboardingId`);--> statement-breakpoint
CREATE INDEX `employeeOffboardings_company_status_idx` ON `employeeOffboardings` (`companyId`,`status`);
