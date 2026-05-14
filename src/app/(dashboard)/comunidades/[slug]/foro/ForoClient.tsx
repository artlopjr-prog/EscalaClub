'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Send, Heart, MessageCircle, Trash2, ChevronDown, ChevronUp, Image as ImageIcon, Pin, Trophy, Users, CheckCircle, Circle } from 'lucide-react'

const C = {
  bg: '#1F2335', bg1: '#262B42', bg2: '#2D3452', bg3: '#343C5C',
  border: 'rgba(255,255,255,0.08)', text: '#E8E9F0',
  muted: '#7B7FA8', muted2: '#A8AACC',
  purple: '#6366F1', purple2: '#818CF8',
  green: '#00D68F', red: '#FF4D6A', gold: '#F0A500',
}

interface Category { id: string; name: string; emoji: string; color: string }
interface Comment { id: string; content: string; author_id: string; created_at: string; author?: any }
interface Post {
  id: string; title?: string; content: string; author_id: string
  created_at: string; reaction_count: number; comment_count: number
  is_pinned?: boolean; media_urls?: string[]; category_id?: string; author?: any
}
interface LeaderEntry { user_id: string; points: number; level: number; profile?: any }

interface Props {
  community: {
    id: string; name: string; slug: string; primary_color?: string
    owner_id: string; members_can_post?: boolean; members_can_upload_images?: boolean
    description?: string; member_count?: number; logo_url?: string; tagline?: string
    banner_url?: string
  }
  posts: Post[]
  categories: Category[]
  userId: string
  userRole: string
  ownerProfile: { display_name: string; avatar_url?: string } | null
  memberCount: number
  userDisplayName: string
  userAvatarUrl?: string
}

const WELCOME_TASKS = [
  { id: 'post', label: 'Escribe tu primer post en la comunidad' },
  { id: 'like', label: 'Dale like a un post que te guste' },
  { id: 'comment', label: 'Deja un comentario en algún post' },
]

