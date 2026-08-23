CREATE TABLE `approvalTasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`requestId` int NOT NULL,
	`approverRole` enum('hr','government','manager','admin') NOT NULL,
	`status` enum('pending','approved','rejected','cancelled') NOT NULL DEFAULT 'pending',
	`decidedByUserId` int,
	`decisionNote` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`decidedAt` timestamp,
	CONSTRAINT `approvalTasks_id` PRIMARY KEY(`id`),
	CONSTRAINT `approvalTasks_request_role_unique` UNIQUE(`requestId`,`approverRole`)
);
--> statement-breakpoint
ALTER TABLE `approvalTasks` ADD CONSTRAINT `approvalTasks_companyId_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `approvalTasks` ADD CONSTRAINT `approvalTasks_requestId_serviceRequests_id_fk` FOREIGN KEY (`requestId`) REFERENCES `serviceRequests`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `approvalTasks` ADD CONSTRAINT `approvalTasks_decidedByUserId_users_id_fk` FOREIGN KEY (`decidedByUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;