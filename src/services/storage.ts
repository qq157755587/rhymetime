import { RhymeData, FavoriteRhyme, RhymeHistory, AppConfig } from '../types';

export class RhymeStorage {
  private static readonly HISTORY_KEY = 'rhymetime_history';
  private static readonly FAVORITES_KEY = 'rhymetime_favorites';
  private static readonly CONFIG_KEY = 'rhymetime_config';
  private static readonly MAX_HISTORY_ITEMS = 20;

  // History Management
  static saveToHistory(rhyme: RhymeData): void {
    try {
      const history = this.getHistory();
      
      // Remove if already exists (to avoid duplicates)
      const filteredHistory = history.filter(item => item.id !== rhyme.id);
      
      // Add to beginning
      filteredHistory.unshift(rhyme);
      
      // Keep only the latest MAX_HISTORY_ITEMS
      const trimmedHistory = filteredHistory.slice(0, this.MAX_HISTORY_ITEMS);
      
      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(trimmedHistory));
    } catch (error) {
      console.error('Failed to save rhyme to history:', error);
    }
  }

  static getHistory(): RhymeData[] {
    try {
      const historyJson = localStorage.getItem(this.HISTORY_KEY);
      return historyJson ? JSON.parse(historyJson) : [];
    } catch (error) {
      console.error('Failed to load history:', error);
      return [];
    }
  }

  static updateRhymeInHistory(rhymeId: string, updatedRhyme: RhymeData): void {
    try {
      const history = this.getHistory();
      const index = history.findIndex(rhyme => rhyme.id === rhymeId);
      
      if (index !== -1) {
        history[index] = updatedRhyme;
        localStorage.setItem(this.HISTORY_KEY, JSON.stringify(history));
      }
    } catch (error) {
      console.error('Failed to update rhyme in history:', error);
    }
  }

  static removeFromHistory(rhymeId: string): void {
    try {
      const history = this.getHistory();
      const filteredHistory = history.filter(item => item.id !== rhymeId);
      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(filteredHistory));
    } catch (error) {
      console.error('Failed to remove rhyme from history:', error);
    }
  }

  // Favorites Management
  static addFavorite(favorite: FavoriteRhyme): void {
    try {
      const favorites = this.getFavorites();
      
      // Remove if already exists
      const filteredFavorites = favorites.filter(item => item.id !== favorite.id);
      
      // Add to beginning
      filteredFavorites.unshift(favorite);
      
      localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(filteredFavorites));
    } catch (error) {
      console.error('Failed to add favorite:', error);
    }
  }

  static getFavorites(): FavoriteRhyme[] {
    try {
      const favoritesJson = localStorage.getItem(this.FAVORITES_KEY);
      return favoritesJson ? JSON.parse(favoritesJson) : [];
    } catch (error) {
      console.error('Failed to load favorites:', error);
      return [];
    }
  }

  static removeFavorite(rhymeId: string): void {
    try {
      const favorites = this.getFavorites();
      const filteredFavorites = favorites.filter(item => item.id !== rhymeId);
      localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(filteredFavorites));
    } catch (error) {
      console.error('Failed to remove favorite:', error);
    }
  }

  // Configuration Management
  static saveConfig(config: Partial<AppConfig>): void {
    try {
      const currentConfig = this.getConfig();
      const updatedConfig = { ...currentConfig, ...config };
      localStorage.setItem(this.CONFIG_KEY, JSON.stringify(updatedConfig));
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  }

  static getConfig(): AppConfig {
    try {
      const configJson = localStorage.getItem(this.CONFIG_KEY);
      const defaultConfig: AppConfig = {
        language: 'en',
        ttsProvider: 'gemini',
        sttProvider: 'google-cloud',
        llmProvider: 'gemini',
        autoPlay: true,
        showWordTimings: true,
        childFriendlyMode: true,
      };
      
      return configJson ? { ...defaultConfig, ...JSON.parse(configJson) } : defaultConfig;
    } catch (error) {
      console.error('Failed to load config:', error);
      return {
        language: 'en',
        ttsProvider: 'gemini',
        sttProvider: 'google-cloud',
        llmProvider: 'gemini',
        autoPlay: true,
        showWordTimings: true,
        childFriendlyMode: true,
      };
    }
  }

  // Utility Methods
  static exportData(): string {
    try {
      const data = {
        history: this.getHistory(),
        favorites: this.getFavorites(),
        config: this.getConfig(),
        exportedAt: new Date().toISOString(),
      };
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Failed to export data:', error);
      return '{}';
    }
  }

  static importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.history) {
        localStorage.setItem(this.HISTORY_KEY, JSON.stringify(data.history));
      }
      
      if (data.favorites) {
        localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(data.favorites));
      }
      
      if (data.config) {
        localStorage.setItem(this.CONFIG_KEY, JSON.stringify(data.config));
      }
      
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }

  static clearAllData(): void {
    try {
      localStorage.removeItem(this.HISTORY_KEY);
      localStorage.removeItem(this.FAVORITES_KEY);
      localStorage.removeItem(this.CONFIG_KEY);
    } catch (error) {
      console.error('Failed to clear data:', error);
    }
  }

  static getStorageUsage(): { used: number; total: number; percentage: number } {
    try {
      let used = 0;
      
      // Calculate used storage
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key) && key.startsWith('rhymetime_')) {
          used += localStorage[key].length;
        }
      }
      
      // Estimate total available (5MB is typical for localStorage)
      const total = 5 * 1024 * 1024; // 5MB in bytes
      const percentage = (used / total) * 100;
      
      return { used, total, percentage };
    } catch (error) {
      console.error('Failed to calculate storage usage:', error);
      return { used: 0, total: 0, percentage: 0 };
    }
  }
}