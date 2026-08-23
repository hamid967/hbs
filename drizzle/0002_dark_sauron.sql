CREATE TABLE `chatMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`role` enum('user','assistant') NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chatMessages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chatSessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employeeId` int NOT NULL,
	`status` enum('open','converted','closed') NOT NULL DEFAULT 'open',
	`draftType` enum('hr','government'),
	`draftCategory` varchar(120),
	`draftSubject` varchar(240),
	`draftDetails` text,
	`draftPriority` enum('normal','urgent'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `chatSessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hrSystemPlans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employeeId` int NOT NULL,
	`businessActivity` varchar(240) NOT NULL,
	`companySize` varchar(80) NOT NULL,
	`operatingNotes` text,
	`generatedContent` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `hrSystemPlans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `chatMessages` ADD CONSTRAINT `chatMessages_sessionId_chatSessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `chatSessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `chatSessions` ADD CONSTRAINT `chatSessions_employeeId_users_id_fk` FOREIGN KEY (`employeeId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `hrSystemPlans` ADD CONSTRAINT `hrSystemPlans_employeeId_users_id_fk` FOREIGN KEY (`employeeId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;