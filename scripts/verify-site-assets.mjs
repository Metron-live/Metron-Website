#!/usr/bin/env node

import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

const expectedPngs = new Map([
  ["images/m-cropped.png", [439, 350, "b7853008506468321aea7fd47020c9b0896b99ec02747c23313f5ad59e89145f"]],
  ["favicon-16x16.png", [16, 16, "ba4defcf3d946d53af818635fbc59c530a405af48e581de98ef20ada1171ec43"]],
  ["favicon-32x32.png", [32, 32, "cf12dec051f96c15a7bc0034b599db141c1d104e8480dbb94f60bb950ca17134"]],
  ["favicon-48x48.png", [48, 48, "c62b5e864bb6d691318cdd7ce0f4dedd9f2a4fe049da716de1537dc16804d276"]],
  ["apple-touch-icon.png", [180, 180, "2834e6e067b93f1f29c5303b2546c702e6f43d22da3c25e6823accf7aec889fc"]],
  ["favicon-192x192.png", [192, 192, "73da90fd6571ee3d43f2ecea6da84cf22aff75990be9c09e5a4d9d902c6534c1"]],
  ["favicon-512x512.png", [512, 512, "9f474ab603ab529cd3bc7e351efd02dafddf752ed4da6346dece1aed624cba5e"]],
]);

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

function fail(message) {
  failures.push(message);
}

function pngDimensions(buffer, label) {
  const signature = "89504e470d0a1a0a";
  if (buffer.length < 24 || buffer.subarray(0, 8).toString("hex") !== signature) {
    fail(`${label}: not a valid PNG header`);
    return null;
  }
  if (buffer.subarray(12, 16).toString("ascii") !== "IHDR") {
    fail(`${label}: missing PNG IHDR chunk`);
    return null;
  }
  return [buffer.readUInt32BE(16), buffer.readUInt32BE(20)];
}

for (const [path, [expectedWidth, expectedHeight, expectedHash]] of expectedPngs) {
  const fullPath = join(root, path);
  if (!existsSync(fullPath)) {
    fail(`${path}: missing`);
    continue;
  }
  const buffer = readFileSync(fullPath);
  const dimensions = pngDimensions(buffer, path);
  if (dimensions && (dimensions[0] !== expectedWidth || dimensions[1] !== expectedHeight)) {
    fail(`${path}: expected ${expectedWidth}x${expectedHeight}, found ${dimensions[0]}x${dimensions[1]}`);
  }
  const actualHash = sha256(buffer);
  if (actualHash !== expectedHash) {
    fail(`${path}: does not match the reviewed canonical export (${actualHash})`);
  }
}

const icoPath = join(root, "favicon.ico");
if (!existsSync(icoPath)) {
  fail("favicon.ico: missing");
} else {
  const ico = readFileSync(icoPath);
  if (ico.length < 6 || ico.readUInt16LE(0) !== 0 || ico.readUInt16LE(2) !== 1) {
    fail("favicon.ico: invalid ICO header");
  } else {
    const count = ico.readUInt16LE(4);
    const sizes = [];
    for (let index = 0; index < count; index += 1) {
      const offset = 6 + index * 16;
      if (offset + 16 > ico.length) {
        fail("favicon.ico: truncated directory");
        break;
      }
      const width = ico[offset] || 256;
      const height = ico[offset + 1] || 256;
      const byteLength = ico.readUInt32LE(offset + 8);
      const imageOffset = ico.readUInt32LE(offset + 12);
      if (imageOffset + byteLength > ico.length) {
        fail(`favicon.ico: ${width}x${height} frame exceeds the file bounds`);
      }
      sizes.push(`${width}x${height}`);
    }
    const actual = sizes.sort().join(",");
    const expected = ["16x16", "32x32", "48x48"].sort().join(",");
    if (actual !== expected) {
      fail(`favicon.ico: expected 16x16, 32x32, and 48x48 frames; found ${actual || "none"}`);
    }
  }
  const actualHash = sha256(ico);
  const expectedHash = "e5fe376406ce42b9ce70c17480ec6ad10d830acd5e9f9ef8414f2636dfa7cc28";
  if (actualHash !== expectedHash) {
    fail(`favicon.ico: does not match the reviewed canonical export (${actualHash})`);
  }
}

function walk(directory) {
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === ".git" || entry.name === ".graveyard") continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walk(path));
    else files.push(path);
  }
  return files;
}

function localTarget(sourceFile, rawReference) {
  const reference = rawReference.trim().replace(/^['"]|['"]$/g, "");
  if (
    !reference ||
    reference.startsWith("#") ||
    reference.startsWith("//") ||
    /^(?:[a-z][a-z\d+.-]*:|\$|\{)/i.test(reference)
  ) return null;

  let decoded;
  try {
    decoded = decodeURIComponent(reference.split(/[?#]/, 1)[0]);
  } catch {
    fail(`${relative(root, sourceFile)}: malformed URL ${reference}`);
    return null;
  }
  if (!decoded) return null;
  return decoded.startsWith("/")
    ? join(root, decoded.slice(1))
    : resolve(dirname(sourceFile), decoded);
}

function resolvesLocally(target) {
  const candidates = [target];
  if (!extname(target)) candidates.push(`${target}.html`);
  candidates.push(join(target, "index.html"));
  return candidates.some((candidate) => existsSync(candidate) && statSync(candidate).isFile());
}

const htmlFiles = walk(root).filter((path) => path.endsWith(".html"));
const attributePattern = /\b(?:href|src|poster)\s*=\s*["']([^"']+)["']/gi;
const cssUrlPattern = /url\(\s*(["']?[^)'"\s]+["']?)\s*\)/gi;

for (const htmlFile of htmlFiles) {
  const source = readFileSync(htmlFile, "utf8");
  const page = relative(root, htmlFile);
  if (/(?:^|["'(=\s])\/?brand\//i.test(source)) {
    fail(`${page}: references retired brand/ assets`);
  }

  for (const pattern of [attributePattern, cssUrlPattern]) {
    pattern.lastIndex = 0;
    for (let match = pattern.exec(source); match; match = pattern.exec(source)) {
      const target = localTarget(htmlFile, match[1]);
      if (target && !resolvesLocally(target)) {
        fail(`${page}: broken local reference ${match[1]}`);
      }
    }
  }
}

if (failures.length) {
  console.error(`Site asset verification failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Verified ${expectedPngs.size} canonical PNGs and a 3-frame ICO.`);
console.log(`Checked ${htmlFiles.length} HTML files: local links resolve and none reference retired brand/ assets.`);
