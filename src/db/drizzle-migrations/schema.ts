import { pgTable, index, uniqueIndex, integer, varchar, boolean, doublePrecision, serial, text, jsonb, timestamp, check, uuid, foreignKey, unique, date, primaryKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const substance = pgTable("substance", {
	fema_number: integer().default(0).notNull(),
	common_name: varchar({ length: 255 }),
	synthetic: boolean(),
	molecular_weight: doublePrecision(),
	exact_mass: doublePrecision(),
	smile: varchar({ length: 2000 }),
	iupac_name: varchar({ length: 3000 }),
	unknown_natural: boolean(),
	olfactory_taste_notes: varchar({ length: 255 }),
	functional_groups: varchar({ length: 1000 }),
	inchi: varchar({ length: 3000 }),
	xlogp: doublePrecision(),
	is_natural: boolean(),
	flavor_profile: varchar({ length: 255 }),
	fema_flavor_profile: varchar({ length: 255 }),
	pubchem_id: integer(),
	cas_id: varchar({ length: 1000 }),
	substance_id: serial().primaryKey().notNull(),
	taste: text(),
	solubility: jsonb(),
	food_additive_classes: jsonb(),
	alternative_names: jsonb(),
	molecular_formula: varchar({ length: 255 }),
	melting_point_c: varchar({ length: 255 }),
	boiling_point_c: varchar({ length: 255 }),
	ec_number: varchar({ length: 1000 }),
	description: text(),
	type: varchar({ length: 255 }),
	pubchem_cid: varchar({ length: 255 }),
	pubchem_sid: varchar({ length: 255 }),
	odor: varchar({ length: 255 }),
	common_applications: varchar({ length: 255 }),
	fl_number: varchar({ length: 20 }),
	coe_number: varchar({ length: 20 }),
	jecfa_number: integer(),
	updated_at: timestamp({ mode: 'string' }).defaultNow(),
	eu_policy_code: varchar({ length: 50 }),
}, (table) => [
	index("idx_substance_cas_id").using("btree", table.cas_id.asc().nullsLast().op("text_ops")),
	index("idx_substance_coe_number").using("btree", table.coe_number.asc().nullsLast().op("text_ops")).where(sql`(coe_number IS NOT NULL)`),
	uniqueIndex("idx_substance_coe_unique").using("btree", table.coe_number.asc().nullsLast().op("text_ops")).where(sql`((coe_number IS NOT NULL) AND ((coe_number)::text <> ''::text))`),
	index("idx_substance_common_name").using("btree", table.common_name.asc().nullsLast().op("text_ops")),
	index("idx_substance_eu_policy_code").using("btree", table.eu_policy_code.asc().nullsLast().op("text_ops")).where(sql`(eu_policy_code IS NOT NULL)`),
	index("idx_substance_fema_number").using("btree", table.fema_number.asc().nullsLast().op("int4_ops")),
	index("idx_substance_fl_number").using("btree", table.fl_number.asc().nullsLast().op("text_ops")).where(sql`(fl_number IS NOT NULL)`),
	uniqueIndex("idx_substance_fl_unique").using("btree", table.fl_number.asc().nullsLast().op("text_ops")).where(sql`((fl_number IS NOT NULL) AND ((fl_number)::text <> ''::text))`),
	index("idx_substance_jecfa_number").using("btree", table.jecfa_number.asc().nullsLast().op("int4_ops")).where(sql`(jecfa_number IS NOT NULL)`),
	uniqueIndex("idx_substance_jecfa_unique").using("btree", table.jecfa_number.asc().nullsLast().op("int4_ops")).where(sql`(jecfa_number IS NOT NULL)`),
	index("idx_substance_name_trgm").using("gin", table.common_name.asc().nullsLast().op("gin_trgm_ops")),
]);

export const job_offers = pgTable("job_offers", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	title: text().notNull(),
	description: text().notNull(),
	company_name: text(),
	original_company_name: text(),
	through_recruiter: boolean().default(false).notNull(),
	source_website: text().notNull(),
	source_url: text().notNull(),
	location: text().notNull(),
	employment_type: text(),
	salary: text(),
	requirements: jsonb(),
	tags: jsonb(),
	status: boolean().default(true).notNull(),
	posted_at: timestamp({ mode: 'string' }).notNull(),
	expires_at: timestamp({ mode: 'string' }),
	created_at: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updated_at: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	industry: text().notNull(),
	experience_level: text(),
	contact_person: jsonb(),
}, (table) => [
	index("idx_job_offers_industry").using("btree", table.industry.asc().nullsLast().op("text_ops")),
	index("idx_job_offers_posted_at").using("btree", table.posted_at.desc().nullsFirst().op("timestamp_ops")),
	index("idx_job_offers_status").using("btree", table.status.asc().nullsLast().op("bool_ops")),
	check("job_offers_employment_type_check", sql`employment_type = ANY (ARRAY['Full-time'::text, 'Part-time'::text, 'Contract'::text, 'Internship'::text, 'Freelance'::text, 'CDI'::text, 'CDD'::text, 'Interim'::text])`),
	check("job_offers_experience_level_check", sql`experience_level = ANY (ARRAY['Entry'::text, 'Mid'::text, 'Senior'::text, 'Executive'::text])`),
]);

