/**
 * Event bus for cross-feature communication in React Native.
 *
 * Unlike the web version, there is no DOM/window.dispatchEvent —
 * everything flows through the in-memory EventBus singleton.
 */

type EventCallback = (data?: any) => void;

interface EventBus {
  subscribe: (event: string, callback: EventCallback) => () => void;
  publish: (event: string, data?: any) => void;
}

// Event types for type safety
export const MFEvents = {
  CITY_SELECTED: 'mf:city-selected',
  WEATHER_LOADED: 'mf:weather-loaded',
  NAVIGATION_REQUEST: 'mf:navigation-request',
  THEME_CHANGED: 'mf:theme-changed',
  USER_LOCATION_CHANGED: 'mf:user-location-changed',
  PODCAST_PLAY_EPISODE: 'mf:podcast-play-episode',
  PODCAST_CLOSE_PLAYER: 'mf:podcast-close-player',
  PODCAST_QUEUE_EPISODE: 'mf:podcast-queue-episode',
  PODCAST_PLAYBACK_STATE: 'mf:podcast-playback-state',
  PODCAST_TOGGLE_PLAY: 'mf:podcast-toggle-play',
  PODCAST_SEEK: 'mf:podcast-seek',
  PODCAST_SKIP_FORWARD: 'mf:podcast-skip-forward',
  PODCAST_SKIP_BACK: 'mf:podcast-skip-back',
  PODCAST_CHANGE_SPEED: 'mf:podcast-change-speed',
  PODCAST_SET_SLEEP_TIMER: 'mf:podcast-set-sleep-timer',
  PODCAST_REMOVE_FROM_QUEUE: 'mf:podcast-remove-from-queue',
  AUDIO_PLAY: 'mf:audio-play',
  AUDIO_CLOSE: 'mf:audio-close',
  AUDIO_PLAYBACK_STATE: 'mf:audio-playback-state',
  AUDIO_TOGGLE_PLAY: 'mf:audio-toggle-play',
  AUDIO_SEEK: 'mf:audio-seek',
  AUDIO_CHANGE_SPEED: 'mf:audio-change-speed',
  AUDIO_SET_SLEEP_TIMER: 'mf:audio-set-sleep-timer',
  AUDIO_QUEUE: 'mf:audio-queue',
  AUDIO_REMOVE_FROM_QUEUE: 'mf:audio-remove-from-queue',
} as const;

// Data-sync events (invalidation signals — no payload)
export const AppEvents = {
  UNITS_CHANGED: 'units-changed',
  WATCHLIST_CHANGED: 'watchlist-changed',
  SUBSCRIPTIONS_CHANGED: 'subscriptions-changed',
  WORSHIP_SONGS_CHANGED: 'worship-songs-changed',
  NOTEBOOK_CHANGED: 'notebook-changed',
  PUBLIC_NOTES_CHANGED: 'public-notes-changed',
  BABY_DUE_DATE_CHANGED: 'baby-due-date-changed',
  CHILD_DATA_CHANGED: 'child-data-changed',
  CHILDREN_LIST_CHANGED: 'children-list-changed',
  NOTIFICATION_ALERTS_CHANGED: 'notification-alerts-changed',
  BIBLE_BOOKMARKS_CHANGED: 'bible-bookmarks-changed',
  CHINESE_CHARACTERS_CHANGED: 'chinese-characters-changed',
  FLASHCARD_PROGRESS_CHANGED: 'flashcard-progress-changed',
  DAILY_LOG_CHANGED: 'daily-log-changed',
  WORSHIP_FAVORITES_CHANGED: 'worship-favorites-changed',
  BOTTOM_NAV_ORDER_CHANGED: 'bottom-nav-order-changed',
  AI_CHAT_UPDATED: 'ai-chat-updated',
  CLOUD_FILES_CHANGED: 'cloud-files-changed',
  IMMIGRATION_CASES_CHANGED: 'immigration-cases-changed',
  RADIO_CHANGED: 'radio-changed',
  POLLS_CHANGED: 'polls-changed',
  TRIPS_CHANGED: 'trips-changed',
  DIGITAL_LIBRARY_CHANGED: 'digital-library-changed',
  FAMILY_GAMES_CHANGED: 'family-games-changed',
  DOC_SCANNER_CHANGED: 'doc-scanner-changed',
  HIKING_ROUTES_CHANGED: 'hiking-routes-changed',
  TRANSIT_CHANGED: 'transit-changed',
  TRANSIT_FAVORITES_CHANGED: 'transit-favorites-changed',
  SHARED_FILES_CHANGED: 'shared-files-changed',
  BABY_MILESTONES_CHANGED: 'baby-milestones-changed',
  BENCHMARK_CHANGED: 'benchmark-changed',
  BOOKS_CHANGED: 'books-changed',
  BOOK_BOOKMARKS_CHANGED: 'book-bookmarks-changed',
  WIDGET_LAYOUT_CHANGED: 'widget-layout-changed',
  TRASH_CHANGED: 'trash-changed',
} as const;

