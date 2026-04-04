import { execFile } from 'node:child_process';
import { mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const CONTENT_ROOT = path.resolve('src/content/blog');
const PUBLIC_ROOT = path.resolve('public');
const TEMPLATE_PATH = path.resolve('design/x-post-image-template.png');
const DEFAULT_FONT_PATH = path.resolve('design/fonts/PlemolJP-Bold.ttf');
const CARD_FILENAME_PREFIX = 'card-image-';
const CARD_FILENAME_RE = /^card-image-\d{14}\.png$/;
const FRONTMATTER_DELIMITER = '---';
const JST_FORMATTER = new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'Asia/Tokyo',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
});

type ChangedArticle = {
  absolutePath: string;
  relativePath: string;
};

type ParsedFrontmatter = {
  title: string;
  cardImage: string | null;
  frontmatterLines: string[];
  body: string;
};

type GenerationTarget = ChangedArticle & {
  title: string;
  cardImage: string | null;
  frontmatterLines: string[];
  body: string;
  publicDirAbsolutePath: string;
  publicDirUrlPath: string;
};

type GeneratedCard = {
  articlePath: string;
  imagePath: string;
  cardImageUrl: string;
};

let resolvedImageMagickCommand: string | null = null;

const fileExists = async (filePath: string): Promise<boolean> => {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
};

const commandExists = async (command: string): Promise<boolean> => {
  try {
    await execFileAsync('bash', ['-lc', `command -v ${command}`]);
    return true;
  } catch {
    return false;
  }
};

const getImageMagickCommand = async (): Promise<string> => {
  if (resolvedImageMagickCommand) {
    return resolvedImageMagickCommand;
  }

  const override = process.env.X_CARD_IMAGEMAGICK_BIN?.trim();
  if (override) {
    resolvedImageMagickCommand = override;
    return resolvedImageMagickCommand;
  }

  for (const command of ['magick', 'convert']) {
    if (await commandExists(command)) {
      resolvedImageMagickCommand = command;
      return resolvedImageMagickCommand;
    }
  }

  throw new Error('ImageMagick command not found. Install "magick" or "convert".');
};

const runGit = async (args: string[]): Promise<string[]> => {
  const { stdout } = await execFileAsync('git', args, {
    cwd: path.resolve('.'),
  });

  return stdout
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
};

const isZeroSha = (value: string | undefined): boolean => Boolean(value) && /^0+$/.test(value);

const getDiffMarkdownPaths = async (baseRef: string, headRef: string): Promise<string[]> => {
  if (isZeroSha(baseRef)) {
    return runGit(['show', '--pretty=', '--name-only', headRef, '--', 'src/content/blog']);
  }

  return runGit(['diff', '--name-only', '--diff-filter=ACMRTUXB', baseRef, headRef, '--', 'src/content/blog']);
};

const getChangedMarkdownPaths = async (): Promise<ChangedArticle[]> => {
  const baseRef = process.env.X_CARD_BASE_REF?.trim();
  const headRef = process.env.X_CARD_HEAD_REF?.trim();
  const trackedDiffs =
    baseRef && headRef
      ? await getDiffMarkdownPaths(baseRef, headRef)
      : await runGit(['diff', '--name-only', '--diff-filter=ACMRTUXB', 'HEAD', '--', 'src/content/blog']);
  const untracked = baseRef && headRef
    ? []
    : await runGit(['ls-files', '--others', '--exclude-standard', '--', 'src/content/blog']);
  const uniquePaths = [...new Set([...trackedDiffs, ...untracked])]
    .filter((filePath) => filePath.endsWith('.md'))
    .sort();

  return uniquePaths.map((relativePath) => ({
    absolutePath: path.resolve(relativePath),
    relativePath,
  }));
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

  const frontmatterBlock = normalized.slice(FRONTMATTER_DELIMITER.length + 1, endIndex);
  const body = normalized.slice(endIndex + `\n${FRONTMATTER_DELIMITER}\n`.length);
  const frontmatterLines = frontmatterBlock.split('\n');

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
  if (!title) {
    throw new Error(`title not found in ${filePath}`);
  }

  return {
    title,
    cardImage: readField('cardImage'),
    frontmatterLines,
    body,
  };
};

const formatTimestamp = (date: Date): string => {
  const parts = Object.fromEntries(
    JST_FORMATTER.formatToParts(date)
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value]),
  ) as Record<'year' | 'month' | 'day' | 'hour' | 'minute' | 'second', string>;

  return `${parts.year}${parts.month}${parts.day}${parts.hour}${parts.minute}${parts.second}`;
};

const toPosixPath = (value: string): string => value.split(path.sep).join('/');

