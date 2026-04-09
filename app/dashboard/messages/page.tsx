// app/dashboard/messages/page.tsx — route hub → business or VA inbox
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import { isAdminUserId } from '@/lib/admin'

export default async function MessagesHubPage() {
  const { userId } = auth()
  if (!userId) redirect('/sign-in')
  if (isAdminUserId(userId)) redirect('/admin')

  const [{ data: business }, { data: va }] = await Promise.all([
    supabaseAdmin.from('businesses').select('id').eq('clerk_user_id', userId).maybeSingle(),
    supabaseAdmin.from('vas').select('id').eq('clerk_user_id', userId).maybeSingle(),
  ])

  if (business) redirect('/dashboard/business/messages')
  if (va) redirect('/dashboard/va/messages')
  redirect('/onboarding')
}