export const flavour = pgTable("flavour", {
	flavour_id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	created_at: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updated_at: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	is_public: boolean().default(true),
	user_id: varchar({ length: 255 }),
	category_id: integer(),
	status: varchar({ length: 20 }).default('draft'),
	version: integer().default(1),
	base_unit: varchar({ length: 20 }).default('g/kg'),
	flavor_profile: jsonb().default([]),
}, (table) => [
	index("idx_flavour_category_id").using("btree", table.category_id.asc().nullsLast().op("int4_ops")),
	index("idx_flavour_is_public").using("btree", table.is_public.asc().nullsLast().op("bool_ops")),
	index("idx_flavour_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("idx_flavour_user_id").using("btree", table.user_id.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.category_id],
			foreignColumns: [category.category_id],
			name: "flavour_category_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.user_id],
			foreignColumns: [users.user_id],
			name: "flavour_user_id_fkey"
		}).onDelete("cascade"),
	check("flavour_base_unit_check", sql`(base_unit)::text = ANY (ARRAY[('g/kg'::character varying)::text, ('%(v/v)'::character varying)::text, ('g/L'::character varying)::text, ('mL/L'::character varying)::text, ('ppm'::character varying)::text])`),
	check("flavour_status_check", sql`(status)::text = ANY (ARRAY[('draft'::character varying)::text, ('published'::character varying)::text, ('archived'::character varying)::text])`),
]);

export const category = pgTable("category", {
	category_id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	parent_category_id: integer(),
	updated_at: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	foreignKey({
			columns: [table.parent_category_id],
			foreignColumns: [table.category_id],
			name: "category_parent_category_id_fkey"
		}).onDelete("set null"),
]);

export const users = pgTable("users", {
	user_id: varchar({ length: 255 }).primaryKey().notNull(),
	email: varchar({ length: 255 }),
	username: varchar({ length: 255 }).notNull(),
	created_at: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updated_at: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	unique("users_email_key").on(table.email),
]);

export const job_offer_interactions = pgTable("job_offer_interactions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	user_id: varchar({ length: 255 }).notNull(),
	job_offer_id: uuid().notNull(),
	action: text(),
	referrer: text(),
	timestamp: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_job_offer_interactions_job_offer_id").using("btree", table.job_offer_id.asc().nullsLast().op("uuid_ops")),
	index("idx_job_offer_interactions_user_id").using("btree", table.user_id.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.job_offer_id],
			foreignColumns: [job_offers.id],
			name: "job_offer_interactions_job_offer_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.user_id],
			foreignColumns: [users.user_id],
			name: "job_offer_interactions_user_id_fkey"
		}).onDelete("cascade"),
	check("job_offer_interactions_action_check", sql`action = ANY (ARRAY['viewed'::text, 'applied'::text, 'seen_contact'::text])`),
]);

export const workspace = pgTable("workspace", {
	workspace_id: serial().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	created_by: text().notNull(),
	created_at: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updated_at: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	foreignKey({
			columns: [table.created_by],
			foreignColumns: [users.user_id],
			name: "workspace_created_by_fkey"
		}).onDelete("cascade"),
]);

