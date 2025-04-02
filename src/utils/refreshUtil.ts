
/**
 * Force a hard refresh of the application
 */
export const forceRefresh = () => {
  window.location.reload();
};

/**
 * Clear browser cache and reload
 */
export const clearCacheAndReload = () => {
  if ('caches' in window) {
    caches.keys().then((names) => {
      names.forEach(name => {
        caches.delete(name);
      });
    });
  }
  
  // Clear local storage if needed
  // localStorage.clear();
  
  // Add a timestamp to force cache busting
  const timestamp = new Date().getTime();
  window.location.href = window.location.pathname + '?cache-bust=' + timestamp;
};
