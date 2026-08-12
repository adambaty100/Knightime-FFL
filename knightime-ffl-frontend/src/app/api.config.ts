declare global {
  interface Window {
    __KNIGHTIME_CONFIG__?: {
      apiBaseUrl?: string;
    };
  }
}

const configuredApiUrl = window.__KNIGHTIME_CONFIG__?.apiBaseUrl?.replace(/\/+$/, '');
const localApiUrl = `http://${window.location.hostname}:8000`;

export const API_BASE_URL = configuredApiUrl || localApiUrl;