export const newsletter_subscribers = pgTable("newsletter_subscribers", {
	id: serial().primaryKey().notNull(),
	email: varchar({ length: 255 }).notNull(),
	subscribed_at: timestamp({ mode: 'string' }).defaultNow(),
	confirmed_at: timestamp({ mode: 'string' }),
	unsubscribed_at: timestamp({ mode: 'string' }),
	confirmation_token: uuid().defaultRandom(),
	source: varchar({ length: 50 }),
	locale: varchar({ length: 5 }).default('fr'),
}, (table) => [
	index("idx_newsletter_email").using("btree", table.email.asc().nullsLast().op("text_ops")),
	index("idx_newsletter_token").using("btree", table.confirmation_token.asc().nullsLast().op("uuid_ops")),
	unique("newsletter_subscribers_email_key").on(table.email),
]);

export const job_alert_preferences = pgTable("job_alert_preferences", {
	id: serial().primaryKey().notNull(),
	user_id: text().notNull(),
	email: varchar({ length: 255 }).notNull(),
	locations: text().array(),
	employment_types: text().array(),
	experience_levels: text().array(),
	keywords: text().array(),
	is_active: boolean().default(true),
	frequency: varchar({ length: 20 }).default('daily'),
	last_notified_at: timestamp({ mode: 'string' }),
	created_at: timestamp({ mode: 'string' }).defaultNow(),
	updated_at: timestamp({ mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_job_alerts_active").using("btree", table.is_active.asc().nullsLast().op("bool_ops")).where(sql`(is_active = true)`),
	index("idx_job_alerts_user_id").using("btree", table.user_id.asc().nullsLast().op("text_ops")),
	unique("unique_user_alert").on(table.user_id),
]);

export const workspace_member = pgTable("workspace_member", {
	member_id: serial().primaryKey().notNull(),
	workspace_id: integer().notNull(),
	user_id: text().notNull(),
	role: text().default('viewer').notNull(),
	created_at: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_workspace_member_user_id").using("btree", table.user_id.asc().nullsLast().op("text_ops")),
	index("idx_workspace_member_workspace_id").using("btree", table.workspace_id.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.workspace_id],
			foreignColumns: [workspace.workspace_id],
			name: "workspace_member_workspace_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.user_id],
			foreignColumns: [users.user_id],
			name: "workspace_member_user_id_fkey"
		}).onDelete("cascade"),
	unique("workspace_member_workspace_id_user_id_key").on(table.workspace_id, table.user_id),
	check("workspace_member_role_check", sql`role = ANY (ARRAY['owner'::text, 'editor'::text, 'viewer'::text])`),
]);

export const workspace_invite = pgTable("workspace_invite", {
	invite_id: serial().primaryKey().notNull(),
	workspace_id: integer().notNull(),
	invited_email: text().notNull(),
	invited_by_user_id: text().notNull(),
	invite_token: uuid().defaultRandom(),
	role: text().default('viewer').notNull(),
	status: text().default('pending').notNull(),
	created_at: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_workspace_invite_email").using("btree", table.invited_email.asc().nullsLast().op("text_ops")),
	index("idx_workspace_invite_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("idx_workspace_invite_token").using("btree", table.invite_token.asc().nullsLast().op("uuid_ops")),
	index("idx_workspace_invite_workspace_id").using("btree", table.workspace_id.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.workspace_id],
			foreignColumns: [workspace.workspace_id],
			name: "workspace_invite_workspace_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.invited_by_user_id],
			foreignColumns: [users.user_id],
			name: "workspace_invite_invited_by_user_id_fkey"
		}).onDelete("cascade"),
	unique("workspace_invite_workspace_id_invited_email_key").on(table.workspace_id, table.invited_email),
	unique("workspace_invite_invite_token_key").on(table.invite_token),
	check("workspace_invite_role_check", sql`role = ANY (ARRAY['editor'::text, 'viewer'::text])`),
	check("workspace_invite_status_check", sql`status = ANY (ARRAY['pending'::text, 'accepted'::text, 'expired'::text])`),
]);

export const flavour_shares = pgTable("flavour_shares", {
	share_id: serial().primaryKey().notNull(),
	flavour_id: integer().notNull(),
	shared_with_user_id: text().notNull(),
	shared_by_user_id: text().notNull(),
	created_at: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_flavour_shares_flavour_id").using("btree", table.flavour_id.asc().nullsLast().op("int4_ops")),
	index("idx_flavour_shares_shared_by_user_id").using("btree", table.shared_by_user_id.asc().nullsLast().op("text_ops")),
	index("idx_flavour_shares_shared_with_user_id").using("btree", table.shared_with_user_id.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.flavour_id],
			foreignColumns: [flavour.flavour_id],
			name: "flavour_shares_flavour_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.shared_with_user_id],
			foreignColumns: [users.user_id],
			name: "flavour_shares_shared_with_user_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.shared_by_user_id],
			foreignColumns: [users.user_id],
			name: "flavour_shares_shared_by_user_id_fkey"
		}).onDelete("cascade"),
	unique("flavour_shares_flavour_id_shared_with_user_id_key").on(table.flavour_id, table.shared_with_user_id),
]);

