import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PAGE_SIZE, getPageHref } from '../src/lib/pagination.js';

const HATENA_BLOG_ORIGIN = 'https://treeapps.hatenablog.com';
const HATENA_BLOG_ROOT_URL = `${HATENA_BLOG_ORIGIN}/`;
const DEFAULT_REFRESH_DELAY_MS = 1000;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const contentRoot = path.join(projectRoot, 'src/content/blog');
const outputFile = path.join(projectRoot, 'src/generated/hatena-pagination-redirects.js');
const snapshotFile = path.join(projectRoot, 'src/generated/hatena-pagination-pages.json');

function parseArgs(argv) {
  const options = {
    delayMs: DEFAULT_REFRESH_DELAY_MS,
    refresh: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];

    if (value === '--refresh') {
      options.refresh = true;
      continue;
    }

    if (value === '--delay-ms') {
      const nextValue = argv[index + 1];
      if (!nextValue) {
        throw new Error('--delay-ms requires a value');
      }

      const parsedValue = Number(nextValue);
      if (!Number.isFinite(parsedValue) || parsedValue < 0) {
        throw new Error(`Invalid --delay-ms value: ${nextValue}`);
      }

      options.delayMs = parsedValue;
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${value}`);
  }

  return options;
}

async function collectMarkdownFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectMarkdownFiles(fullPath)));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }

  return files;
}

function readFrontmatterValue(content, fieldName) {
  const match = content.match(new RegExp(`^${fieldName}:\\s*"([^"]+)"$`, 'm'));
  return match?.[1] ?? null;
}

