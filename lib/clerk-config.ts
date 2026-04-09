export function isClerkPublishableKeyValid(key: string | undefined): boolean {
  const value = (key ?? '').trim()
  if (!/^(pk_test|pk_live)_/i.test(value)) return false

  const lower = value.toLowerCase()
  // Reject obvious placeholders and template values.
  if (
    lower.includes('replace_with') ||
    lower.includes('your_') ||
    /^(pk_test|pk_live)_x{8,}$/i.test(value)
  ) {
    return false
  }

  // Clerk keys can include URL-safe chars and separators.
  return /^(pk_test|pk_live)_[A-Za-z0-9._$-]+$/.test(value)
}

export const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
export const clerkEnabled = isClerkPublishableKeyValid(clerkPublishableKey)
