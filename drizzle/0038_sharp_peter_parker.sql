CREATE TABLE `internalMessagingChannelMembers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`channelId` int NOT NULL,
	`userId` int NOT NULL,
	`addedByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `internalMessagingChannelMembers_id` PRIMARY KEY(`id`),
	CONSTRAINT `internalMessagingChannelMembers_channel_user_unique` UNIQUE(`channelId`,`userId`)
);
--> statement-breakpoint
CREATE TABLE `internalMessagingChannels` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`name` varchar(120) NOT NULL,
	`description` varchar(360),
	`status` enum('active','archived') NOT NULL DEFAULT 'active',
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `internalMessagingChannels_id` PRIMARY KEY(`id`),
	CONSTRAINT `internalMessagingChannels_company_name_unique` UNIQUE(`companyId`,`name`)
);
--> statement-breakpoint
CREATE TABLE `internalMessagingMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`channelId` int NOT NULL,
	`senderUserId` int NOT NULL,
	`body` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `internalMessagingMessages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `internalMessagingChannelMembers` ADD CONSTRAINT `imcm_company_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `internalMessagingChannelMembers` ADD CONSTRAINT `imcm_channel_fk` FOREIGN KEY (`channelId`) REFERENCES `internalMessagingChannels`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `internalMessagingChannelMembers` ADD CONSTRAINT `imcm_user_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `internalMessagingChannelMembers` ADD CONSTRAINT `imcm_adder_fk` FOREIGN KEY (`addedByUserId`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `internalMessagingChannels` ADD CONSTRAINT `imc_company_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `internalMessagingChannels` ADD CONSTRAINT `imc_creator_fk` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `internalMessagingMessages` ADD CONSTRAINT `imm_company_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `internalMessagingMessages` ADD CONSTRAINT `imm_channel_fk` FOREIGN KEY (`channelId`) REFERENCES `internalMessagingChannels`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `internalMessagingMessages` ADD CONSTRAINT `imm_sender_fk` FOREIGN KEY (`senderUserId`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `internalMessagingChannelMembers_company_user_idx` ON `internalMessagingChannelMembers` (`companyId`,`userId`);--> statement-breakpoint
CREATE INDEX `internalMessagingChannelMembers_company_channel_idx` ON `internalMessagingChannelMembers` (`companyId`,`channelId`);--> statement-breakpoint
CREATE INDEX `internalMessagingChannels_company_status_idx` ON `internalMessagingChannels` (`companyId`,`status`);--> statement-breakpoint
CREATE INDEX `internalMessagingMessages_company_channel_created_idx` ON `internalMessagingMessages` (`companyId`,`channelId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `internalMessagingMessages_company_sender_created_idx` ON `internalMessagingMessages` (`companyId`,`senderUserId`,`createdAt`);