function parsePublishedAt(content, filePath) {
  const value = readFrontmatterValue(content, 'publishedAt');
  if (!value) {
    throw new Error(`publishedAt not found in ${filePath}`);
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid publishedAt in ${filePath}: ${value}`);
  }

  return date;
}

function parseLegacyPath(content, filePath) {
  const legacyValue = readFrontmatterValue(content, 'legacyUrl') ?? readFrontmatterValue(content, 'sourceUrl');
  if (!legacyValue) {
    throw new Error(`legacyUrl not found in ${filePath}`);
  }

  return normalizeEntryPath(legacyValue, filePath);
}

function normalizeEntryPath(value, context = value) {
  let url;

  try {
    url = new URL(value, HATENA_BLOG_ROOT_URL);
  } catch {
    throw new Error(`Invalid legacy URL in ${context}: ${value}`);
  }

  const decodedPath = decodeURIComponent(url.pathname);
  const normalizedPath = decodedPath.endsWith('/') ? decodedPath : `${decodedPath}/`;
  return normalizedPath.replace(/\/{2,}/g, '/');
}

function extractEntryPaths(html) {
  const entryAnchorPattern =
    /<a\b[^>]*href="([^"]+)"[^>]*class="[^"]*\bentry-title-link\b[^"]*"|<a\b[^>]*class="[^"]*\bentry-title-link\b[^"]*"[^>]*href="([^"]+)"/g;
  const paths = [];
  const seenPaths = new Set();

  for (const match of html.matchAll(entryAnchorPattern)) {
    const href = match[1] ?? match[2];
    if (!href) {
      continue;
    }

    const entryPath = normalizeEntryPath(href);
    if (!entryPath.startsWith('/entry/')) {
      continue;
    }

    if (seenPaths.has(entryPath)) {
      continue;
    }

    seenPaths.add(entryPath);
    paths.push(entryPath);
  }

  return paths;
}

function extractNextPageUrl(html) {
  const nextPagePattern =
    /<a\b[^>]*href="([^"]+)"[^>]*rel="next"[^>]*>|<a\b[^>]*rel="next"[^>]*href="([^"]+)"[^>]*>/;
  const match = html.match(nextPagePattern);
  const href = match?.[1] ?? match?.[2];

  if (!href) {
    return null;
  }

  return new URL(href, HATENA_BLOG_ROOT_URL).toString();
}

function extractPageCursor(pageUrl) {
  const url = new URL(pageUrl);
  return url.searchParams.get('page');
}

function sleep(delayMs) {
  return new Promise((resolve) => {
    setTimeout(resolve, delayMs);
  });
}

async function refreshHatenaPaginationSnapshot(delayMs) {
  const pages = [];
  const visitedUrls = new Set();
  let nextPageUrl = HATENA_BLOG_ROOT_URL;

  while (nextPageUrl) {
    if (visitedUrls.has(nextPageUrl)) {
      throw new Error(`Detected pagination loop while crawling ${nextPageUrl}`);
    }

    visitedUrls.add(nextPageUrl);
    console.log(`Fetching Hatena pagination page ${pages.length + 1}: ${nextPageUrl}`);

    const response = await fetch(nextPageUrl, {
      headers: {
        'user-agent': 'bunkei-programmer.net redirect refresh bot/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${nextPageUrl}: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    const entries = extractEntryPaths(html);

    if (entries.length === 0) {
      throw new Error(`No entry links found in ${nextPageUrl}`);
    }

    pages.push({
      cursor: extractPageCursor(nextPageUrl),
      entries,
      url: nextPageUrl,
    });

    nextPageUrl = extractNextPageUrl(html);
    if (nextPageUrl && delayMs > 0) {
      await sleep(delayMs);
    }
  }

  const snapshot = {
    checkedAt: new Date().toISOString(),
    delayMs,
    source: HATENA_BLOG_ROOT_URL,
    pages,
  };

  await mkdir(path.dirname(snapshotFile), { recursive: true });
  await writeFile(snapshotFile, `${JSON.stringify(snapshot, null, 2)}\n`);
  return snapshot;
}

async function loadHatenaPaginationSnapshot() {
  try {
    const content = await readFile(snapshotFile, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      throw new Error(
        `Snapshot file not found: ${snapshotFile}. Run "bun run redirects:generate -- --refresh --delay-ms ${DEFAULT_REFRESH_DELAY_MS}" first.`,
      );
    }

    throw error;
  }
}

function buildLocalPageIndex(posts) {
  const pageByLegacyPath = new Map();

  posts
    .slice()
    .sort((left, right) => right.publishedAt.getTime() - left.publishedAt.getTime())
    .forEach((post, index) => {
      pageByLegacyPath.set(post.legacyPath, Math.floor(index / PAGE_SIZE) + 1);
    });

  return pageByLegacyPath;
}

function createRedirectMap(pageByLegacyPath, snapshot) {
  if (!Array.isArray(snapshot.pages) || snapshot.pages.length === 0) {
    throw new Error(`Invalid Hatena pagination snapshot: ${snapshotFile}`);
  }

  const redirects = {};

  for (const page of snapshot.pages) {
    if (!page.cursor) {
      continue;
    }

    const leadEntryPath = page.entries?.[0];
    if (!leadEntryPath) {
      throw new Error(`No entries found for cursor ${page.cursor}`);
    }

    const normalizedEntryPath = normalizeEntryPath(leadEntryPath);
    const targetPage = pageByLegacyPath.get(normalizedEntryPath);

    if (!targetPage) {
      throw new Error(`Could not map Hatena entry to local page: ${normalizedEntryPath}`);
    }

    redirects[page.cursor] = getPageHref(targetPage);
  }

  return redirects;
}

const options = parseArgs(process.argv.slice(2));
const markdownFiles = await collectMarkdownFiles(contentRoot);
const posts = [];

for (const filePath of markdownFiles) {
  const content = await readFile(filePath, 'utf8');
  posts.push({
    filePath,
    legacyPath: parseLegacyPath(content, filePath),
    publishedAt: parsePublishedAt(content, filePath),
  });
}

const snapshot = options.refresh
  ? await refreshHatenaPaginationSnapshot(options.delayMs)
  : await loadHatenaPaginationSnapshot();
const pageByLegacyPath = buildLocalPageIndex(posts);
const redirects = createRedirectMap(pageByLegacyPath, snapshot);

await mkdir(path.dirname(outputFile), { recursive: true });
await writeFile(
  outputFile,
  `export const HATENA_PAGINATION_REDIRECTS = ${JSON.stringify(redirects, null, 2)};\n`,
);

console.log(
  `Generated ${Object.keys(redirects).length} Hatena pagination redirects from ${snapshot.pages.length} crawled pages using PAGE_SIZE=${PAGE_SIZE}.`,
);
