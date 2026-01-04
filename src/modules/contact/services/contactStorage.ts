
import { ContactMessage, ContactStats, MessageStatus, ChatLogEntry } from "../types/ContactMessage";
import { supabase } from "../../../lib/supabase";

export const contactStorage = {
  getMessages: async (): Promise<ContactMessage[]> => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching messages:", error);
      return [];
    }

    return (data || []).map((m: any) => ({
      id: m.id,
      type: m.type,
      fullName: m.full_name,
      email: m.email,
      phone: m.phone,
      subject: m.subject,
      message: m.message,
      status: m.status,
      createdAt: m.created_at,
      readAt: m.read_at,
      processedAt: m.processed_at,
      repliedAt: m.replied_at,
      replyNote: m.reply_note,
      isStarred: m.is_starred,
      conversationLogs: m.conversation_logs, // Stocké en JSONB dans Supabase
      tags: m.tags || [],
      assignedTo: m.assigned_to
    }));
  },

  createMessage: async (data: Partial<ContactMessage>): Promise<void> => {
    const { error } = await supabase
      .from('messages')
      .insert([{
        type: data.type,
        full_name: data.fullName,
        email: data.email,
        phone: data.phone,
        subject: data.subject,
        message: data.message,
        status: 'new',
        conversation_logs: data.conversationLogs,
        tags: data.tags || []
      }]);

    if (error) throw error;
  },

  updateStatus: async (id: string, status: MessageStatus): Promise<void> => {
    await supabase.from('messages').update({ status }).eq('id', id);
  },

  updateTags: async (id: string, tags: string[]): Promise<void> => {
    await supabase.from('messages').update({ tags }).eq('id', id);
  },

  assignTo: async (id: string, userId: string): Promise<void> => {
    await supabase.from('messages').update({ 
        assigned_to: userId,
        status: 'assigned' 
    }).eq('id', id);
  },

  markAsRead: async (id: string): Promise<void> => {
    await supabase.from('messages').update({ read_at: new Date().toISOString() }).eq('id', id);
  },

  toggleStar: async (id: string): Promise<void> => {
    const { data } = await supabase.from('messages').select('is_starred').eq('id', id).single();
    if (data) {
        await supabase.from('messages').update({ is_starred: !data.is_starred }).eq('id', id);
    }
  },

  logReply: async (id: string, note: string): Promise<void> => {
    await supabase.from('messages').update({ 
        status: 'replied', 
        replied_at: new Date().toISOString(),
        reply_note: note 
      }).eq('id', id);
  },

  deleteMessage: async (id: string): Promise<void> => {
    await supabase.from('messages').delete().eq('id', id);
  },

  // Added cleanupOldMessages method to handle automatic message retention policies
  cleanupOldMessages: async (days: number): Promise<number> => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const { error, count } = await supabase
      .from('messages')
      .delete({ count: 'exact' })
      .lt('created_at', cutoff.toISOString());
    
    if (error) {
      console.error("Error cleaning up messages:", error);
      return 0;
    }
    return count || 0;
  },

  getStats: async (): Promise<ContactStats> => {
    const { data } = await supabase.from('messages').select('status, type');
    const msgs = data || [];
    return {
      total: msgs.length,
      unread: msgs.filter(m => m.status === 'new').length,
      processing: msgs.filter(m => m.status === 'processing').length,
      replied: msgs.filter(m => m.status === 'replied').length,
      quotes: msgs.filter(m => m.type === 'quote').length,
      archived: msgs.filter(m => m.status === 'archived').length,
      converted: msgs.filter(m => m.status === 'converted').length
    };
  }
};
