// SPDX-License-Identifier: MIT

/**
 * Help API Client
 *
 * API client for interacting with the help desk backend.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface HelpArticle {
  id: number;
  title: string;
  content: string;
  category: string;
  excerpt?: string;
  keywords?: string;
  icon?: string;
  path?: string;
  status: 'draft' | 'published' | 'archived';
  author?: string;
  created_at?: string;
  updated_at?: string;
  view_count?: number;
}

export interface HelpCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  order: number;
}

export interface SearchParams {
  category?: string;
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  id: number;
  title: string;
  category: string;
  excerpt: string;
  icon?: string;
  path?: string;
  view_count?: number;
  relevance?: number;
}

/**
 * Fetch all help articles with optional filtering
 */
export async function getHelpArticles(params?: SearchParams): Promise<HelpArticle[]> {
  const queryParams = new URLSearchParams();
  
  if (params?.category) queryParams.append('category', params.category);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.search) queryParams.append('search', params.search);
  if (params?.limit) queryParams.append('limit', String(params.limit));
  if (params?.offset) queryParams.append('offset', String(params.offset));

  const url = `${API_BASE}/api/help/articles?${queryParams.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to fetch help articles');
  }

  const data = await response.json();
  return data.articles;
}

/**
 * Fetch a specific help article by ID
 */
export async function getHelpArticle(id: string | number): Promise<HelpArticle> {
  const response = await fetch(`${API_BASE}/api/help/articles/${id}`);

  if (!response.ok) {
    throw new Error('Failed to fetch help article');
  }

  const data = await response.json();
  return data.article;
}

/**
 * Create a new help article
 */
export async function createHelpArticle(article: Partial<HelpArticle>): Promise<number> {
  const response = await fetch(`${API_BASE}/api/help/articles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(article),
  });

  if (!response.ok) {
    throw new Error('Failed to create help article');
  }

  const data = await response.json();
  return data.id;
}

/**
 * Update an existing help article
 */
export async function updateHelpArticle(
  id: string | number,
  article: Partial<HelpArticle>
): Promise<void> {
  const response = await fetch(`${API_BASE}/api/help/articles/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(article),
  });

  if (!response.ok) {
    throw new Error('Failed to update help article');
  }
}

/**
 * Delete a help article
 */
export async function deleteHelpArticle(id: string | number): Promise<void> {
  const response = await fetch(`${API_BASE}/api/help/articles/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete help article');
  }
}

/**
 * Fetch all help categories
 */
export async function getHelpCategories(): Promise<HelpCategory[]> {
  const response = await fetch(`${API_BASE}/api/help/categories`);

  if (!response.ok) {
    throw new Error('Failed to fetch help categories');
  }

  const data = await response.json();
  return data.categories;
}

/**
 * Create a new help category
 */
export async function createHelpCategory(category: HelpCategory): Promise<void> {
  const response = await fetch(`${API_BASE}/api/help/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(category),
  });

  if (!response.ok) {
    throw new Error('Failed to create help category');
  }
}

/**
 * Search help articles
 */
export async function searchHelpArticles(
  query: string,
  category?: string,
  limit?: number
): Promise<SearchResult[]> {
  const queryParams = new URLSearchParams({ q: query });
  
  if (category) queryParams.append('category', category);
  if (limit) queryParams.append('limit', String(limit));

  const url = `${API_BASE}/api/help/search?${queryParams.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to search help articles');
  }

  const data = await response.json();
  return data.results;
}

/**
 * Get help system statistics
 */
export async function getHelpStats(): Promise<{
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  totalViews: number;
  topArticles: Array<{
    id: number;
    title: string;
    category: string;
    view_count: number;
  }>;
}> {
  const response = await fetch(`${API_BASE}/api/help/stats`);

  if (!response.ok) {
    throw new Error('Failed to fetch help statistics');
  }

  const data = await response.json();
  return data.stats;
}
