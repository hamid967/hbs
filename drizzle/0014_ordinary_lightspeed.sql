CREATE TABLE `jobCandidates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`openingId` int NOT NULL,
	`fullName` varchar(160) NOT NULL,
	`email` varchar(320),
	`status` enum('applied','screening','interview','offer','accepted','rejected','withdrawn') NOT NULL DEFAULT 'applied',
	`internalNote` text,
	`expectedStartAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `jobCandidates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `jobOpenings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`title` varchar(160) NOT NULL,
	`departmentId` int,
	`hiringManagerUserId` int,
	`employmentType` enum('full_time','part_time','contract') NOT NULL DEFAULT 'full_time',
	`headcount` int NOT NULL DEFAULT 1,
	`description` text,
	`status` enum('draft','open','closed') NOT NULL DEFAULT 'draft',
	`createdByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `jobOpenings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `onboardingTasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`candidateId` int NOT NULL,
	`ownerUserId` int,
	`title` varchar(180) NOT NULL,
	`status` enum('pending','completed') NOT NULL DEFAULT 'pending',
	`dueAt` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `onboardingTasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `jobCandidates` ADD CONSTRAINT `jobCandidates_companyId_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `jobCandidates` ADD CONSTRAINT `jobCandidates_openingId_jobOpenings_id_fk` FOREIGN KEY (`openingId`) REFERENCES `jobOpenings`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `jobOpenings` ADD CONSTRAINT `jobOpenings_companyId_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `jobOpenings` ADD CONSTRAINT `jobOpenings_departmentId_departments_id_fk` FOREIGN KEY (`departmentId`) REFERENCES `departments`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `jobOpenings` ADD CONSTRAINT `jobOpenings_hiringManagerUserId_users_id_fk` FOREIGN KEY (`hiringManagerUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `jobOpenings` ADD CONSTRAINT `jobOpenings_createdByUserId_users_id_fk` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `onboardingTasks` ADD CONSTRAINT `onboardingTasks_companyId_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `onboardingTasks` ADD CONSTRAINT `onboardingTasks_candidateId_jobCandidates_id_fk` FOREIGN KEY (`candidateId`) REFERENCES `jobCandidates`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `onboardingTasks` ADD CONSTRAINT `onboardingTasks_ownerUserId_users_id_fk` FOREIGN KEY (`ownerUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `jobCandidates_company_opening_status_idx` ON `jobCandidates` (`companyId`,`openingId`,`status`);--> statement-breakpoint
CREATE INDEX `jobOpenings_company_status_idx` ON `jobOpenings` (`companyId`,`status`);--> statement-breakpoint
CREATE INDEX `onboardingTasks_company_candidate_status_idx` ON `onboardingTasks` (`companyId`,`candidateId`,`status`);