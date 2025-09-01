export interface Server {
  id: number;
  name: string;
  ip: string;
  port: number;
  description?: string;
  country_code?: string;
  game?: string;  
  prime?: string; 
  map?: string;
  mode?: string;
  current_map?: string;
  game_mode?: string;
  current_players?: number;
  max_players?: number;
  players?: number;
  tags?: string[];
  likes?: number;         
  total_likes?: number; 
  banner_url?: string;
  liked_by_user?: boolean;
}