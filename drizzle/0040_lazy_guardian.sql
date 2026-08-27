CREATE TABLE `costCenters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`name` varchar(160) NOT NULL,
	`code` varchar(32) NOT NULL,
	`status` enum('active','archived') NOT NULL DEFAULT 'active',
	`archivedAt` timestamp,
	`createdByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `costCenters_id` PRIMARY KEY(`id`),
	CONSTRAINT `costCenters_company_code_unique` UNIQUE(`companyId`,`code`),
	CONSTRAINT `costCenters_company_name_unique` UNIQUE(`companyId`,`name`)
);
--> statement-breakpoint
CREATE TABLE `legalEntities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`name` varchar(160) NOT NULL,
	`code` varchar(32),
	`registrationLabel` varchar(80),
	`registrationNumber` varchar(80),
	`status` enum('active','archived') NOT NULL DEFAULT 'active',
	`archivedAt` timestamp,
	`createdByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `legalEntities_id` PRIMARY KEY(`id`),
	CONSTRAINT `legalEntities_company_name_unique` UNIQUE(`companyId`,`name`),
	CONSTRAINT `legalEntities_company_code_unique` UNIQUE(`companyId`,`code`)
);
--> statement-breakpoint
CREATE TABLE `organizationAssignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`employeeUserId` int NOT NULL,
	`legalEntityId` int,
	`branchId` int,
	`departmentId` int,
	`teamId` int,
	`costCenterId` int,
	`workLocationId` int,
	`effectiveFrom` timestamp NOT NULL,
	`effectiveTo` timestamp,
	`status` enum('active','archived') NOT NULL DEFAULT 'active',
	`archivedAt` timestamp,
	`createdByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `organizationAssignments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `organizationBranches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`legalEntityId` int,
	`name` varchar(160) NOT NULL,
	`code` varchar(32),
	`city` varchar(120),
	`region` varchar(120),
	`managerUserId` int,
	`status` enum('active','archived') NOT NULL DEFAULT 'active',
	`archivedAt` timestamp,
	`createdByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `organizationBranches_id` PRIMARY KEY(`id`),
	CONSTRAINT `organizationBranches_company_name_unique` UNIQUE(`companyId`,`name`),
	CONSTRAINT `organizationBranches_company_code_unique` UNIQUE(`companyId`,`code`)
);
--> statement-breakpoint
CREATE TABLE `organizationTeams` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`departmentId` int,
	`branchId` int,
	`name` varchar(160) NOT NULL,
	`code` varchar(32),
	`managerUserId` int,
	`status` enum('active','archived') NOT NULL DEFAULT 'active',
	`archivedAt` timestamp,
	`createdByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `organizationTeams_id` PRIMARY KEY(`id`),
	CONSTRAINT `organizationTeams_company_name_unique` UNIQUE(`companyId`,`name`),
	CONSTRAINT `organizationTeams_company_code_unique` UNIQUE(`companyId`,`code`)
);
--> statement-breakpoint
CREATE TABLE `workLocations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`branchId` int,
	`name` varchar(160) NOT NULL,
	`code` varchar(32),
	`city` varchar(120),
	`region` varchar(120),
	`status` enum('active','archived') NOT NULL DEFAULT 'active',
	`archivedAt` timestamp,
	`createdByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `workLocations_id` PRIMARY KEY(`id`),
	CONSTRAINT `workLocations_company_name_unique` UNIQUE(`companyId`,`name`),
	CONSTRAINT `workLocations_company_code_unique` UNIQUE(`companyId`,`code`)
);
--> statement-breakpoint
ALTER TABLE `departments` ADD `parentDepartmentId` int;--> statement-breakpoint
ALTER TABLE `departments` ADD `effectiveFrom` timestamp;--> statement-breakpoint
ALTER TABLE `departments` ADD `effectiveTo` timestamp;--> statement-breakpoint
ALTER TABLE `departments` ADD `archivedAt` timestamp;--> statement-breakpoint
ALTER TABLE `costCenters` ADD CONSTRAINT `costCenters_companyId_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `costCenters` ADD CONSTRAINT `costCenters_createdByUserId_users_id_fk` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `legalEntities` ADD CONSTRAINT `legalEntities_companyId_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `legalEntities` ADD CONSTRAINT `legalEntities_createdByUserId_users_id_fk` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `organizationAssignments` ADD CONSTRAINT `organizationAssignments_companyId_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `organizationAssignments` ADD CONSTRAINT `organizationAssignments_employeeUserId_users_id_fk` FOREIGN KEY (`employeeUserId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `organizationAssignments` ADD CONSTRAINT `organizationAssignments_legalEntityId_legalEntities_id_fk` FOREIGN KEY (`legalEntityId`) REFERENCES `legalEntities`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `organizationAssignments` ADD CONSTRAINT `organizationAssignments_branchId_organizationBranches_id_fk` FOREIGN KEY (`branchId`) REFERENCES `organizationBranches`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `organizationAssignments` ADD CONSTRAINT `organizationAssignments_departmentId_departments_id_fk` FOREIGN KEY (`departmentId`) REFERENCES `departments`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `organizationAssignments` ADD CONSTRAINT `organizationAssignments_teamId_organizationTeams_id_fk` FOREIGN KEY (`teamId`) REFERENCES `organizationTeams`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `organizationAssignments` ADD CONSTRAINT `organizationAssignments_costCenterId_costCenters_id_fk` FOREIGN KEY (`costCenterId`) REFERENCES `costCenters`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `organizationAssignments` ADD CONSTRAINT `organizationAssignments_workLocationId_workLocations_id_fk` FOREIGN KEY (`workLocationId`) REFERENCES `workLocations`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `organizationAssignments` ADD CONSTRAINT `organizationAssignments_createdByUserId_users_id_fk` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `organizationBranches` ADD CONSTRAINT `organizationBranches_companyId_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `organizationBranches` ADD CONSTRAINT `organizationBranches_legalEntityId_legalEntities_id_fk` FOREIGN KEY (`legalEntityId`) REFERENCES `legalEntities`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `organizationBranches` ADD CONSTRAINT `organizationBranches_managerUserId_users_id_fk` FOREIGN KEY (`managerUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `organizationBranches` ADD CONSTRAINT `organizationBranches_createdByUserId_users_id_fk` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `organizationTeams` ADD CONSTRAINT `organizationTeams_companyId_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `organizationTeams` ADD CONSTRAINT `organizationTeams_departmentId_departments_id_fk` FOREIGN KEY (`departmentId`) REFERENCES `departments`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `organizationTeams` ADD CONSTRAINT `organizationTeams_branchId_organizationBranches_id_fk` FOREIGN KEY (`branchId`) REFERENCES `organizationBranches`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `organizationTeams` ADD CONSTRAINT `organizationTeams_managerUserId_users_id_fk` FOREIGN KEY (`managerUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `organizationTeams` ADD CONSTRAINT `organizationTeams_createdByUserId_users_id_fk` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `workLocations` ADD CONSTRAINT `workLocations_companyId_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `workLocations` ADD CONSTRAINT `workLocations_branchId_organizationBranches_id_fk` FOREIGN KEY (`branchId`) REFERENCES `organizationBranches`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `workLocations` ADD CONSTRAINT `workLocations_createdByUserId_users_id_fk` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `costCenters_company_status_idx` ON `costCenters` (`companyId`,`status`);--> statement-breakpoint
CREATE INDEX `legalEntities_company_status_idx` ON `legalEntities` (`companyId`,`status`);--> statement-breakpoint
CREATE INDEX `organizationAssignments_company_employee_idx` ON `organizationAssignments` (`companyId`,`employeeUserId`);--> statement-breakpoint
CREATE INDEX `organizationAssignments_company_status_idx` ON `organizationAssignments` (`companyId`,`status`);--> statement-breakpoint
CREATE INDEX `organizationAssignments_company_department_idx` ON `organizationAssignments` (`companyId`,`departmentId`);--> statement-breakpoint
CREATE INDEX `organizationAssignments_company_effective_idx` ON `organizationAssignments` (`companyId`,`effectiveFrom`,`effectiveTo`);--> statement-breakpoint
CREATE INDEX `organizationBranches_company_entity_idx` ON `organizationBranches` (`companyId`,`legalEntityId`);--> statement-breakpoint
CREATE INDEX `organizationBranches_company_status_idx` ON `organizationBranches` (`companyId`,`status`);--> statement-breakpoint
CREATE INDEX `organizationTeams_company_department_idx` ON `organizationTeams` (`companyId`,`departmentId`);--> statement-breakpoint
CREATE INDEX `organizationTeams_company_branch_idx` ON `organizationTeams` (`companyId`,`branchId`);--> statement-breakpoint
CREATE INDEX `organizationTeams_company_status_idx` ON `organizationTeams` (`companyId`,`status`);--> statement-breakpoint
CREATE INDEX `workLocations_company_branch_idx` ON `workLocations` (`companyId`,`branchId`);--> statement-breakpoint
CREATE INDEX `workLocations_company_status_idx` ON `workLocations` (`companyId`,`status`);--> statement-breakpoint
ALTER TABLE `departments` ADD CONSTRAINT `departments_parentDepartmentId_departments_id_fk` FOREIGN KEY (`parentDepartmentId`) REFERENCES `departments`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `departments_company_parent_idx` ON `departments` (`companyId`,`parentDepartmentId`);--> statement-breakpoint
CREATE INDEX `departments_company_archived_idx` ON `departments` (`companyId`,`archivedAt`);