export const flavour_invites = pgTable("flavour_invites", {
	invite_id: serial().primaryKey().notNull(),
	flavour_id: integer().notNull(),
	invited_email: text().notNull(),
	invited_by_user_id: text().notNull(),
	invite_token: uuid().defaultRandom(),
	status: text().default('pending').notNull(),
	created_at: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	accepted_at: timestamp({ mode: 'string' }),
}, (table) => [
	index("idx_flavour_invites_email").using("btree", table.invited_email.asc().nullsLast().op("text_ops")),
	index("idx_flavour_invites_flavour_id").using("btree", table.flavour_id.asc().nullsLast().op("int4_ops")),
	index("idx_flavour_invites_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("idx_flavour_invites_token").using("btree", table.invite_token.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.flavour_id],
			foreignColumns: [flavour.flavour_id],
			name: "flavour_invites_flavour_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.invited_by_user_id],
			foreignColumns: [users.user_id],
			name: "flavour_invites_invited_by_user_id_fkey"
		}).onDelete("cascade"),
	unique("flavour_invites_flavour_id_invited_email_key").on(table.flavour_id, table.invited_email),
	unique("flavour_invites_invite_token_key").on(table.invite_token),
	check("flavour_invites_status_check", sql`status = ANY (ARRAY['pending'::text, 'accepted'::text, 'expired'::text])`),
]);

export const functional_group = pgTable("functional_group", {
	functional_group_id: serial().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	description: text(),
	smarts_pattern: varchar({ length: 500 }),
}, (table) => [
	unique("functional_group_name_key").on(table.name),
]);

export const workspace_document = pgTable("workspace_document", {
	document_id: serial().primaryKey().notNull(),
	workspace_id: integer().notNull(),
	name: text().notNull(),
	description: text(),
	type: text().notNull(),
	content: text(),
	url: text(),
	file_size: integer(),
	mime_type: text(),
	created_by: text(),
	created_at: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updated_at: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_workspace_document_type").using("btree", table.type.asc().nullsLast().op("text_ops")),
	index("idx_workspace_document_workspace_id").using("btree", table.workspace_id.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.workspace_id],
			foreignColumns: [workspace.workspace_id],
			name: "workspace_document_workspace_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.created_by],
			foreignColumns: [users.user_id],
			name: "workspace_document_created_by_fkey"
		}).onDelete("set null"),
	check("workspace_document_type_check", sql`type = ANY (ARRAY['image'::text, 'csv'::text, 'markdown'::text, 'pdf'::text, 'file'::text])`),
]);

export const user_learning_queue = pgTable("user_learning_queue", {
	queue_id: serial().primaryKey().notNull(),
	user_id: text().notNull(),
	substance_id: integer().notNull(),
	priority: integer().default(0),
	target_date: date(),
	added_at: timestamp({ mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_learning_queue_priority").using("btree", table.user_id.asc().nullsLast().op("int4_ops"), table.priority.desc().nullsFirst().op("text_ops")),
	index("idx_learning_queue_user").using("btree", table.user_id.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.user_id],
			foreignColumns: [users.user_id],
			name: "user_learning_queue_user_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.substance_id],
			foreignColumns: [substance.substance_id],
			name: "user_learning_queue_substance_id_fkey"
		}).onDelete("cascade"),
	unique("user_learning_queue_user_id_substance_id_key").on(table.user_id, table.substance_id),
]);

