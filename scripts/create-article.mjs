import fs from 'node:fs/promises';
import path from 'node:path';

const OUTPUT_DIR = path.resolve('src/content/blog');
const JST_OFFSET = '+09:00';

function getJstParts(date) {
  const formatter = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });
  const entries = formatter.formatToParts(date).filter((part) => part.type !== 'literal');

  return Object.fromEntries(entries.map((part) => [part.type, part.value]));
}

function buildTimestamp(parts) {
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}${JST_OFFSET}`;
}

function buildBasename(parts) {
  return `${parts.year}/${parts.month}/${parts.day}/${parts.hour}${parts.minute}${parts.second}`;
}

function buildFrontmatter({ title, publishedAt, basename }) {
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
}

async function main() {
  const title = process.argv.slice(2).join(' ').trim() || 'タイトル未設定';
  const now = new Date();
  const parts = getJstParts(now);
  const basename = buildBasename(parts);
  const publishedAt = buildTimestamp(parts);
  const filePath = path.join(OUTPUT_DIR, ...basename.split('/')) + '.md';

  await fs.mkdir(path.dirname(filePath), { recursive: true });

  try {
    await fs.writeFile(
      filePath,
      buildFrontmatter({
        title,
        publishedAt,
        basename,
      }),
      { flag: 'wx' },
    );
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'EEXIST') {
      throw new Error(`Article already exists: ${path.relative(process.cwd(), filePath)}`);
    }
    throw error;
  }

  process.stdout.write(`${path.relative(process.cwd(), filePath)}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error.message ?? error}\n`);
  process.exitCode = 1;
});
