CREATE TABLE `jobInterviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`candidateId` int NOT NULL,
	`interviewerUserId` int NOT NULL,
	`scheduledAt` timestamp NOT NULL,
	`channel` enum('in_person','video','phone') NOT NULL DEFAULT 'video',
	`status` enum('scheduled','completed','cancelled') NOT NULL DEFAULT 'scheduled',
	`internalSummary` text,
	`createdByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `jobInterviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `jobOffers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`candidateId` int NOT NULL,
	`status` enum('draft','issued','accepted','declined','withdrawn') NOT NULL DEFAULT 'draft',
	`proposedStartAt` timestamp,
	`responseDueAt` timestamp,
	`internalNote` text,
	`createdByUserId` int,
	`issuedAt` timestamp,
	`decidedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `jobOffers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `jobInterviews` ADD CONSTRAINT `jobInterviews_companyId_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `jobInterviews` ADD CONSTRAINT `jobInterviews_candidateId_jobCandidates_id_fk` FOREIGN KEY (`candidateId`) REFERENCES `jobCandidates`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `jobInterviews` ADD CONSTRAINT `jobInterviews_interviewerUserId_users_id_fk` FOREIGN KEY (`interviewerUserId`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `jobInterviews` ADD CONSTRAINT `jobInterviews_createdByUserId_users_id_fk` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `jobOffers` ADD CONSTRAINT `jobOffers_companyId_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `jobOffers` ADD CONSTRAINT `jobOffers_candidateId_jobCandidates_id_fk` FOREIGN KEY (`candidateId`) REFERENCES `jobCandidates`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `jobOffers` ADD CONSTRAINT `jobOffers_createdByUserId_users_id_fk` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `jobInterviews_company_candidate_scheduled_idx` ON `jobInterviews` (`companyId`,`candidateId`,`scheduledAt`);--> statement-breakpoint
CREATE INDEX `jobInterviews_company_interviewer_idx` ON `jobInterviews` (`companyId`,`interviewerUserId`);--> statement-breakpoint
CREATE INDEX `jobOffers_company_candidate_status_idx` ON `jobOffers` (`companyId`,`candidateId`,`status`);