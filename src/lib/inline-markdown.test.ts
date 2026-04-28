import { isValidElement, type ReactElement } from "react";
import { describe, expect, it } from "vitest";

import { renderInlineMarkdown } from "./inline-markdown";

type ElementProps = { children?: unknown; href?: string; target?: string; rel?: string };

function asElement(node: unknown): ReactElement<ElementProps> | null {
  return isValidElement(node) ? (node as ReactElement<ElementProps>) : null;
}

function getChildren(node: unknown): string {
  const el = asElement(node);
  if (el && typeof el.props.children === "string") return el.props.children;
  return "";
}

describe("renderInlineMarkdown", () => {
  it("returns plain text wrapped in a single Fragment node when no markdown is present", () => {
    const out = renderInlineMarkdown("hello world");
    expect(out).toHaveLength(1);
    const el = asElement(out[0]);
    expect(el).not.toBeNull();
    expect(el?.props.children).toBe("hello world");
  });

  it("renders **bold** as a <strong>", () => {
    const out = renderInlineMarkdown("a **bold** b");
    expect(out.length).toBeGreaterThan(1);
    const strong = out.map(asElement).find((el) => el?.type === "strong");
    expect(strong).toBeTruthy();
    expect(getChildren(strong)).toBe("bold");
  });

  it("renders *italic* as an <em>", () => {
    const out = renderInlineMarkdown("a *italic* b");
    const em = out.map(asElement).find((el) => el?.type === "em");
    expect(em).toBeTruthy();
    expect(getChildren(em)).toBe("italic");
  });

  it("renders [text](https://...) as an external <a>", () => {
    const out = renderInlineMarkdown("see [Anthropic](https://www.anthropic.com/research/81k-economics)");
    const link = out.map(asElement).find((el) => el?.type === "a");
    expect(link).toBeTruthy();
    expect(link?.props.href).toBe("https://www.anthropic.com/research/81k-economics");
    expect(link?.props.target).toBe("_blank");
    expect(link?.props.rel).toBe("noopener noreferrer");
    expect(getChildren(link)).toBe("Anthropic");
  });

  it("renders relative links without target=_blank", () => {
    const out = renderInlineMarkdown("see [the index](/columns/good-paper)");
    const link = out.map(asElement).find((el) => el?.type === "a");
    expect(link?.props.href).toBe("/columns/good-paper");
    expect(link?.props.target).toBeUndefined();
  });

  it("renders inline `code` as a <code>", () => {
    const out = renderInlineMarkdown("set the `column_slug` to good-paper");
    const code = out.map(asElement).find((el) => el?.type === "code");
    expect(code).toBeTruthy();
    expect(getChildren(code)).toBe("column_slug");
  });

  it("does NOT auto-link bare URLs (must be wrapped in [](...))", () => {
    const out = renderInlineMarkdown("https://example.com is plain text");
    const link = out.map(asElement).find((el) => el?.type === "a");
    expect(link).toBeFalsy();
  });

  it("preserves text around markdown markers in order", () => {
    const out = renderInlineMarkdown("before **mid** after");
    const elTypes = out.map((node) => asElement(node)?.type);
    expect(elTypes[1]).toBe("strong");
  });
});
