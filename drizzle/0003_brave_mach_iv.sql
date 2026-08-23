CREATE TABLE `demoRequests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fullName` varchar(160) NOT NULL,
	`workEmail` varchar(320) NOT NULL,
	`phone` varchar(48),
	`companyName` varchar(180) NOT NULL,
	`companySize` varchar(80) NOT NULL,
	`businessActivity` varchar(240),
	`interest` varchar(120) NOT NULL,
	`notes` text,
	`status` enum('new','contacted','qualified','closed') NOT NULL DEFAULT 'new',
	`ownerId` int,
	`internalNote` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `demoRequests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `demoRequests` ADD CONSTRAINT `demoRequests_ownerId_users_id_fk` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;