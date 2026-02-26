
export const platformService = {
  getPlatform: () => {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    if (/android/i.test(userAgent)) return 'Android';
    if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) return 'iOS';
    return 'Desktop/Web';
  },

  vibrate: (pattern: number | number[] = 10) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  },

  share: async (title: string, text: string, url: string) => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return true;
      } catch (e) {
        return false;
      }
    }
    return false;
  },

  copyToClipboard: (text: string) => {
    navigator.clipboard.writeText(text);
  }
};
