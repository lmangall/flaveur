# Product Improvements Roadmap

## Feature Gaps

### 1. Community Discovery Page (`/community`) - HIGH - DONE
- **Status:** COMPLETED - Route created at `/community` with full filter support
- **Impact:** Users can now browse other users' public formulas
- **Implemented:**
  - Page: `src/app/[locale]/(app)/community/page.tsx`
  - Enhanced action: `getCommunityFlavors()` with category, projectType, and search filters
  - Translations added to both `en.json` and `fr.json` (Community namespace)
  - Sidebar link added to app navigation

### 2. Workspace Invite Emails - HIGH - DONE
- **Status:** COMPLETED - Email notification system implemented
- **Impact:** Invitees now receive email notifications when invited to workspaces
- **Implemented:**
  - Email function: `sendWorkspaceInviteEmail()` in `src/lib/email/resend.ts`
  - Server action: Updated `addWorkspaceMember()` in `src/actions/workspaces.ts`
  - Invite page: `src/app/[locale]/(app)/invite/workspace/page.tsx`
  - Translations: Added `WorkspaceInvite` namespace to both `en.json` and `fr.json`

### 3. "Favorites" Semantic Confusion - MEDIUM
- **Status:** `getFavoriteFlavors()` actually filters by `status = 'published'`
- **Impact:** Users see "Published" formulas labeled as "Favorites" on dashboard
- **Action:** Either rename to "Published" or add a real favorites/bookmarking system

### 4. Indeed & LinkedIn Extractors - LOW
- **Status:** Defined in constants but not implemented
- **Impact:** Job monitoring limited to HelloWork
- **Action:** Implement extractors in `src/lib/job-monitors/extractors/`

### 5. Possibly Abandoned Features - LOW
- `job_social_posts` table & admin page - unclear if used
- `snippets` admin feature - purpose unclear
- **Action:** Audit usage, remove or complete

---

## UX Improvements

### 6. Dashboard Enhancements - HIGH
- **Current:** Stats cards + recent flavors + learning progress
- **Missing:**
  - Activity feed (recent actions across the platform)
  - Quick action buttons (new formula, add substance, start learning)
  - Charts/trends over time (formulas created, substances learned)
  - Personalized insights ("You haven't studied in 3 days")
- **Files:** `src/app/[locale]/(app)/dashboard/`

### 7. Onboarding Improvements - MEDIUM
- **Current:** 5-step dialog after signup
- **Missing:**
  - Contextual tooltips on first visit to each feature
  - "Getting started" checklist on dashboard (create first formula, add substance, etc.)
  - Sample formula auto-created for new users to explore
- **Files:** `src/app/[locale]/components/onboarding/`

---

## UI Polish

### 8. Image Loading - LOW
- **Missing:** Blur placeholders (`blurDataURL`) for Next/Image
- **Impact:** Perceived performance on slow connections
- **Action:** Add placeholder blur to key images

### 9. i18n Test Coverage - MEDIUM
- **Risk:** Namespace/key mismatches have caused past bugs (raw keys leaking in UI)
- **Action:** Add automated test to verify all `t()` calls have matching keys in both locale files
- **Files:** `src/locales/en.json`, `src/locales/fr.json`

### 10. Duplicate Component Directories - LOW
- Both `src/app/components/ui/` and `src/app/[locale]/components/ui/` exist with overlap
- **Action:** Consolidate to single directory

---

## Growth & Engagement

### 11. Formula Sharing Improvements - LOW
- Two separate systems: `formula_shares` and `formula_invites`
- **Action:** Consider consolidating or clarifying the UX difference

### 12. Export/PDF Generation - MEDIUM
- Flavorists often need to share formulas as PDFs with clients
- **Action:** Add "Export as PDF" for formula detail pages

---

## Priority Ranking

| Priority | Item | Effort | Impact | Status |
|----------|------|--------|--------|--------|
| P0 | Community page | Medium | High | DONE |
| P0 | Workspace invite emails | Small | High | DONE |
| P1 | Dashboard enhancements | Medium | Medium |
| P1 | i18n test coverage | Small | Medium |
| P1 | Favorites vs Published fix | Small | Medium |
| P1 | PDF export | Medium | Medium |
| P2 | Onboarding improvements | Medium | Medium |
| P3 | Blur image placeholders | Small | Low |
| P3 | Duplicate component cleanup | Small | Low |
| P3 | Indeed/LinkedIn extractors | Large | Low |
| P3 | Abandoned feature cleanup | Small | Low |

---

## Suggested First Sprint

1. ~~**Community page** - Leverage existing `getCommunityFlavors()` action~~ - DONE
2. ~~**Workspace invite emails** - Follow existing Resend pattern~~ - DONE
3. **i18n key validation script** - Prevent translation bugs
4. **Rename "Favorites" to "Published"** on dashboard
