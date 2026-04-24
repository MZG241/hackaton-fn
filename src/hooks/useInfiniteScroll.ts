import { useState, useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  threshold?: number;
  initialPage?: number;
  limit?: number;
}

export const useInfiniteScroll = (
  fetchFn: (page: number, limit: number) => Promise<boolean>,
  options: UseInfiniteScrollOptions = {}
) => {
  const { threshold = 100, initialPage = 1, limit = 20 } = options;
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const isFetching = useRef(false);
  const lastFetchedPage = useRef(0);

  const loadMore = useCallback(async (pageToLoad: number) => {
    if (loading || !hasMore || isFetching.current || lastFetchedPage.current === pageToLoad) return;

    isFetching.current = true;
    setLoading(true);
    
    try {
      const moreAvailable = await fetchFn(pageToLoad, limit);
      lastFetchedPage.current = pageToLoad;
      
      if (moreAvailable) {
        setPage(pageToLoad);
      } else {
        setHasMore(false);
      }
    } catch (e) {
      console.error("Infinite scroll fetch error:", e);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, [fetchFn, hasMore, loading, limit]);

  useEffect(() => {
    // Initial load
    if (page === initialPage && hasMore && !loading && lastFetchedPage.current === 0) {
      loadMore(initialPage);
    }
  }, [initialPage, loadMore]); // Add dependencies correctly

  useEffect(() => {
    const handleScroll = () => {
      if (loading || !hasMore || isFetching.current) return;
      
      // Attempt to find the best scrollable container
      // Priority: scrollRef -> nearest scrollable parent of scrollRef -> main element -> document
      let element: HTMLElement | null = scrollRef.current;
      
      if (element) {
        // If the element itself isn't scrollable, look for candidates
        if (element.scrollHeight <= element.clientHeight) {
            const nearestMain = document.querySelector('main');
            if (nearestMain) element = nearestMain;
        }
      } else {
        element = document.querySelector('main') as HTMLElement || document.documentElement;
      }

      const { scrollTop, scrollHeight, clientHeight } = element;

      if (scrollHeight - scrollTop - clientHeight < threshold) {
        loadMore(page + 1);
      }
    };

    // If we're monitoring 'main', we need to attach the listener to it
    const scrollTarget = scrollRef.current;
    const isInternalScroll = scrollTarget ? (scrollTarget.scrollHeight > scrollTarget.clientHeight) : false;
    const container = isInternalScroll ? scrollTarget : (document.querySelector('main') || (typeof window !== 'undefined' ? window : null));

    if (container) {
      container.addEventListener('scroll', handleScroll as any);
      return () => container.removeEventListener('scroll', handleScroll as any);
    }
  }, [loadMore, threshold]);

  const reset = useCallback(() => {
    setPage(initialPage);
    setHasMore(true);
    lastFetchedPage.current = 0;
  }, [initialPage]);

  return { scrollRef, loading, hasMore, page, reset };
};
