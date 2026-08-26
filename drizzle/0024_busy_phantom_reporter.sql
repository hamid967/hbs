CREATE TABLE `employeeEmergencyContacts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`employeeUserId` int NOT NULL,
	`contactName` varchar(160) NOT NULL,
	`relationship` varchar(80) NOT NULL,
	`phone` varchar(48) NOT NULL,
	`createdByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `employeeEmergencyContacts_id` PRIMARY KEY(`id`),
	CONSTRAINT `employeeEmergencyContacts_company_employee_unique` UNIQUE(`companyId`,`employeeUserId`)
);
--> statement-breakpoint
ALTER TABLE `employeeProfiles` ADD `workLocation` varchar(160);--> statement-breakpoint
ALTER TABLE `employeeEmergencyContacts` ADD CONSTRAINT `employeeEmergencyContacts_companyId_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employeeEmergencyContacts` ADD CONSTRAINT `employeeEmergencyContacts_employeeUserId_users_id_fk` FOREIGN KEY (`employeeUserId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employeeEmergencyContacts` ADD CONSTRAINT `employeeEmergencyContacts_createdByUserId_users_id_fk` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `employeeEmergencyContacts_company_employee_idx` ON `employeeEmergencyContacts` (`companyId`,`employeeUserId`);