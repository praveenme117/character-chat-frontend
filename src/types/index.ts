export type Role = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
}

export interface UserData {
  name: string;
  city: string;
}

export interface Avatar {
  id: number;
  staticUrl: string;
  listeningUrl: string;
  speakingUrl: string;
  tapUrl: string;
}
