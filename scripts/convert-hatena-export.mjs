#!/usr/bin/env node

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const DEFAULT_INPUT = 'backup/treeapps.hatenablog.com.export.txt';
const DEFAULT_OUTPUT_DIR = 'src/content/blog';
const LEGACY_HOSTS = new Set([
  'treeapps.hatenablog.com',
  'bunkei-programmer.net',
  'www.bunkei-programmer.net',
]);
const HATENA_IMAGE_HOSTS = new Set([
  'cdn-ak.f.st-hatena.com',
  'f.st-hatena.com',
]);

function usage() {
  console.error(
    [
      'Usage:',
      '  node scripts/convert-hatena-export.mjs [input] [--output dir]',
      '',
      'Examples:',
      '  node scripts/convert-hatena-export.mjs',
      '  node scripts/convert-hatena-export.mjs backup/treeapps.hatenablog.com.export.txt --output src/content/blog',
    ].join('\n'),
  );
}

function parseArgs(argv) {
  const args = {
    input: DEFAULT_INPUT,
    outputDir: DEFAULT_OUTPUT_DIR,
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
    args.input = positional[0];
  }

  return args;
}

function splitRecords(text) {
  return text
    .replace(/\r\n/g, '\n')
    .split(/\n--------\n/g)
    .map((record) => record.trim())
    .filter(Boolean);
}

function parseFields(lines) {
  const fields = new Map();
  for (const line of lines) {
    if (!line || line === '-----') {
      continue;
    }
    const separatorIndex = line.indexOf(': ');
    if (separatorIndex === -1) {
      continue;
    }
    const key = line.slice(0, separatorIndex);
    const value = line.slice(separatorIndex + 2);
    if (!fields.has(key)) {
      fields.set(key, []);
    }
    fields.get(key).push(value);
  }
  return fields;
}

function parseRecord(record) {
  const lines = record.split('\n');
  const bodySeparatorIndex = lines.indexOf('-----');
  if (bodySeparatorIndex === -1) {
    throw new Error('Invalid export record: missing BODY separator');
  }

  const fields = parseFields(lines.slice(0, bodySeparatorIndex));
  const bodyHeaderIndex = bodySeparatorIndex + 1;
  if (lines[bodyHeaderIndex] !== 'BODY:') {
    throw new Error('Invalid export record: missing BODY header');
  }

  const bodyEndIndex = findNextSeparator(lines, bodyHeaderIndex + 1);
  if (bodyEndIndex === -1) {
    throw new Error('Invalid export record: missing end of BODY');
  }

  const body = lines.slice(bodyHeaderIndex + 1, bodyEndIndex).join('\n');
  const extendedHeaderIndex = bodyEndIndex + 1;

  let extendedBody = '';
  if (lines[extendedHeaderIndex] === 'EXTENDED BODY:') {
    const extendedEndIndex = findNextSeparator(lines, extendedHeaderIndex + 1);
    if (extendedEndIndex === -1) {
      throw new Error('Invalid export record: missing end of EXTENDED BODY');
    }
    extendedBody = lines.slice(extendedHeaderIndex + 1, extendedEndIndex).join('\n');
  }

  return {
    fields,
    body,
    extendedBody,
  };
}

function findNextSeparator(lines, startIndex) {
  for (let i = startIndex; i < lines.length; i += 1) {
    if (lines[i] === '-----') {
      return i;
    }
  }
  return -1;
}

function getFieldValues(fields, key) {
  return fields.get(key) ?? [];
}

function getFieldValue(fields, key) {
  const values = getFieldValues(fields, key);
  return values[0] ?? '';
}

function getCategories(fields) {
  return getFieldValues(fields, 'CATEGORY').filter(Boolean);
}

function parseJstDate(value) {
  const match = value.match(
    /^(?<month>\d{2})\/(?<day>\d{2})\/(?<year>\d{4}) (?<hour>\d{2}):(?<minute>\d{2}):(?<second>\d{2})$/,
  );
  if (!match || !match.groups) {
    return null;
  }

  const { year, month, day, hour, minute, second } = match.groups;
  return `${year}-${month}-${day}T${hour}:${minute}:${second}+09:00`;
}

function detectSlugLang(attrs) {
  const dataLang = attrs['data-lang'];
  if (dataLang) {
    return dataLang;
  }
  const className = attrs.class ?? '';
  const match = className.match(/\blang-([A-Za-z0-9_+-]+)\b/);
  return match ? match[1] : '';
}

