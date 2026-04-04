#!/usr/bin/env node

import { execFile } from 'node:child_process';
import { mkdir, readFile, readdir, rename, rm, stat } from 'node:fs/promises';
import { promisify } from 'node:util';
import path from 'node:path';

const execFileAsync = promisify(execFile);

const DEFAULT_CONTENT_DIR = 'src/content/blog';
const DEFAULT_PUBLIC_DIR = 'public/hatena-images';
const LOCAL_IMAGE_PATH_RE = /\/hatena-images\/images\/[^\s<>"')\]]+/g;
const DOWNLOAD_CONCURRENCY = 6;
const CURL_ARGS = ['-fsSL', '--retry', '3', '--retry-delay', '1', '-A', 'Mozilla/5.0'] as const;
const HATENA_REFERER = 'https://treeapps.hatenablog.com/';

type CliArgs = {
  contentDir: string;
  outputDir: string;
  help?: boolean;
};

type DownloadResult = {
  localPath: string;
  targetPath: string;
  skipped: boolean;
};

const formatError = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

const usage = (): void => {
  console.error(
    [
      'Usage:',
      '  bun scripts/download-hatena-images.ts [content-dir] [--output dir]',
      '',
      'Examples:',
      '  bun scripts/download-hatena-images.ts',
      '  bun scripts/download-hatena-images.ts src/content/blog --output public/hatena-images',
    ].join('\n'),
  );
};

const parseArgs = (argv: string[]): CliArgs => {
  const args: CliArgs = {
    contentDir: DEFAULT_CONTENT_DIR,
    outputDir: DEFAULT_PUBLIC_DIR,
  };

  const positional: string[] = [];
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--output' || arg === '-o') {
      const next = argv[i + 1];
      if (!next) {
        throw new Error('Missing value for --output');
      }
      args.outputDir = next;
      i += 1;
      continue;
    }
    if (arg === '--help' || arg === '-h') {
      args.help = true;
      continue;
    }
    positional.push(arg);
  }

  if (positional[0]) {
    args.contentDir = positional[0];
  }

  return args;
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

const collectLocalImagePaths = (text: string): string[] =>
  [...text.matchAll(LOCAL_IMAGE_PATH_RE)].map((match) => normalizeLocalImagePath(match[0]));

const normalizeLocalImagePath = (value: string): string => value.replace(/[\\:;,!?]+$/g, '');

const resolveTargetLocalPath = (localPath: string): string =>
  localPath.endsWith('.gif') ? localPath.replace(/\.gif$/i, '.mp4') : localPath;

const localToRemoteUrl = (localPath: string): string => {
  const remotePath = localPath.endsWith('.mp4')
    ? localPath.replace(/^\/hatena-images/, '').replace(/\.mp4$/i, '.gif')
    : localPath.replace(/^\/hatena-images/, '');
  return `https://cdn-ak.f.st-hatena.com${remotePath}`;
};

const cleanupLegacyGif = async (targetPath: string): Promise<void> => {
  if (!targetPath.endsWith('.mp4')) {
    return;
  }

  await rm(targetPath.replace(/\.mp4$/i, '.gif'), { force: true }).catch(() => {});
};

const fileExists = async (filePath: string): Promise<boolean> => {
  try {
    const info = await stat(filePath);
    return info.isFile() && info.size > 0;
  } catch {
    return false;
  }
};

const downloadFile = async (sourceUrl: string, destinationPath: string): Promise<void> => {
  await execFileAsync('curl', [...CURL_ARGS, '-e', HATENA_REFERER, sourceUrl, '-o', destinationPath]);
};

const convertGifToMp4 = async (inputPath: string, outputPath: string): Promise<void> => {
  await execFileAsync('ffmpeg', [
    '-y',
    '-i',
    inputPath,
    '-an',
    '-vf',
    'pad=ceil(iw/2)*2:ceil(ih/2)*2',
    '-c:v',
    'libx264',
    '-pix_fmt',
    'yuv420p',
    '-movflags',
    '+faststart',
    '-crf',
    '28',
    '-preset',
    'medium',
    outputPath,
  ]);
};

const downloadAsset = async (localPath: string, outputDir: string): Promise<DownloadResult> => {
  const resolvedLocalPath = resolveTargetLocalPath(localPath);
  const relativePath = resolvedLocalPath.replace(/^\/hatena-images\/?/, '');
  const targetPath = path.join(outputDir, relativePath);
  if (await fileExists(targetPath)) {
    await cleanupLegacyGif(targetPath);
    return { localPath, targetPath, skipped: true };
  }

  const sourceUrl = localToRemoteUrl(localPath);
  const isMp4 = targetPath.endsWith('.mp4');
  const temporaryPath = isMp4
    ? `${targetPath}.download-${process.pid}-${Date.now()}.mp4`
    : `${targetPath}.download-${process.pid}-${Date.now()}`;
  await mkdir(path.dirname(targetPath), { recursive: true });

  try {
    if (isMp4) {
      const temporaryGifPath = `${temporaryPath}.gif`;
      await downloadFile(sourceUrl, temporaryGifPath);
      await convertGifToMp4(temporaryGifPath, temporaryPath);
      await rm(temporaryGifPath, { force: true });
      await rename(temporaryPath, targetPath);
      await cleanupLegacyGif(targetPath);
    } else {
      await downloadFile(sourceUrl, temporaryPath);
      await rename(temporaryPath, targetPath);
      await cleanupLegacyGif(targetPath);
    }
  } catch (error) {
    await rm(temporaryPath, { force: true }).catch(() => {});
    await rm(`${temporaryPath}.gif`, { force: true }).catch(() => {});
    throw new Error(`Failed to download ${sourceUrl}: ${formatError(error)}`);
  }

  return { localPath, targetPath, skipped: false };
};

const main = async (): Promise<void> => {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    process.exit(0);
  }

  const contentDir = path.resolve(args.contentDir);
  const outputDir = path.resolve(args.outputDir);
  const markdownFiles = await collectMarkdownFiles(contentDir);
  const localPaths = new Set<string>();

  for (const filePath of markdownFiles) {
    const text = await readFile(filePath, 'utf8');
    for (const match of collectLocalImagePaths(text)) {
      localPaths.add(match);
    }
  }

  const paths = [...localPaths].sort();
  const failures: unknown[] = [];
  let downloaded = 0;
  let skipped = 0;

  for (let i = 0; i < paths.length; i += DOWNLOAD_CONCURRENCY) {
    const batch = paths.slice(i, i + DOWNLOAD_CONCURRENCY);
    const results = await Promise.allSettled(batch.map((localPath) => downloadAsset(localPath, outputDir)));
    for (const result of results) {
      if (result.status === 'fulfilled') {
        if (result.value.skipped) {
          skipped += 1;
        } else {
          downloaded += 1;
        }
      } else {
        failures.push(result.reason);
        console.error(formatError(result.reason));
      }
    }
  }

  console.log(`Downloaded ${downloaded} images, skipped ${skipped} existing images.`);

  if (failures.length > 0) {
    process.exitCode = 1;
    console.error(`Failed to download ${failures.length} image(s).`);
  }
};

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error : new Error(String(error)));
  process.exit(1);
});
