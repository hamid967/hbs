CREATE TABLE `dataRetentionPolicies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`dataDomain` enum('accounts','employees','dependents','requests','contracts','leave','assets','offboarding','recruitment','goals','audit') NOT NULL,
	`ownerLabel` varchar(120) NOT NULL,
	`retentionDays` int,
	`reviewState` enum('draft','reviewed') NOT NULL DEFAULT 'draft',
	`policyNote` varchar(720) NOT NULL,
	`createdByUserId` int,
	`reviewedByUserId` int,
	`reviewedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dataRetentionPolicies_id` PRIMARY KEY(`id`),
	CONSTRAINT `dataRetentionPolicies_company_domain_unique` UNIQUE(`companyId`,`dataDomain`)
);
--> statement-breakpoint
ALTER TABLE `dataRetentionPolicies` ADD CONSTRAINT `dataRetentionPolicies_companyId_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dataRetentionPolicies` ADD CONSTRAINT `dataRetentionPolicies_createdByUserId_users_id_fk` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dataRetentionPolicies` ADD CONSTRAINT `dataRetentionPolicies_reviewedByUserId_users_id_fk` FOREIGN KEY (`reviewedByUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `dataRetentionPolicies_company_state_idx` ON `dataRetentionPolicies` (`companyId`,`reviewState`);