# PostHog post-wizard report

The wizard has completed a deep integration of PostHog into your Oumamie/Flaveur Next.js application. This integration includes:

- **Client-side tracking** via `instrumentation-client.ts` (Next.js 15.3+ approach)
- **Server-side tracking** via `posthog-node` for server actions
- **Reverse proxy** configured in `next.config.ts` to avoid ad blockers
- **User identification** on sign-in and sign-up flows
- **Exception capture** for error tracking
- **30 custom events** tracking key user actions across the application

## Files Created

| File | Purpose |
|------|---------|
| `instrumentation-client.ts` | Client-side PostHog initialization |
| `src/lib/posthog-server.ts` | Server-side PostHog client |
| `src/app/[locale]/(public)/samples/SamplesPageTracker.tsx` | Client component for tracking sample page views |

## Files Modified

| File | Changes |
|------|---------|
| `.env.local` | Added `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` |
| `next.config.ts` | Added rewrites for reverse proxy and `skipTrailingSlashRedirect` |
| `src/actions/variations.ts` | Added `variation_created` and `variation_deleted` events |
| `src/actions/compliance.ts` | Added `compliance_check_run` event |
| `src/actions/job-alerts.ts` | Added `job_alert_preferences_saved` event |
| `src/actions/substances.ts` | Added `substance_search_performed` event |
| `src/actions/profile.ts` | Added `profile_updated` event |
| `src/actions/learning.ts` | Added `quiz_completed`, `study_session_created`, `study_session_completed`, `badge_earned` events |
| `src/app/[locale]/(public)/samples/page.tsx` | Added SamplesPageTracker component |
| `src/app/[locale]/components/FlavoringCalculator.tsx` | Added `calculator_used` event |

## Events Implemented

### Core Authentication & Onboarding
| Event | Description | File |
|-------|-------------|------|
| `user_signed_up` | User creates a new account via email or Google OAuth | `src/app/[locale]/(public)/auth/sign-up/page.tsx` |
| `user_signed_in` | User logs into their account via email or Google OAuth | `src/app/[locale]/(public)/auth/sign-in/page.tsx` |
| `onboarding_completed` | User completes the onboarding flow | `src/actions/onboarding.ts` |
| `onboarding_skipped` | User skips the onboarding flow | `src/actions/onboarding.ts` |

### Flavour & Formula Management
| Event | Description | File |
|-------|-------------|------|
| `flavour_created` | User creates a new flavour formula | `src/actions/flavours.ts` |
| `flavour_duplicated` | User duplicates an existing flavour | `src/actions/flavours.ts` |
| `flavour_deleted` | User deletes a flavour | `src/actions/flavours.ts` |
| `flavour_shared` | User shares a flavour with another user | `src/actions/shares.ts` |
| `share_invite_accepted` | User accepts a flavour share invitation | `src/actions/shares.ts` |
| `variation_created` | User creates a new formula variation for A/B comparison | `src/actions/variations.ts` |
| `variation_deleted` | User deletes a formula variation | `src/actions/variations.ts` |
| `compliance_check_run` | User runs EU regulatory compliance check on a formula | `src/actions/compliance.ts` |

### Workspace & Collaboration
| Event | Description | File |
|-------|-------------|------|
| `workspace_created` | User creates a new workspace for collaboration | `src/actions/workspaces.ts` |
| `workspace_member_added` | User adds a member to a workspace | `src/actions/workspaces.ts` |
| `flavour_linked_to_workspace` | User links a flavour to a workspace | `src/actions/workspaces.ts` |

### Learning & Education
| Event | Description | File |
|-------|-------------|------|
| `substance_added_to_queue` | User adds a substance to their learning queue | `src/actions/learning.ts` |
| `learning_progress_updated` | User updates their learning status for a substance | `src/actions/learning.ts` |
| `quiz_completed` | User completes a learning quiz | `src/actions/learning.ts` |
| `study_session_created` | User creates a new study session | `src/actions/learning.ts` |
| `study_session_completed` | User completes a study session | `src/actions/learning.ts` |
| `badge_earned` | User earns a learning badge | `src/actions/learning.ts` |

### Tools & Features
| Event | Description | File |
|-------|-------------|------|
| `substance_search_performed` | User searches the substance database | `src/actions/substances.ts` |
| `calculator_used` | User uses the flavoring calculator tool | `src/app/[locale]/components/FlavoringCalculator.tsx` |
| `formulation_imported` | User imports a formulation from external data | `src/actions/formulation-import.ts` |

### User Engagement
| Event | Description | File |
|-------|-------------|------|
| `profile_updated` | User updates their profile information | `src/actions/profile.ts` |
| `job_alert_preferences_saved` | User configures job alert preferences | `src/actions/job-alerts.ts` |
| `sample_flavor_viewed` | Anonymous user views sample flavors | `src/app/[locale]/(public)/samples/page.tsx` |
| `newsletter_subscribed` | User subscribes to the newsletter | `src/actions/newsletter.ts` |

### Contributions
| Event | Description | File |
|-------|-------------|------|
| `substance_submitted` | User submits a new substance to the database | `src/actions/contributions.ts` |
| `feedback_submitted` | User submits feedback on an existing substance | `src/actions/contributions.ts` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

### Dashboard
- [Analytics basics](https://eu.posthog.com/project/122365/dashboard/509815) - Core analytics dashboard tracking key user events

### Insights
- [Formula Variations Created](https://eu.posthog.com/project/122365/insights/bdImZPXy) - Track formula variation creation activity
- [Learning Engagement Funnel](https://eu.posthog.com/project/122365/insights/GxCA279k) - Quiz → Study Session → Badge earned funnel
- [Compliance Check Usage](https://eu.posthog.com/project/122365/insights/TVnPjBMI) - Track EU regulatory compliance checks
- [Substance Search Activity](https://eu.posthog.com/project/122365/insights/0zEhF3CH) - Track database search patterns
- [Sample Page to Signup Funnel](https://eu.posthog.com/project/122365/insights/w3WixlQE) - Track conversion from anonymous viewing to signup

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/posthog-nextjs-app-router/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

## Environment Variables

Make sure these are set in your production environment (Vercel, etc.):

```bash
NEXT_PUBLIC_POSTHOG_KEY=phc_5EO7VxRt8eLj1tVx13uzNAR2GdoEeGgM01HhrN0EhQg
NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com
```
