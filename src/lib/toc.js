// Why not: render() の headings はフラット配列で構造が無い。目次の
// 階層リストを組み立てる責務をコンポーネントから分離し、ここに置く
// (テストで保護できる対象はロジック側に寄せる)。

/**
 * @typedef {Object} MarkdownHeading
 * @property {number} depth 見出しレベル (1〜6)
 * @property {string} slug プロセッサーが付与したヘッダー ID
 * @property {string} text 見出しテキスト (整形済み)
 */

/**
 * フラットな見出し配列を「章(h2) / 節(h3)」の2階層ツリーに組み立てる。
 * 深度1と4以降は目次から除外する。親を持たない h3 はそれ自体を章として
 * 扱う (情報を欠落させないため)。
 *
 * @param {MarkdownHeading[] | undefined} headings
 * @returns {Array<{ heading: MarkdownHeading, children: MarkdownHeading[] }>}
 */
export function buildTocTree(headings) {
  const chapters = [];

  for (const heading of headings ?? []) {
    if (heading.depth === 2) {
      chapters.push({ heading, children: [] });
      continue;
    }

    if (heading.depth === 3) {
      const parent = chapters.at(-1);
      if (parent) {
        parent.children.push(heading);
      } else {
        chapters.push({ heading, children: [] });
      }
    }
  }

  return chapters;
}