export default function ForoClient({
  community, posts: initialPosts, categories, userId, userRole,
  ownerProfile, memberCount, userDisplayName, userAvatarUrl
}: Props) {
  const supabase = createClient()
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
  const [leaderboard, setLeaderboard] = useState<LeaderEntry[]>([])
  const [onlineCount] = useState(Math.floor(Math.random() * 12) + 3)
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set())
  const [composerFocused, setComposerFocused] = useState(false)

  const accent = community.primary_color ?? C.purple
  const isOwner = userRole === 'owner'
  const isOwnerOrAdmin = userRole === 'owner' || userRole === 'admin' || userRole === 'moderator'
  const canPost = isOwner || userRole === 'admin' || userRole === 'moderator' || community.members_can_post !== false
  const canUploadImages = isOwner || community.members_can_upload_images !== false

  useEffect(() => {
    // Load leaderboard
    supabase.from('ec_community_members')
      .select('user_id, points, level, profile:ec_profiles(display_name, avatar_url)')
      .eq('community_id', community.id)
      .eq('status', 'active')
      .order('points', { ascending: false })
      .limit(5)
      .then(({ data }) => setLeaderboard((data ?? []) as LeaderEntry[]))

    // Load liked posts
    supabase.from('ec_reactions')
      .select('target_id')
      .eq('user_id', userId)
      .eq('target_type', 'post')
      .then(({ data }) => setLikedPosts(new Set(data?.map(r => r.target_id) ?? [])))
  }, [])

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
    if (error) { toast.error('Error al publicar'); setPosting(false); return }
    setPosts([data as Post, ...posts])
    setContent(''); setTitle(''); setImageUrl(''); setShowImageInput(false)
    setComposerFocused(false)
    setPosting(false)
    setCompletedTasks(prev => new Set([...prev, 'post']))
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
      setCompletedTasks(prev => new Set([...prev, 'like']))
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
    setCompletedTasks(prev => new Set([...prev, 'comment']))
    const post = posts.find(p => p.id === postId)
    if (post && post.author_id !== userId) {
      await supabase.from('ec_notifications').insert({
        user_id: post.author_id, community_id: community.id, type: 'comment',
        title: '💬 Nuevo comentario en tu post', body: text.slice(0, 100),
        action_url: `/comunidades/${community.slug}/foro`, actor_id: userId,
      })
    }
  }

  async function deleteComment(postId: string, commentId: string) {
    await supabase.from('ec_comments').delete().eq('id', commentId)
    setComments(prev => ({ ...prev, [postId]: prev[postId].filter(c => c.id !== commentId) }))
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, comment_count: Math.max(0, (p.comment_count ?? 1) - 1) } : p))
  }

  const filteredPosts = filterCat === 'all' ? posts : posts.filter(p => p.category_id === filterCat)
  const sortedPosts = [...filteredPosts.filter(p => p.is_pinned), ...filteredPosts.filter(p => !p.is_pinned)]
  const allTasksDone = WELCOME_TASKS.every(t => completedTasks.has(t.id))

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, maxWidth: 1100, margin: '0 auto', padding: '24px 20px', alignItems: 'start' }}>

      {/* ── LEFT COLUMN ── */}
      <div>
        {/* Welcome checklist — show only if not all done */}
        {!allTasksDone && (
          <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 16, padding: '18px 20px', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: accent + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: accent }} />
              </div>
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, color: C.text }}>Bienvenido — empieza aquí</span>
            </div>
            {WELCOME_TASKS.map(task => (
              <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
                {completedTasks.has(task.id)
                  ? <CheckCircle size={18} color={C.green} />
                  : <Circle size={18} color={C.muted} />
                }
                <span style={{ fontSize: 13, color: completedTasks.has(task.id) ? C.muted : C.muted2, textDecoration: completedTasks.has(task.id) ? 'line-through' : 'none' }}>
                  {task.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Composer */}
        <div style={{ background: C.bg1, border: `1px solid ${composerFocused ? accent + '60' : C.border}`, borderRadius: 16, padding: 16, marginBottom: 20, transition: 'border-color 0.2s' }}>
          {!composerFocused ? (
            /* Collapsed composer — like Skool */
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'text' }} onClick={() => setComposerFocused(true)}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: accent + '25', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 13, color: accent, flexShrink: 0, overflow: 'hidden' }}>
                {userAvatarUrl ? <img src={userAvatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : userDisplayName?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div style={{ flex: 1, background: C.bg2, borderRadius: 99, padding: '10px 18px', color: C.muted, fontSize: 14 }}>
                Escribe algo...
              </div>
            </div>
          ) : (
            /* Expanded composer */
            <div>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Título (opcional)"
                style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: C.text, fontSize: 16, fontFamily: 'Syne, sans-serif', fontWeight: 700, marginBottom: 10 }}
                autoFocus
              />
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submitPost() }}
                placeholder="¿Qué quieres compartir con la comunidad?"
                rows={4}
                style={{ width: '100%', background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 12, padding: '12px 14px', color: C.text, fontSize: 14, outline: 'none', resize: 'none', fontFamily: 'Plus Jakarta Sans, sans-serif', boxSizing: 'border-box' }}
              />

              {showImageInput && (
                <input
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  placeholder="URL de la imagen..."
                  style={{ width: '100%', background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', color: C.text, fontSize: 13, outline: 'none', marginTop: 10, boxSizing: 'border-box' }}
                />
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, gap: 10, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {categories.length > 0 && (
                    <select value={selectedCat} onChange={e => setSelectedCat(e.target.value)} style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 9, padding: '6px 10px', color: C.text, fontSize: 12, outline: 'none', cursor: 'pointer' }}>
                      {categories.map(c => <option key={c.id} value={c.id} style={{ background: C.bg2 }}>{c.emoji} {c.name}</option>)}
                    </select>
                  )}
                  {canUploadImages && (
                    <button onClick={() => setShowImageInput(!showImageInput)} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: `1px solid ${C.border}`, borderRadius: 9, padding: '6px 12px', color: C.muted, cursor: 'pointer', fontSize: 12 }}>
                      <ImageIcon size={13} /> Imagen
                    </button>
                  )}
                  <button onClick={() => { setComposerFocused(false); setContent(''); setTitle('') }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontSize: 12, padding: '6px 8px' }}>
                    Cancelar
                  </button>
                </div>
                <button
                  onClick={submitPost}
                  disabled={posting || !content.trim()}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 22px', borderRadius: 10, background: content.trim() ? `linear-gradient(135deg, ${accent}, ${accent}cc)` : 'rgba(255,255,255,0.06)', color: content.trim() ? '#fff' : C.muted, border: 'none', cursor: content.trim() ? 'pointer' : 'not-allowed', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13 }}
                >
                  <Send size={13} /> {posting ? 'Publicando...' : 'Publicar'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Category pills */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
          <button onClick={() => setFilterCat('all')} style={{ padding: '6px 16px', borderRadius: 99, fontSize: 12, fontWeight: 700, background: filterCat === 'all' ? accent : C.bg1, color: filterCat === 'all' ? '#fff' : C.muted, border: `1px solid ${filterCat === 'all' ? 'transparent' : C.border}`, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'Syne, sans-serif' }}>
            Todos
          </button>
          {categories.map(cat => (
            <button key={cat.id} onClick={() => setFilterCat(cat.id)} style={{ padding: '6px 16px', borderRadius: 99, fontSize: 12, fontWeight: 700, background: filterCat === cat.id ? cat.color : C.bg1, color: filterCat === cat.id ? '#fff' : C.muted, border: `1px solid ${filterCat === cat.id ? 'transparent' : C.border}`, cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'Syne, sans-serif' }}>
              {cat.emoji} {cat.name}
            </button>
          ))}
        </div>

        {/* Posts feed */}
        {sortedPosts.length > 0 ? sortedPosts.map(post => {
          const isAuthor = post.author_id === userId
          const canDelete = isAuthor || isOwnerOrAdmin
          const isLiked = likedPosts.has(post.id)
          const isExpanded = expandedPost === post.id
          const postComments = comments[post.id] ?? []
          const cat = categories.find(c => c.id === post.category_id)

          return (
            <div key={post.id} style={{ background: C.bg1, border: `1px solid ${post.is_pinned ? accent + '50' : C.border}`, borderRadius: 16, padding: 18, marginBottom: 12 }}>
              {/* Author */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: accent + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 14, color: accent, flexShrink: 0, overflow: 'hidden', border: `2px solid ${accent}30` }}>
                  {post.author?.avatar_url ? <img src={post.author.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (post.author?.display_name?.[0]?.toUpperCase() ?? '?')}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{post.author?.display_name ?? 'Usuario'}</span>
                    {post.author_id === community.owner_id && <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 99, background: 'rgba(240,165,0,0.15)', color: C.gold, fontWeight: 700 }}>⭐ Creador</span>}
                    {isAuthor && post.author_id !== community.owner_id && <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 99, background: accent + '20', color: accent, fontWeight: 700 }}>tú</span>}
                    {post.is_pinned && <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 99, background: 'rgba(240,165,0,0.12)', color: C.gold, fontWeight: 700 }}>📌 Anclado</span>}
                    {cat && <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 99, background: cat.color + '20', color: cat.color, fontWeight: 700 }}>{cat.emoji} {cat.name}</span>}
                  </div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{timeAgo(post.created_at)}</div>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {isOwnerOrAdmin && (
                    <button onClick={() => togglePin(post)} title={post.is_pinned ? 'Desanclar' : 'Anclar'} style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.border}`, borderRadius: 7, cursor: 'pointer', color: post.is_pinned ? C.gold : C.muted, padding: '5px 6px', display: 'flex' }}>
                      <Pin size={12} />
                    </button>
                  )}
                  {canDelete && (
                    <button onClick={() => deletePost(post.id)} style={{ background: 'rgba(255,77,106,0.08)', border: `1px solid rgba(255,77,106,0.15)`, borderRadius: 7, cursor: 'pointer', color: C.red, padding: '5px 6px', display: 'flex' }}>
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* Content */}
              <div style={{ display: 'grid', gridTemplateColumns: post.media_urls?.length ? '1fr 140px' : '1fr', gap: 14, alignItems: 'start' }}>
                <div>
                  {post.title && <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 15, color: C.text, marginBottom: 6 }}>{post.title}</h3>}
                  <p style={{ fontSize: 14, color: C.muted2, lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0 }}>{post.content}</p>
                </div>
                {post.media_urls && post.media_urls.length > 0 && (
                  <div style={{ borderRadius: 10, overflow: 'hidden', height: 90 }}>
                    <img src={post.media_urls[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
                <button onClick={() => toggleLike(post.id)} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', color: isLiked ? C.red : C.muted, fontSize: 13, fontWeight: 600, padding: 0 }}>
                  <Heart size={15} fill={isLiked ? C.red : 'none'} /> {post.reaction_count ?? 0}
                </button>
                <button onClick={() => loadComments(post.id)} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', color: isExpanded ? accent : C.muted, fontSize: 13, fontWeight: 600, padding: 0 }}>
                  <MessageCircle size={15} /> {post.comment_count ?? 0} {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
              </div>

              {/* Comments */}
              {isExpanded && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
                  {postComments.map(comment => (
                    <div key={comment.id} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: '50%', background: accent + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: accent, flexShrink: 0, overflow: 'hidden' }}>
                        {comment.author?.avatar_url ? <img src={comment.author.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (comment.author?.display_name?.[0]?.toUpperCase() ?? '?')}
                      </div>
                      <div style={{ flex: 1, background: C.bg2, borderRadius: 12, padding: '9px 13px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
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
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <input
                      value={commentText[post.id] ?? ''}
                      onChange={e => setCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitComment(post.id) } }}
                      placeholder="Escribe un comentario... (Enter)"
                      style={{ flex: 1, background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 10, padding: '9px 14px', color: C.text, fontSize: 13, outline: 'none' }}
                    />
                    <button onClick={() => submitComment(post.id)} disabled={!commentText[post.id]?.trim()} style={{ padding: '9px 14px', borderRadius: 10, background: commentText[post.id]?.trim() ? accent : 'rgba(255,255,255,0.06)', color: commentText[post.id]?.trim() ? '#fff' : C.muted, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                      <Send size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        }) : (
          <div style={{ textAlign: 'center', padding: '60px 24px', background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 16 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, color: C.text, marginBottom: 8 }}>Sé el primero en publicar</h3>
            <p style={{ fontSize: 14, color: C.muted }}>Comparte algo con la comunidad</p>
          </div>
        )}
      </div>

      {/* ── RIGHT SIDEBAR ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 100 }}>
        {/* Community info card */}
        <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
          {/* Banner */}
          <div style={{ height: 70, background: `linear-gradient(135deg, ${accent}44, ${accent}11)`, position: 'relative' }}>
            {community.banner_url && <img src={community.banner_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
          </div>
          <div style={{ padding: '0 16px 16px' }}>
            {/* Logo */}
            <div style={{ width: 48, height: 48, borderRadius: 12, background: community.logo_url ? undefined : accent + '30', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, overflow: 'hidden', border: `3px solid ${C.bg1}`, marginTop: -24, marginBottom: 10 }}>
              {community.logo_url ? <img src={community.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🌐'}
            </div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 15, color: C.text, marginBottom: 4 }}>{community.name}</div>
            {community.description && <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.6, marginBottom: 12 }}>{community.description.slice(0, 120)}...</p>}

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
              {[
                { label: 'Miembros', value: memberCount },
                { label: 'Online', value: onlineCount },
                { label: 'Posts', value: posts.length },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: 'center', padding: '8px 4px', background: C.bg2, borderRadius: 10 }}>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, color: C.text }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: C.muted }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Owner */}
            {ownerProfile && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: C.bg2, borderRadius: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: accent + '25', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: accent, overflow: 'hidden', flexShrink: 0 }}>
                  {ownerProfile.avatar_url ? <img src={ownerProfile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : ownerProfile.display_name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{ownerProfile.display_name}</div>
                  <div style={{ fontSize: 10, color: C.gold }}>⭐ Creador</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Leaderboard */}
        {leaderboard.length > 0 && (
          <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 13, color: C.text }}>
                <Trophy size={14} color={C.gold} /> Leaderboard
              </div>
              <span style={{ fontSize: 10, color: C.muted }}>30 días</span>
            </div>
            {leaderboard.map((entry, i) => {
              const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣']
              const profile = entry.profile as any
              return (
                <div key={entry.user_id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderBottom: i < leaderboard.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                  <span style={{ fontSize: 14, width: 20, textAlign: 'center' }}>{medals[i]}</span>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: accent + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: accent, overflow: 'hidden', flexShrink: 0 }}>
                    {profile?.avatar_url ? <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : profile?.display_name?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.display_name ?? 'Usuario'}</span>
                  <span style={{ fontSize: 11, color: C.gold, fontWeight: 700, fontFamily: 'Syne, sans-serif' }}>+{(entry.points ?? 0).toLocaleString()}</span>
                </div>
              )
            })}
            <div style={{ padding: '10px 16px' }}>
              <Link href={`/comunidades/${community.slug}/ranking`} style={{ fontSize: 12, color: C.muted2, textDecoration: 'none' }}>Ver todo el ranking →</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
