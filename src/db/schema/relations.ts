import { relations } from "drizzle-orm/relations";
import { category } from "./misc";
import { job_offers, job_offer_interactions } from "./jobs";
import { users, user_profile, user_social_link } from "./user";
import { workspace, workspace_member, workspace_invite, workspace_document, workspace_formula } from "./workspace";
import { formula, formula_shares, formula_invites, variation_group, ingredient_formula, substance_formula } from "./formula";
import { substance, substance_functional_group, functional_group } from "./substance";
import { user_learning_queue, substance_learning_progress, learning_streak, learning_review, learning_quiz_attempt, learning_session, learning_session_substance } from "./learning";
import { support_conversation, support_message } from "./support";
import { job_search_monitors, monitored_listings } from "./job-monitors";
import { referral } from "./referral";

export const categoryRelations = relations(category, ({one, many}) => ({
	category: one(category, {
		fields: [category.parent_category_id],
		references: [category.category_id],
		relationName: "category_parent_category_id_category_category_id"
	}),
	categories: many(category, {
		relationName: "category_parent_category_id_category_category_id"
	}),
	formulas: many(formula),
}));

export const job_offer_interactionsRelations = relations(job_offer_interactions, ({one}) => ({
	job_offer: one(job_offers, {
		fields: [job_offer_interactions.job_offer_id],
		references: [job_offers.id]
	}),
	user: one(users, {
		fields: [job_offer_interactions.user_id],
		references: [users.id]
	}),
}));

export const job_offersRelations = relations(job_offers, ({many}) => ({
	job_offer_interactions: many(job_offer_interactions),
}));

export const usersRelations = relations(users, ({many}) => ({
	job_offer_interactions: many(job_offer_interactions),
	workspaces: many(workspace),
	workspace_members: many(workspace_member),
	workspace_invites: many(workspace_invite),
	formula_shares_shared_with_user_id: many(formula_shares, {
		relationName: "formula_shares_shared_with_user_id_users_user_id"
	}),
	formula_shares_shared_by_user_id: many(formula_shares, {
		relationName: "formula_shares_shared_by_user_id_users_user_id"
	}),
	formula_invites: many(formula_invites),
	workspace_documents: many(workspace_document),
	user_learning_queues: many(user_learning_queue),
	substance_learning_progresses: many(substance_learning_progress),
	learning_streaks: many(learning_streak),
	learning_reviews: many(learning_review),
	learning_quiz_attempts: many(learning_quiz_attempt),
	learning_sessions: many(learning_session),
	variation_groups: many(variation_group),
	formulas: many(formula),
	user_social_links: many(user_social_link),
	support_messages: many(support_message),
	user_profiles: many(user_profile),
	support_conversations: many(support_conversation),
	referrals_referrer_id: many(referral, {
		relationName: "referral_referrer_id_users_user_id"
	}),
	referrals_referred_user_id: many(referral, {
		relationName: "referral_referred_user_id_users_user_id"
	}),
	workspace_formulas: many(workspace_formula),
}));

export const workspaceRelations = relations(workspace, ({one, many}) => ({
	user: one(users, {
		fields: [workspace.created_by],
		references: [users.id]
	}),
	workspace_members: many(workspace_member),
	workspace_invites: many(workspace_invite),
	workspace_documents: many(workspace_document),
	workspace_formulas: many(workspace_formula),
}));

export const workspace_memberRelations = relations(workspace_member, ({one}) => ({
	workspace: one(workspace, {
		fields: [workspace_member.workspace_id],
		references: [workspace.workspace_id]
	}),
	user: one(users, {
		fields: [workspace_member.user_id],
		references: [users.id]
	}),
}));

export const workspace_inviteRelations = relations(workspace_invite, ({one}) => ({
	workspace: one(workspace, {
		fields: [workspace_invite.workspace_id],
		references: [workspace.workspace_id]
	}),
	user: one(users, {
		fields: [workspace_invite.invited_by_user_id],
		references: [users.id]
	}),
}));

export const formula_sharesRelations = relations(formula_shares, ({one}) => ({
	formula: one(formula, {
		fields: [formula_shares.formula_id],
		references: [formula.formula_id]
	}),
	user_shared_with_user_id: one(users, {
		fields: [formula_shares.shared_with_user_id],
		references: [users.id],
		relationName: "formula_shares_shared_with_user_id_users_user_id"
	}),
	user_shared_by_user_id: one(users, {
		fields: [formula_shares.shared_by_user_id],
		references: [users.id],
		relationName: "formula_shares_shared_by_user_id_users_user_id"
	}),
}));

export const formulaRelations = relations(formula, ({one, many}) => ({
	formula_shares: many(formula_shares),
	formula_invites: many(formula_invites),
	category: one(category, {
		fields: [formula.category_id],
		references: [category.category_id]
	}),
	user: one(users, {
		fields: [formula.user_id],
		references: [users.id]
	}),
	variation_group: one(variation_group, {
		fields: [formula.variation_group_id],
		references: [variation_group.group_id]
	}),
	workspace_formulas: many(workspace_formula),
	ingredient_formulas_ingredient_formula_id: many(ingredient_formula, {
		relationName: "ingredient_formula_ingredient_formula_id_formula_formula_id"
	}),
	ingredient_formulas_parent_formula_id: many(ingredient_formula, {
		relationName: "ingredient_formula_parent_formula_id_formula_formula_id"
	}),
	substance_formulas: many(substance_formula),
}));

