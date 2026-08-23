CREATE TABLE `inAppNotifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`recipientUserId` int NOT NULL,
	`type` enum('approval_required','request_decision') NOT NULL,
	`title` varchar(180) NOT NULL,
	`body` text NOT NULL,
	`href` varchar(320),
	`relatedRequestId` int,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `inAppNotifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `inAppNotifications` ADD CONSTRAINT `inAppNotifications_companyId_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inAppNotifications` ADD CONSTRAINT `inAppNotifications_recipientUserId_users_id_fk` FOREIGN KEY (`recipientUserId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inAppNotifications` ADD CONSTRAINT `inAppNotifications_relatedRequestId_serviceRequests_id_fk` FOREIGN KEY (`relatedRequestId`) REFERENCES `serviceRequests`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `inAppNotifications_recipient_created_idx` ON `inAppNotifications` (`recipientUserId`,`createdAt`);