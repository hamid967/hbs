CREATE TABLE `userModulePermissionHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`actorId` int,
	`module` enum('hr','government') NOT NULL,
	`previousCanView` boolean NOT NULL DEFAULT false,
	`previousCanManage` boolean NOT NULL DEFAULT false,
	`nextCanView` boolean NOT NULL DEFAULT false,
	`nextCanManage` boolean NOT NULL DEFAULT false,
	`note` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `userModulePermissionHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userModulePermissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`module` enum('hr','government') NOT NULL,
	`canView` boolean NOT NULL DEFAULT false,
	`canManage` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userModulePermissions_id` PRIMARY KEY(`id`),
	CONSTRAINT `userModulePermissions_user_module_unique` UNIQUE(`userId`,`module`)
);
--> statement-breakpoint
ALTER TABLE `userModulePermissionHistory` ADD CONSTRAINT `userModulePermissionHistory_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userModulePermissionHistory` ADD CONSTRAINT `userModulePermissionHistory_actorId_users_id_fk` FOREIGN KEY (`actorId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userModulePermissions` ADD CONSTRAINT `userModulePermissions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;