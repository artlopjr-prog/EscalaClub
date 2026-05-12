import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// This route now redirects to the main course page with lesson param
export default async function AprenderPage({ params, searchParams }: { 
  params: Promise<{ id: string }>
  searchParams: Promise<{ lesson?: string }>
}) {
  const { id } = await params
  const { lesson } = await searchParams
  redirect(`/cursos/${id}${lesson ? `?lesson=${lesson}` : ''}`)
}
