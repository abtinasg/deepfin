'use client';

import { useQuery } from '@tanstack/react-query';
import { ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { NewsItem } from '@/types/stock';

interface RecentNewsProps {
  ticker: string;
}

export function RecentNews({ ticker }: RecentNewsProps) {
  const { data: news, isLoading } = useQuery<NewsItem[]>({
    queryKey: ['stock-news', ticker],
    queryFn: async () => {
      // For now, return empty array - integrate with news API later
      return [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border p-8">
        <h2 className="text-2xl font-semibold mb-6">Recent News</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border p-8">
      <h2 className="text-2xl font-semibold mb-6">Recent News</h2>
      
      {!news || news.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No recent news available</p>
          <p className="text-sm text-gray-400 mt-2">
            News integration coming soon
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {news.slice(0, 3).map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block p-4 border rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              <div className="flex gap-4">
                {item.thumbnail && (
                  <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={item.thumbnail}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                    <span>{item.source}</span>
                    <span>•</span>
                    <span>
                      {formatDistanceToNow(new Date(item.publishedAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  {item.summary && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {item.summary}
                    </p>
                  )}
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
