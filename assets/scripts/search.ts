/**
 * Search functionality for the site
 * Handles searching through the search index and displaying results
 */

interface SearchResult {
  title: string;
  url: string;
  content: string;
}

interface SearchResultWithScore extends SearchResult {
  score: number;
}

interface SearchIndex {
  pages: SearchResult[];
}

export class SearchEngine {
  private searchInput: HTMLInputElement | null = null;
  private searchForm: HTMLFormElement | null = null;
  private resultsContainer: HTMLElement | null = null;
  private resultTemplate: HTMLTemplateElement | null = null;
  private searchIndex: SearchIndex | null = null;
  private debounceTimer: number | null = null;

  constructor() {
    this.init();
  }

  /**
   * Initialize the search engine
   */
  private async init(): Promise<void> {
    this.bindElements();
    this.attachEventListeners();
    await this.loadSearchIndex();
  }

  /**
   * Bind DOM elements
   */
  private bindElements(): void {
    this.searchInput = document.getElementById('search-input') as HTMLInputElement;
    this.searchForm = document.querySelector('.search-form') as HTMLFormElement;
    this.resultsContainer = document.getElementById('search-results') as HTMLElement;
    this.resultTemplate = document.getElementById('search-result-template') as HTMLTemplateElement;
  }

  /**
   * Attach event listeners
   */
  private attachEventListeners(): void {
    if (this.searchForm) {
      this.searchForm.addEventListener('submit', this.handleFormSubmit.bind(this));
    }

    if (this.searchInput) {
      this.searchInput.addEventListener('input', this.handleSearchInput.bind(this));
    }
  }

  /**
   * Load the search index from the server
   */
  private async loadSearchIndex(): Promise<void> {
    try {
      const response = await fetch('/search-index.json');
      if (!response.ok) {
        throw new Error(`Failed to load search index: ${response.status}`);
      }
      this.searchIndex = await response.json();
    }
    catch (error) {
      console.error('Error loading search index:', error);
    }
  }

  /**
   * Handle form submission
   */
  private handleFormSubmit(event: Event): void {
    event.preventDefault();
    if (this.searchInput) {
      this.performSearch(this.searchInput.value.trim());
    }
  }

  /**
   * Handle search input with debouncing
   */
  private handleSearchInput(event: Event): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    const target = event.target as HTMLInputElement;
    const query = target.value.trim();

    this.debounceTimer = window.setTimeout(() => {
      if (query.length > 0) {
        this.performSearch(query);
      }
      else {
        this.clearResults();
      }
    }, 300);
  }

  /**
   * Perform the actual search
   */
  private performSearch(query: string): void {
    if (!this.searchIndex || !query) {
      this.clearResults();
      return;
    }

    const results = this.searchPages(query);
    this.displayResults(results, query);
  }

  /**
   * Search through the pages
   */
  private searchPages(query: string): SearchResultWithScore[] {
    if (!this.searchIndex) return [];

    const queryLower = query.toLowerCase();
    const searchTerms = queryLower.split(/\s+/).filter(term => term.length > 0);

    return this.searchIndex.pages
      .map((page): SearchResultWithScore => {
        const titleScore = this.calculateRelevanceScore(page.title.toLowerCase(), searchTerms);
        const contentScore = this.calculateRelevanceScore(page.content.toLowerCase(), searchTerms);
        const totalScore = titleScore * 2 + contentScore; // Weight title matches higher

        return {
          ...page,
          score: totalScore,
        };
      })
      .filter((page): page is SearchResultWithScore => page.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20); // Limit to top 20 results
  }

  /**
   * Calculate relevance score for a text against search terms
   */
  private calculateRelevanceScore(text: string, searchTerms: string[]): number {
    let score = 0;

    for (const term of searchTerms) {
      // Exact phrase match
      if (text.includes(term)) {
        score += term.length;
      }

      // Word boundary matches
      const wordRegex = new RegExp(`\\b${this.escapeRegex(term)}`, 'gi');
      const matches = text.match(wordRegex);
      if (matches) {
        score += matches.length * 2;
      }
    }

    return score;
  }

  /**
   * Escape special characters for regex
   */
  private escapeRegex(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Display search results
   */
  private displayResults(results: SearchResultWithScore[], query: string): void {
    if (!this.resultsContainer || !this.resultTemplate) return;

    this.clearResults();

    if (results.length === 0) {
      this.displayNoResults(query);
      return;
    }

    results.forEach((result) => {
      const resultElement = this.createResultElement(result, query);
      if (resultElement && this.resultsContainer) {
        this.resultsContainer.appendChild(resultElement);
      }
    });
  }

  /**
   * Create a result element from the template
   */
  private createResultElement(result: SearchResult, query: string): DocumentFragment | null {
    if (!this.resultTemplate) return null;

    const clone = this.resultTemplate.content.cloneNode(true) as DocumentFragment;

    const link = clone.querySelector('.search-result-link') as HTMLAnchorElement;
    const url = clone.querySelector('.search-result-url') as HTMLElement;
    const excerpt = clone.querySelector('.search-result-excerpt') as HTMLElement;

    if (link) {
      link.innerHTML = this.highlightSearchTerms(result.title, query);
      link.href = result.url;
    }

    if (url) {
      url.textContent = result.url;
    }

    if (excerpt) {
      excerpt.innerHTML = this.createExcerpt(result.content, query);
    }

    return clone;
  }

  /**
   * Create an excerpt with highlighted search terms
   */
  private createExcerpt(content: string, query: string, maxLength = 200): string {
    const queryLower = query.toLowerCase();
    const contentLower = content.toLowerCase();

    // Find the best position to start the excerpt
    let startPos = 0;
    const queryIndex = contentLower.indexOf(queryLower);

    if (queryIndex !== -1) {
      startPos = Math.max(0, queryIndex - 50);
    }

    let excerpt = content.slice(startPos, startPos + maxLength);

    // Add ellipsis if needed
    if (startPos > 0) excerpt = '...' + excerpt;
    if (startPos + maxLength < content.length) excerpt = excerpt + '...';

    // Highlight search terms
    excerpt = this.highlightSearchTerms(excerpt, query);

    return excerpt;
  }

  /**
   * Highlight search terms in text
   */
  private highlightSearchTerms(text: string, query: string): string {
    const searchTerms = query.split(/\s+/).filter(term => term.length > 0);
    let highlightedText = text;

    for (const term of searchTerms) {
      const regex = new RegExp(`(${this.escapeRegex(term)})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
    }

    return highlightedText;
  }

  /**
   * Display no results message
   */
  private displayNoResults(query: string): void {
    if (!this.resultsContainer) return;

    const noResultsElement = document.createElement('div');
    noResultsElement.className = 'search-no-results';
    noResultsElement.innerHTML = `
      <h3>No results found</h3>
      <p>No results found for "<strong>${this.escapeHtml(query)}</strong>"</p>
      <div class="search-suggestions">
        <p>Try:</p>
        <ul>
          <li>Checking your spelling</li>
          <li>Using different keywords</li>
          <li>Using more general terms</li>
          <li>Browsing <a href="/artists/">artists</a>, <a href="/discography/">discography</a>, or <a href="/events/">events</a></li>
        </ul>
      </div>
    `;

    this.resultsContainer.appendChild(noResultsElement);
  }

  /**
   * Clear search results
   */
  private clearResults(): void {
    if (this.resultsContainer) {
      this.resultsContainer.innerHTML = '';
    }
  }

  /**
   * Escape HTML to prevent XSS
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize search when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new SearchEngine();
});
