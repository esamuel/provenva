export function isClerkPublishableKeyValid(key: string | undefined): boolean {
  return (
    typeof key === 'string' &&
    key.startsWith('pk_') &&
    !key.includes('xxxx')
  )
}

export const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
export const clerkEnabled = isClerkPublishableKeyValid(clerkPublishableKey)
