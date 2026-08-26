ALTER TABLE `employeeContracts` ADD `versionNumber` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `employeeContracts` ADD `supersedesContractId` int;--> statement-breakpoint
ALTER TABLE `employeeContracts` ADD CONSTRAINT `employeeContracts_supersedesContractId_employeeContracts_id_fk` FOREIGN KEY (`supersedesContractId`) REFERENCES `employeeContracts`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `employeeContracts_company_previous_idx` ON `employeeContracts` (`companyId`,`supersedesContractId`);