interface StoredMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  category?: "qa" | "assessment" | "content";
  downloadUrl?: string;
  synced?: boolean;
}

const STORAGE_KEY = 'ai_chat_messages';

export const chatStorage = {
  // Get messages from localStorage
  getMessages: (userId: string): StoredMessage[] => {
    try {
      const key = `${STORAGE_KEY}_${userId}`;
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return [];
    }
  },

  // Save messages to localStorage
  saveMessages: (userId: string, messages: StoredMessage[]) => {
    try {
      const key = `${STORAGE_KEY}_${userId}`;
      localStorage.setItem(key, JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },

  // Add a single message
  addMessage: (userId: string, message: StoredMessage) => {
    const messages = chatStorage.getMessages(userId);
    messages.push(message);
    chatStorage.saveMessages(userId, messages);
  },

  // Clear all messages for a user
  clearMessages: (userId: string) => {
    try {
      const key = `${STORAGE_KEY}_${userId}`;
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },

  // Get unsynced messages
  getUnsyncedMessages: (userId: string): StoredMessage[] => {
    const messages = chatStorage.getMessages(userId);
    return messages.filter(msg => !msg.synced);
  },

  // Mark messages as synced
  markMessagesSynced: (userId: string) => {
    const messages = chatStorage.getMessages(userId);
    const syncedMessages = messages.map(msg => ({ ...msg, synced: true }));
    chatStorage.saveMessages(userId, syncedMessages);
  }
};
