CREATE TABLE `departments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`name` varchar(120) NOT NULL,
	`code` varchar(32),
	`managerUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `departments_id` PRIMARY KEY(`id`),
	CONSTRAINT `departments_company_name_unique` UNIQUE(`companyId`,`name`)
);
--> statement-breakpoint
CREATE TABLE `employeeProfiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`userId` int NOT NULL,
	`employeeNumber` varchar(40),
	`jobTitle` varchar(160),
	`departmentId` int,
	`managerUserId` int,
	`employmentStatus` enum('active','on_leave','inactive') NOT NULL DEFAULT 'active',
	`joinedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `employeeProfiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `employeeProfiles_user_unique` UNIQUE(`userId`),
	CONSTRAINT `employeeProfiles_company_number_unique` UNIQUE(`companyId`,`employeeNumber`)
);
--> statement-breakpoint
ALTER TABLE `departments` ADD CONSTRAINT `departments_companyId_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `departments` ADD CONSTRAINT `departments_managerUserId_users_id_fk` FOREIGN KEY (`managerUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employeeProfiles` ADD CONSTRAINT `employeeProfiles_companyId_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employeeProfiles` ADD CONSTRAINT `employeeProfiles_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employeeProfiles` ADD CONSTRAINT `employeeProfiles_departmentId_departments_id_fk` FOREIGN KEY (`departmentId`) REFERENCES `departments`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employeeProfiles` ADD CONSTRAINT `employeeProfiles_managerUserId_users_id_fk` FOREIGN KEY (`managerUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;