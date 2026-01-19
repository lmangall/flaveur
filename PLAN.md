# Phase 2 Plan

## 2.0 Deploy Phase 1
- Push commits to remote
- Run newsletter migration on database
- Add RESEND_API_KEY to environment

## 2.1 Job Detail Page
- Polish `/jobs/[id]` page layout
- Show full description, requirements, salary
- Display contact person info (reveal on click, track interaction)
- Add "Apply" button with external link tracking
- Back to listings navigation

## 2.2 Flavour Detail View
- Improve `/flavours/[id]` page
- Show substances list with concentrations
- Display radar chart for flavor profile
- Add edit/duplicate/delete actions
- Show category and status badges

## 2.3 User Settings Page ✅
- Create `/settings` route
- Email preferences (newsletter opt-in/out)
- Display name and profile info from Clerk
- Language preference
- Theme toggle (light/dark)

## 2.4 Error Boundaries ✅
- Global error boundary component
- Page-level error boundaries
- Graceful fallback UI
- Error logging

## 2.5 Loading States ✅
- React Suspense for data fetching
- Skeleton components for all pages
- Optimistic UI updates for mutations
- Toast notifications for async actions

## 2.6 Job Notifications ✅
- User can set job alert criteria (location, type, level)
- Store preferences in database
- Email when new jobs match criteria
- Unsubscribe from alerts
