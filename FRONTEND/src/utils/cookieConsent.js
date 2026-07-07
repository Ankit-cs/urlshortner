const CONSENT_KEY = 'shrink_cookie_consent';

const DEFAULT_CONSENT = {
  necessary: true, // Always true
  analytics: false,
  functional: false,
  timestamp: null,
};

class CookieConsentManager {
  constructor() {
    this.preferences = this._loadPreferences();
  }

  _loadPreferences() {
    if (typeof window === 'undefined') return DEFAULT_CONSENT;
    
    try {
      const stored = localStorage.getItem(CONSENT_KEY);
      if (stored) {
        return { ...DEFAULT_CONSENT, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('Failed to parse cookie consent preferences', e);
    }
    return null; // Return null if user hasn't made a choice yet
  }

  getPreferences() {
    return this.preferences || DEFAULT_CONSENT;
  }

  hasConsented() {
    return this.preferences !== null;
  }

  setPreferences(newPreferences) {
    const preferencesToSave = {
      ...this.getPreferences(),
      ...newPreferences,
      necessary: true, // Force necessary to true
      timestamp: new Date().toISOString(),
    };

    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(preferencesToSave));
      this.preferences = preferencesToSave;
      
      // Emit an event so the UI or other scripts can react
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('cookieConsentChanged', {
          detail: this.preferences
        });
        window.dispatchEvent(event);
      }
    } catch (e) {
      console.error('Failed to save cookie consent preferences', e);
    }
  }

  acceptAll() {
    this.setPreferences({
      analytics: true,
      functional: true,
    });
  }

  rejectNonEssential() {
    this.setPreferences({
      analytics: false,
      functional: false,
    });
  }

  hasAnalytics() {
    return this.getPreferences().analytics === true;
  }

  hasFunctional() {
    return this.getPreferences().functional === true;
  }
}

export const CookieConsent = new CookieConsentManager();
