'use client';

import { useMemo, useState } from 'react';

import videosData from '@/data/videos.json';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { Video } from '@/types';

import { Header } from './_components/header';
import { SearchBar } from './_components/search-bar';
import { VideoCard } from './_components/video-card';

// 빌드 시점에 import된 데이터 사용
const videos = (Array.isArray(videosData) ? videosData : []) as Video[];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 300);

  // 검색어로 필터링된 비디오 목록
  const filteredVideos = useMemo(() => {
    if (!debouncedSearchQuery.trim()) {
      return videos;
    }

    const query = debouncedSearchQuery.toLowerCase().trim();
    return videos.filter(
      (video: Video) =>
        video.title.toLowerCase().includes(query) || video.synopsis?.toLowerCase().includes(query)
    );
  }, [debouncedSearchQuery]);

  return (
    <div className="bg-background min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredVideos.map((video: Video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      </main>
    </div>
  );
}
