CREATE TABLE `requestHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`requestId` int NOT NULL,
	`actorId` int,
	`action` enum('created','status_change','note') NOT NULL,
	`previousStatus` varchar(32),
	`nextStatus` varchar(32),
	`note` text NOT NULL,
	`visibleToEmployee` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `requestHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `serviceRequests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reference` varchar(32) NOT NULL,
	`type` enum('hr','government') NOT NULL,
	`category` varchar(120) NOT NULL,
	`subject` varchar(240) NOT NULL,
	`details` text NOT NULL,
	`priority` enum('normal','urgent') NOT NULL DEFAULT 'normal',
	`status` enum('submitted','in_review','approved','rejected','completed') NOT NULL DEFAULT 'submitted',
	`employeeId` int NOT NULL,
	`assignedToId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `serviceRequests_id` PRIMARY KEY(`id`),
	CONSTRAINT `serviceRequests_reference_unique` UNIQUE(`reference`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','hr','government','manager','admin') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `requestHistory` ADD CONSTRAINT `requestHistory_requestId_serviceRequests_id_fk` FOREIGN KEY (`requestId`) REFERENCES `serviceRequests`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `requestHistory` ADD CONSTRAINT `requestHistory_actorId_users_id_fk` FOREIGN KEY (`actorId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `serviceRequests` ADD CONSTRAINT `serviceRequests_employeeId_users_id_fk` FOREIGN KEY (`employeeId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `serviceRequests` ADD CONSTRAINT `serviceRequests_assignedToId_users_id_fk` FOREIGN KEY (`assignedToId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;