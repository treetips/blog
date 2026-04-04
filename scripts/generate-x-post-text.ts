import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const CONTENT_ROOT = path.resolve('src/content');
const SITE_ORIGIN = 'https://bunkei-programmer.net';
const LOOKBACK_HOURS = 12;
const FRONTMATTER_DELIMITER = '---';
const POST_SEPARATOR = '\n\n------------------------------------------------------\n\n';

type PostCandidate = {
  title: string;
  publishedAt: Date;
  sourceUrl: string;
};

type ParsedFrontmatter = {
  title: string;
  publishedAt: string;
  sourceUrl: string;
};

const collectMarkdownFiles = async (rootDir: string): Promise<string[]> => {
  const entries = await readdir(rootDir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectMarkdownFiles(fullPath)));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }

  return files;
};

const parseFrontmatter = (content: string, filePath: string): ParsedFrontmatter => {
  const normalized = content.replace(/\r\n/g, '\n');
  if (!normalized.startsWith(`${FRONTMATTER_DELIMITER}\n`)) {
    throw new Error(`Frontmatter not found in ${filePath}`);
  }

  const endIndex = normalized.indexOf(`\n${FRONTMATTER_DELIMITER}\n`, FRONTMATTER_DELIMITER.length + 1);
  if (endIndex === -1) {
    throw new Error(`Frontmatter closing delimiter not found in ${filePath}`);
  }

  const frontmatterLines = normalized
    .slice(FRONTMATTER_DELIMITER.length + 1, endIndex)
    .split('\n');

  const readField = (fieldName: string): string | null => {
    const line = frontmatterLines.find((entry) => entry.startsWith(`${fieldName}:`));
    if (!line) {
      return null;
    }

    const match = line.match(new RegExp(`^${fieldName}:\\s*(.+)\\s*$`));
    if (!match) {
      return null;
    }

    try {
      return JSON.parse(match[1]) as string;
    } catch {
      return null;
    }
  };

  const title = readField('title');
  const publishedAt = readField('publishedAt');
  const sourceUrl = readField('sourceUrl');

  if (!title || !publishedAt || !sourceUrl) {
    throw new Error(`Required frontmatter fields not found in ${filePath}`);
  }

  return {
    title,
    publishedAt,
    sourceUrl,
  };
};

const isRecentPost = (publishedAt: Date, now: Date): boolean => {
  const diffMs = now.getTime() - publishedAt.getTime();
  return diffMs >= 0 && diffMs <= LOOKBACK_HOURS * 60 * 60 * 1000;
};

const formatPostText = ({ title, sourceUrl }: Pick<PostCandidate, 'title' | 'sourceUrl'>): string =>
  `ブログ記事を投稿しました。\n\n${title}\n${new URL(sourceUrl, SITE_ORIGIN).toString()}`;

const main = async (): Promise<void> => {
  const markdownFiles = await collectMarkdownFiles(CONTENT_ROOT);
  const now = new Date();
  const posts: PostCandidate[] = [];

  for (const filePath of markdownFiles) {
    const content = await readFile(filePath, 'utf8');
    const { title, publishedAt, sourceUrl } = parseFrontmatter(content, filePath);
    const publishedDate = new Date(publishedAt);

    if (Number.isNaN(publishedDate.getTime())) {
      throw new Error(`Invalid publishedAt in ${filePath}: ${publishedAt}`);
    }

    if (!isRecentPost(publishedDate, now)) {
      continue;
    }

    posts.push({
      title,
      publishedAt: publishedDate,
      sourceUrl,
    });
  }

  posts.sort((left, right) => left.publishedAt.getTime() - right.publishedAt.getTime());

  const output = posts.map(formatPostText).join(POST_SEPARATOR);
  process.stdout.write(output);
};

void main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});
