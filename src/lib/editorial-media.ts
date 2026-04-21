import { existsSync, readdirSync } from "node:fs";
import path from "node:path";

function collectSvgAssets(directory: string, rootDirectory = directory, accumulator = new Map<string, string>()) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) {
      continue;
    }

    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      collectSvgAssets(fullPath, rootDirectory, accumulator);
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".svg")) {
      const relativePath = path.relative(rootDirectory, fullPath).split(path.sep).join("/");
      accumulator.set(entry.name, `/editorial/${relativePath}`);
    }
  }

  return accumulator;
}

const editorialSvgDirectory = path.join(process.cwd(), "public", "editorial");
const editorialSvgAssets = existsSync(editorialSvgDirectory) ? collectSvgAssets(editorialSvgDirectory) : new Map<string, string>();

export function resolvePreferredEditorialAsset(src: string) {
  if (!src.endsWith(".png")) {
    return src;
  }

  if (src.startsWith("/editorial/")) {
    const svgSrc = src.replace(/\.png$/u, ".svg");
    const svgPath = path.join(process.cwd(), "public", svgSrc);

    return existsSync(svgPath) ? svgSrc : src;
  }

  const svgFileName = path.basename(src).replace(/\.png$/u, ".svg");
  return editorialSvgAssets.get(svgFileName) ?? src;
}
