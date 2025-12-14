// SPDX-License-Identifier: MIT
// apps/backend/src/services/outlineParser.ts
/* Ein toleranter Parser für Unicode-ASCII-Bäume + Markdown-Bullets + „plain“ Überschriften. */

export type OutlineNode = {
  id: string;
  title: string;
  depth: number; // 0 = Wurzel
  path: string[]; // Titel-Kette bis zu diesem Knoten
  line: number; // 1-basierte Zeile
  children: OutlineNode[];
};

export type ParseOptions = {
  // heuristische Steuerung
  allowBullets?: boolean; // -/*/+ als Baumzeilen
  allowPlainHeadings?: boolean; // „🚛 Logistik“ als Root, wenn danach Baum folgt
  spacePerLevel?: number; // für reine Space-Einrückung
};

const DEFAULT_OPTS: Required<ParseOptions> = {
  allowBullets: true,
  allowPlainHeadings: true,
  spacePerLevel: 2,
};

const VS16 = /\uFE0F/g; // Variation Selector-16
const ZWJ = /\u200D/g; // Zero Width Joiner
const NBSP = /\u00A0/g;

/** Vor-Normalisierung: entfernt Zeichen, die das Matching sprengen, ohne sichtbare Info zu verlieren. */
function normalizeLine(raw: string): string {
  return raw
    .normalize("NFKC")
    .replace(VS16, "")
    .replace(ZWJ, "")
    .replace(NBSP, " ");
}

/** Tiefe aus Einrückung schätzen – robust gegenüber │, |, Tabs und Spaces. */
function measureDepth(indent: string, spacePerLevel: number): number {
  const pipes = (indent.match(/[│|]/g) || []).length;
  const spaces = indent.replace(/[^\s]/g, "").replace(/\t/g, "    ").length;
  const bySpaces = Math.floor(spaces / Math.max(1, spacePerLevel));
  return Math.max(pipes, bySpaces);
}

/** slug/id-Generator, stabil über Titelkette */
function slugify(parts: string[]): string {
  return parts
    .map((p) =>
      p
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\p{L}\p{N}\-_.]+/gu, "")
        .replace(/-+/g, "-"),
    )
    .join("/");
}

/** Hauptparser */
export function parseOutline(
  text: string,
  opts: ParseOptions = {},
): OutlineNode[] {
  const { allowBullets, allowPlainHeadings, spacePerLevel } = {
    ...DEFAULT_OPTS,
    ...opts,
  };
  const lines = text.split(/\r?\n/);

  type StackEntry = { node: OutlineNode; depth: number };
  const roots: OutlineNode[] = [];
  let stack: StackEntry[] = [];

  // Lookahead-Helfer: prüft, ob nach einer Überschrift tatsächlich Baum-/Bullet-Zeilen kommen
  const nextLineLooksLikeChild = (startIdx: number): boolean => {
    for (let j = startIdx + 1; j < lines.length; j++) {
      const l = normalizeLine(lines[j]).trimEnd();
      if (!l.trim()) continue;
      if (/^(?:[│|] ?|[ \t]{1,4})*(?:├|└)[─>]*\s+.+$/.test(l)) return true; // Baum
      if (allowBullets && /^\s*[-*+]\s+.+$/.test(l)) return true; // Bullet
      break;
    }
    return false;
  };

  const pushAtDepth = (title: string, depth: number, line1: number) => {
    // Stack auf Ziel-Tiefe trimmen
    while (stack.length && stack[stack.length - 1].depth >= depth) stack.pop();

    const path = [...(stack[stack.length - 1]?.node.path ?? []), title.trim()];
    const node: OutlineNode = {
      id: slugify(path),
      title: title.trim(),
      depth,
      path,
      line: line1,
      children: [],
    };

    if (stack.length === 0) {
      roots.push(node);
    } else {
      stack[stack.length - 1].node.children.push(node);
    }
    stack.push({ node, depth });
    return node;
  };

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = normalizeLine(raw).trimEnd();
    if (!line.trim()) continue;

    // 1) Markdown-Überschriften als Root (##, ###, …)
    const mH = line.match(/^\s*#{2,6}\s+(.+?)\s*$/);
    if (mH) {
      stack = [];
      pushAtDepth(mH[1], 0, i + 1);
      continue;
    }

    // 2) Baum-Zeile mit Box-Drawing / variablen Bindestrichen / „--->“
    //    indent: Kombination aus │, |, Tabs/Spaces
    const mTree = line.match(
      /^(?<indent>(?:[│|] ?|[ \t]{1,4})*)(?:├|└)[─>]*\s*(?<title>.+?)\s*$/,
    );
    if (mTree && mTree.groups) {
      const indent = mTree.groups.indent ?? "";
      const depth = measureDepth(indent, spacePerLevel);
      pushAtDepth(mTree.groups.title, depth, i + 1);
      continue;
    }

    // 3) Optional: reine Bullets als Baum (z. B. in deinen Listen)
    if (allowBullets) {
      const mBullet = line.match(/^(\s*)[-*+]\s+(.+?)\s*$/);
      if (mBullet) {
        const spaces = (mBullet[1] || "").replace(/\t/g, "    ").length;
        const depth = Math.floor(spaces / spacePerLevel);
        pushAtDepth(mBullet[2], depth, i + 1);
        continue;
      }
    }

    // 4) Optional: „plain“ Überschrift als Root (z. B. „🚛 Logistik“)
    if (allowPlainHeadings && stack.length > 0) {
      // Nur am Zeilenanfang, ohne Branch-/Bullet-Präfixe
      const looksPlain =
        /^[^\s#*+-].+/.test(line) &&
        !/^(?:[│|] ?|[ \t]{1,4})*(?:├|└)/.test(line);
      if (looksPlain && nextLineLooksLikeChild(i)) {
        stack = [];
        pushAtDepth(line.trim(), 0, i + 1);
        continue;
      }
    }

    // Alles andere ignorieren (freie Textzeilen)
  }

  return roots;
}
