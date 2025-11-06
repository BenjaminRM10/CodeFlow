import { SearchProvider } from '@/types';

interface SearchResult {
  success: boolean;
  context: string;
  error?: string;
}

export async function performWebSearch(
  query: string,
  provider: SearchProvider,
  apiKey: string
): Promise<SearchResult> {
  if (!apiKey) {
    console.warn('No search API key configured, using fallback context');
    return {
      success: false,
      context: 'No search performed - using latest best practices and syntax',
      error: 'API key not configured'
    };
  }

  try {
    switch (provider) {
      case 'serper':
        return await searchSerper(query, apiKey);
      case 'bing':
        return await searchBing(query, apiKey);
      case 'google':
        return await searchGoogle(query, apiKey);
      case 'serpapi':
        return await searchSerpAPI(query, apiKey);
      default:
        return {
          success: false,
          context: 'Unknown search provider',
          error: 'Invalid provider'
        };
    }
  } catch (error) {
    console.error('Search error:', error);
    return {
      success: false,
      context: 'Search failed - using latest best practices',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function searchSerper(query: string, apiKey: string): Promise<SearchResult> {
  const response = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ q: query }),
  });

  if (!response.ok) {
    throw new Error(`Serper API error: ${response.status}`);
  }

  const data = await response.json();
  const context = extractSearchContext(data.organic || []);
  
  return {
    success: true,
    context,
  };
}

async function searchBing(query: string, apiKey: string): Promise<SearchResult> {
  const response = await fetch(
    `https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(query)}`,
    {
      headers: {
        'Ocp-Apim-Subscription-Key': apiKey,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Bing API error: ${response.status}`);
  }

  const data = await response.json();
  const context = extractSearchContext(data.webPages?.value || []);
  
  return {
    success: true,
    context,
  };
}

async function searchGoogle(query: string, apiKey: string): Promise<SearchResult> {
  // Google Custom Search requires both API key and Search Engine ID
  // This is a simplified implementation
  throw new Error('Google Custom Search not fully implemented - use Serper instead');
}

async function searchSerpAPI(query: string, apiKey: string): Promise<SearchResult> {
  const response = await fetch(
    `https://serpapi.com/search?q=${encodeURIComponent(query)}&api_key=${apiKey}`
  );

  if (!response.ok) {
    throw new Error(`SerpAPI error: ${response.status}`);
  }

  const data = await response.json();
  const context = extractSearchContext(data.organic_results || []);
  
  return {
    success: true,
    context,
  };
}

function extractSearchContext(results: any[]): string {
  if (!results || results.length === 0) {
    return 'No search results found';
  }

  const snippets = results
    .slice(0, 5)
    .map((result: any) => {
      const title = result.title || '';
      const snippet = result.snippet || result.description || '';
      return `${title}\n${snippet}`;
    })
    .filter(Boolean)
    .join('\n\n');

  return snippets || 'No relevant information found';
}

export function buildSearchQuery(language: string): string {
  return `novedades y actualizaciones en cuestión de código de ${language} (sintaxis, APIs, CLI flags, breaking changes, mejores prácticas)`;
}