export const substance_learning_progress = pgTable("substance_learning_progress", {
	progress_id: serial().primaryKey().notNull(),
	user_id: text().notNull(),
	substance_id: integer().notNull(),
	has_smelled: boolean().default(false),
	smelled_at: timestamp({ mode: 'string' }),
	has_tasted: boolean().default(false),
	tasted_at: timestamp({ mode: 'string' }),
	status: text().default('not_started').notNull(),
	personal_notes: text(),
	personal_descriptors: text().array(),
	associations: text(),
	sample_photo_url: text(),
	concentration_notes: text(),
	started_at: timestamp({ mode: 'string' }),
	mastered_at: timestamp({ mode: 'string' }),
	created_at: timestamp({ mode: 'string' }).defaultNow(),
	updated_at: timestamp({ mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_learning_progress_status").using("btree", table.user_id.asc().nullsLast().op("text_ops"), table.status.asc().nullsLast().op("text_ops")),
	index("idx_learning_progress_user").using("btree", table.user_id.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.user_id],
			foreignColumns: [users.user_id],
			name: "substance_learning_progress_user_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.substance_id],
			foreignColumns: [substance.substance_id],
			name: "substance_learning_progress_substance_id_fkey"
		}).onDelete("cascade"),
	unique("substance_learning_progress_user_id_substance_id_key").on(table.user_id, table.substance_id),
	check("substance_learning_progress_status_check", sql`status = ANY (ARRAY['not_started'::text, 'learning'::text, 'confident'::text, 'mastered'::text])`),
]);

export const learning_streak = pgTable("learning_streak", {
	streak_id: serial().primaryKey().notNull(),
	user_id: text().notNull(),
	current_streak: integer().default(0),
	longest_streak: integer().default(0),
	last_study_date: date(),
	streak_freezes_available: integer().default(0),
}, (table) => [
	foreignKey({
			columns: [table.user_id],
			foreignColumns: [users.user_id],
			name: "learning_streak_user_id_fkey"
		}).onDelete("cascade"),
	unique("learning_streak_user_id_key").on(table.user_id),
]);

export const learning_review = pgTable("learning_review", {
	review_id: serial().primaryKey().notNull(),
	user_id: text().notNull(),
	substance_id: integer().notNull(),
	scheduled_for: timestamp({ mode: 'string' }).notNull(),
	completed_at: timestamp({ mode: 'string' }),
	review_result: text(),
	confidence_after: integer(),
	notes: text(),
	created_at: timestamp({ mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_learning_review_scheduled").using("btree", table.user_id.asc().nullsLast().op("text_ops"), table.scheduled_for.asc().nullsLast().op("text_ops")).where(sql`(completed_at IS NULL)`),
	index("idx_learning_review_user").using("btree", table.user_id.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.user_id],
			foreignColumns: [users.user_id],
			name: "learning_review_user_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.substance_id],
			foreignColumns: [substance.substance_id],
			name: "learning_review_substance_id_fkey"
		}).onDelete("cascade"),
	check("learning_review_result_check", sql`(review_result IS NULL) OR (review_result = ANY (ARRAY['correct'::text, 'incorrect'::text, 'partial'::text]))`),
	check("learning_review_confidence_check", sql`(confidence_after IS NULL) OR ((confidence_after >= 1) AND (confidence_after <= 5))`),
]);

export const learning_quiz_attempt = pgTable("learning_quiz_attempt", {
	attempt_id: serial().primaryKey().notNull(),
	user_id: text().notNull(),
	substance_id: integer().notNull(),
	guessed_name: text(),
	observations: text(),
	result: text().notNull(),
	created_at: timestamp({ mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_learning_quiz_user").using("btree", table.user_id.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.user_id],
			foreignColumns: [users.user_id],
			name: "learning_quiz_attempt_user_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.substance_id],
			foreignColumns: [substance.substance_id],
			name: "learning_quiz_attempt_substance_id_fkey"
		}).onDelete("cascade"),
	check("learning_quiz_attempt_result_check", sql`result = ANY (ARRAY['correct'::text, 'incorrect'::text, 'partial'::text])`),
]);

export const learning_session = pgTable("learning_session", {
	session_id: serial().primaryKey().notNull(),
	user_id: text().notNull(),
	name: text().notNull(),
	description: text(),
	scheduled_for: date(),
	duration_minutes: integer(),
	reflection_notes: text(),
	completed_at: timestamp({ mode: 'string' }),
	created_at: timestamp({ mode: 'string' }).defaultNow(),
	updated_at: timestamp({ mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_learning_session_user").using("btree", table.user_id.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.user_id],
			foreignColumns: [users.user_id],
			name: "learning_session_user_id_fkey"
		}).onDelete("cascade"),
]);

