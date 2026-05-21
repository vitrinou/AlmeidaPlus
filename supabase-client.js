/**
 * SUPABASE UTILITIES FOR ALMEIDA+
 * Handles all Supabase database operations with caching
 */

const SUPABASE_URL = 'https://kltmddxlionutfxtbzgz.supabase.co';
const SUPABASE_KEY = 'sb_publishable_ONblKy95Ya925lHHWHINeA_20KZ922w';

class SupabaseClient {
  constructor() {
    this.url = SUPABASE_URL;
    this.key = SUPABASE_KEY;
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  async request(method, table, data = null, filters = null) {
    try {
      let url = `${this.url}/rest/v1/${table}`;
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.key}`,
        'apikey': this.key
      };

      // Build query string for filters
      if (filters) {
        const filterStr = Object.entries(filters)
          .map(([key, value]) => `${key}=eq.${encodeURIComponent(value)}`)
          .join('&');
        url += `?${filterStr}`;
      }

      const options = {
        method,
        headers
      };

      if (data) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(url, options);
      if (!response.ok) throw new Error(`Supabase error: ${response.status}`);
      
      return await response.json();
    } catch (error) {
      console.error('Supabase request error:', error);
      return null;
    }
  }

  // USERS OPERATIONS
  async getUser(email) {
    const cacheKey = `user_${email}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const result = await this.request('GET', 'users', null, { email });
    if (result && result.length > 0) {
      this.cache.set(cacheKey, result[0]);
      setTimeout(() => this.cache.delete(cacheKey), this.cacheTimeout);
      return result[0];
    }
    return null;
  }

  async createUser(userData) {
    const result = await this.request('POST', 'users', userData);
    this.cache.delete(`user_${userData.email}`);
    return result ? result[0] : null;
  }

  async updateUser(userId, userData) {
    const result = await this.request('PATCH', `users?id=eq.${userId}`, userData);
    // Clear cache
    this.cache.forEach((value, key) => {
      if (key.startsWith('user_')) {
        this.cache.delete(key);
      }
    });
    return result;
  }

  async getAllUsers() {
    const cacheKey = 'all_users';
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const result = await this.request('GET', 'users');
    if (result) {
      this.cache.set(cacheKey, result);
      setTimeout(() => this.cache.delete(cacheKey), this.cacheTimeout);
    }
    return result || [];
  }

  // PLATFORMS OPERATIONS
  async getPlatforms() {
    const cacheKey = 'all_platforms';
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const result = await this.request('GET', 'platforms');
    if (result) {
      this.cache.set(cacheKey, result);
      setTimeout(() => this.cache.delete(cacheKey), this.cacheTimeout);
    }
    return result || [];
  }

  async updatePlatform(platformId, data) {
    const result = await this.request('PATCH', `platforms?id=eq.${platformId}`, data);
    this.cache.delete('all_platforms');
    return result;
  }

  async addPlatform(platformData) {
    const result = await this.request('POST', 'platforms', platformData);
    this.cache.delete('all_platforms');
    return result;
  }

  // FAVORITES OPERATIONS
  async getUserFavorites(userId) {
    const cacheKey = `favorites_${userId}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const result = await this.request('GET', 'user_favorites', null, { user_id: userId });
    if (result) {
      this.cache.set(cacheKey, result);
      setTimeout(() => this.cache.delete(cacheKey), this.cacheTimeout);
    }
    return result || [];
  }

  async addFavorite(userId, movieId, movieTitle) {
    const result = await this.request('POST', 'user_favorites', {
      user_id: userId,
      movie_id: movieId,
      movie_title: movieTitle
    });
    this.cache.delete(`favorites_${userId}`);
    return result;
  }

  async removeFavorite(userId, movieId) {
    await this.request('DELETE', `user_favorites?user_id=eq.${userId}&movie_id=eq.${movieId}`);
    this.cache.delete(`favorites_${userId}`);
  }

  // SETTINGS OPERATIONS
  async getUserSettings(userId) {
    const cacheKey = `settings_${userId}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const result = await this.request('GET', 'user_settings', null, { user_id: userId });
    if (result && result.length > 0) {
      this.cache.set(cacheKey, result[0]);
      setTimeout(() => this.cache.delete(cacheKey), this.cacheTimeout);
      return result[0];
    }
    return null;
  }

  async updateSettings(userId, settings) {
    const existing = await this.getUserSettings(userId);
    
    if (existing) {
      await this.request('PATCH', `user_settings?user_id=eq.${userId}`, settings);
    } else {
      await this.request('POST', 'user_settings', {
        user_id: userId,
        ...settings
      });
    }
    
    this.cache.delete(`settings_${userId}`);
  }

  clearCache() {
    this.cache.clear();
  }
}

// Export singleton
window.supabase = new SupabaseClient();
