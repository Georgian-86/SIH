import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from 'react-query';
import { 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc,
  Tag,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { apiEndpoints } from '../services/api';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import toast from 'react-hot-toast';

interface SearchResult {
  term: {
    id: string;
    term: string;
    category: string;
    synonyms: string[];
    icd11_tm2_code?: string;
    references: string;
    description: string;
  };
  score: number;
}

const SearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'name'>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string>('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch search results
  const { data: searchResults, isLoading, error } = useQuery(
    ['search', debouncedQuery, categoryFilter],
    () => apiEndpoints.searchTerms(debouncedQuery, { category: categoryFilter || undefined }),
    {
      enabled: debouncedQuery.length >= 2,
      select: (data) => data.data.results || []
    }
  );

  // Fetch categories for filter
  const { data: statsData } = useQuery(
    'statistics',
    () => apiEndpoints.getStatistics().then(res => res.data),
    { select: (data) => data.statistics?.categories || [] }
  );

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.success('ID copied to clipboard!');
    setTimeout(() => setCopiedId(''), 2000);
  };

  const sortedResults = React.useMemo(() => {
    if (!searchResults) return [];
    
    return [...searchResults].sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'score') {
        comparison = a.score - b.score;
      } else {
        comparison = a.term.term.localeCompare(b.term.term);
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [searchResults, sortBy, sortOrder]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-primary-100 rounded-lg">
            <Search className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Search & Browse</h1>
            <p className="text-gray-600">Find NAMASTE terminology with advanced search</p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for terms, synonyms, or concepts..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mt-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Categories</option>
              {statsData?.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'score' | 'name')}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="score">Sort by Score</option>
              <option value="name">Sort by Name</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-1 hover:bg-gray-100 rounded-md"
            >
              {sortOrder === 'asc' ? (
                <SortAsc className="h-4 w-4 text-gray-500" />
              ) : (
                <SortDesc className="h-4 w-4 text-gray-500" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {isLoading && debouncedQuery && (
          <div className="p-8">
            <LoadingSpinner message="Searching..." />
          </div>
        )}

        {error && (
          <div className="p-8 text-center">
            <div className="text-red-600 mb-2">Search failed</div>
            <p className="text-gray-600">Please try again</p>
          </div>
        )}

        {!isLoading && !error && debouncedQuery && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Search Results ({sortedResults.length})
              </h2>
              {query && (
                <p className="text-sm text-gray-600">
                  Results for "{query}"
                </p>
              )}
            </div>

            <AnimatePresence>
              <div className="space-y-4">
                {sortedResults.map((result, index) => (
                  <motion.div
                    key={result.term.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {result.term.term}
                          </h3>
                          <span className="px-2 py-1 bg-primary-100 text-primary-800 text-xs font-medium rounded-full">
                            {result.term.category}
                          </span>
                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <span>Score:</span>
                            <span className="font-medium">{result.score.toFixed(1)}</span>
                          </div>
                        </div>

                        {result.term.description && (
                          <p className="text-gray-600 mb-3">{result.term.description}</p>
                        )}

                        {result.term.synonyms.length > 0 && (
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <Tag className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-500">Synonyms:</span>
                            {result.term.synonyms.map((synonym, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-md"
                              >
                                {synonym}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>ID: {result.term.id}</span>
                          {result.term.icd11_tm2_code && (
                            <span>ICD-11: {result.term.icd11_tm2_code}</span>
                          )}
                          {result.term.references && (
                            <span>Ref: {result.term.references}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleCopyId(result.term.id)}
                          className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                          title="Copy ID"
                        >
                          {copiedId === result.term.id ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4 text-gray-500" />
                          )}
                        </button>
                        
                        {result.term.icd11_tm2_code && (
                          <button
                            onClick={() => window.open(`https://icd.who.int/browse11/l-m/en#/http://id.who.int/icd/entity/${result.term.icd11_tm2_code}`, '_blank')}
                            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                            title="View in ICD-11"
                          >
                            <ExternalLink className="h-4 w-4 text-gray-500" />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>

            {sortedResults.length === 0 && (
              <div className="text-center py-8">
                <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600">Try adjusting your search terms or filters</p>
              </div>
            )}
          </div>
        )}

        {!debouncedQuery && (
          <div className="p-8 text-center">
            <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Start searching</h3>
            <p className="text-gray-600">Enter a search term to find NAMASTE terminology</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
