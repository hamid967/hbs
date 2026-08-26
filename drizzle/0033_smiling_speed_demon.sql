CREATE TABLE `employeeAssets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`assetName` varchar(160) NOT NULL,
	`assetTag` varchar(80) NOT NULL,
	`assetType` varchar(80),
	`status` enum('available','assigned','returned','retired') NOT NULL DEFAULT 'available',
	`assignedEmployeeUserId` int,
	`assignedAt` timestamp,
	`returnedAt` timestamp,
	`notes` varchar(500),
	`createdByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `employeeAssets_id` PRIMARY KEY(`id`),
	CONSTRAINT `employeeAssets_company_tag_unique` UNIQUE(`companyId`,`assetTag`)
);
--> statement-breakpoint
ALTER TABLE `employeeAssets` ADD CONSTRAINT `employeeAssets_companyId_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employeeAssets` ADD CONSTRAINT `employeeAssets_assignedEmployeeUserId_users_id_fk` FOREIGN KEY (`assignedEmployeeUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employeeAssets` ADD CONSTRAINT `employeeAssets_createdByUserId_users_id_fk` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `employeeAssets_company_employee_idx` ON `employeeAssets` (`companyId`,`assignedEmployeeUserId`);--> statement-breakpoint
CREATE INDEX `employeeAssets_company_status_idx` ON `employeeAssets` (`companyId`,`status`);