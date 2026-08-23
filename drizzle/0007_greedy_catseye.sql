CREATE TABLE `companies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(160) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `companies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `companyPermissionTemplates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`title` varchar(120) NOT NULL,
	`description` varchar(360),
	`role` enum('user','hr','government','manager','admin') NOT NULL,
	`hrCanView` boolean NOT NULL DEFAULT false,
	`hrCanManage` boolean NOT NULL DEFAULT false,
	`governmentCanView` boolean NOT NULL DEFAULT false,
	`governmentCanManage` boolean NOT NULL DEFAULT false,
	`createdByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `companyPermissionTemplates_id` PRIMARY KEY(`id`),
	CONSTRAINT `companyPermissionTemplates_company_title_unique` UNIQUE(`companyId`,`title`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `companyId` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `companyPermissionTemplates` ADD CONSTRAINT `companyPermissionTemplates_companyId_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `companyPermissionTemplates` ADD CONSTRAINT `companyPermissionTemplates_createdByUserId_users_id_fk` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_companyId_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE restrict ON UPDATE no action;