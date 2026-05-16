import { redirect } from 'next/navigation'

// Redirect to the dashboard comunidades page which now works without auth
export default function ComunidadesRedirect() {
  redirect('/comunidades')
}