const buildGenerationTargets = async (): Promise<GenerationTarget[]> => {
  const changedArticles = await getChangedMarkdownPaths();

  return Promise.all(
    changedArticles.map(async ({ absolutePath, relativePath }) => {
      const content = await readFile(absolutePath, 'utf8');
      const parsed = parseFrontmatter(content, relativePath);
      const relativeDir = path.relative(CONTENT_ROOT, path.dirname(absolutePath));
      const normalizedDir = relativeDir === '' ? '' : toPosixPath(relativeDir);

      return {
        absolutePath,
        relativePath,
        ...parsed,
        publicDirAbsolutePath: normalizedDir ? path.join(PUBLIC_ROOT, normalizedDir) : PUBLIC_ROOT,
        publicDirUrlPath: normalizedDir ? `/${normalizedDir}` : '',
      };
    }),
  );
};

const updateFrontmatter = (lines: string[], cardImageUrl: string): string[] => {
  const nextLines = [...lines];
  const cardImageLine = `cardImage: "${cardImageUrl}"`;
  const existingIndex = nextLines.findIndex((line) => line.startsWith('cardImage:'));

  if (existingIndex !== -1) {
    nextLines[existingIndex] = cardImageLine;
    return nextLines;
  }

  const imageIndex = nextLines.findIndex((line) => line.startsWith('image:'));
  if (imageIndex !== -1) {
    nextLines.splice(imageIndex + 1, 0, cardImageLine);
    return nextLines;
  }

  const categoriesIndex = nextLines.findIndex((line) => line.startsWith('categories:'));
  if (categoriesIndex !== -1) {
    nextLines.splice(categoriesIndex + 1, 0, cardImageLine);
    return nextLines;
  }

  nextLines.push(cardImageLine);
  return nextLines;
};

const removePreviousCardImage = async (
  cardImageUrl: string | null,
  publicDirAbsolutePath: string,
  nextOutputAbsolutePath: string,
): Promise<void> => {
  if (!cardImageUrl) {
    return;
  }

  const fileName = path.posix.basename(cardImageUrl);
  if (!CARD_FILENAME_RE.test(fileName)) {
    return;
  }

  const absolutePath = path.resolve(PUBLIC_ROOT, cardImageUrl.replace(/^\/+/, ''));
  if (path.dirname(absolutePath) !== publicDirAbsolutePath) {
    return;
  }

  if (absolutePath === nextOutputAbsolutePath) {
    return;
  }

  await rm(absolutePath, { force: true });
};

const generateCardImage = async (target: GenerationTarget, outputAbsolutePath: string): Promise<void> => {
  const fontPath = process.env.X_CARD_FONT_PATH || DEFAULT_FONT_PATH;
  const imageMagickCommand = await getImageMagickCommand();

  if (!(await fileExists(TEMPLATE_PATH))) {
    throw new Error(`Template file not found: ${TEMPLATE_PATH}`);
  }

  if (!(await fileExists(fontPath))) {
    throw new Error(`Font file not found: ${fontPath}`);
  }

  await execFileAsync(imageMagickCommand, [
    TEMPLATE_PATH,
    '(',
    '-background',
    'none',
    '-fill',
    'black',
    '-font',
    fontPath,
    '-gravity',
    'northwest',
    '-interline-spacing',
    '0',
    '-size',
    '910x300',
    `caption:${target.title}`,
    ')',
    '-gravity',
    'northwest',
    '-geometry',
    '+141+129',
    '-composite',
    outputAbsolutePath,
  ]);
};

const writeUpdatedArticle = async (target: GenerationTarget, cardImageUrl: string): Promise<void> => {
  const content = [
    FRONTMATTER_DELIMITER,
    ...updateFrontmatter(target.frontmatterLines, cardImageUrl),
    FRONTMATTER_DELIMITER,
    target.body,
  ].join('\n');

  await writeFile(target.absolutePath, content, 'utf8');
};

const processTarget = async (target: GenerationTarget, timestamp: string): Promise<GeneratedCard> => {
  const outputFileName = `${CARD_FILENAME_PREFIX}${timestamp}.png`;
  const outputAbsolutePath = path.join(target.publicDirAbsolutePath, outputFileName);
  const outputUrlPath = `${target.publicDirUrlPath}/${outputFileName}`.replace(/\/{2,}/g, '/');

  await mkdir(target.publicDirAbsolutePath, { recursive: true });
  await generateCardImage(target, outputAbsolutePath);
  await removePreviousCardImage(target.cardImage, target.publicDirAbsolutePath, outputAbsolutePath);
  await writeUpdatedArticle(target, outputUrlPath);

  return {
    articlePath: target.relativePath,
    imagePath: path.relative(path.resolve('.'), outputAbsolutePath),
    cardImageUrl: outputUrlPath,
  };
};

const main = async (): Promise<void> => {
  const targets = await buildGenerationTargets();

  if (targets.length === 0) {
    console.log('No changed articles found.');
    return;
  }

  const results: GeneratedCard[] = [];
  const baseTime = new Date();

  for (const [index, target] of targets.entries()) {
    const timestamp = formatTimestamp(new Date(baseTime.getTime() + index * 1000));
    results.push(await processTarget(target, timestamp));
  }

  for (const result of results) {
    console.log(`${result.articlePath}\t${result.cardImageUrl}\t${result.imagePath}`);
  }
};

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
