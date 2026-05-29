'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react'

interface ImageUploaderProps {
  onUpload: (url: string) => void
  onRemove: (url: string) => void
  images: string[]
  maxImages?: number
  communityId: string
}

export function ImageUploader({ onUpload, onRemove, images, maxImages = 4, communityId }: ImageUploaderProps) {
  const supabase = createClient()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    if (images.length >= maxImages) {
      setError(`Máximo ${maxImages} imágenes por post`)
      return
    }

    setUploading(true)
    setError(null)

    const remaining = maxImages - images.length
    const toUpload = Array.from(files).slice(0, remaining)

    for (const file of toUpload) {
      // Validate
      if (!file.type.startsWith('image/')) {
        setError('Solo se permiten imágenes')
        continue
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Máximo 5MB por imagen')
        continue
      }

      try {
        const ext = file.name.split('.').pop() ?? 'jpg'
        const fileName = `posts/${communityId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

        const { error: uploadError } = await supabase.storage
          .from('community-media')
          .upload(fileName, file, { contentType: file.type, upsert: false })

        if (uploadError) throw uploadError

        const { data } = supabase.storage.from('community-media').getPublicUrl(fileName)
        onUpload(data.publicUrl)
      } catch (err: any) {
        setError(err.message ?? 'Error al subir imagen')
      }
    }

    setUploading(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    handleFiles(e.dataTransfer.files)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
  }

  const canAdd = images.length < maxImages

  return (
    <div style={{ marginTop: 10 }}>
      {/* Image previews */}
      {images.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
          {images.map((url, i) => (
            <div key={i} style={{ position: 'relative', width: 80, height: 80 }}>
              <img
                src={url}
                alt=""
                style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--border)' }}
              />
              <button
                onClick={() => onRemove(url)}
                style={{
                  position: 'absolute', top: -6, right: -6,
                  width: 20, height: 20, borderRadius: '50%',
                  background: '#EF4444', color: '#fff',
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <X size={11} />
              </button>
            </div>
          ))}

          {/* Add more slot */}
          {canAdd && !uploading && (
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: 80, height: 80, borderRadius: 10,
                border: '2px dashed var(--border2)',
                background: 'var(--bg1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--muted)', flexDirection: 'column', gap: 4,
              }}
            >
              <ImageIcon size={16} />
              <span style={{ fontSize: 9 }}>Agregar</span>
            </button>
          )}
        </div>
      )}

      {/* Drop zone — only shown when no images yet */}
      {images.length === 0 && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => !uploading && fileInputRef.current?.click()}
          style={{
            border: '2px dashed var(--border2)',
            borderRadius: 12, padding: '14px 16px',
            display: 'flex', alignItems: 'center', gap: 10,
            cursor: uploading ? 'not-allowed' : 'pointer',
            background: 'var(--bg1)',
            transition: 'border-color .15s',
          }}
        >
          {uploading ? (
            <>
              <Loader2 size={16} color="var(--purple)" style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>Subiendo imagen...</span>
            </>
          ) : (
            <>
              <Upload size={16} color="var(--muted)" />
              <div>
                <span style={{ fontSize: 13, color: 'var(--muted2)', fontWeight: 500 }}>
                  Haz clic o arrastra una imagen
                </span>
                <span style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginTop: 1 }}>
                  PNG, JPG, GIF · Máximo 5MB · Hasta {maxImages} imágenes
                </span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Loading indicator when images exist */}
      {images.length > 0 && uploading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>
          <Loader2 size={13} color="var(--purple)" />
          Subiendo...
        </div>
      )}

      {/* Error */}
      {error && (
        <p style={{ fontSize: 12, color: '#EF4444', marginTop: 6 }}>{error}</p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={e => handleFiles(e.target.files)}
      />
    </div>
  )
}
