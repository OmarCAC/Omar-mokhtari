
export type MessageStatus = 'new' | 'assigned' | 'processing' | 'replied' | 'converted' | 'archived' | 'read';
export type MessageType = 'contact' | 'quote';

export interface ChatLogEntry {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface ContactMessage {
  id: string;
  type: MessageType;
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: MessageStatus;
  createdAt: string;
  readAt?: string;
  processedAt?: string;
  repliedAt?: string;
  replyNote?: string;
  isStarred?: boolean;
  
  // Nouveaux champs CRM
  conversationLogs?: ChatLogEntry[];
  tags?: string[];
  assignedTo?: string; // ID de l'expert
}

export interface ContactStats {
  total: number;
  unread: number;
  processing: number;
  replied: number;
  quotes: number;
  archived: number;
  converted: number;
}
