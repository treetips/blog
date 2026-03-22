export const PAGE_SIZE = 6;
export const HATENA_PAGE_SIZE = 6;
export const PAGINATION_AROUND_CURRENT_PAGE_COUNT = 5;
export const PAGINATION_EDGE_PAGE_COUNT = 1;

export function getPageHref(page) {
  return page <= 1 ? '/' : `/page/${page}/`;
}
