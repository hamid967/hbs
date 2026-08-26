CREATE TABLE `jobDesignations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`title` varchar(160) NOT NULL,
	`code` varchar(32),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `jobDesignations_id` PRIMARY KEY(`id`),
	CONSTRAINT `jobDesignations_company_title_unique` UNIQUE(`companyId`,`title`),
	CONSTRAINT `jobDesignations_company_code_unique` UNIQUE(`companyId`,`code`)
);
--> statement-breakpoint
ALTER TABLE `employeeLifecycleEvents` MODIFY COLUMN `eventType` enum('joined','profile_updated','status_changed','role_changed','department_changed','designation_changed','manager_changed','offboarding_started','offboarding_completed') NOT NULL;--> statement-breakpoint
ALTER TABLE `employeeProfiles` ADD `designationId` int;--> statement-breakpoint
ALTER TABLE `jobDesignations` ADD CONSTRAINT `jobDesignations_companyId_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `jobDesignations` ADD CONSTRAINT `jobDesignations_createdByUserId_users_id_fk` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `jobDesignations_company_active_idx` ON `jobDesignations` (`companyId`,`isActive`);--> statement-breakpoint
ALTER TABLE `employeeProfiles` ADD CONSTRAINT `employeeProfiles_designationId_jobDesignations_id_fk` FOREIGN KEY (`designationId`) REFERENCES `jobDesignations`(`id`) ON DELETE set null ON UPDATE no action;