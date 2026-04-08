export type Plan = 'free' | 'premium'
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired'
export type VisionStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface UserRow {
  id: string
  email: string
  avatar_url: string | null
  plan: Plan
  daily_count: number
  created_at: string
}

export interface VisionRow {
  id: string
  user_id: string
  prompt: string
  template_id: string | null
  image_url: string | null
  video_url: string | null
  is_public: boolean
  status: VisionStatus
  created_at: string
}

export interface SubscriptionRow {
  id: string
  user_id: string
  polar_order_id: string
  status: SubscriptionStatus
  plan: string
  started_at: string
  expires_at: string
}

export interface ReferralRow {
  id: string
  referrer_id: string
  referred_id: string
  bonus_given: boolean
  created_at: string
}

// Supabase client에 전달하는 Database 제네릭 타입
export interface Database {
  public: {
    Tables: {
      users: {
        Row: UserRow
        Insert: Omit<UserRow, 'created_at'> & { created_at?: string }
        Update: Partial<Omit<UserRow, 'id'>>
        Relationships: []
      }
      visions: {
        Row: VisionRow
        Insert: Omit<VisionRow, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<VisionRow, 'id' | 'user_id'>>
        Relationships: []
      }
      subscriptions: {
        Row: SubscriptionRow
        Insert: Omit<SubscriptionRow, 'id'> & { id?: string }
        Update: Partial<Omit<SubscriptionRow, 'id' | 'user_id'>>
        Relationships: []
      }
      referrals: {
        Row: ReferralRow
        Insert: Omit<ReferralRow, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Pick<ReferralRow, 'bonus_given'>>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

// 편의 타입 alias
export type Vision = VisionRow
export type User = UserRow
export type Subscription = SubscriptionRow
export type Referral = ReferralRow
