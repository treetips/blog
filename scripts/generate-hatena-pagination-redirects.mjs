import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { HATENA_PAGE_SIZE, PAGE_SIZE } from '../src/lib/pagination.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const contentRoot = path.join(projectRoot, 'src/content/blog');
const outputFile = path.join(projectRoot, 'src/generated/hatena-pagination-redirects.js');

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

function parsePublishedAt(content, filePath) {
  const match = content.match(/^publishedAt:\s*"([^"]+)"$/m);
  if (!match) {
    throw new Error(`publishedAt not found in ${filePath}`);
  }

  const date = new Date(match[1]);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid publishedAt in ${filePath}: ${match[1]}`);
  }

  return date;
}

function createRedirectMap(posts) {
  const redirects = {};

  for (let boundaryIndex = HATENA_PAGE_SIZE - 1; boundaryIndex < posts.length - 1; boundaryIndex += HATENA_PAGE_SIZE) {
    const cursor = String(Math.floor(posts[boundaryIndex].publishedAt.getTime() / 1000));
    const targetPage = Math.floor((boundaryIndex + 1) / PAGE_SIZE) + 1;
    redirects[cursor] = `/page/${targetPage}/`;
  }

  return redirects;
}

const markdownFiles = await collectMarkdownFiles(contentRoot);
const posts = [];

for (const filePath of markdownFiles) {
  const content = await readFile(filePath, 'utf8');
  posts.push({
    filePath,
    publishedAt: parsePublishedAt(content, filePath),
  });
}

posts.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

const redirects = createRedirectMap(posts);
await mkdir(path.dirname(outputFile), { recursive: true });
await writeFile(
  outputFile,
  `export const HATENA_PAGINATION_REDIRECTS = ${JSON.stringify(redirects, null, 2)};\n`,
);

console.log(
  `Generated ${Object.keys(redirects).length} Hatena pagination redirects using PAGE_SIZE=${PAGE_SIZE} and HATENA_PAGE_SIZE=${HATENA_PAGE_SIZE}.`,
);