export const formula_invitesRelations = relations(formula_invites, ({one}) => ({
	formula: one(formula, {
		fields: [formula_invites.formula_id],
		references: [formula.formula_id]
	}),
	user: one(users, {
		fields: [formula_invites.invited_by_user_id],
		references: [users.id]
	}),
}));

export const workspace_documentRelations = relations(workspace_document, ({one}) => ({
	workspace: one(workspace, {
		fields: [workspace_document.workspace_id],
		references: [workspace.workspace_id]
	}),
	user: one(users, {
		fields: [workspace_document.created_by],
		references: [users.id]
	}),
}));

export const user_learning_queueRelations = relations(user_learning_queue, ({one}) => ({
	user: one(users, {
		fields: [user_learning_queue.user_id],
		references: [users.id]
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
	substance_formulas: many(substance_formula),
}));

export const substance_learning_progressRelations = relations(substance_learning_progress, ({one}) => ({
	user: one(users, {
		fields: [substance_learning_progress.user_id],
		references: [users.id]
	}),
	substance: one(substance, {
		fields: [substance_learning_progress.substance_id],
		references: [substance.substance_id]
	}),
}));

export const learning_streakRelations = relations(learning_streak, ({one}) => ({
	user: one(users, {
		fields: [learning_streak.user_id],
		references: [users.id]
	}),
}));

export const learning_reviewRelations = relations(learning_review, ({one}) => ({
	user: one(users, {
		fields: [learning_review.user_id],
		references: [users.id]
	}),
	substance: one(substance, {
		fields: [learning_review.substance_id],
		references: [substance.substance_id]
	}),
}));

export const learning_quiz_attemptRelations = relations(learning_quiz_attempt, ({one}) => ({
	user: one(users, {
		fields: [learning_quiz_attempt.user_id],
		references: [users.id]
	}),
	substance: one(substance, {
		fields: [learning_quiz_attempt.substance_id],
		references: [substance.substance_id]
	}),
}));

export const learning_sessionRelations = relations(learning_session, ({one, many}) => ({
	user: one(users, {
		fields: [learning_session.user_id],
		references: [users.id]
	}),
	learning_session_substances: many(learning_session_substance),
}));

export const variation_groupRelations = relations(variation_group, ({one, many}) => ({
	user: one(users, {
		fields: [variation_group.user_id],
		references: [users.id]
	}),
	formulas: many(formula),
}));

export const user_social_linkRelations = relations(user_social_link, ({one}) => ({
	user: one(users, {
		fields: [user_social_link.user_id],
		references: [users.id]
	}),
}));

export const support_messageRelations = relations(support_message, ({one}) => ({
	support_conversation: one(support_conversation, {
		fields: [support_message.conversation_id],
		references: [support_conversation.conversation_id]
	}),
	user: one(users, {
		fields: [support_message.sender_user_id],
		references: [users.id]
	}),
}));

export const support_conversationRelations = relations(support_conversation, ({one, many}) => ({
	support_messages: many(support_message),
	user: one(users, {
		fields: [support_conversation.user_id],
		references: [users.id]
	}),
}));

export const user_profileRelations = relations(user_profile, ({one}) => ({
	user: one(users, {
		fields: [user_profile.user_id],
		references: [users.id]
	}),
}));

export const monitored_listingsRelations = relations(monitored_listings, ({one}) => ({
	job_search_monitor: one(job_search_monitors, {
		fields: [monitored_listings.monitor_id],
		references: [job_search_monitors.id]
	}),
}));

export const job_search_monitorsRelations = relations(job_search_monitors, ({many}) => ({
	monitored_listings: many(monitored_listings),
}));

export const referralRelations = relations(referral, ({one}) => ({
	user_referrer_id: one(users, {
		fields: [referral.referrer_id],
		references: [users.id],
		relationName: "referral_referrer_id_users_user_id"
	}),
	user_referred_user_id: one(users, {
		fields: [referral.referred_user_id],
		references: [users.id],
		relationName: "referral_referred_user_id_users_user_id"
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

export const workspace_formulaRelations = relations(workspace_formula, ({one}) => ({
	workspace: one(workspace, {
		fields: [workspace_formula.workspace_id],
		references: [workspace.workspace_id]
	}),
	formula: one(formula, {
		fields: [workspace_formula.formula_id],
		references: [formula.formula_id]
	}),
	user: one(users, {
		fields: [workspace_formula.added_by],
		references: [users.id]
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

export const ingredient_formulaRelations = relations(ingredient_formula, ({one}) => ({
	formula_ingredient_formula_id: one(formula, {
		fields: [ingredient_formula.ingredient_formula_id],
		references: [formula.formula_id],
		relationName: "ingredient_formula_ingredient_formula_id_formula_formula_id"
	}),
	formula_parent_formula_id: one(formula, {
		fields: [ingredient_formula.parent_formula_id],
		references: [formula.formula_id],
		relationName: "ingredient_formula_parent_formula_id_formula_formula_id"
	}),
}));

export const substance_formulaRelations = relations(substance_formula, ({one}) => ({
	formula: one(formula, {
		fields: [substance_formula.formula_id],
		references: [formula.formula_id]
	}),
	substance: one(substance, {
		fields: [substance_formula.substance_id],
		references: [substance.substance_id]
	}),
}));
