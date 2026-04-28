import { Fragment, type ReactNode, createElement } from "react";

/**
 * Parse a small, safe subset of inline Markdown into React nodes.
 *
 * Supported:
 *   - `**text**` -> <strong>text</strong>
 *   - `*text*`   -> <em>text</em>
 *   - `[text](url)` -> <a href="url" rel="noopener noreferrer" target=_blank if external>
 *   - `` `code` `` -> <code>code</code>
 *
 * Deliberately NOT supported:
 *   - Block-level constructs (paragraphs, headings, lists, images)
 *     — those are stored as their own block types and rendered upstream.
 *   - Raw HTML — never injected; the input string is treated as text first,
 *     then matched against the four inline patterns above.
 *   - Auto-linking of bare URLs — must be wrapped in `[](...)` to link.
 *
 * The output is an array of strings and React elements suitable for
 * direct use as children of any inline-flow element.
 */

type Token =
  | { kind: "text"; value: string }
  | { kind: "bold"; value: string }
  | { kind: "italic"; value: string }
  | { kind: "code"; value: string }
  | { kind: "link"; text: string; href: string };

const PATTERN_RE = new RegExp(
  [
    "(\\*\\*([^*\\n]+)\\*\\*)", // **bold**
    "(\\*([^*\\n]+)\\*)", // *italic*
    "(`([^`\\n]+)`)", // `code`
    "(\\[([^\\]]+)\\]\\(([^)\\s]+)\\))", // [text](href)
  ].join("|"),
  "g",
);

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let cursor = 0;

  for (const match of input.matchAll(PATTERN_RE)) {
    const matchIndex = match.index ?? 0;
    if (matchIndex > cursor) {
      tokens.push({ kind: "text", value: input.slice(cursor, matchIndex) });
    }

    if (match[1] !== undefined) {
      tokens.push({ kind: "bold", value: match[2] ?? "" });
    } else if (match[3] !== undefined) {
      tokens.push({ kind: "italic", value: match[4] ?? "" });
    } else if (match[5] !== undefined) {
      tokens.push({ kind: "code", value: match[6] ?? "" });
    } else if (match[7] !== undefined) {
      tokens.push({ kind: "link", text: match[8] ?? "", href: match[9] ?? "" });
    }

    cursor = matchIndex + match[0].length;
  }

  if (cursor < input.length) {
    tokens.push({ kind: "text", value: input.slice(cursor) });
  }

  return tokens;
}

function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

/**
 * Render an inline-Markdown string into React children.
 *
 * Each call site provides a stable `keyPrefix` so the React keys remain
 * unique across siblings (e.g. inside `<li>` children of the same list).
 */
export function renderInlineMarkdown(input: string, keyPrefix = "inline"): ReactNode[] {
  const tokens = tokenize(input);

  return tokens.map((token, index) => {
    const key = `${keyPrefix}-${index}`;

    if (token.kind === "text") {
      // Strings can be returned directly so React concatenates them with
      // siblings; no wrapper needed.
      return createElement(Fragment, { key }, token.value);
    }

    if (token.kind === "bold") {
      return createElement("strong", { key }, token.value);
    }

    if (token.kind === "italic") {
      return createElement("em", { key }, token.value);
    }

    if (token.kind === "code") {
      return createElement("code", { key }, token.value);
    }

    // link
    const external = isExternalHref(token.href);
    const linkProps: Record<string, string> = {
      href: token.href,
    };
    if (external) {
      linkProps.target = "_blank";
      linkProps.rel = "noopener noreferrer";
    }
    return createElement("a", { key, ...linkProps }, token.text);
  });
}
