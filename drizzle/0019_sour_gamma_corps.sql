CREATE TABLE `employeeLifecycleEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`employeeUserId` int NOT NULL,
	`eventType` enum('joined','status_changed','role_changed','department_changed','manager_changed','offboarding_started','offboarding_completed') NOT NULL,
	`effectiveAt` timestamp NOT NULL,
	`note` varchar(500),
	`createdByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `employeeLifecycleEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `employeeLifecycleEvents` ADD CONSTRAINT `employeeLifecycleEvents_companyId_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employeeLifecycleEvents` ADD CONSTRAINT `employeeLifecycleEvents_employeeUserId_users_id_fk` FOREIGN KEY (`employeeUserId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employeeLifecycleEvents` ADD CONSTRAINT `employeeLifecycleEvents_createdByUserId_users_id_fk` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `employeeLifecycleEvents_company_employee_effective_idx` ON `employeeLifecycleEvents` (`companyId`,`employeeUserId`,`effectiveAt`);--> statement-breakpoint
CREATE INDEX `employeeLifecycleEvents_company_type_idx` ON `employeeLifecycleEvents` (`companyId`,`eventType`);