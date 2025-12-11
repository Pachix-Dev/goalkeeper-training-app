// ================================================
// DATABASE TYPES - TypeScript Interfaces
// ================================================

export interface User {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  role: 'admin' | 'coach' | 'assistant';
  avatar?: string;
  is_active: boolean;
  email_verified: boolean;
  last_login?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Team {
  id: number;
  name: string;
  category: string;
  season: string;
  description?: string;
  color: string;
  user_id: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Goalkeeper {
  id: number;
  first_name: string;
  last_name: string;
  date_of_birth?: Date;
  height?: number;
  weight?: number;
  nationality?: string;
  photo?: string;
  dominant_hand?: 'left' | 'right' | 'both';
  team_id?: number;
  jersey_number?: number;
  notes?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  category: 'technical' | 'tactical' | 'physical' | 'psychological' | 'goalkeeper_specific';
  subcategory?: string;
  duration?: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  objectives?: string;
  materials?: string;
  instructions?: string;
  video_url?: string;
  image_url?: string;
  user_id: number;
  is_public: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface TrainingSession {
  id: number;
  title: string;
  description?: string;
  session_date: Date;
  start_time?: string;
  end_time?: string;
  location?: string;
  team_id: number;
  user_id: number;
  session_type: 'training' | 'match' | 'recovery' | 'tactical' | 'physical';
  status: 'planned' | 'completed' | 'cancelled';
  notes?: string;
  weather?: string;
  created_at: Date;
  updated_at: Date;
}

export interface SessionTask {
  id: number;
  session_id: number;
  task_id: number;
  order_number: number;
  duration?: number;
  intensity?: 'low' | 'medium' | 'high' | 'very_high';
  notes?: string;
  created_at: Date;
}

export interface GoalkeeperAttendance {
  id: number;
  session_id: number;
  goalkeeper_id: number;
  status: 'present' | 'absent' | 'late' | 'injured' | 'excused';
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Penalty {
  id: number;
  goalkeeper_id: number;
  opponent_name: string;
  match_date?: Date;
  competition?: string;
  penalty_taker: string;
  taker_foot?: 'left' | 'right';
  shot_direction: 'left' | 'center' | 'right';
  shot_height: 'low' | 'mid' | 'high';
  result: 'saved' | 'goal' | 'missed' | 'post';
  goalkeeper_direction?: 'left' | 'center' | 'right' | 'stayed';
  notes?: string;
  video_url?: string;
  created_by: number;
  created_at: Date;
  updated_at: Date;
}

export interface MatchAnalysis {
  id: number;
  goalkeeper_id: number;
  match_date: Date;
  opponent: string;
  competition?: string;
  result?: string;
  minutes_played?: number;
  goals_conceded: number;
  saves: number;
  high_balls: number;
  crosses_caught: number;
  distribution_success_rate?: number;
  rating?: number;
  strengths?: string;
  areas_for_improvement?: string;
  notes?: string;
  video_url?: string;
  created_by: number;
  created_at: Date;
  updated_at: Date;
}

export interface GoalkeeperStatistics {
  id: number;
  goalkeeper_id: number;
  season: string;
  matches_played: number;
  minutes_played: number;
  goals_conceded: number;
  clean_sheets: number;
  saves: number;
  penalties_saved: number;
  penalties_faced: number;
  yellow_cards: number;
  red_cards: number;
  created_at: Date;
  updated_at: Date;
}

export interface MethodologySetting {
  id: number;
  user_id: number;
  setting_key: string;
  setting_value?: string;
  setting_type: 'text' | 'number' | 'boolean' | 'json';
  category?: string;
  created_at: Date;
  updated_at: Date;
}

export interface RefreshToken {
  id: number;
  user_id: number;
  token: string;
  expires_at: Date;
  created_at: Date;
}

// Tactical editor designs persistence
export interface TrainingDesign {
  id: number;
  user_id: number;
  title: string;
  locale?: string;
  data: any; // Serialized tldraw store JSON
  training_session_id?: number | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateTrainingDesignDTO {
  title: string;
  data: any;
  locale?: string;
  training_session_id?: number | null;
}

export interface UpdateTrainingDesignDTO {
  title?: string;
  data?: any;
  training_session_id?: number | null;
}

// ================================================
// DTOs (Data Transfer Objects)
// ================================================

export interface CreateUserDTO {
  email: string;
  password: string;
  name: string;
  role?: 'admin' | 'coach' | 'assistant';
}

export interface UpdateUserDTO {
  email?: string;
  name?: string;
  role?: 'admin' | 'coach' | 'assistant';
  avatar?: string;
  email_verified?: boolean;
  password?: string;
}

export interface CreateTeamDTO {
  name: string;
  category: string;
  season: string;
  description?: string;
  color?: string;
}

export interface UpdateTeamDTO {
  name?: string;
  category?: string;
  season?: string;
  description?: string;
  color?: string;
  is_active?: boolean;
}

export interface CreateGoalkeeperDTO {
  first_name: string;
  last_name: string;
  date_of_birth?: Date;
  height?: number;
  weight?: number;
  nationality?: string;
  photo?: string;
  dominant_hand?: 'left' | 'right' | 'both';
  team_id?: number;
  jersey_number?: number;
  notes?: string;
}

export interface UpdateGoalkeeperDTO {
  first_name?: string;
  last_name?: string;
  date_of_birth?: Date;
  height?: number;
  weight?: number;
  nationality?: string;
  photo?: string;
  dominant_hand?: 'left' | 'right' | 'both';
  team_id?: number;
  jersey_number?: number;
  notes?: string;
  is_active?: boolean;
}

export interface CreateTaskDTO {
  title: string;
  description?: string;
  category: 'technical' | 'tactical' | 'physical' | 'psychological' | 'goalkeeper_specific';
  subcategory?: string;
  duration?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  objectives?: string;
  materials?: string;
  instructions?: string;
  video_url?: string;
  image_url?: string;
  is_public?: boolean;
}

export interface CreateSessionDTO {
  title: string;
  description?: string;
  session_date: Date;
  start_time?: string;
  end_time?: string;
  location?: string;
  team_id: number;
  session_type?: 'training' | 'match' | 'recovery' | 'tactical' | 'physical';
  notes?: string;
  weather?: string;
}

// ================================================
// QUERY RESULTS
// ================================================

export interface TeamWithStats extends Team {
  total_goalkeepers: number;
  coach_name: string;
}

export interface GoalkeeperWithTeam extends Goalkeeper {
  team_name?: string;
  team_category?: string;
}

export interface SessionWithDetails extends TrainingSession {
  team_name: string;
  tasks: Array<Task & { duration?: number; intensity?: string }>;
  attendance: GoalkeeperAttendance[];
}

export interface GoalkeeperPenaltyStats {
  goalkeeper_id: number;
  goalkeeper_name: string;
  total_penalties: number;
  saved: number;
  conceded: number;
  missed: number;
  post: number;
  save_percentage: number;
}
