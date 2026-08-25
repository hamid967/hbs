CREATE TABLE `auditEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`actorUserId` int,
	`category` enum('recruitment','attendance','approval','account','permission') NOT NULL,
	`action` varchar(120) NOT NULL,
	`entityType` varchar(80) NOT NULL,
	`entityId` int,
	`summary` varchar(360) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `auditEvents` ADD CONSTRAINT `auditEvents_companyId_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `auditEvents` ADD CONSTRAINT `auditEvents_actorUserId_users_id_fk` FOREIGN KEY (`actorUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `auditEvents_company_created_idx` ON `auditEvents` (`companyId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `auditEvents_company_category_idx` ON `auditEvents` (`companyId`,`category`);