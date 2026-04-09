export function getAdminUserIds(): string[] {
  const raw = process.env.APP_ADMIN_CLERK_USER_IDS ?? ''
  return raw
    .split(',')
    .map((v) => v.trim())
    .filter((v) => Boolean(v) && v !== 'user_abc123yourclerkid')
}

export function allowAllAuthedAsAdmin(): boolean {
  return (process.env.APP_ADMIN_ALLOW_ALL ?? '').trim().toLowerCase() === 'true'
}

export function isAdminUserId(userId: string | null | undefined): boolean {
  if (!userId) return false
  if (allowAllAuthedAsAdmin()) return true
  return getAdminUserIds().includes(userId)
}
