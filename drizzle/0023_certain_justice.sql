CREATE TABLE `executionDependencyReviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`stageNumber` int NOT NULL,
	`status` enum('review_requested','dependency_resolved','retry_requested') NOT NULL DEFAULT 'review_requested',
	`requestedByUserId` int NOT NULL,
	`reviewedByUserId` int,
	`reviewedAt` timestamp,
	`retryRequestedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `executionDependencyReviews_id` PRIMARY KEY(`id`),
	CONSTRAINT `executionDependencyReviews_company_stage_unique` UNIQUE(`companyId`,`stageNumber`)
);
--> statement-breakpoint
ALTER TABLE `executionDependencyReviews` ADD CONSTRAINT `executionDependencyReviews_companyId_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `executionDependencyReviews` ADD CONSTRAINT `executionDependencyReviews_requestedByUserId_users_id_fk` FOREIGN KEY (`requestedByUserId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `executionDependencyReviews` ADD CONSTRAINT `executionDependencyReviews_reviewedByUserId_users_id_fk` FOREIGN KEY (`reviewedByUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `executionDependencyReviews_company_status_idx` ON `executionDependencyReviews` (`companyId`,`status`);