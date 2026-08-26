CREATE TABLE `onboardingTaskTemplates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`title` varchar(180) NOT NULL,
	`defaultOwnerUserId` int,
	`dueOffsetDays` int NOT NULL DEFAULT 0,
	`createdByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `onboardingTaskTemplates_id` PRIMARY KEY(`id`),
	CONSTRAINT `onboardingTaskTemplates_company_title_unique` UNIQUE(`companyId`,`title`)
);
--> statement-breakpoint
ALTER TABLE `onboardingTaskTemplates` ADD CONSTRAINT `onboardingTaskTemplates_companyId_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `onboardingTaskTemplates` ADD CONSTRAINT `onboardingTaskTemplates_defaultOwnerUserId_users_id_fk` FOREIGN KEY (`defaultOwnerUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `onboardingTaskTemplates` ADD CONSTRAINT `onboardingTaskTemplates_createdByUserId_users_id_fk` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `onboardingTaskTemplates_company_owner_idx` ON `onboardingTaskTemplates` (`companyId`,`defaultOwnerUserId`);