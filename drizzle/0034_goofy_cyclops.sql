CREATE TABLE `employeeDependents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`employeeUserId` int NOT NULL,
	`fullName` varchar(160) NOT NULL,
	`relationship` varchar(80) NOT NULL,
	`birthYear` int,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `employeeDependents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `employeeDependents` ADD CONSTRAINT `employeeDependents_companyId_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employeeDependents` ADD CONSTRAINT `employeeDependents_employeeUserId_users_id_fk` FOREIGN KEY (`employeeUserId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employeeDependents` ADD CONSTRAINT `employeeDependents_createdByUserId_users_id_fk` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `employeeDependents_company_employee_idx` ON `employeeDependents` (`companyId`,`employeeUserId`);--> statement-breakpoint
CREATE INDEX `employeeDependents_company_active_idx` ON `employeeDependents` (`companyId`,`isActive`);