CREATE TABLE `employeeContracts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`employeeUserId` int NOT NULL,
	`contractReference` varchar(80) NOT NULL,
	`title` varchar(160) NOT NULL,
	`status` enum('draft','active','ended','archived') NOT NULL DEFAULT 'draft',
	`startAt` timestamp,
	`endAt` timestamp,
	`createdByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `employeeContracts_id` PRIMARY KEY(`id`),
	CONSTRAINT `employeeContracts_company_reference_unique` UNIQUE(`companyId`,`contractReference`)
);
--> statement-breakpoint
CREATE TABLE `employeeDocuments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`employeeUserId` int NOT NULL,
	`contractId` int,
	`category` enum('contract_attachment','employee_document','other') NOT NULL DEFAULT 'employee_document',
	`fileName` varchar(240) NOT NULL,
	`mimeType` varchar(100) NOT NULL,
	`sizeBytes` int NOT NULL,
	`storageKey` varchar(500) NOT NULL,
	`uploadedByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `employeeDocuments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `employeeContracts` ADD CONSTRAINT `employeeContracts_companyId_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employeeContracts` ADD CONSTRAINT `employeeContracts_employeeUserId_users_id_fk` FOREIGN KEY (`employeeUserId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employeeContracts` ADD CONSTRAINT `employeeContracts_createdByUserId_users_id_fk` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employeeDocuments` ADD CONSTRAINT `employeeDocuments_companyId_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employeeDocuments` ADD CONSTRAINT `employeeDocuments_employeeUserId_users_id_fk` FOREIGN KEY (`employeeUserId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employeeDocuments` ADD CONSTRAINT `employeeDocuments_contractId_employeeContracts_id_fk` FOREIGN KEY (`contractId`) REFERENCES `employeeContracts`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employeeDocuments` ADD CONSTRAINT `employeeDocuments_uploadedByUserId_users_id_fk` FOREIGN KEY (`uploadedByUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `employeeContracts_company_employee_idx` ON `employeeContracts` (`companyId`,`employeeUserId`);--> statement-breakpoint
CREATE INDEX `employeeDocuments_company_employee_idx` ON `employeeDocuments` (`companyId`,`employeeUserId`);--> statement-breakpoint
CREATE INDEX `employeeDocuments_company_contract_idx` ON `employeeDocuments` (`companyId`,`contractId`);