import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'
import { canBusinessMessage } from '@/lib/messaging'
import ContactVAActions, { type ContactVariant } from '@/components/ContactVAActions'
import type { Business } from '@/types'

export default async function ContactSection({ vaId }: { vaId: string }) {
  const { userId } = auth()

  if (!userId) {
    return <ContactVAActions kind="signed_out" vaId={vaId} />
  }

  const [{ data: business }, { data: asVa }] = await Promise.all([
    supabaseAdmin.from('businesses').select('*').eq('clerk_user_id', userId).maybeSingle(),
    supabaseAdmin.from('vas').select('id').eq('clerk_user_id', userId).maybeSingle(),
  ]) as [{ data: Business | null }, { data: { id: string } | null }]

  let variant: ContactVariant

  if (business) {
    if (!canBusinessMessage(business)) {
      variant = { kind: 'no_plan' }
    } else {
      const { data: conv } = await supabaseAdmin
        .from('conversations')
        .select('id')
        .eq('business_id', business.id)
        .eq('va_id', vaId)
        .maybeSingle()

      variant = conv?.id
        ? { kind: 'open_thread', conversationId: conv.id as string }
        : { kind: 'compose', vaId }
    }
  } else if (asVa) {
    variant = { kind: 'va_account' }
  } else {
    variant = { kind: 'needs_onboarding' }
  }

  return <ContactVAActions {...variant} />
}
