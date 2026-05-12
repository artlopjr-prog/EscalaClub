'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, X, Image, Loader } from 'lucide-react'

interface Props {
  bucket: 'avatars' | 'community-media' | 'community-assets'
  folder: string
  onUpload: (url: string) => void
  currentUrl?: string
  accept?: string
  maxMB?: number
  label?: string
  rounded?: boolean
}

export default function ImageUpload({ bucket, folder, onUpload, currentUrl, accept = 'image/*', maxMB = 5, label = 'Subir imagen', rounded = false }: Props) {
  const supabase = createClient()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(currentUrl ?? '')
  const [error, setError] = useState('')

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')

    if (file.size > maxMB * 1024 * 1024) {
      setError(`El archivo es muy grande. Máximo ${maxMB}MB.`)
      return
    }

    setUploading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('No autenticado'); setUploading(false); return }

    const ext = file.name.split('.').pop()
    const path = `${user.id}/${folder}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
    if (uploadError) { setError('Error al subir: ' + uploadError.message); setUploading(false); return }

    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path)
    setPreview(publicUrl)
    onUpload(publicUrl)
    setUploading(false)
  }

  return (
    <div>
      <input ref={inputRef} type="file" accept={accept} onChange={handleFile} style={{ display: 'none' }} />

      {preview ? (
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <img src={preview} alt="" style={{
            width: rounded ? 80 : '100%', height: rounded ? 80 : 160,
            objectFit: 'cover', borderRadius: rounded ? '50%' : 12,
            border: '1px solid rgba(255,255,255,0.07)',
          }} />
          <button onClick={() => { setPreview(''); onUpload('') }} style={{
            position: 'absolute', top: -8, right: -8, width: 24, height: 24,
            borderRadius: '50%', background: '#FF4D6A', border: '2px solid #06060A',
            color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <X size={12} />
          </button>
          <button onClick={() => inputRef.current?.click()} style={{
            position: 'absolute', bottom: 6, right: 6, padding: '4px 10px',
            borderRadius: 8, background: 'rgba(0,0,0,0.7)', color: '#fff',
            border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700,
          }}>
            Cambiar
          </button>
        </div>
      ) : (
        <button onClick={() => inputRef.current?.click()} disabled={uploading} style={{
          display: 'flex', flexDirection: rounded ? 'column' : 'row', alignItems: 'center', justifyContent: 'center',
          gap: 8, padding: rounded ? 0 : '12px 18px',
          width: rounded ? 80 : '100%', height: rounded ? 80 : 'auto',
          borderRadius: rounded ? '50%' : 12,
          background: 'rgba(124,58,237,0.08)', border: '2px dashed rgba(124,58,237,0.3)',
          color: '#9F67FF', cursor: uploading ? 'not-allowed' : 'pointer',
          fontSize: 13, fontWeight: 600, transition: 'all 0.2s',
        }}>
          {uploading ? <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Upload size={18} />}
          {!rounded && <span>{uploading ? 'Subiendo...' : label}</span>}
        </button>
      )}

      {error && <div style={{ fontSize: 11, color: '#FF4D6A', marginTop: 6 }}>{error}</div>}

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
