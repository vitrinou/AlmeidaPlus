/**
 * SUPABASE UTILITIES FOR ALMEIDA+
 * Handles all Supabase database operations via secure API proxy
 */

class SupabaseClient {
  constructor() {
    this.apiBase = '/api/supabase';
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  async _fetch(method, table, data = null, filters = null, queryString = null) {
    try {
      // Support legacy callers that pass query string in table param (e.g. "users?id=eq.123")
      let finalTable = table;
      let finalQueryString = queryString;
      const qIdx = table.indexOf('?');
      if (qIdx !== -1) {
        finalTable = table.substring(0, qIdx);
        const qs = table.substring(qIdx + 1);
        finalQueryString = finalQueryString ? `${finalQueryString}&${qs}` : qs;
      }

      const response = await fetch(this.apiBase, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method, table: finalTable, data, filters, queryString: finalQueryString })
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(err.error || `HTTP ${response.status}`);
      }
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

    const result = await this._fetch('GET', 'users', null, { email });
    if (result && result.length > 0) {
      this.cache.set(cacheKey, result[0]);
      setTimeout(() => this.cache.delete(cacheKey), this.cacheTimeout);
      return result[0];
    }
    return null;
  }

  async createUser(userData) {
    const result = await this._fetch('POST', 'users', userData);
    this.cache.delete(`user_${userData.email}`);
    return result && result.length > 0 ? result[0] : null;
  }

  async updateUser(userId, userData) {
    const result = await this._fetch('PATCH', `users`, userData, null, `id=eq.${userId}`);
    this.cache.forEach((value, key) => {
      if (key.startsWith('user_')) {
        this.cache.delete(key);
      }
    });
    return result && result.length > 0 ? result[0] : null;
  }

  async getAllUsers() {
    const cacheKey = 'all_users';
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const result = await this._fetch('GET', 'users');
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

    const result = await this._fetch('GET', 'platforms');
    if (result) {
      this.cache.set(cacheKey, result);
      setTimeout(() => this.cache.delete(cacheKey), this.cacheTimeout);
    }
    return result || [];
  }

  async updatePlatform(platformId, data) {
    const result = await this._fetch('PATCH', 'platforms', data, null, `id=eq.${platformId}`);
    this.cache.delete('all_platforms');
    return result && result.length > 0 ? result[0] : null;
  }

  async addPlatform(platformData) {
    const result = await this._fetch('POST', 'platforms', platformData);
    this.cache.delete('all_platforms');
    return result && result.length > 0 ? result[0] : null;
  }

  // FAVORITES OPERATIONS
  async getUserFavorites(userId) {
    const cacheKey = `favorites_${userId}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const result = await this._fetch('GET', 'user_favorites', null, { user_id: userId });
    if (result) {
      this.cache.set(cacheKey, result);
      setTimeout(() => this.cache.delete(cacheKey), this.cacheTimeout);
    }
    return result || [];
  }

  async addFavorite(userId, movieId, movieTitle) {
    const result = await this._fetch('POST', 'user_favorites', {
      user_id: userId,
      movie_id: movieId,
      movie_title: movieTitle
    });
    this.cache.delete(`favorites_${userId}`);
    return result;
  }

  async removeFavorite(userId, movieId) {
    await this._fetch('DELETE', `user_favorites`, null, null, `user_id=eq.${userId}&movie_id=eq.${movieId}`);
    this.cache.delete(`favorites_${userId}`);
  }

  // SETTINGS OPERATIONS
  async getUserSettings(userId) {
    const cacheKey = `settings_${userId}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const result = await this._fetch('GET', 'user_settings', null, { user_id: userId });
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
      await this._fetch('PATCH', 'user_settings', settings, null, `user_id=eq.${userId}`);
    } else {
      await this._fetch('POST', 'user_settings', {
        user_id: userId,
        ...settings
      });
    }

    this.cache.delete(`settings_${userId}`);
  }

  async request(method, table, data = null) {
    return this._fetch(method, table, data);
  }

  clearCache() {
    this.cache.clear();
  }
}

// Export singleton
window.supabase = new SupabaseClient();
