import { relations } from "drizzle-orm/relations";
import { category, flavour, users, job_offers, job_offer_interactions, workspace, workspace_member, workspace_invite, flavour_shares, flavour_invites, workspace_document, user_learning_queue, substance, substance_learning_progress, learning_streak, learning_review, learning_quiz_attempt, learning_session, user_badge, substance_functional_group, functional_group, workspace_flavour, learning_session_substance, substance_flavour, ingredient_flavour } from "./schema";

export const flavourRelations = relations(flavour, ({one, many}) => ({
	category: one(category, {
		fields: [flavour.category_id],
		references: [category.category_id]
	}),
	user: one(users, {
		fields: [flavour.user_id],
		references: [users.user_id]
	}),
	flavour_shares: many(flavour_shares),
	flavour_invites: many(flavour_invites),
	workspace_flavours: many(workspace_flavour),
	substance_flavours: many(substance_flavour),
	ingredient_flavours_ingredient_flavour_id: many(ingredient_flavour, {
		relationName: "ingredient_flavour_ingredient_flavour_id_flavour_flavour_id"
	}),
	ingredient_flavours_parent_flavour_id: many(ingredient_flavour, {
		relationName: "ingredient_flavour_parent_flavour_id_flavour_flavour_id"
	}),
}));

export const categoryRelations = relations(category, ({one, many}) => ({
	flavours: many(flavour),
	category: one(category, {
		fields: [category.parent_category_id],
		references: [category.category_id],
		relationName: "category_parent_category_id_category_category_id"
	}),
	categories: many(category, {
		relationName: "category_parent_category_id_category_category_id"
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	flavours: many(flavour),
	job_offer_interactions: many(job_offer_interactions),
	workspaces: many(workspace),
	workspace_members: many(workspace_member),
	workspace_invites: many(workspace_invite),
	flavour_shares_shared_with_user_id: many(flavour_shares, {
		relationName: "flavour_shares_shared_with_user_id_users_user_id"
	}),
	flavour_shares_shared_by_user_id: many(flavour_shares, {
		relationName: "flavour_shares_shared_by_user_id_users_user_id"
	}),
	flavour_invites: many(flavour_invites),
	workspace_documents: many(workspace_document),
	user_learning_queues: many(user_learning_queue),
	substance_learning_progresses: many(substance_learning_progress),
	learning_streaks: many(learning_streak),
	learning_reviews: many(learning_review),
	learning_quiz_attempts: many(learning_quiz_attempt),
	learning_sessions: many(learning_session),
	user_badges: many(user_badge),
	workspace_flavours: many(workspace_flavour),
}));

export const job_offer_interactionsRelations = relations(job_offer_interactions, ({one}) => ({
	job_offer: one(job_offers, {
		fields: [job_offer_interactions.job_offer_id],
		references: [job_offers.id]
	}),
	user: one(users, {
		fields: [job_offer_interactions.user_id],
		references: [users.user_id]
	}),
}));

export const job_offersRelations = relations(job_offers, ({many}) => ({
	job_offer_interactions: many(job_offer_interactions),
}));

export const workspaceRelations = relations(workspace, ({one, many}) => ({
	user: one(users, {
		fields: [workspace.created_by],
		references: [users.user_id]
	}),
	workspace_members: many(workspace_member),
	workspace_invites: many(workspace_invite),
	workspace_documents: many(workspace_document),
	workspace_flavours: many(workspace_flavour),
}));

export const workspace_memberRelations = relations(workspace_member, ({one}) => ({
	workspace: one(workspace, {
		fields: [workspace_member.workspace_id],
		references: [workspace.workspace_id]
	}),
	user: one(users, {
		fields: [workspace_member.user_id],
		references: [users.user_id]
	}),
}));

export const workspace_inviteRelations = relations(workspace_invite, ({one}) => ({
	workspace: one(workspace, {
		fields: [workspace_invite.workspace_id],
		references: [workspace.workspace_id]
	}),
	user: one(users, {
		fields: [workspace_invite.invited_by_user_id],
		references: [users.user_id]
	}),
}));

export const flavour_sharesRelations = relations(flavour_shares, ({one}) => ({
	flavour: one(flavour, {
		fields: [flavour_shares.flavour_id],
		references: [flavour.flavour_id]
	}),
	user_shared_with_user_id: one(users, {
		fields: [flavour_shares.shared_with_user_id],
		references: [users.user_id],
		relationName: "flavour_shares_shared_with_user_id_users_user_id"
	}),
	user_shared_by_user_id: one(users, {
		fields: [flavour_shares.shared_by_user_id],
		references: [users.user_id],
		relationName: "flavour_shares_shared_by_user_id_users_user_id"
	}),
}));

export const flavour_invitesRelations = relations(flavour_invites, ({one}) => ({
	flavour: one(flavour, {
		fields: [flavour_invites.flavour_id],
		references: [flavour.flavour_id]
	}),
	user: one(users, {
		fields: [flavour_invites.invited_by_user_id],
		references: [users.user_id]
	}),
}));

export const workspace_documentRelations = relations(workspace_document, ({one}) => ({
	workspace: one(workspace, {
		fields: [workspace_document.workspace_id],
		references: [workspace.workspace_id]
	}),
	user: one(users, {
		fields: [workspace_document.created_by],
		references: [users.user_id]
	}),
}));

export const user_learning_queueRelations = relations(user_learning_queue, ({one}) => ({
	user: one(users, {
		fields: [user_learning_queue.user_id],
		references: [users.user_id]
	}),
	substance: one(substance, {
		fields: [user_learning_queue.substance_id],
		references: [substance.substance_id]
	}),
}));

export const substanceRelations = relations(substance, ({many}) => ({
	user_learning_queues: many(user_learning_queue),
	substance_learning_progresses: many(substance_learning_progress),
	learning_reviews: many(learning_review),
	learning_quiz_attempts: many(learning_quiz_attempt),
	substance_functional_groups: many(substance_functional_group),
	learning_session_substances: many(learning_session_substance),
	substance_flavours: many(substance_flavour),
}));

export const substance_learning_progressRelations = relations(substance_learning_progress, ({one}) => ({
	user: one(users, {
		fields: [substance_learning_progress.user_id],
		references: [users.user_id]
	}),
	substance: one(substance, {
		fields: [substance_learning_progress.substance_id],
		references: [substance.substance_id]
	}),
}));

export const learning_streakRelations = relations(learning_streak, ({one}) => ({
	user: one(users, {
		fields: [learning_streak.user_id],
		references: [users.user_id]
	}),
}));

export const learning_reviewRelations = relations(learning_review, ({one}) => ({
	user: one(users, {
		fields: [learning_review.user_id],
		references: [users.user_id]
	}),
	substance: one(substance, {
		fields: [learning_review.substance_id],
		references: [substance.substance_id]
	}),
}));

export const learning_quiz_attemptRelations = relations(learning_quiz_attempt, ({one}) => ({
	user: one(users, {
		fields: [learning_quiz_attempt.user_id],
		references: [users.user_id]
	}),
	substance: one(substance, {
		fields: [learning_quiz_attempt.substance_id],
		references: [substance.substance_id]
	}),
}));

export const learning_sessionRelations = relations(learning_session, ({one, many}) => ({
	user: one(users, {
		fields: [learning_session.user_id],
		references: [users.user_id]
	}),
	learning_session_substances: many(learning_session_substance),
}));

export const user_badgeRelations = relations(user_badge, ({one}) => ({
	user: one(users, {
		fields: [user_badge.user_id],
		references: [users.user_id]
	}),
}));

export const substance_functional_groupRelations = relations(substance_functional_group, ({one}) => ({
	substance: one(substance, {
		fields: [substance_functional_group.substance_id],
		references: [substance.substance_id]
	}),
	functional_group: one(functional_group, {
		fields: [substance_functional_group.functional_group_id],
		references: [functional_group.functional_group_id]
	}),
}));

export const functional_groupRelations = relations(functional_group, ({many}) => ({
	substance_functional_groups: many(substance_functional_group),
}));

export const workspace_flavourRelations = relations(workspace_flavour, ({one}) => ({
	workspace: one(workspace, {
		fields: [workspace_flavour.workspace_id],
		references: [workspace.workspace_id]
	}),
	flavour: one(flavour, {
		fields: [workspace_flavour.flavour_id],
		references: [flavour.flavour_id]
	}),
	user: one(users, {
		fields: [workspace_flavour.added_by],
		references: [users.user_id]
	}),
}));

export const learning_session_substanceRelations = relations(learning_session_substance, ({one}) => ({
	learning_session: one(learning_session, {
		fields: [learning_session_substance.session_id],
		references: [learning_session.session_id]
	}),
	substance: one(substance, {
		fields: [learning_session_substance.substance_id],
		references: [substance.substance_id]
	}),
}));

export const substance_flavourRelations = relations(substance_flavour, ({one}) => ({
	flavour: one(flavour, {
		fields: [substance_flavour.flavour_id],
		references: [flavour.flavour_id]
	}),
	substance: one(substance, {
		fields: [substance_flavour.substance_id],
		references: [substance.substance_id]
	}),
}));

export const ingredient_flavourRelations = relations(ingredient_flavour, ({one}) => ({
	flavour_ingredient_flavour_id: one(flavour, {
		fields: [ingredient_flavour.ingredient_flavour_id],
		references: [flavour.flavour_id],
		relationName: "ingredient_flavour_ingredient_flavour_id_flavour_flavour_id"
	}),
	flavour_parent_flavour_id: one(flavour, {
		fields: [ingredient_flavour.parent_flavour_id],
		references: [flavour.flavour_id],
		relationName: "ingredient_flavour_parent_flavour_id_flavour_flavour_id"
	}),
}));