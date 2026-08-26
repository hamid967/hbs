CREATE TABLE `employeeExitInterviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`offboardingId` int NOT NULL,
	`employeeUserId` int NOT NULL,
	`status` enum('scheduled','completed','declined') NOT NULL DEFAULT 'scheduled',
	`scheduledAt` timestamp,
	`completedAt` timestamp,
	`feedbackCategory` varchar(80),
	`summary` varchar(1200),
	`followUpRequired` boolean NOT NULL DEFAULT false,
	`recordedByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `employeeExitInterviews_id` PRIMARY KEY(`id`),
	CONSTRAINT `employeeExitInterviews_offboarding_unique` UNIQUE(`offboardingId`)
);
--> statement-breakpoint
ALTER TABLE `employeeExitInterviews` ADD CONSTRAINT `employeeExitInterviews_companyId_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employeeExitInterviews` ADD CONSTRAINT `employeeExitInterviews_offboardingId_employeeOffboardings_id_fk` FOREIGN KEY (`offboardingId`) REFERENCES `employeeOffboardings`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employeeExitInterviews` ADD CONSTRAINT `employeeExitInterviews_employeeUserId_users_id_fk` FOREIGN KEY (`employeeUserId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employeeExitInterviews` ADD CONSTRAINT `employeeExitInterviews_recordedByUserId_users_id_fk` FOREIGN KEY (`recordedByUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `employeeExitInterviews_company_employee_idx` ON `employeeExitInterviews` (`companyId`,`employeeUserId`);--> statement-breakpoint
CREATE INDEX `employeeExitInterviews_company_status_idx` ON `employeeExitInterviews` (`companyId`,`status`);