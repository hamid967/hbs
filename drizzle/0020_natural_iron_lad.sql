CREATE TABLE `attendancePolicies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`title` varchar(160) NOT NULL,
	`startTime` varchar(5) NOT NULL,
	`endTime` varchar(5) NOT NULL,
	`workDays` varchar(32) NOT NULL,
	`graceMinutes` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `attendancePolicies_id` PRIMARY KEY(`id`),
	CONSTRAINT `attendancePolicies_company_title_unique` UNIQUE(`companyId`,`title`)
);
--> statement-breakpoint
CREATE TABLE `employeeShiftAssignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`employeeUserId` int NOT NULL,
	`attendancePolicyId` int NOT NULL,
	`effectiveFrom` varchar(10) NOT NULL,
	`effectiveTo` varchar(10),
	`createdByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `employeeShiftAssignments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `attendancePolicies` ADD CONSTRAINT `attendancePolicies_companyId_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `attendancePolicies` ADD CONSTRAINT `attendancePolicies_createdByUserId_users_id_fk` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employeeShiftAssignments` ADD CONSTRAINT `employeeShiftAssignments_companyId_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employeeShiftAssignments` ADD CONSTRAINT `employeeShiftAssignments_employeeUserId_users_id_fk` FOREIGN KEY (`employeeUserId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employeeShiftAssignments` ADD CONSTRAINT `shift_policy_fk` FOREIGN KEY (`attendancePolicyId`) REFERENCES `attendancePolicies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employeeShiftAssignments` ADD CONSTRAINT `shift_created_by_fk` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `attendancePolicies_company_active_idx` ON `attendancePolicies` (`companyId`,`isActive`);--> statement-breakpoint
CREATE INDEX `employeeShiftAssignments_company_employee_from_idx` ON `employeeShiftAssignments` (`companyId`,`employeeUserId`,`effectiveFrom`);--> statement-breakpoint
CREATE INDEX `employeeShiftAssignments_company_policy_idx` ON `employeeShiftAssignments` (`companyId`,`attendancePolicyId`);
