'use client';

import { useState } from 'react';
const urlObject = {
  localhost: 'http://localhost:8000',
  ngrok: 'https://c814b2903a2b.ngrok-free.app'
}

const url = urlObject.ngrok;
interface SearchResult {
  title?: string;
  page_number?: number;
  score: number;
  text?: string;
}

interface SearchResponse {
  results: SearchResult[];
}

export default function Home() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cleanText = (input?: string) => {
    const text = (input ?? '').toString();
    return text
      .split('\n')
      .filter(line => line.trim().length > 0)
      .join('\n');
  };

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${url}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          limit: 10
        })
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data: SearchResponse = await response.json();
      setResults(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Guidance Doc Search
        </h1>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search Guidance Docs..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 placeholder-gray-500"
              disabled={loading}
            />
            <button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {results.length > 0 && (
            <h2 className="text-xl font-semibold text-gray-900">
              Found {results.length} results
            </h2>
          )}

          {results.map((result, index) => (
            <div key={`${result.title ?? 'result'}-${result.page_number ?? index}-${index}`} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {result.title || 'Untitled'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Score: {result.score.toFixed(4)} • Page: {result.page_number ?? '—'}
                  </p>
                </div>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  #{index + 1}
                </span>
              </div>

              <div className="prose prose-gray max-w-none">
                <p className="text-gray-900 font-medium bg-yellow-50 p-3 rounded border-l-4 border-yellow-400 whitespace-pre-line">
                  {cleanText(result.text)}
                </p>
              </div>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}
