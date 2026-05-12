'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import toast from 'react-hot-toast'
import { Mail, ArrowLeft } from 'lucide-react'

export default function RecuperarPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const supabase = createClient()

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/nueva-password`,
    })
    if (error) { toast.error(error.message); setLoading(false); return }
    setSent(true)
    toast.success('Email enviado. Revisa tu bandeja de entrada.')
  }

  if (sent) return (
    <div className="animate-fadeIn text-center">
      <div className="w-16 h-16 rounded-full bg-ec-success/20 flex items-center justify-center mx-auto mb-6">
        <Mail size={28} className="text-ec-success" />
      </div>
      <h1 className="font-display text-2xl font-bold mb-2">¡Email enviado!</h1>
      <p className="text-ec-muted mb-6">Revisa tu bandeja de entrada y sigue el enlace para restablecer tu contraseña.</p>
      <Link href="/login"><Button variant="secondary" className="w-full">Volver al inicio de sesión</Button></Link>
    </div>
  )

  return (
    <div className="animate-fadeIn">
      <Link href="/login" className="flex items-center gap-2 text-ec-muted hover:text-ec-text mb-8 text-sm transition-colors">
        <ArrowLeft size={16} /> Volver
      </Link>
      <h1 className="font-display text-3xl font-bold text-ec-text mb-2">Recuperar cuenta 🔐</h1>
      <p className="text-ec-muted mb-8">Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.</p>
      <form onSubmit={handleReset} className="flex flex-col gap-4">
        <Input label="Email" type="email" placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} icon={<Mail size={16} />} required />
        <Button type="submit" loading={loading} size="lg" className="w-full mt-2">Enviar enlace de recuperación</Button>
      </form>
    </div>
  )
}
