CREATE TABLE `accountActivationHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`actorId` int,
	`previousStatus` varchar(32),
	`nextStatus` enum('pending','active','suspended','rejected') NOT NULL,
	`assignedRole` enum('user','hr','government','manager','admin'),
	`note` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `accountActivationHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `accountStatus` enum('pending','active','suspended','rejected') DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `accountActivationHistory` ADD CONSTRAINT `accountActivationHistory_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `accountActivationHistory` ADD CONSTRAINT `accountActivationHistory_actorId_users_id_fk` FOREIGN KEY (`actorId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;