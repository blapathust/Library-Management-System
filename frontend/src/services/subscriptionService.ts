import api from '../api/axios';
import { BaseService } from './baseService';
import subscriptions, { Subscription } from '../data/subscriptions';

// Create subscription service using the base service with fallback data
const subscriptionBaseService = new BaseService<Subscription>('subscriptions', subscriptions);

export const SubscriptionService = {
  // Get all subscriptions
  getAll: async (): Promise<Subscription[]> => {
    try {
      const response = await api.get('/api/subscriptions');
      return response.data;
    } catch (error) {
      console.error('Error fetching all subscriptions:', error);
      // Fallback to local data
      return subscriptionBaseService.getAll();
    }
  },
  
  // Get all subscriptions for a user
  getByUser: async (userId: string): Promise<Subscription[]> => {
    try {
      const response = await api.get(`/api/subscriptions/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching subscriptions for user ${userId}:`, error);
      // Fallback to local data
      const allSubscriptions = await subscriptionBaseService.getAll();
      return allSubscriptions.filter(sub => sub.userId === userId);
    }
  },

  // Subscribe to a book
  subscribeToBook: async (userId: string, bookId: number): Promise<string> => {
    try {
      const response = await api.post(`/api/subscriptions/subscribe/${userId}/${bookId}`);
      return response.data;
    } catch (error) {
      console.error(`Error subscribing to book ${bookId}:`, error);
      throw error;
    }
  },

  // Unsubscribe
  unsubscribe: async (subscriptionId: number): Promise<void> => {
    try {
      await api.put(`/api/subscriptions/unsubscribe/${subscriptionId}`);
    } catch (error) {
      console.error(`Error unsubscribing from subscription ${subscriptionId}:`, error);
      throw error;
    }
  },

  // Notify all subscribers about book availability
  notifyAll: async (): Promise<{ success: boolean, message: string }> => {
    try {
      const response = await api.post('/api/subscriptions/notify-all');
      return { 
        success: true, 
        message: response.data || 'Notification emails have been sent successfully!'
      };
    } catch (error: unknown) {
      console.error('Error sending subscription notifications:', error);
      const err = error as { response?: { data?: { message?: string } } };
      const errorMessage = err.response?.data?.message || 'Failed to send notification emails.';
      return { success: false, message: errorMessage };
    }
  }
};
