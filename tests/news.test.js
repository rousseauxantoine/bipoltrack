// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { newsStripHtml, newsLoadRssUrls, newsIsValidFeedUrl } from '../lib/core.js';

// ── newsStripHtml ─────────────────────────────────────────────────────

describe('newsStripHtml', () => {
  it('strips a simple tag', () => {
    expect(newsStripHtml('<p>Hello world</p>')).toBe('Hello world');
  });

  it('strips nested tags', () => {
    expect(newsStripHtml('<div><p>Nested <strong>text</strong></p></div>')).toBe('Nested text');
  });

  it('collapses multiple whitespace into a single space', () => {
    expect(newsStripHtml('<p>Too   many   spaces</p>')).toBe('Too many spaces');
  });

  it('trims leading and trailing whitespace', () => {
    expect(newsStripHtml('  <p>  padded  </p>  ')).toBe('padded');
  });

  it('handles plain text with no tags', () => {
    expect(newsStripHtml('Plain text')).toBe('Plain text');
  });

  it('returns empty string for empty input', () => {
    expect(newsStripHtml('')).toBe('');
  });

  it('strips HTML entities are decoded (textContent behaviour)', () => {
    expect(newsStripHtml('&lt;b&gt;bold&lt;/b&gt;')).toBe('<b>bold</b>');
  });

  it('handles self-closing tags', () => {
    expect(newsStripHtml('Before<br/>After')).toBe('BeforeAfter');
  });

  it('handles tags with attributes', () => {
    expect(newsStripHtml('<a href="http://example.com" class="x">Link</a>')).toBe('Link');
  });
});

// ── newsIsValidFeedUrl ────────────────────────────────────────────────

describe('newsIsValidFeedUrl', () => {
  it('accepts an https URL', () => {
    expect(newsIsValidFeedUrl('https://example.com/feed')).toBe(true);
  });

  it('accepts an http URL', () => {
    expect(newsIsValidFeedUrl('http://example.com/rss')).toBe(true);
  });

  it('trims surrounding whitespace before validating', () => {
    expect(newsIsValidFeedUrl('  https://example.com/feed  ')).toBe(true);
  });

  it('rejects a URL without scheme', () => {
    expect(newsIsValidFeedUrl('example.com/feed')).toBe(false);
  });

  it('rejects a non-http scheme', () => {
    expect(newsIsValidFeedUrl('ftp://example.com/feed')).toBe(false);
  });

  it('rejects an empty string', () => {
    expect(newsIsValidFeedUrl('')).toBe(false);
  });

  it('rejects a URL containing whitespace', () => {
    expect(newsIsValidFeedUrl('https://example.com/a b')).toBe(false);
  });

  it('rejects non-string input', () => {
    expect(newsIsValidFeedUrl(null)).toBe(false);
    expect(newsIsValidFeedUrl(undefined)).toBe(false);
    expect(newsIsValidFeedUrl(42)).toBe(false);
  });
});

// ── newsLoadRssUrls ───────────────────────────────────────────────────

function makeFetch(text, ok = true) {
  return vi.fn().mockResolvedValue({
    ok,
    text: () => Promise.resolve(text),
  });
}

describe('newsLoadRssUrls', () => {
  it('returns valid https URLs found in the file', async () => {
    const content = 'https://example.com/feed\nhttps://another.org/rss';
    const urls = await newsLoadRssUrls(makeFetch(content));
    expect(urls).toEqual(['https://example.com/feed', 'https://another.org/rss']);
  });

  it('returns valid http URLs as well as https', async () => {
    const urls = await newsLoadRssUrls(makeFetch('http://example.com/feed'));
    expect(urls).toEqual(['http://example.com/feed']);
  });

  it('filters out lines starting with #', async () => {
    const content = '# This is a comment\nhttps://valid.com/feed\n# another comment';
    const urls = await newsLoadRssUrls(makeFetch(content));
    expect(urls).toEqual(['https://valid.com/feed']);
  });

  it('filters out blank lines', async () => {
    const content = '\n\nhttps://valid.com/feed\n\n';
    const urls = await newsLoadRssUrls(makeFetch(content));
    expect(urls).toEqual(['https://valid.com/feed']);
  });

  it('filters out non-URL lines', async () => {
    const content = 'not a url\nhttps://valid.com/feed\njust text';
    const urls = await newsLoadRssUrls(makeFetch(content));
    expect(urls).toEqual(['https://valid.com/feed']);
  });

  it('returns empty array when file is an HTML page (server returning 200 with HTML)', async () => {
    const htmlContent = '<!DOCTYPE html><html><body>Not found</body></html>';
    const urls = await newsLoadRssUrls(makeFetch(htmlContent));
    expect(urls).toEqual([]);
  });

  it('returns empty array for HTML with lowercase doctype', async () => {
    const urls = await newsLoadRssUrls(makeFetch('<!doctype html><html>'));
    expect(urls).toEqual([]);
  });

  it('returns empty array for HTML with <html> tag (no doctype)', async () => {
    const urls = await newsLoadRssUrls(makeFetch('<html lang="fr">'));
    expect(urls).toEqual([]);
  });

  it('returns empty array when fetch returns HTTP error', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ ok: false, status: 404 });
    const urls = await newsLoadRssUrls(fetchFn);
    expect(urls).toEqual([]);
  });

  it('returns empty array when fetch throws a network error', async () => {
    const fetchFn = vi.fn().mockRejectedValue(new Error('Network error'));
    const urls = await newsLoadRssUrls(fetchFn);
    expect(urls).toEqual([]);
  });

  it('returns empty array for an empty file', async () => {
    const urls = await newsLoadRssUrls(makeFetch(''));
    expect(urls).toEqual([]);
  });

  it('trims whitespace around URLs', async () => {
    const content = '  https://example.com/feed  ';
    const urls = await newsLoadRssUrls(makeFetch(content));
    expect(urls).toEqual(['https://example.com/feed']);
  });

  it('handles Windows line endings (CRLF)', async () => {
    const content = 'https://a.com/feed\r\nhttps://b.com/feed';
    const urls = await newsLoadRssUrls(makeFetch(content));
    expect(urls).toEqual(['https://a.com/feed', 'https://b.com/feed']);
  });

  it('passes the filePath argument to fetch', async () => {
    const fetchFn = makeFetch('');
    await newsLoadRssUrls(fetchFn, 'custom-feeds.md');
    expect(fetchFn).toHaveBeenCalledWith('custom-feeds.md', { cache: 'no-store' });
  });
});
