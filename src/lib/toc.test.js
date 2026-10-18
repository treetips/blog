import { describe, expect, it } from "bun:test";
import { buildTocTree } from "./toc.js";

describe("buildTocTree", () => {
  it("深度1と4〜6の見出しを除外する", () => {
    const headings = [
      { depth: 1, slug: "a", text: "h1" },
      { depth: 2, slug: "b", text: "h2" },
      { depth: 4, slug: "c", text: "h4" },
      { depth: 6, slug: "d", text: "h6" },
    ];

    expect(buildTocTree(headings)).toEqual([{ heading: headings[1], children: [] }]);
  });

  it("直前の章に節をぶら下げる", () => {
    const headings = [
      { depth: 2, slug: "a", text: "chap1" },
      { depth: 3, slug: "b", text: "sec1" },
      { depth: 3, slug: "c", text: "sec2" },
      { depth: 2, slug: "d", text: "chap2" },
    ];

    expect(buildTocTree(headings)).toEqual([
      { heading: headings[0], children: [headings[1], headings[2]] },
      { heading: headings[3], children: [] },
    ]);
  });

  it("親のない節はそれ自体を章として扱う", () => {
    const headings = [
      { depth: 3, slug: "a", text: "orphan" },
      { depth: 2, slug: "b", text: "chap" },
      { depth: 3, slug: "c", text: "sec" },
    ];

    expect(buildTocTree(headings)).toEqual([
      { heading: headings[0], children: [] },
      { heading: headings[1], children: [headings[2]] },
    ]);
  });

  it("目次対象が無い入力は空配列を返す", () => {
    expect(buildTocTree([])).toEqual([]);
    expect(buildTocTree(undefined)).toEqual([]);
  });
});
