
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import type { StartupItem, StartupApiResponse } from '@/lib/startup-types';
import StartupShortCard from './StartupShortCard';
import { Loader } from '@/components/ui/loader';
import { useToast } from "@/hooks/use-toast";

interface StartupShortsViewProps {
  fetchApi: (url: string, options?: RequestInit) => Promise<any>;
  lang: 'en' | 'hi';
}

export default function StartupShortsView({ fetchApi, lang }: StartupShortsViewProps) {
  const [items, setItems] = useState<StartupItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [nextSegment, setNextSegment] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const { toast } = useToast();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    axis: 'y',
    containScroll: false,
    align: 'start',
  });

  const fetchItems = useCallback(async (isLoadMore = false) => {
    if (!hasMore && isLoadMore) return;
    if (isLoadMore) {
        setIsLoadingMore(true);
    } else {
        setIsLoading(true);
    }

    try {
        const segmentParam = isLoadMore && nextSegment ? `?nextSegment=${encodeURIComponent(nextSegment)}` : '';
        const url = `/api/startup${segmentParam}`;
        
        const json: StartupApiResponse = await fetchApi(url);
        
        if (json.status !== 'success') {
            throw new Error('API returned an error');
        }

        const newItems = json.data || [];
        
        setItems(prev => isLoadMore ? [...prev, ...newItems] : newItems);
        setNextSegment(json.nextSegment || null);
        setHasMore(!!json.nextSegment && newItems.length > 0);

    } catch (error) {
        const message = error instanceof Error ? error.message : 'Could not load startup feed.';
        toast({ variant: 'destructive', title: 'Error', description: message });
    } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
    }
  }, [nextSegment, hasMore, toast, fetchApi]);
  
  useEffect(() => {
    fetchItems(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSelect = useCallback(() => {
    if (!emblaApi || isLoadingMore) return;

    setSelectedIndex(emblaApi.selectedScrollSnap());
    const totalSlides = emblaApi.scrollSnapList().length;
    const threshold = Math.floor(totalSlides * 0.7);

    if (emblaApi.selectedScrollSnap() >= threshold && hasMore) {
       if (items.length > 0) { // Only load more if initial content is present
          fetchItems(true);
       }
    }
  }, [emblaApi, hasMore, isLoadingMore, fetchItems, items.length]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    onSelect();
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  if (isLoading && items.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader />
      </div>
    );
  }
  
  if (!isLoading && items.length === 0) {
    return <div className="text-center py-20 text-muted-foreground">No items found.</div>;
  }

  return (
    <div className="overflow-hidden h-full w-full" ref={emblaRef}>
      <div className="flex flex-col h-full">
        {items.map((item, index) => (
          <div className="flex-shrink-0 w-full h-full relative" key={item.id}>
            <StartupShortCard item={item} lang={lang} isActive={index === selectedIndex} />
          </div>
        ))}
        {hasMore && (
          <div className="flex-shrink-0 w-full h-full relative flex items-center justify-center bg-black">
            <Loader />
          </div>
        )}
      </div>
    </div>
  );
}