export const user_badge = pgTable("user_badge", {
	badge_id: serial().primaryKey().notNull(),
	user_id: text().notNull(),
	badge_key: text().notNull(),
	earned_at: timestamp({ mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_user_badge_user").using("btree", table.user_id.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.user_id],
			foreignColumns: [users.user_id],
			name: "user_badge_user_id_fkey"
		}).onDelete("cascade"),
	unique("user_badge_user_id_badge_key_key").on(table.user_id, table.badge_key),
]);

export const substance_functional_group = pgTable("substance_functional_group", {
	substance_id: integer().notNull(),
	functional_group_id: integer().notNull(),
}, (table) => [
	index("idx_sfg_group").using("btree", table.functional_group_id.asc().nullsLast().op("int4_ops")),
	index("idx_sfg_substance").using("btree", table.substance_id.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.substance_id],
			foreignColumns: [substance.substance_id],
			name: "substance_functional_group_substance_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.functional_group_id],
			foreignColumns: [functional_group.functional_group_id],
			name: "substance_functional_group_functional_group_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.substance_id, table.functional_group_id], name: "substance_functional_group_pkey"}),
]);

export const workspace_flavour = pgTable("workspace_flavour", {
	workspace_id: integer().notNull(),
	flavour_id: integer().notNull(),
	added_by: text(),
	added_at: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_workspace_flavour_flavour_id").using("btree", table.flavour_id.asc().nullsLast().op("int4_ops")),
	index("idx_workspace_flavour_workspace_id").using("btree", table.workspace_id.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.workspace_id],
			foreignColumns: [workspace.workspace_id],
			name: "workspace_flavour_workspace_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.flavour_id],
			foreignColumns: [flavour.flavour_id],
			name: "workspace_flavour_flavour_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.added_by],
			foreignColumns: [users.user_id],
			name: "workspace_flavour_added_by_fkey"
		}).onDelete("set null"),
	primaryKey({ columns: [table.workspace_id, table.flavour_id], name: "workspace_flavour_pkey"}),
]);

export const learning_session_substance = pgTable("learning_session_substance", {
	session_id: integer().notNull(),
	substance_id: integer().notNull(),
	order_index: integer().default(0),
	session_code: text(),
}, (table) => [
	foreignKey({
			columns: [table.session_id],
			foreignColumns: [learning_session.session_id],
			name: "learning_session_substance_session_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.substance_id],
			foreignColumns: [substance.substance_id],
			name: "learning_session_substance_substance_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.session_id, table.substance_id], name: "learning_session_substance_pkey"}),
]);

export const substance_flavour = pgTable("substance_flavour", {
	substance_id: integer().notNull(),
	flavour_id: integer().notNull(),
	concentration: doublePrecision(),
	unit: varchar({ length: 20 }),
	order_index: integer(),
}, (table) => [
	foreignKey({
			columns: [table.flavour_id],
			foreignColumns: [flavour.flavour_id],
			name: "substance_flavour_flavour_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.substance_id],
			foreignColumns: [substance.substance_id],
			name: "substance_flavour_substance_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.substance_id, table.flavour_id], name: "substance_flavour_pkey"}),
	check("substance_flavour_unit_check", sql`(unit)::text = ANY (ARRAY[('g/kg'::character varying)::text, ('%(v/v)'::character varying)::text, ('g/L'::character varying)::text, ('mL/L'::character varying)::text, ('ppm'::character varying)::text])`),
]);

export const ingredient_flavour = pgTable("ingredient_flavour", {
	parent_flavour_id: integer().notNull(),
	ingredient_flavour_id: integer().notNull(),
	concentration: doublePrecision(),
	unit: varchar({ length: 20 }),
	order_index: integer(),
}, (table) => [
	foreignKey({
			columns: [table.ingredient_flavour_id],
			foreignColumns: [flavour.flavour_id],
			name: "ingredient_flavour_ingredient_flavour_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.parent_flavour_id],
			foreignColumns: [flavour.flavour_id],
			name: "ingredient_flavour_parent_flavour_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.parent_flavour_id, table.ingredient_flavour_id], name: "ingredient_flavour_pkey"}),
	check("ingredient_flavour_unit_check", sql`(unit)::text = ANY (ARRAY[('g/kg'::character varying)::text, ('%(v/v)'::character varying)::text, ('g/L'::character varying)::text, ('mL/L'::character varying)::text, ('ppm'::character varying)::text])`),
]);
