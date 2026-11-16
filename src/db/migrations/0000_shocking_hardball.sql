CREATE TABLE `companies` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`role` text,
	`status` text DEFAULT 'interested' NOT NULL,
	`comp_range` text,
	`stack` text,
	`remote_policy` text,
	`company_stage` text,
	`source` text,
	`careers_url` text,
	`notes` text,
	`outcome_notes` text,
	`would_reapply` integer DEFAULT false,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `contacts` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`company_id` text,
	`title` text,
	`email` text,
	`linkedin_url` text,
	`relationship` text,
	`notes` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `debriefs` (
	`id` text PRIMARY KEY NOT NULL,
	`interaction_id` text NOT NULL,
	`went_well` text,
	`caught_off_guard` text,
	`do_differently` text,
	`learned_about_company` text,
	`energy_check` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`interaction_id`) REFERENCES `interactions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `debriefs_interaction_id_unique` ON `debriefs` (`interaction_id`);--> statement-breakpoint
CREATE TABLE `interactions` (
	`id` text PRIMARY KEY NOT NULL,
	`company_id` text NOT NULL,
	`date` text NOT NULL,
	`type` text NOT NULL,
	`person_name` text,
	`person_title` text,
	`duration` text,
	`summary` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`company_id` text,
	`contact_id` text,
	`direction` text NOT NULL,
	`channel` text NOT NULL,
	`subject` text,
	`body` text,
	`date` text NOT NULL,
	`source_id` text,
	`is_example` integer DEFAULT false,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `messages_source_id_unique` ON `messages` (`source_id`);--> statement-breakpoint
CREATE TABLE `nudges` (
	`id` text PRIMARY KEY NOT NULL,
	`company_id` text,
	`type` text NOT NULL,
	`message` text NOT NULL,
	`due_date` text NOT NULL,
	`completed` integer DEFAULT false,
	`completed_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `watchlist_checks` (
	`id` text PRIMARY KEY NOT NULL,
	`company_id` text NOT NULL,
	`checked_at` text DEFAULT CURRENT_TIMESTAMP,
	`jobs_found` text,
	`matched` integer DEFAULT false,
	`notified` integer DEFAULT false,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE cascade
);
