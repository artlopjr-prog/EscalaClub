'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { ArrowLeft, Send, Heart, MessageCircle, Trash2, ChevronDown, ChevronUp, Image as ImageIcon, X, Pin } from 'lucide-react'
import ImageUpload from '@/components/ui/ImageUpload'

const C = { bg: '#06060A', bg1: '#0D0D14', bg2: '#13131C', border: 'rgba(255,255,255,0.07)', text: '#EEEDF5', muted: '#6B6A80', muted2: '#9998B0', purple: '#7C3AED', purple2: '#9F67FF', green: '#00D68F', red: '#FF4D6A' }

interface Category { id: string; name: string; icon: string; color: string }
interface Comment { id: string; content: string; author_id: string; created_at: string; author?: any }
interface Post { id: string; title?: string; content: string; author_id: string; created_at: string; reaction_count: number; comment_count: number; is_pinned?: boolean; media_urls?: string[]; category_id?: string; author?: any }

interface Props {
  community: { id: string; name: string; slug: string; primary_color?: string; owner_id: string; members_can_post?: boolean; members_can_upload_images?: boolean; members_can_upload_videos?: boolean }
  posts: Post[]
  categories: Category[]
  userId: string
  userRole: string
}

export default function ForoClient({ community, posts: initialPosts, categories, userId, userRole }: Props) {
  const supabase = createClient()
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [selectedCat, setSelectedCat] = useState<string>(categories[0]?.id ?? '')
  const [filterCat, setFilterCat] = useState<string>('all')
  const [posting, setPosting] = useState(false)
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())
  const [expandedPost, setExpandedPost] = useState<string | null>(null)
  const [comments, setComments] = useState<Record<string, Comment[]>>({})
  const [commentText, setCommentText] = useState<Record<string, string>>({})
  const [imageUrl, setImageUrl] = useState('')
  const [showImageInput, setShowImageInput] = useState(false)
  const accentColor = community.primary_color ?? '#7C3AED'
  
  const isOwner = userRole === 'owner'
  const canPost = isOwner || userRole === 'admin' || userRole === 'moderator' || (community.members_can_post !== false)
  const canUploadImages = isOwner || (community.members_can_upload_images !== false)
  const canUploadVideos = isOwner || (community.members_can_upload_videos === true)

  function timeAgo(d: string) {
    const diff = Date.now() - new Date(d).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 1) return 'ahora'
    if (m < 60) return `${m}m`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h`
    return `${Math.floor(h / 24)}d`
  }

  async function submitPost() {
    if (!content.trim()) return
    setPosting(true)
    const mediaUrls = imageUrl.trim() ? [imageUrl.trim()] : []
    const { data, error } = await supabase
      .from('ec_posts')
      .insert({
        community_id: community.id,
        author_id: userId,
        title: title.trim() || null,
        content: content.trim(),
        category_id: selectedCat || null,
        media_urls: mediaUrls.length > 0 ? mediaUrls : null,
      })
      .select('*, author:ec_profiles(id, display_name, avatar_url)')
      .single()
    if (error) { toast.error('Error al publicar: ' + error.message); setPosting(false); return }
    setPosts([data as Post, ...posts])
    setContent(''); setTitle(''); setImageUrl(''); setShowImageInput(false)
    setPosting(false)
    toast.success('¡Post publicado! 🎉')
  }

  async function toggleLike(postId: string) {
    const isLiked = likedPosts.has(postId)
    setLikedPosts(prev => { const n = new Set(prev); isLiked ? n.delete(postId) : n.add(postId); return n })
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, reaction_count: (p.reaction_count ?? 0) + (isLiked ? -1 : 1) } : p))
    if (isLiked) {
      await supabase.from('ec_reactions').delete().eq('target_id', postId).eq('user_id', userId).eq('target_type', 'post')
    } else {
      await supabase.from('ec_reactions').insert({ target_id: postId, target_type: 'post', user_id: userId, emoji: '❤️' })
    }
  }

  async function deletePost(postId: string) {
    if (!confirm('¿Eliminar este post?')) return
    await supabase.from('ec_posts').delete().eq('id', postId)
    setPosts(prev => prev.filter(p => p.id !== postId))
    toast.success('Post eliminado')
  }

  async function togglePin(post: Post) {
    const newVal = !post.is_pinned
    await supabase.from('ec_posts').update({ is_pinned: newVal }).eq('id', post.id)
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, is_pinned: newVal } : p))
    toast.success(newVal ? 'Post anclado 📌' : 'Post desanclado')
  }

  async function loadComments(postId: string) {
    if (expandedPost === postId) { setExpandedPost(null); return }
    setExpandedPost(postId)
    if (comments[postId]) return
    const { data } = await supabase
      .from('ec_comments')
      .select('*, author:ec_profiles(id, display_name, avatar_url)')
      .eq('post_id', postId)
      .is('parent_id', null)
      .order('created_at')
    setComments(prev => ({ ...prev, [postId]: (data ?? []) as Comment[] }))
  }

  async function submitComment(postId: string) {
    const text = commentText[postId]?.trim()
    if (!text) return
    const { data, error } = await supabase
      .from('ec_comments')
      .insert({ post_id: postId, author_id: userId, content: text })
      .select('*, author:ec_profiles(id, display_name, avatar_url)')
      .single()
    if (error) { toast.error('Error al comentar'); return }
    setComments(prev => ({ ...prev, [postId]: [...(prev[postId] ?? []), data as Comment] }))
    setCommentText(prev => ({ ...prev, [postId]: '' }))
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, comment_count: (p.comment_count ?? 0) + 1 } : p))
    // Notify post author
    const post = posts.find(p => p.id === postId)
    if (post && post.author_id !== userId) {
      await supabase.from('ec_notifications').insert({
        user_id: post.author_id,
        community_id: community.id,
        type: 'comment',
        title: '💬 Nuevo comentario en tu post',
        body: text.slice(0, 100),
        action_url: `/comunidades/${community.slug}/foro`,
        actor_id: userId,
      })
    }
  }

  async function deleteComment(postId: string, commentId: string) {
    await supabase.from('ec_comments').delete().eq('id', commentId)
    setComments(prev => ({ ...prev, [postId]: prev[postId].filter(c => c.id !== commentId) }))
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, comment_count: Math.max(0, (p.comment_count ?? 1) - 1) } : p))
  }

  const isOwnerOrAdmin = userRole === 'owner' || userRole === 'admin' || userRole === 'moderator'
  const filteredPosts = filterCat === 'all' ? posts : posts.filter(p => p.category_id === filterCat)
  const pinnedPosts = filteredPosts.filter(p => p.is_pinned)
  const regularPosts = filteredPosts.filter(p => !p.is_pinned)
  const sortedPosts = [...pinnedPosts, ...regularPosts]

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      {/* Header */}
      <div style={{ background: C.bg1, borderBottom: `1px solid ${C.border}`, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 10, backdropFilter: 'blur(20px)' }}>
        <Link href={`/comunidades/${community.slug}`} style={{ display: 'flex', alignItems: 'center', gap: 5, color: C.muted, textDecoration: 'none', fontSize: 12, padding: '6px 10px', borderRadius: 8, border: `1px solid ${C.border}` }}>
          <ArrowLeft size={13} /> Volver
        </Link>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 16, letterSpacing: '-0.03em', color: C.text, flex: 1 }}>
          💬 {community.name}
        </h1>
        <span style={{ fontSize: 11, color: C.muted }}>{posts.length} posts</span>
      </div>

      <div style={{ maxWidth: 780, margin: '0 auto', padding: '20px 16px' }}>
        {/* Category filter */}
        {categories.length > 0 && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
            <button onClick={() => setFilterCat('all')} style={{ padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600, background: filterCat === 'all' ? accentColor : C.bg1, color: filterCat === 'all' ? '#fff' : C.muted, border: `1px solid ${filterCat === 'all' ? 'transparent' : C.border}`, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              Todos
            </button>
            {categories.map(cat => (
              <button key={cat.id} onClick={() => setFilterCat(cat.id)} style={{ padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600, background: filterCat === cat.id ? cat.color : C.bg1, color: filterCat === cat.id ? '#fff' : C.muted, border: `1px solid ${filterCat === cat.id ? 'transparent' : C.border}`, cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: cat.color, display: 'inline-block', flexShrink: 0 }} />
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Compose */}
        <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 20, padding: 18, marginBottom: 20 }}>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Título (opcional)" style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: C.text, fontSize: 15, fontFamily: 'Syne, sans-serif', fontWeight: 700, marginBottom: 8 }} />
          <textarea value={content} onChange={e => setContent(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submitPost() }} placeholder="¿Qué quieres compartir? (Ctrl+Enter para publicar)" rows={3} style={{ width: '100%', background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 12, padding: '12px 14px', color: C.text, fontSize: 14, outline: 'none', resize: 'none', fontFamily: 'Plus Jakarta Sans, sans-serif' }} />

          {showImageInput && (
            <div style={{ marginTop: 10 }}>
              <ImageUpload
                bucket="community-media"
                folder={`posts/${community.id}`}
                onUpload={(url) => setImageUrl(url)}
                currentUrl={imageUrl}
                label="Subir imagen al post"
                maxMB={10}
              />
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, gap: 10, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {categories.length > 0 && (
                <select value={selectedCat} onChange={e => setSelectedCat(e.target.value)} style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 9, padding: '6px 10px', color: C.text, fontSize: 12, outline: 'none', cursor: 'pointer' }}>
                  {categories.map(c => <option key={c.id} value={c.id} style={{ background: C.bg2 }}>{c.name}</option>)}
                </select>
              )}
              {canUploadImages && <button onClick={() => setShowImageInput(!showImageInput)} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: `1px solid ${C.border}`, borderRadius: 9, padding: '6px 12px', color: C.muted, cursor: 'pointer', fontSize: 12 }}>
                <ImageIcon size={13} /> Imagen
              </button>}
            </div>
            <button onClick={submitPost} disabled={posting || !content.trim()} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 20px', borderRadius: 10, background: content.trim() ? `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)` : 'rgba(255,255,255,0.06)', color: content.trim() ? '#fff' : C.muted, border: 'none', cursor: content.trim() ? 'pointer' : 'not-allowed', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13 }}>
              <Send size={13} /> {posting ? 'Publicando...' : 'Publicar'}
            </button>
          </div>
        </div>

        {/* Posts */}
        {sortedPosts.length > 0 ? sortedPosts.map(post => {
          const isAuthor = post.author_id === userId
          const canDelete = isAuthor || isOwnerOrAdmin
          const isLiked = likedPosts.has(post.id)
          const isExpanded = expandedPost === post.id
          const postComments = comments[post.id] ?? []
          const cat = categories.find(c => c.id === post.category_id)

          return (
            <div key={post.id} style={{ background: C.bg1, border: `1px solid ${post.is_pinned ? accentColor + '44' : C.border}`, borderRadius: 20, padding: 18, marginBottom: 12 }}>
              {/* Author row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: accentColor + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 13, color: accentColor, flexShrink: 0, overflow: 'hidden' }}>
                  {post.author?.avatar_url ? <img src={post.author.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (post.author?.display_name?.[0]?.toUpperCase() ?? '?')}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{post.author?.display_name ?? 'Usuario'}</span>
                    {isAuthor && <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 99, background: accentColor + '22', color: accentColor, fontWeight: 700 }}>tú</span>}
                    {post.is_pinned && <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 99, background: 'rgba(240,165,0,0.15)', color: '#F0A500', fontWeight: 700 }}>📌 Anclado</span>}
                    {cat && <span style={{ fontSize: 9, padding: '1px 8px', borderRadius: 99, background: cat.color + '22', color: cat.color, fontWeight: 700 }}>{cat.name}</span>}
                  </div>
                  <div style={{ fontSize: 11, color: C.muted }}>{timeAgo(post.created_at)}</div>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {isOwnerOrAdmin && (
                    <button onClick={() => togglePin(post)} title={post.is_pinned ? 'Desanclar' : 'Anclar'} style={{ background: 'none', border: 'none', cursor: 'pointer', color: post.is_pinned ? '#F0A500' : C.muted, padding: 6, borderRadius: 8, display: 'flex' }}>
                      <Pin size={13} />
                    </button>
                  )}
                  {canDelete && (
                    <button onClick={() => deletePost(post.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, padding: 6, borderRadius: 8, display: 'flex' }}
                      onMouseEnter={e => (e.currentTarget.style.color = C.red)}
                      onMouseLeave={e => (e.currentTarget.style.color = C.muted)}>
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* Content */}
              {post.title && <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 15, color: C.text, marginBottom: 6 }}>{post.title}</h3>}
              <p style={{ fontSize: 14, color: C.muted2, lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0 }}>{post.content}</p>

              {/* Image */}
              {post.media_urls && post.media_urls.length > 0 && (
                <div style={{ marginTop: 12, borderRadius: 12, overflow: 'hidden', maxHeight: 300 }}>
                  <img src={post.media_urls[0]} alt="" style={{ width: '100%', objectFit: 'cover' }} />
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
                <button onClick={() => toggleLike(post.id)} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', color: isLiked ? C.red : C.muted, fontSize: 12, fontWeight: 500, padding: 0, transition: 'color 0.15s' }}>
                  <Heart size={15} fill={isLiked ? C.red : 'none'} /> {post.reaction_count ?? 0}
                </button>
                <button onClick={() => loadComments(post.id)} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', color: isExpanded ? accentColor : C.muted, fontSize: 12, fontWeight: 500, padding: 0, transition: 'color 0.15s' }}>
                  <MessageCircle size={15} /> {post.comment_count ?? 0} {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
              </div>

              {/* Comments */}
              {isExpanded && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
                  {postComments.map(comment => (
                    <div key={comment.id} style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                      <div style={{ width: 30, height: 30, borderRadius: '50%', background: accentColor + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: accentColor, flexShrink: 0, overflow: 'hidden' }}>
                        {comment.author?.avatar_url ? <img src={comment.author.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (comment.author?.display_name?.[0]?.toUpperCase() ?? '?')}
                      </div>
                      <div style={{ flex: 1, background: C.bg2, borderRadius: 12, padding: '10px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{comment.author?.display_name ?? 'Usuario'}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 10, color: C.muted }}>{timeAgo(comment.created_at)}</span>
                            {(comment.author_id === userId || isOwnerOrAdmin) && (
                              <button onClick={() => deleteComment(post.id, comment.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, padding: 0, display: 'flex' }}>
                                <Trash2 size={11} />
                              </button>
                            )}
                          </div>
                        </div>
                        <p style={{ fontSize: 13, color: C.muted2, margin: 0, lineHeight: 1.5 }}>{comment.content}</p>
                      </div>
                    </div>
                  ))}

                  {/* Comment input */}
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <input value={commentText[post.id] ?? ''} onChange={e => setCommentText(prev => ({ ...prev, [post.id]: e.target.value }))} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitComment(post.id) } }} placeholder="Escribe un comentario... (Enter para enviar)" style={{ flex: 1, background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 10, padding: '9px 14px', color: C.text, fontSize: 13, outline: 'none' }} />
                    <button onClick={() => submitComment(post.id)} disabled={!commentText[post.id]?.trim()} style={{ padding: '9px 14px', borderRadius: 10, background: commentText[post.id]?.trim() ? accentColor : 'rgba(255,255,255,0.06)', color: commentText[post.id]?.trim() ? '#fff' : C.muted, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                      <Send size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        }) : (
          <div style={{ textAlign: 'center', padding: '60px 24px', background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 20 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, color: C.text, marginBottom: 8 }}>Sé el primero en publicar</h3>
            <p style={{ fontSize: 14, color: C.muted }}>Comparte algo con la comunidad</p>
          </div>
        )}
      </div>
    </div>
  )
}
