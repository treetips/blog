#!/usr/bin/env node

import { execFile } from 'node:child_process';
import { mkdir, readFile, readdir, rename, rm, stat } from 'node:fs/promises';
import { promisify } from 'node:util';
import path from 'node:path';

const execFileAsync = promisify(execFile);

const DEFAULT_CONTENT_DIR = 'src/content/blog';
const DEFAULT_PUBLIC_DIR = 'public/hatena-images';
const LOCAL_IMAGE_PATH_RE = /\/hatena-images\/images\/[^\s<>"')\]]+/g;

function usage() {
  console.error(
    [
      'Usage:',
      '  bun scripts/download-hatena-images.mjs [content-dir] [--output dir]',
      '',
      'Examples:',
      '  bun scripts/download-hatena-images.mjs',
      '  bun scripts/download-hatena-images.mjs src/content/blog --output public/hatena-images',
    ].join('\n'),
  );
}

function parseArgs(argv) {
  const args = {
    contentDir: DEFAULT_CONTENT_DIR,
    outputDir: DEFAULT_PUBLIC_DIR,
  };

  const positional = [];
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
}

async function collectMarkdownFiles(rootDir) {
  const entries = await readdir(rootDir, { withFileTypes: true });
  const files = [];

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
}

function collectLocalImagePaths(text) {
  return [...text.matchAll(LOCAL_IMAGE_PATH_RE)].map((match) => normalizeLocalImagePath(match[0]));
}

function normalizeLocalImagePath(value) {
  return value.replace(/[\\:;,!?]+$/g, '');
}

function resolveTargetLocalPath(localPath) {
  if (localPath.endsWith('.gif')) {
    return localPath.replace(/\.gif$/i, '.mp4');
  }
  return localPath;
}

function localToRemoteUrl(localPath) {
  const remotePath = localPath.endsWith('.mp4')
    ? localPath.replace(/^\/hatena-images/, '').replace(/\.mp4$/i, '.gif')
    : localPath.replace(/^\/hatena-images/, '');
  return `https://cdn-ak.f.st-hatena.com${remotePath}`;
}

async function cleanupLegacyGif(targetPath) {
  if (!targetPath.endsWith('.mp4')) {
    return;
  }

  const legacyGifPath = targetPath.replace(/\.mp4$/i, '.gif');
  await rm(legacyGifPath, { force: true }).catch(() => {});
}

async function fileExists(filePath) {
  try {
    const info = await stat(filePath);
    return info.isFile() && info.size > 0;
  } catch {
    return false;
  }
}

async function downloadAsset(localPath, outputDir) {
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
      await execFileAsync('curl', [
        '-fsSL',
        '--retry',
        '3',
        '--retry-delay',
        '1',
        '-A',
        'Mozilla/5.0',
        '-e',
        'https://treeapps.hatenablog.com/',
        sourceUrl,
        '-o',
        temporaryGifPath,
      ]);
      await execFileAsync('ffmpeg', [
        '-y',
        '-i',
        temporaryGifPath,
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
        temporaryPath,
      ]);
      await rm(temporaryGifPath, { force: true });
      await rename(temporaryPath, targetPath);
      await cleanupLegacyGif(targetPath);
    } else {
      await execFileAsync('curl', [
        '-fsSL',
        '--retry',
        '3',
        '--retry-delay',
        '1',
        '-A',
        'Mozilla/5.0',
        '-e',
        'https://treeapps.hatenablog.com/',
        sourceUrl,
        '-o',
        temporaryPath,
      ]);
      await rename(temporaryPath, targetPath);
      await cleanupLegacyGif(targetPath);
    }
  } catch (error) {
    await rm(temporaryPath, { force: true }).catch(() => {});
    await rm(`${temporaryPath}.gif`, { force: true }).catch(() => {});
    throw new Error(`Failed to download ${sourceUrl}: ${error.message ?? error}`);
  }

  return { localPath, targetPath, skipped: false };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    process.exit(0);
  }

  const contentDir = path.resolve(args.contentDir);
  const outputDir = path.resolve(args.outputDir);
  const markdownFiles = await collectMarkdownFiles(contentDir);
  const localPaths = new Set();

  for (const filePath of markdownFiles) {
    const text = await readFile(filePath, 'utf8');
    for (const match of collectLocalImagePaths(text)) {
      localPaths.add(match);
    }
  }

  const paths = [...localPaths].sort();
  const failures = [];
  let downloaded = 0;
  let skipped = 0;
  const concurrency = 6;

  for (let i = 0; i < paths.length; i += concurrency) {
    const batch = paths.slice(i, i + concurrency);
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
        console.error(String(result.reason?.message ?? result.reason));
      }
    }
  }

  console.log(`Downloaded ${downloaded} images, skipped ${skipped} existing images.`);

  if (failures.length > 0) {
    process.exitCode = 1;
    console.error(`Failed to download ${failures.length} image(s).`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
