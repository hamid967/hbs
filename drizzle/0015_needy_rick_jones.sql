CREATE TABLE `attendanceEntries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`userId` int NOT NULL,
	`workDate` varchar(10) NOT NULL,
	`workMode` enum('onsite','remote') NOT NULL DEFAULT 'onsite',
	`status` enum('open','completed') NOT NULL DEFAULT 'open',
	`checkInAt` timestamp NOT NULL,
	`checkOutAt` timestamp,
	`note` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `attendanceEntries_id` PRIMARY KEY(`id`),
	CONSTRAINT `attendanceEntries_company_user_date_unique` UNIQUE(`companyId`,`userId`,`workDate`)
);
--> statement-breakpoint
ALTER TABLE `attendanceEntries` ADD CONSTRAINT `attendanceEntries_companyId_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `attendanceEntries` ADD CONSTRAINT `attendanceEntries_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `attendanceEntries_company_date_idx` ON `attendanceEntries` (`companyId`,`workDate`);