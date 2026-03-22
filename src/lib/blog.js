import { getCollection } from 'astro:content';
import {
  PAGE_SIZE,
  PAGINATION_AROUND_CURRENT_PAGE_COUNT,
  PAGINATION_EDGE_PAGE_COUNT,
  getPageHref,
} from './pagination.js';

export { PAGE_SIZE, PAGINATION_AROUND_CURRENT_PAGE_COUNT, PAGINATION_EDGE_PAGE_COUNT, getPageHref };

/**
 * @typedef {import('astro:content').CollectionEntry<'blog'>} BlogPost
 */

/**
 * @returns {Promise<BlogPost[]>}
 */
export async function getSortedPosts() {
  /** @type {BlogPost[]} */
  const posts = await getCollection('blog');
  return [...posts].sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime());
}

/**
 * @param {number} totalPosts
 * @returns {number}
 */
export function getTotalPages(totalPosts) {
  return Math.max(1, Math.ceil(totalPosts / PAGE_SIZE));
}

/**
 * @param {BlogPost[]} posts
 * @param {number} page
 * @returns {{
 *   posts: BlogPost[];
 *   page: number;
 *   totalPages: number;
 * }}
 */
export function getPageSlice(posts, page) {
  const currentPage = Math.max(1, page);
  const totalPages = getTotalPages(posts.length);
  const start = (currentPage - 1) * PAGE_SIZE;
  return {
    posts: posts.slice(start, start + PAGE_SIZE),
    page: currentPage,
    totalPages,
  };
}

/**
 * @param {string} tag
 * @returns {string}
 */
export function getTagHref(tag) {
  return `/tags/${encodeURIComponent(tag)}/`;
}

function createPaginationPage(value, currentPage) {
  return {
    type: 'page',
    page: value,
    href: getPageHref(value),
    current: value === currentPage,
  };
}

function expandPaginationWindow(start, end, min, max, targetCount) {
  let nextStart = start;
  let nextEnd = end;

  while (nextEnd - nextStart + 1 < targetCount && (nextStart > min || nextEnd < max)) {
    if (nextStart > min) {
      nextStart -= 1;
    }

    if (nextEnd - nextStart + 1 >= targetCount) {
      break;
    }

    if (nextEnd < max) {
      nextEnd += 1;
    }
  }

  return {
    start: nextStart,
    end: nextEnd,
  };
}

export function getPaginationItems(currentPage, totalPages) {
  const page = Math.max(1, Math.min(currentPage, totalPages));
  const adjacentPageCount = Math.max(0, PAGINATION_AROUND_CURRENT_PAGE_COUNT);
  const edgePageCount = Math.max(0, PAGINATION_EDGE_PAGE_COUNT);
  const visibleInnerPageCount = adjacentPageCount * 2 + 1;
  const maxPagesWithoutEllipsis = visibleInnerPageCount + edgePageCount * 2;

  if (totalPages <= maxPagesWithoutEllipsis) {
    return Array.from({ length: totalPages }, (_, index) => createPaginationPage(index + 1, page));
  }

  const items = [];
  const pushPage = (value) => {
    items.push(createPaginationPage(value, page));
  };
  const pushEllipsis = () => {
    items.push({ type: 'ellipsis' });
  };

  const innerMin = 2;
  const innerMax = totalPages - 1;
  const targetInnerCount = Math.min(innerMax - innerMin + 1, visibleInnerPageCount);
  const initialStart = Math.max(innerMin, page - adjacentPageCount);
  const initialEnd = Math.min(innerMax, page + adjacentPageCount);
  const { start, end } = expandPaginationWindow(
    initialStart,
    initialEnd,
    innerMin,
    innerMax,
    targetInnerCount,
  );

  pushPage(1);
  if (start > 2) {
    pushEllipsis();
  }
  for (let value = start; value <= end; value += 1) {
    pushPage(value);
  }
  if (end < totalPages - 1) {
    pushEllipsis();
  }
  pushPage(totalPages);

  return items;
}
