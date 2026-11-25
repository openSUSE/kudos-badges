#!/usr/bin/env node
// Copyright © 2025–present Lubos Kocman and openSUSE contributors
// SPDX-License-Identifier: Apache-2.0
//
// Checks that the badge definitions are complete and consistent, so a merged badge
// shows up in Kudos exactly as intended:
//
//   - every badge image (top-level *.png) has metadata in meta/<slug>.json
//   - every meta file is valid and points at an existing image and previews
//   - every badge has an English title and description in locales/en.json
//   - translations only carry title/description for badges that exist
//   - with --base <ref>: no badge that exists in <ref> has been removed, since
//     badges are never revoked (Kudos retires a badge whose meta file is gone)
//
// Usage: node scripts/check-badges.mjs [--base <git-ref>]
//        (run from anywhere; no dependencies besides git for --base)

import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PREVIEW_SIZES = [200, 800];
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const META_KEYS = new Set(["image", "link", "retired"]);
const STRING_KEYS = new Set(["title", "description"]);

function usage(message) {
  console.error(`${message}\nUsage: node scripts/check-badges.mjs [--base <git-ref>]`);
  process.exit(2);
}

let baseRef;
const args = process.argv.slice(2);
while (args.length) {
  const arg = args.shift();
  if (arg === "--base" || arg.startsWith("--base=")) {
    baseRef = arg === "--base" ? args.shift() : arg.slice("--base=".length);
    if (!baseRef) usage("--base needs a git ref, e.g. --base origin/main");
  } else {
    usage(`unknown argument "${arg}"`);
  }
}

const errors = [];
function error(file, message) {
  errors.push({ file, message });
}

function readJson(rel) {
  try {
    return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
  } catch (err) {
    error(rel, `invalid JSON: ${err.message}`);
    return undefined;
  }
}

const isObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));

// ── meta/<slug>.json ────────────────────────────────────────────────────────
const metaFiles = fs.readdirSync(path.join(ROOT, "meta")).filter((f) => f.endsWith(".json"));
const slugs = new Set();
const referencedImages = new Set();

for (const file of metaFiles) {
  const rel = `meta/${file}`;
  const slug = file.replace(/\.json$/, "");
  if (!SLUG_RE.test(slug)) {
    error(rel, `slug "${slug}" must be lowercase letters, digits and single hyphens`);
    continue;
  }
  slugs.add(slug);

  const meta = readJson(rel);
  if (meta === undefined) continue;
  if (!isObject(meta)) {
    error(rel, "must be a JSON object");
    continue;
  }

  for (const key of Object.keys(meta)) {
    if (!META_KEYS.has(key)) error(rel, `unknown key "${key}" (allowed: ${[...META_KEYS].join(", ")})`);
  }

  if (typeof meta.image !== "string" || !/^[^/\\]+\.png$/.test(meta.image)) {
    error(rel, `"image" must be the file name of a top-level .png, e.g. "${slug}.png"`);
  } else {
    referencedImages.add(meta.image);
    if (!exists(meta.image)) error(rel, `image "${meta.image}" does not exist`);
    for (const size of PREVIEW_SIZES) {
      if (!exists(`previews/${size}/${meta.image}`)) {
        error(rel, `missing previews/${size}/${meta.image} (run ./generate-previews.sh)`);
      }
    }
  }

  if ("link" in meta && (typeof meta.link !== "string" || !/^https?:\/\/\S+$/.test(meta.link))) {
    error(rel, `"link" must be an http(s) URL`);
  }
  if ("retired" in meta && typeof meta.retired !== "boolean") {
    error(rel, `"retired" must be true or false`);
  }
}

// ── badges are never removed ────────────────────────────────────────────────
// Compare against the meta files in baseRef (e.g. the PR's target branch).
// The slug is a badge's permanent ID and Kudos retires every badge whose meta
// file is gone: deleting one hides it from the badge list, and renaming one
// leaves its holders on the retired old slug while the new one has nobody.
if (baseRef !== undefined) {
  let baseFiles;
  try {
    baseFiles = execFileSync("git", ["ls-tree", "--name-only", baseRef, "--", "meta/"], {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (err) {
    const reason = err.stderr?.toString().trim() || err.message;
    console.error(`cannot list meta/ in "${baseRef}": ${reason}`);
    process.exit(2);
  }
  for (const rel of baseFiles.split("\n").filter((f) => f.endsWith(".json"))) {
    const slug = path.posix.basename(rel, ".json");
    if (!exists(rel)) {
      error(rel, `badge "${slug}" exists in ${baseRef} but its meta file is gone; badges are never removed or renamed, keep the file and set "retired": true to hide it`);
    }
  }
}

// ── every badge image needs metadata ────────────────────────────────────────
for (const file of fs.readdirSync(ROOT).filter((f) => f.endsWith(".png"))) {
  if (!referencedImages.has(file)) {
    error(file, `no meta/*.json refers to this image; add meta/${file.replace(/\.png$/, "")}.json`);
  }
}

// ── locales/<lang>.json ─────────────────────────────────────────────────────
function checkStrings(rel, strings, { requireAll }) {
  if (!isObject(strings)) {
    error(rel, "must be a JSON object keyed by badge slug");
    return;
  }
  for (const [slug, entry] of Object.entries(strings)) {
    if (!slugs.has(slug)) {
      error(rel, `"${slug}" has no meta/${slug}.json`);
      continue;
    }
    if (!isObject(entry)) {
      error(rel, `"${slug}" must be an object with title and description`);
      continue;
    }
    for (const [key, value] of Object.entries(entry)) {
      if (!STRING_KEYS.has(key)) error(rel, `"${slug}" has unknown key "${key}"`);
      else if (typeof value !== "string" || !value.trim()) error(rel, `"${slug}.${key}" must be a non-empty string`);
    }
  }
  if (requireAll) {
    for (const slug of slugs) {
      for (const key of STRING_KEYS) {
        if (typeof strings[slug]?.[key] !== "string") error(rel, `missing "${slug}.${key}"`);
      }
    }
  }
}

if (!exists("locales/en.json")) {
  error("locales/en.json", "missing; it holds the English title and description of every badge");
}
for (const file of fs.readdirSync(path.join(ROOT, "locales")).filter((f) => f.endsWith(".json"))) {
  const rel = `locales/${file}`;
  const strings = readJson(rel);
  if (strings !== undefined) checkStrings(rel, strings, { requireAll: file === "en.json" });
}

// ── report ──────────────────────────────────────────────────────────────────
const inActions = process.env.GITHUB_ACTIONS === "true";
for (const { file, message } of errors) {
  console.error(inActions ? `::error file=${file}::${message}` : `${file}: ${message}`);
}
if (errors.length) {
  console.error(`\n✗ ${errors.length} problem(s) found.`);
  process.exit(1);
}
console.log(`✓ ${slugs.size} badges, all with metadata, previews and English strings.`);
