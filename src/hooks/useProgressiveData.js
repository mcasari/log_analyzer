import { useState, useEffect, useCallback, useRef } from 'react';

const useProgressiveData = (options = {}) => {
  const {
    pageSize = 100,
    maxMemoryPages = 10,
    preloadPages = 2,
    onLoadMore,
    onError,
    initialData = []
  } = options;

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [memoryPages, setMemoryPages] = useState(new Map());
  
  const abortControllerRef = useRef(null);
  const loadingRef = useRef(false);

  // Memory management for pages
  const manageMemory = useCallback(() => {
    if (memoryPages.size > maxMemoryPages) {
      const sortedPages = Array.from(memoryPages.entries())
        .sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed);
      
      // Remove oldest pages
      const pagesToRemove = sortedPages.slice(0, memoryPages.size - maxMemoryPages);
      pagesToRemove.forEach(([pageNum]) => {
        memoryPages.delete(pageNum);
      });
      
      setMemoryPages(new Map(memoryPages));
    }
  }, [memoryPages, maxMemoryPages]);

  // Load a specific page
  const loadPage = useCallback(async (pageNumber) => {
    if (loadingRef.current || memoryPages.has(pageNumber)) {
      return memoryPages.get(pageNumber)?.data || [];
    }

    if (!onLoadMore) {
      console.warn('onLoadMore callback is required for progressive loading');
      return [];
    }

    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const result = await onLoadMore({
        page: pageNumber,
        pageSize,
        signal: abortControllerRef.current.signal
      });

      const pageData = {
        data: result.data || [],
        page: pageNumber,
        totalCount: result.totalCount || 0,
        hasMore: result.hasMore !== undefined ? result.hasMore : true,
        lastAccessed: Date.now()
      };

      // Update memory pages
      const newMemoryPages = new Map(memoryPages);
      newMemoryPages.set(pageNumber, pageData);
      setMemoryPages(newMemoryPages);

      // Update state
      setTotalCount(result.totalCount || 0);
      setHasMore(result.hasMore !== undefined ? result.hasMore : true);

      // Trigger memory management
      setTimeout(manageMemory, 0);

      return pageData.data;
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err);
        if (onError) {
          onError(err);
        }
      }
      return [];
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [pageSize, memoryPages, onLoadMore, onError, manageMemory]);

  // Get visible data for a range
  const getVisibleData = useCallback(async (startIndex, endIndex) => {
    const startPage = Math.floor(startIndex / pageSize);
    const endPage = Math.floor(endIndex / pageSize);
    
    const visibleData = [];
    const loadPromises = [];

    // Load required pages
    for (let page = startPage; page <= endPage; page++) {
      if (memoryPages.has(page)) {
        // Update last accessed time
        const pageData = memoryPages.get(page);
        pageData.lastAccessed = Date.now();
      } else {
        loadPromises.push(loadPage(page));
      }
    }

    // Wait for any new pages to load
    if (loadPromises.length > 0) {
      await Promise.all(loadPromises);
    }

    // Collect visible data
    for (let page = startPage; page <= endPage; page++) {
      const pageData = memoryPages.get(page);
      if (pageData) {
        const pageStartIndex = page * pageSize;
        const pageEndIndex = pageStartIndex + pageSize;
        
        // Calculate slice indices relative to the page
        const sliceStart = Math.max(0, startIndex - pageStartIndex);
        const sliceEnd = Math.min(pageSize, endIndex - pageStartIndex + 1);
        
        const pageSlice = pageData.data.slice(sliceStart, sliceEnd);
        visibleData.push(...pageSlice);
      }
    }

    return visibleData;
  }, [pageSize, memoryPages, loadPage]);

  // Preload adjacent pages
  const preloadAdjacentPages = useCallback(async (centerPage) => {
    const pagesToPreload = [];
    
    for (let i = 1; i <= preloadPages; i++) {
      const prevPage = centerPage - i;
      const nextPage = centerPage + i;
      
      if (prevPage >= 0 && !memoryPages.has(prevPage)) {
        pagesToPreload.push(prevPage);
      }
      
      if (!memoryPages.has(nextPage)) {
        pagesToPreload.push(nextPage);
      }
    }

    // Load pages in background
    pagesToPreload.forEach(page => {
      setTimeout(() => loadPage(page), 100 * (page - centerPage));
    });
  }, [preloadPages, memoryPages, loadPage]);

  // Load next page
  const loadNextPage = useCallback(async () => {
    if (!hasMore || loading) return false;

    const nextPage = currentPage + 1;
    const pageData = await loadPage(nextPage);
    
    if (pageData.length > 0) {
      setData(prevData => [...prevData, ...pageData]);
      setCurrentPage(nextPage);
      
      // Preload adjacent pages
      preloadAdjacentPages(nextPage);
      
      return true;
    }
    
    return false;
  }, [currentPage, hasMore, loading, loadPage, preloadAdjacentPages]);

  // Reset data
  const reset = useCallback(() => {
    setData([]);
    setCurrentPage(0);
    setMemoryPages(new Map());
    setHasMore(true);
    setError(null);
    setTotalCount(0);
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Search functionality
  const search = useCallback(async (query, searchOptions = {}) => {
    if (!onLoadMore) return [];

    try {
      setLoading(true);
      const result = await onLoadMore({
        page: 0,
        pageSize: searchOptions.limit || 100,
        search: query,
        ...searchOptions
      });

      return result.data || [];
    } catch (err) {
      setError(err);
      if (onError) {
        onError(err);
      }
      return [];
    } finally {
      setLoading(false);
    }
  }, [onLoadMore, onError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    hasMore,
    currentPage,
    totalCount,
    loadNextPage,
    getVisibleData,
    loadPage,
    reset,
    search,
    memoryUsage: memoryPages.size,
    isPageLoaded: (page) => memoryPages.has(page)
  };
};

export default useProgressiveData;