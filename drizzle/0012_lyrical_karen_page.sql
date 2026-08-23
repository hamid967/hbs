CREATE TABLE `expenseRequests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`requestId` int NOT NULL,
	`companyId` int NOT NULL,
	`expenseType` enum('travel','operating') NOT NULL,
	`amountSar` varchar(32) NOT NULL,
	`reason` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `expenseRequests_id` PRIMARY KEY(`id`),
	CONSTRAINT `expenseRequests_requestId_unique` UNIQUE(`requestId`)
);
--> statement-breakpoint
CREATE TABLE `leaveRequests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`requestId` int NOT NULL,
	`companyId` int NOT NULL,
	`leaveType` enum('annual','sick','emergency') NOT NULL,
	`startDate` varchar(10) NOT NULL,
	`endDate` varchar(10) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `leaveRequests_id` PRIMARY KEY(`id`),
	CONSTRAINT `leaveRequests_requestId_unique` UNIQUE(`requestId`)
);
--> statement-breakpoint
ALTER TABLE `expenseRequests` ADD CONSTRAINT `expenseRequests_requestId_serviceRequests_id_fk` FOREIGN KEY (`requestId`) REFERENCES `serviceRequests`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `expenseRequests` ADD CONSTRAINT `expenseRequests_companyId_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `leaveRequests` ADD CONSTRAINT `leaveRequests_requestId_serviceRequests_id_fk` FOREIGN KEY (`requestId`) REFERENCES `serviceRequests`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `leaveRequests` ADD CONSTRAINT `leaveRequests_companyId_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE cascade ON UPDATE no action;