// Keep WindowEvents alias for easier porting from web code
export const WindowEvents = AppEvents;

// Centralised AsyncStorage keys to avoid typo-prone string literals
export const StorageKeys = {
  TEMP_UNIT: 'tempUnit',
  SPEED_UNIT: 'speedUnit',
  DISTANCE_UNIT: 'distanceUnit',
  THEME: 'theme',
  LOCALE: 'weather-app-locale',
  STOCK_WATCHLIST: 'stock-tracker-watchlist',
  PODCAST_SUBSCRIPTIONS: 'podcast-subscriptions',
  PODCAST_PROGRESS: 'podcast-progress',
  PODCAST_SPEED: 'podcast-speed',
  WEATHER_LIVE: 'weather-live-enabled',
  STOCK_LIVE: 'stock-live-enabled',
  DASHBOARD_WIDGETS: 'weather-dashboard-widgets',
  WORSHIP_SONGS_CACHE: 'worship-songs-cache',
  WORSHIP_FAVORITES: 'worship-favorites',
  WORSHIP_SCROLL_SPEED: 'worship-scroll-speed',
  BIBLE_BOOKMARKS: 'bible-bookmarks',
  BIBLE_LAST_READ: 'bible-last-read',
  BIBLE_FONT_SIZE: 'bible-font-size',
  BIBLE_DEVOTIONAL_LOG: 'bible-devotional-log',
  WIDGET_LAYOUT: 'widget-dashboard-layout',
  RECENT_CITIES: 'recent-cities',
  LAST_SEEN_ANNOUNCEMENT: 'last-seen-announcement',
  BIBLE_TRANSLATION: 'bible-translation',
  NOTEBOOK_CACHE: 'notebook-cache',
  BABY_DUE_DATE: 'baby-due-date',
  CHILD_NAME: 'child-name',
  CHILD_BIRTH_DATE: 'child-birth-date',
  CHILD_MILESTONES: 'child-milestones',
  BOTTOM_NAV_ORDER: 'bottom-nav-order',
  WEATHER_ALERTS: 'weather-alerts-enabled',
  ANNOUNCEMENT_ALERTS: 'announcement-alerts-enabled',
  RECENTLY_VISITED: 'recently-visited',
  CHINESE_CHARACTERS_CACHE: 'chinese-characters-cache',
  FLASHCARD_BIBLE_CARDS: 'flashcard-bible-cards',
  FLASHCARD_CUSTOM_CARDS: 'flashcard-custom-cards',
  FLASHCARD_PROGRESS: 'flashcard-progress',
  FLASHCARD_TYPE_FILTER: 'flashcard-type-filter',
  DAILY_LOG_CACHE: 'daily-log-cache',
  PODCAST_NOW_PLAYING: 'podcast-now-playing',
  AI_CHAT_HISTORY: 'ai-chat-history',
  AI_DEBUG_MODE: 'ai-debug-mode',
  CLOUD_FILES_CACHE: 'cloud-files-cache',
  IMMIGRATION_CASES_CACHE: 'immigration-cases-cache',
  BENCHMARK_HISTORY_CACHE: 'benchmark-history-cache',
  BENCHMARK_ENDPOINTS: 'benchmark-endpoints',
  BENCHMARK_RESULTS: 'benchmark-results',
  RADIO_FAVORITES: 'radio-favorites',
  POLL_CACHE: 'poll-cache',
  TRIP_CACHE: 'trip-cache',
  DIGITAL_LIBRARY_CACHE: 'digital-library-cache',
  FAMILY_GAMES_CACHE: 'family-games-cache',
  DOC_SCANNER_CACHE: 'doc-scanner-cache',
  HIKING_ROUTES_CACHE: 'hiking-routes-cache',
  TRANSIT_RECENT_STOPS: 'transit-recent-stops',
  TRANSIT_FAVORITES: 'transit-favorites',
  CHILDREN_LIST: 'children-list',
  CHECKED_MILESTONES: 'checked-milestones',
} as const;

export interface CitySelectedEvent {
  city: {
    id: string;
    name: string;
    lat: number;
    lon: number;
    country: string;
    state?: string;
  };
}

export interface NavigationRequestEvent {
  path: string;
  params?: Record<string, string>;
}

export interface PodcastPlayEpisodeEvent {
  episode: import('../types/podcast').Episode;
  podcast: import('../types/podcast').Podcast | null;
}

class EventBusImpl implements EventBus {
  private listeners: Map<string, Set<EventCallback>> = new Map();

  subscribe(event: string, callback: EventCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  publish(event: string, data?: any): void {
    this.listeners.get(event)?.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }
}

// Singleton instance
export const eventBus = new EventBusImpl();

// Hook for React components
export function useEventBus() {
  return eventBus;
}

// Helper to listen to app events from other features
export function subscribeToAppEvent<T = any>(
  event: string,
  callback: (data: T) => void,
): () => void {
  return eventBus.subscribe(event, callback);
}

// Keep web compat name for easier porting
export const subscribeToMFEvent = subscribeToAppEvent;