function decodeHtmlEntities(value) {
  if (!value) {
    return '';
  }

  const named = {
    amp: '&',
    lt: '<',
    gt: '>',
    quot: '"',
    apos: "'",
    nbsp: ' ',
    ldquo: '“',
    rdquo: '”',
    lsquo: '‘',
    rsquo: '’',
    hellip: '…',
    middot: '・',
    rarr: '→',
    larr: '←',
    uarr: '↑',
    darr: '↓',
  };

  return value.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, entity) => {
    if (entity[0] === '#') {
      const base = entity[1] === 'x' || entity[1] === 'X' ? 16 : 10;
      const digits = base === 16 ? entity.slice(2) : entity.slice(1);
      const codePoint = Number.parseInt(digits, base);
      if (Number.isFinite(codePoint)) {
        try {
          return String.fromCodePoint(codePoint);
        } catch {
          return match;
        }
      }
      return match;
    }
    return named[entity] ?? match;
  });
}

function normalizeInlineText(value) {
  return decodeHtmlEntities(value)
    .replace(/\s+/g, ' ')
    .replace(/ \n/g, '\n')
    .trim();
}

function trimTrailingSpaces(value) {
  return value.replace(/[ \t]+$/gm, '');
}

function escapeMarkdownText(value) {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function parseAttributes(attributeText) {
  const attrs = {};
  const regex = /([A-Za-z0-9:-]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s"'`=<>]+)))?/g;
  let match;
  while ((match = regex.exec(attributeText))) {
    const [, key, doubleQuoted, singleQuoted, bare] = match;
    attrs[key] = doubleQuoted ?? singleQuoted ?? bare ?? '';
  }
  return attrs;
}

function tokenizeHtml(html) {
  return html.match(/<!--[\s\S]*?-->|<\/?[A-Za-z0-9:-]+(?:\s[^<>]*?)?>|[^<]+/g) ?? [];
}

function parseHtml(html) {
  const root = { type: 'root', children: [] };
  const stack = [root];
  const tokens = tokenizeHtml(html);
  const voidTags = new Set(['br', 'img', 'hr', 'meta', 'input', 'link', 'source', 'area', 'base', 'col', 'embed', 'param', 'track', 'wbr']);

  for (const token of tokens) {
    if (!token) {
      continue;
    }
    if (token.startsWith('<!--')) {
      continue;
    }
    if (token.startsWith('</')) {
      const closeMatch = token.match(/^<\/\s*([A-Za-z0-9:-]+)\s*>$/);
      if (!closeMatch) {
        continue;
      }
      const closeTag = closeMatch[1].toLowerCase();
      for (let i = stack.length - 1; i > 0; i -= 1) {
        if (stack[i].tag === closeTag) {
          stack.length = i;
          break;
        }
      }
      continue;
    }
    if (token.startsWith('<')) {
      const openMatch = token.match(/^<\s*([A-Za-z0-9:-]+)([\s\S]*?)\/?\s*>$/);
      if (!openMatch) {
        continue;
      }
      const tag = openMatch[1].toLowerCase();
      const rawAttrs = openMatch[2] ?? '';
      const selfClosing = /\/\s*>$/.test(token) || voidTags.has(tag);
      const node = {
        type: 'element',
        tag,
        attrs: parseAttributes(rawAttrs),
        children: [],
      };
      current(stack).children.push(node);
      if (!selfClosing) {
        stack.push(node);
      }
      continue;
    }

    current(stack).children.push({
      type: 'text',
      text: token,
    });
  }

  return root;
}

function current(stack) {
  return stack[stack.length - 1];
}

function hasClass(node, className) {
  const classList = (node.attrs.class ?? '').split(/\s+/).filter(Boolean);
  return classList.includes(className);
}

function findFirstDescendant(node, predicate) {
  for (const child of node.children ?? []) {
    if (child.type === 'element') {
      if (predicate(child)) {
        return child;
      }
      const found = findFirstDescendant(child, predicate);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

function extractText(node, options = {}) {
  const { preserveLineBreaks = false } = options;
  if (node.type === 'text') {
    return decodeHtmlEntities(node.text);
  }

  if (node.type !== 'element' && node.type !== 'root') {
    return '';
  }

  switch (node.tag) {
    case 'br':
      return '\n';
    case 'p':
    case 'div':
    case 'section':
    case 'li':
    case 'blockquote':
      return `${node.children.map((child) => extractText(child, { preserveLineBreaks })).join('')}${preserveLineBreaks ? '\n' : ' '}`;
    default:
      return node.children.map((child) => extractText(child, { preserveLineBreaks })).join('');
  }
}

function renderChildren(children, context) {
  return children.map((child) => renderNode(child, context)).join('');
}

function renderNode(node, context = { mode: 'block', listDepth: 0 }) {
  if (node.type === 'text') {
    if (context.mode === 'code') {
      return decodeHtmlEntities(node.text);
    }
    if (context.mode === 'inline') {
      return rewriteBareUrls(decodeHtmlEntities(node.text), context.entryMap).replace(/\s+/g, ' ');
    }
    return rewriteBareUrls(decodeHtmlEntities(node.text), context.entryMap).replace(/\s+/g, ' ');
  }

  if (node.type !== 'element') {
    return '';
  }

  const mode = context.mode ?? 'block';

  if (node.tag === 'cite' && hasClass(node, 'hatena-citation')) {
    return '';
  }

  if (node.tag === 'img') {
    const src = node.attrs.src ?? '';
    if (!src) {
      return '';
    }
    const alt = normalizeInlineText(node.attrs.alt ?? node.attrs.title ?? '');
    if (isHatenaVideoPath(src)) {
      return renderVideoElement(rewriteHatenaImageUrl(src), alt);
    }
    return `![${escapeMarkdownText(alt)}](${rewriteHatenaImageUrl(src)})`;
  }

  if (node.tag === 'a') {
    const href = rewriteUrl(node.attrs.href ?? '', context.entryMap);
    const text = normalizeInlineText(renderChildren(node.children, { ...context, mode: 'inline' }));
    const label = text || href;
    if (!href) {
      return label;
    }
    if (label === href) {
      return href;
    }
    return `[${escapeMarkdownText(label)}](${href})`;
  }

  if (node.tag === 'br') {
    return mode === 'code' ? '\n' : '  \n';
  }

  if (/^h[1-6]$/.test(node.tag)) {
    const level = Number(node.tag.slice(1));
    const id = node.attrs.id ? `<a id="${escapeHtml(node.attrs.id)}"></a>\n\n` : '';
    const text = normalizeInlineText(renderChildren(node.children, { ...context, mode: 'inline' }));
    if (!text) {
      return '';
    }
    if (mode === 'inline') {
      return text;
    }
    return `\n\n${id}${'#'.repeat(level)} ${text}\n\n`;
  }

  if (node.tag === 'p') {
    const significantChildren = node.children.filter(
      (child) => !(child.type === 'text' && normalizeInlineText(child.text) === ''),
    );
    const specialVideoIndex = significantChildren.findIndex(
      (child) => child.type === 'element' && child.tag === 'img' && isHatenaVideoPath(child.attrs.src ?? ''),
    );
    if (specialVideoIndex !== -1) {
      const before = normalizeInlineText(
        renderChildren(significantChildren.slice(0, specialVideoIndex), { ...context, mode: 'inline' }),
      );
      const after = normalizeInlineText(
        renderChildren(significantChildren.slice(specialVideoIndex + 1), { ...context, mode: 'inline' }),
      );
      const videoNode = significantChildren[specialVideoIndex];
      const video = renderNode(videoNode, { ...context, mode: 'block' }).trim();
      const parts = [];
      if (before) {
        parts.push(`\n\n${before}\n\n`);
      }
      if (video) {
        parts.push(`${video}\n\n`);
      }
      if (after) {
        parts.push(after ? `${after}\n\n` : '');
      }
      return parts.join('');
    }
    const canRenderAsBlock =
      significantChildren.length > 0 &&
      significantChildren.every((child) => {
        if (child.type !== 'element') {
          return false;
        }
        if (child.tag === 'cite' && hasClass(child, 'hatena-citation')) {
          return true;
        }
        return ['iframe', 'div', 'img', 'blockquote', 'pre'].includes(child.tag);
      });
    if (canRenderAsBlock) {
      const rendered = significantChildren.map((child) => renderNode(child, { ...context, mode: 'block' })).join('');
      return rendered.trim() ? `\n\n${normalizeBlock(rendered)}\n\n` : '';
    }

    const text = normalizeInlineText(renderChildren(node.children, { ...context, mode: 'inline' }));
    if (!text) {
      return '';
    }
    return mode === 'inline' ? text : `\n\n${text}\n\n`;
  }

  if (node.tag === 'pre') {
    const lang = detectSlugLang(node.attrs);
    const code = normalizeLegacyEntryReferences(
      rewriteBareUrls(
        extractText(node, { preserveLineBreaks: true })
          .replace(/^\n+/, '')
          .replace(/\n+$/, ''),
        context.entryMap,
      ),
      context.entryMap,
    );
    return `\n\n\`\`\`${lang}\n${code}\n\`\`\`\n\n`;
  }

  if (node.tag === 'blockquote') {
    const inner = normalizeBlock(renderChildren(node.children, { ...context, mode: 'block' })).trim();
    if (!inner) {
      return '';
    }
    const quoted = inner
      .split('\n')
      .map((line) => (line.trim() ? `> ${line}` : '>'))
      .join('\n');
    return `\n\n${quoted}\n\n`;
  }

  if (node.tag === 'ul' || node.tag === 'ol') {
    const ordered = node.tag === 'ol';
    const rendered = renderList(node, { ...context, listDepth: context.listDepth ?? 0 }, ordered);
    return mode === 'inline' ? rendered.trim() : `\n\n${rendered}\n\n`;
  }

  if (node.tag === 'li') {
    return renderListItem(node, { ...context, listDepth: context.listDepth ?? 0 }, false, 1).trimEnd();
  }

  if (node.tag === 'iframe') {
    const rendered = renderIframe(node, context.entryMap);
    return mode === 'inline' ? rendered : `\n\n${rendered}\n\n`;
  }

  if (node.tag === 'div' && hasClass(node, 'hatena-asin-detail')) {
    const rendered = renderHatenaAsinDetail(node, context.entryMap);
    return mode === 'inline' ? rendered : `\n\n${rendered}\n\n`;
  }

  if (node.tag === 'div' && hasClass(node, 'section')) {
    return renderChildren(node.children, context);
  }

  if (node.tag === 'span' || node.tag === 'cite' || node.tag === 'div') {
    return renderChildren(node.children, context);
  }

  return renderChildren(node.children, context);
}

function renderList(node, context, ordered) {
  const items = node.children.filter((child) => child.type === 'element' && child.tag === 'li');
  const rendered = items
    .map((item, index) => renderListItem(item, context, ordered, index + 1))
    .filter(Boolean)
    .join('\n');
  return rendered;
}

function renderListItem(node, context, ordered, index) {
  const indent = '  '.repeat(context.listDepth ?? 0);
  const bullet = ordered ? `${index}.` : '-';
  const inlineParts = [];
  const nestedLists = [];

  for (const child of node.children) {
    if (child.type === 'element' && (child.tag === 'ul' || child.tag === 'ol')) {
      nestedLists.push(
        renderList(child, { ...context, listDepth: (context.listDepth ?? 0) + 1 }, child.tag === 'ol'),
      );
      continue;
    }
    inlineParts.push(renderNode(child, { ...context, mode: 'inline' }));
  }

  const content = normalizeInlineText(inlineParts.join(' '));
  const line = content ? `${indent}${bullet} ${content}` : `${indent}${bullet}`;
  const nested = nestedLists.filter(Boolean).join('\n');
  if (!nested) {
    return line;
  }
  return `${line}\n${nested}`;
}

function renderIframe(node, entryMap) {
  const src = node.attrs.src ?? '';
  if (!src) {
    return '';
  }

  const url = rewriteIframeUrl(src, entryMap);
  const title = normalizeInlineText(node.attrs.title ?? '');
  const label =
    title ||
    (url.includes('youtube.com/watch') ? 'YouTube' : url.includes('amazon.co.jp') ? 'Amazon' : 'embed');
  return `[${escapeMarkdownText(label)}](${url})`;
}

function renderHatenaAsinDetail(node, entryMap) {
  const anchor = findFirstDescendant(node, (candidate) => candidate.tag === 'a' && (candidate.attrs.href ?? '') !== '');
  const image = findFirstDescendant(node, (candidate) => candidate.tag === 'img' && (candidate.attrs.src ?? '') !== '');
  const titleNode = findFirstDescendant(node, (candidate) =>
    candidate.tag === 'p' && hasClass(candidate, 'hatena-asin-detail-title'),
  );
  const titleAnchor = titleNode
    ? findFirstDescendant(titleNode, (candidate) => candidate.tag === 'a' && (candidate.attrs.href ?? '') !== '')
    : null;

  const link = anchor ? rewriteUrl(anchor.attrs.href ?? '', entryMap) : '';
  const title =
    (titleAnchor ? normalizeInlineText(extractText(titleAnchor)) : '') ||
    (titleNode ? normalizeInlineText(extractText(titleNode)) : '') ||
    (anchor ? normalizeInlineText(extractText(anchor)) : '') ||
    (image ? normalizeInlineText(image.attrs.alt ?? image.attrs.title ?? '') : '') ||
    link;

  const parts = [];
  if (title && link) {
    parts.push(`[${escapeMarkdownText(title)}](${link})`);
  } else if (link) {
    parts.push(link);
  } else if (title) {
    parts.push(title);
  }
  if (image?.attrs.src) {
    const imageAlt = title || normalizeInlineText(image.attrs.alt ?? image.attrs.title ?? '');
    parts.push(`![${escapeMarkdownText(imageAlt)}](${image.attrs.src})`);
  }
  return parts.join('\n\n');
}

function normalizeBlock(value) {
  return trimTrailingSpaces(value)
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function rewriteUrl(href, entryMap) {
  const trimmed = href.trim();
  if (!trimmed) {
    return '';
  }

  if (trimmed.startsWith('#') || trimmed.startsWith('mailto:') || trimmed.startsWith('tel:')) {
    return trimmed;
  }

  let url;
  try {
    url = new URL(trimmed, 'https://example.com');
  } catch {
    return trimmed;
  }

  if (LEGACY_HOSTS.has(url.hostname)) {
    return rewriteInternalUrl(url, entryMap);
  }

  return trimmed;
}

function rewriteBareUrls(text, entryMap) {
  if (!text) {
    return text;
  }

  return text.replace(
    /https?:\/\/(?:www\.)?(?:treeapps\.hatenablog\.com|bunkei-programmer\.net)(?:\/[^\s<>"')\]]*)?/g,
    (match) => {
      try {
        return rewriteInternalUrl(new URL(match), entryMap);
      } catch {
        return match;
      }
    },
  );
}

function normalizeLegacyEntryReferences(text, entryMap) {
  if (!text) {
    return text;
  }

  return text.replace(
    /https?:\/\/(?:www\.)?(?:treeapps\.hatenablog\.com|bunkei-programmer\.net)\/entry\/((?:[^\/\s<>"')\]:]+\/)*[^\/\s<>"')\]:]+)(:title:[^\s<>"')\]]+)?/g,
    (match, basename, suffix = '') => {
      let decoded = basename;
      try {
        decoded = decodeURIComponent(basename);
      } catch {
        // Keep the original value when decoding fails.
      }

      const currentPath = entryMap.get(decoded);
      if (currentPath) {
        return `${currentPath}${suffix}`;
      }

      return `/entry/${decoded}${suffix}`;
    },
  );
}

function rewriteIframeUrl(src, entryMap) {
  let url;
  try {
    url = new URL(src, 'https://example.com');
  } catch {
    return src;
  }

  if (url.hostname === 'www.youtube.com' || url.hostname === 'youtube.com') {
    const embedMatch = url.pathname.match(/^\/embed\/([A-Za-z0-9_-]+)/);
    if (embedMatch) {
      return `https://www.youtube.com/watch?v=${embedMatch[1]}`;
    }
    return url.toString();
  }

  if (url.hostname === 'youtu.be') {
    const id = url.pathname.replace(/^\//, '');
    if (id) {
      return `https://www.youtube.com/watch?v=${id}`;
    }
    return url.toString();
  }

  if (url.hostname === 'hatenablog-parts.com') {
    const embedded = url.searchParams.get('url');
    if (embedded) {
      return rewriteUrl(decodeURIComponent(embedded), entryMap);
    }
  }

  if (LEGACY_HOSTS.has(url.hostname)) {
    return rewriteInternalUrl(url, entryMap);
  }

  return src;
}

function isHatenaImageUrl(value) {
  let url;
  try {
    url = new URL(value, 'https://example.com');
  } catch {
    return false;
  }

  return HATENA_IMAGE_HOSTS.has(url.hostname) && url.pathname.startsWith('/images/');
}

function rewriteHatenaImageUrl(value) {
  let url;
  try {
    url = new URL(value, 'https://example.com');
  } catch {
    return value;
  }

  if (!isHatenaImageUrl(url.toString())) {
    return value;
  }

  if (url.pathname.endsWith('.gif')) {
    return `/hatena-images${url.pathname.replace(/\.gif$/i, '.mp4')}`;
  }

  return `/hatena-images${url.pathname}`;
}

function isHatenaVideoPath(value) {
  return rewriteHatenaImageUrl(value).endsWith('.mp4');
}

function renderVideoElement(src, alt) {
  const title = alt ? ` title="${escapeHtml(alt)}"` : '';
  const aria = alt ? ` aria-label="${escapeHtml(alt)}"` : '';
  return `<video class="post-media" controls playsinline preload="metadata"${title}${aria}>\n  <source src="${escapeHtml(src)}" type="video/mp4" />\n</video>`;
}

function rewriteInternalUrl(url, entryMap) {
  const match = url.pathname.match(/^\/entry\/(.+)$/);
  if (match) {
    let basename = match[1].replace(/\/$/, '');
    try {
      basename = decodeURIComponent(basename);
    } catch {
      // Keep the original path when it is not valid percent-encoding.
    }
    const currentPath = entryMap.get(basename);
    if (currentPath) {
      return `${currentPath}${url.search ?? ''}${url.hash ?? ''}`;
    }
  }

  return `${url.pathname}${url.search ?? ''}${url.hash ?? ''}`;
}

function buildEntryMap(entries) {
  const map = new Map();
  for (const entry of entries) {
    if (!entry.basename) {
      continue;
    }
    map.set(entry.basename, `/entry/${entry.basename}/`);
  }
  return map;
}

function buildMarkdown(entry, entryMap) {
  const sourceUrl = `/entry/${entry.basename}/`;
  const legacyUrl = `/entry/${entry.basename}/`;
  const categories = entry.categories;
  const image = entry.image ? rewriteHatenaImageUrl(entry.image) : '';

  const frontmatter = [
    '---',
    `title: ${yamlString(entry.title)}`,
    `publishedAt: ${yamlString(entry.publishedAt)}`,
    `basename: ${yamlString(entry.basename)}`,
    `sourceUrl: ${yamlString(sourceUrl)}`,
    `legacyUrl: ${yamlString(legacyUrl)}`,
    `categories: ${yamlArray(categories)}`,
    image ? `image: ${yamlString(image)}` : null,
    '---',
    '',
  ]
    .filter((line) => line !== null)
    .join('\n');

  const html = [entry.body, entry.extendedBody].filter(Boolean).join('\n');
  const tree = parseHtml(html);
  const markdown = normalizeLegacyEntryReferences(
    normalizeBlock(renderChildren(tree.children, { mode: 'block', listDepth: 0, entryMap })),
    entryMap,
  );

  return normalizeAnimeTerminology(`${frontmatter}${markdown}\n`);
}

function normalizeAnimeTerminology(text) {
  return text
    .replace(/GIFアニメ/g, '動画')
    .replace(/GIF アニメ/g, '動画')
    .replace(/gifアニメ/g, '動画')
    .replace(/gif アニメ/g, '動画');
}

function yamlString(value) {
  return JSON.stringify(String(value));
}

function yamlArray(values) {
  return `[${values.map((value) => yamlString(value)).join(', ')}]`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    process.exit(0);
  }

  const sourcePath = path.resolve(args.input);
  const outputDir = path.resolve(args.outputDir);
  const source = await readFile(sourcePath, 'utf8');
  const records = splitRecords(source);

  const parsedEntries = records.map((record) => {
    const { fields, body, extendedBody } = parseRecord(record);
    const title = getFieldValue(fields, 'TITLE');
    const basename = getFieldValue(fields, 'BASENAME');
    const date = getFieldValue(fields, 'DATE');
    const publishedAt = parseJstDate(date);
    if (!publishedAt) {
      throw new Error(`Failed to parse date: ${date}`);
    }
    const categories = getCategories(fields);
    const image = getFieldValue(fields, 'IMAGE');

    return {
      title,
      basename,
      publishedAt,
      categories,
      image,
      body,
      extendedBody,
    };
  });

  const entryMap = buildEntryMap(parsedEntries);

  await mkdir(outputDir, { recursive: true });

  for (const entry of parsedEntries) {
    const markdown = buildMarkdown(entry, entryMap);
    const filePath = path.join(outputDir, ...entry.basename.split('/')) + '.md';
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, markdown, 'utf8');
  }

  console.error(`Converted ${parsedEntries.length} entries into ${outputDir}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error));
  process.exit(1);
});
