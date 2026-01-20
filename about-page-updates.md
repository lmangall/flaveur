# About Page Updates

## Changes Made

1. **Redesigned layout** - Changed from table to card-based grid
2. **Added icons** - Each feature now has a visual icon (Database, Search, FlaskConical, etc.)
3. **Added navigation links** - "Try it" buttons linking to implemented features:
   - Substances → `/substances`
   - Flavor Creation → `/flavours`
   - Job Board → `/jobs`
   - Calculator → `/calculator`
4. **Fixed badge visibility** - Status badges now use solid colors (`bg-green-500`, `bg-amber-500`) with white text

## Files Modified

- `src/app/[locale]/about/page.tsx`
- `src/locales/en.json` (added `tryIt` key)
- `src/locales/fr.json` (added `tryIt` key)

## Commits

- `feat: improve about page with feature cards and navigation links`
- `fix: improve visibility of status badges on about page`
