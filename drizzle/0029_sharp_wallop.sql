CREATE TABLE `leaveAllocations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`employeeUserId` int NOT NULL,
	`leavePolicyId` int NOT NULL,
	`allocationYear` int NOT NULL,
	`allocatedDays` int NOT NULL,
	`allocatedByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leaveAllocations_id` PRIMARY KEY(`id`),
	CONSTRAINT `leaveAllocations_company_employee_policy_year_unique` UNIQUE(`companyId`,`employeeUserId`,`leavePolicyId`,`allocationYear`)
);
--> statement-breakpoint
CREATE TABLE `leavePolicies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`leaveType` enum('annual','sick','emergency') NOT NULL,
	`title` varchar(120) NOT NULL,
	`referenceDays` int NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leavePolicies_id` PRIMARY KEY(`id`),
	CONSTRAINT `leavePolicies_company_type_unique` UNIQUE(`companyId`,`leaveType`)
);
--> statement-breakpoint
ALTER TABLE `leaveAllocations` ADD CONSTRAINT `leaveAllocations_companyId_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `leaveAllocations` ADD CONSTRAINT `leaveAllocations_employeeUserId_users_id_fk` FOREIGN KEY (`employeeUserId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `leaveAllocations` ADD CONSTRAINT `leaveAllocations_leavePolicyId_leavePolicies_id_fk` FOREIGN KEY (`leavePolicyId`) REFERENCES `leavePolicies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `leaveAllocations` ADD CONSTRAINT `leaveAllocations_allocatedByUserId_users_id_fk` FOREIGN KEY (`allocatedByUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `leavePolicies` ADD CONSTRAINT `leavePolicies_companyId_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `leavePolicies` ADD CONSTRAINT `leavePolicies_createdByUserId_users_id_fk` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `leaveAllocations_company_employee_year_idx` ON `leaveAllocations` (`companyId`,`employeeUserId`,`allocationYear`);--> statement-breakpoint
CREATE INDEX `leavePolicies_company_active_idx` ON `leavePolicies` (`companyId`,`isActive`);