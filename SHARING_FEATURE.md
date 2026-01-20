# Flavor Sharing Feature

## Overview
Share flavors via email invitation. If recipient isn't a user yet, they receive an invite email to join the platform. When they sign up, they automatically get access to the shared flavor.

## Flow

```
Owner shares flavor with email@example.com
    ↓
Email exists in users table?
    ├── YES → Create direct share (flavour_shares) + notify recipient + notify admin
    └── NO  → Create invite (flavour_invites) + send invite email + notify admin
                    ↓
              Recipient clicks "View Flavor" in email
                    ↓
              Not logged in? → Redirect to sign-up
                    ↓
              Clerk webhook fires on user.created
                    ↓
              Convert pending invites → actual shares
                    ↓
              User sees flavor in "Shared with me" tab
```

## Database Tables

### `flavour_shares` - Direct shares for existing users
- `share_id`, `flavour_id`, `shared_with_user_id`, `shared_by_user_id`, `created_at`

### `flavour_invites` - Pending invites for non-users
- `invite_id`, `flavour_id`, `invited_email`, `invited_by_user_id`, `invite_token`, `status`, `created_at`, `accepted_at`

## Key Files

| File | Purpose |
|------|---------|
| `src/actions/shares.ts` | Server actions: shareFlavour, getFlavourShares, revokeShare, acceptInvite, convertPendingInvites |
| `src/actions/flavours.ts` | Updated getFlavourById to check shared access |
| `src/lib/email/resend.ts` | Email templates: invite, share notification, admin notification |
| `src/app/[locale]/invite/page.tsx` | Accept invite page |
| `src/app/[locale]/components/share-flavour-dialog.tsx` | Share UI dialog |
| `src/app/[locale]/flavours/[id]/page.tsx` | Share button + read-only mode for shared flavors |
| `src/app/[locale]/dashboard/page.tsx` | "Shared with me" tab |
| `src/app/[locale]/admin/page.tsx` | Sharing stats + pending invites table |

## Admin Features

- **Sharing Stats Cards**: Active shares count, pending invites count
- **Pending Invites Table**: Shows invited email, flavor name, inviter, date
- **Email Notifications**: Admin receives email for every share/invite action

## Access Control

- **Owner**: Full edit, delete, share, duplicate
- **Shared user**: View only, can duplicate to own flavors
- **No access**: 403 error
