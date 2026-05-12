// ─── Types aligned with real Supabase schema ───────────────────────────────

export type PlatformRole = 'user' | 'support' | 'super_admin'
export type MemberRole = 'owner' | 'admin' | 'moderator' | 'member'
export type CommunityStatus = 'active' | 'suspended' | 'archived'
export type AccessType = 'free' | 'paid' | 'invite_only'
export type SubStatus = 'active' | 'canceled' | 'past_due' | 'trialing'
export type BillingCycle = 'monthly' | 'yearly'
export type Locale = 'es' | 'pt'

export interface EcProfile {
  id: string
  username: string
  display_name: string
  avatar_url?: string
  bio?: string
  country?: string
  locale?: Locale
  social_links?: Record<string, string>
  role_platform: PlatformRole
  onboarding_completed?: boolean
  created_at: string
  updated_at: string
}

export interface EcCommunity {
  id: string
  slug: string
  name: string
  tagline?: string
  description?: string
  logo_url?: string
  banner_url?: string
  owner_id: string
  access_type: AccessType
  price_monthly?: number
  price_yearly?: number
  currency: string
  primary_color?: string
  locale?: Locale
  plan: string
  paypal_account_email?: string
  member_limit?: number
  status: CommunityStatus
  member_count?: number
  post_count?: number
  created_at: string
  updated_at: string
}

export interface EcCommunityMember {
  id: string
  community_id: string
  user_id: string
  role: MemberRole
  status: string
  points?: number
  level?: number
  joined_at: string
  last_active_at?: string
}

export interface EcCourse {
  id: string
  community_id: string
  title: string
  description?: string
  cover_url?: string
  position?: number
  is_published?: boolean
  created_at: string
  updated_at: string
}

export interface EcCourseModule {
  id: string
  course_id: string
  title: string
  position?: number
  created_at: string
}

export interface EcCourseLesson {
  id: string
  module_id: string
  title: string
  content?: string
  video_url?: string
  attachments?: Array<{ name: string; url: string }>
  duration_min?: number
  position?: number
  created_at: string
  updated_at: string
}

export interface EcLessonProgress {
  id: string
  lesson_id: string
  user_id: string
  completed_at?: string
  progress_pct?: number
}

export interface EcPost {
  id: string
  community_id: string
  category_id?: string
  author_id: string
  title?: string
  content: string
  media_urls?: string[]
  is_pinned?: boolean
  view_count?: number
  reaction_count?: number
  comment_count?: number
  created_at: string
  updated_at: string
}

export interface EcEvent {
  id: string
  community_id: string
  host_id: string
  title: string
  description?: string
  starts_at: string
  duration_min?: number
  meet_url?: string
  recording_url?: string
  cover_url?: string
  rsvp_count?: number
  created_at: string
}

export interface EcNotification {
  id: string
  user_id: string
  community_id?: string
  type: string
  title: string
  body?: string
  action_url?: string
  actor_id?: string
  is_read?: boolean
  created_at: string
}

export interface EcCreatorSubscription {
  id: string
  community_id: string
  paypal_subscription_id?: string
  plan: string
  billing_cycle: BillingCycle
  status: SubStatus
  amount: number
  currency?: string
  current_period_start?: string
  current_period_end?: string
  canceled_at?: string
  cancel_at_period_end?: boolean
  created_at: string
  updated_at: string
}
