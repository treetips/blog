import fs from 'node:fs/promises';
import path from 'node:path';

const OUTPUT_DIR = path.resolve('src/content/blog');
const JST_OFFSET = '+09:00';
const DATE_PART_KEYS = ['year', 'month', 'day', 'hour', 'minute', 'second'] as const;
const JST_FORMATTER_OPTIONS = {
  timeZone: 'Asia/Tokyo',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
} satisfies Intl.DateTimeFormatOptions;
const JST_FORMATTER = new Intl.DateTimeFormat('sv-SE', JST_FORMATTER_OPTIONS);

type JstDatePartKey = (typeof DATE_PART_KEYS)[number];
type JstDateParts = Record<JstDatePartKey, string>;
type CliArgs = {
  help: boolean;
  title: string;
};
type FrontmatterInput = {
  title: string;
  publishedAt: string;
  basename: string;
};

const isErrnoException = (error: unknown): error is NodeJS.ErrnoException =>
  error instanceof Error && 'code' in error;

const getJstParts = (date: Date): JstDateParts => {
  const parts = Object.fromEntries(DATE_PART_KEYS.map((key) => [key, ''])) as JstDateParts;

  for (const part of JST_FORMATTER.formatToParts(date)) {
    if (part.type !== 'literal' && DATE_PART_KEYS.includes(part.type as JstDatePartKey)) {
      parts[part.type as JstDatePartKey] = part.value;
    }
  }

  return parts;
};

const buildTimestamp = (parts: JstDateParts): string =>
  `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}${JST_OFFSET}`;

const buildBasename = (parts: JstDateParts): string =>
  `${parts.year}/${parts.month}/${parts.day}/${parts.hour}${parts.minute}${parts.second}`;

const buildFrontmatter = ({ title, publishedAt, basename }: FrontmatterInput): string => {
  const entryUrl = `/entry/${basename}/`;

  return [
    '---',
    `title: ${JSON.stringify(title)}`,
    `publishedAt: ${JSON.stringify(publishedAt)}`,
    `basename: ${JSON.stringify(basename)}`,
    `sourceUrl: ${JSON.stringify(entryUrl)}`,
    `legacyUrl: ${JSON.stringify(entryUrl)}`,
    'categories: []',
    '---',
    '',
    '',
  ].join('\n');
};

const parseArgs = (argv: string[]): CliArgs => {
  const help = argv.includes('--help') || argv.includes('-h');
  const title = argv.filter((arg) => arg !== '--help' && arg !== '-h').join(' ').trim();

  return {
    help,
    title,
  };
};

const main = async (): Promise<void> => {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    process.stdout.write('Usage:\n  bun scripts/create-article.ts [title]\n');
    return;
  }

  const title = args.title || 'タイトル未設定';
  const now = new Date();
  const parts = getJstParts(now);
  const basename = buildBasename(parts);
  const publishedAt = buildTimestamp(parts);
  const filePath = path.join(OUTPUT_DIR, ...basename.split('/')) + '.md';

  await fs.mkdir(path.dirname(filePath), { recursive: true });

  try {
    await fs.writeFile(filePath, buildFrontmatter({ title, publishedAt, basename }), { flag: 'wx' });
  } catch (error) {
    if (isErrnoException(error) && error.code === 'EEXIST') {
      throw new Error(`Article already exists: ${path.relative(process.cwd(), filePath)}`);
    }

    throw error;
  }

  process.stdout.write(`${path.relative(process.cwd(), filePath)}\n`);
};

void main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
