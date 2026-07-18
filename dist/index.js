import { createRequire } from 'module';
import { createContext, createElement, h, toChildArray } from 'preact';
import { useContext } from 'preact/hooks';
import { jsx, Fragment, jsxs } from 'preact/jsx-runtime';

createRequire(import.meta.url);

// node_modules/@quartz-community/utils/dist/path.js
function simplifySlug(fp) {
  const res = stripSlashes(trimSuffix(fp, "index"), true);
  return res.length === 0 ? "/" : res;
}
function joinSegments(...args) {
  if (args.length === 0) {
    return "";
  }
  let joined = args.filter((segment) => segment !== "" && segment !== "/").map((segment) => stripSlashes(segment)).join("/");
  const first = args[0];
  const last = args[args.length - 1];
  if (first?.startsWith("/")) {
    joined = "/" + joined;
  }
  if (last?.endsWith("/")) {
    joined = joined + "/";
  }
  return joined;
}
function endsWith(s, suffix) {
  return s === suffix || s.endsWith("/" + suffix);
}
function trimSuffix(s, suffix) {
  if (endsWith(s, suffix)) {
    s = s.slice(0, -suffix.length);
  }
  return s;
}
function stripSlashes(s, onlyStripPrefix) {
  if (s.startsWith("/")) {
    s = s.substring(1);
  }
  if (!onlyStripPrefix && s.endsWith("/")) {
    s = s.slice(0, -1);
  }
  return s;
}
function pathToRoot(slug2) {
  let rootPath = slug2.split("/").filter((x) => x !== "").slice(0, -1).map((_) => "..").join("/");
  if (rootPath.length === 0) {
    rootPath = ".";
  }
  return rootPath;
}
function resolveRelative(current, target) {
  const res = joinSegments(pathToRoot(current), simplifySlug(target));
  return res;
}

// src/options.ts
var registryIdentifierPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
var hexAccentPattern = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
var customPropertyAccentPattern = /^var\(--[A-Za-z_][A-Za-z0-9_-]*\)$/;
function isObjectRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function ownDataValue(value, key) {
  if (!isObjectRecord(value)) return void 0;
  try {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    return descriptor && "value" in descriptor ? descriptor.value : void 0;
  } catch {
    return void 0;
  }
}
function ownDataEntries(value) {
  if (!isObjectRecord(value)) return [];
  try {
    const entries = [];
    for (const key of Object.keys(value)) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (descriptor && "value" in descriptor) entries.push([key, descriptor.value]);
    }
    return entries;
  } catch {
    return [];
  }
}
function isRegistryIdentifier(value) {
  return registryIdentifierPattern.test(value);
}
function normalizeRegistryIdentifier(value) {
  if (typeof value !== "string") return void 0;
  const normalized = value.trim();
  return isRegistryIdentifier(normalized) ? normalized : void 0;
}
function isDirectAccent(value) {
  return hexAccentPattern.test(value) || customPropertyAccentPattern.test(value);
}
function normalizeDirectAccent(value) {
  if (typeof value !== "string") return void 0;
  const normalized = value.trim();
  return isDirectAccent(normalized) ? normalized : void 0;
}
function normalizeIconRegistry(value) {
  const icons = /* @__PURE__ */ Object.create(null);
  for (const [rawName, component] of ownDataEntries(value)) {
    const name = normalizeRegistryIdentifier(rawName);
    if (!name || typeof component !== "function" || Object.hasOwn(icons, name)) continue;
    icons[name] = component;
  }
  return icons;
}
function normalizeAccentRegistry(value) {
  const accents = /* @__PURE__ */ Object.create(null);
  for (const [rawName, rawAccent] of ownDataEntries(value)) {
    const name = normalizeRegistryIdentifier(rawName);
    const accent = normalizeDirectAccent(rawAccent);
    if (!name || name === "theme" || !accent || Object.hasOwn(accents, name)) continue;
    accents[name] = accent;
  }
  return accents;
}
function normalizeDefaultAccent(value, accents) {
  if (typeof value !== "string") return "theme";
  const normalized = value.trim();
  if (normalized === "theme") return normalized;
  const name = normalizeRegistryIdentifier(normalized);
  if (name && Object.hasOwn(accents, name)) return name;
  return normalizeDirectAccent(normalized) ?? "theme";
}
function normalizeExcludeDirs(value) {
  if (!Array.isArray(value)) return [];
  const directories = [];
  const seen = /* @__PURE__ */ new Set();
  for (const item of value) {
    if (typeof item !== "string") continue;
    const directory = item.trim();
    if (directory.length === 0 || seen.has(directory)) continue;
    seen.add(directory);
    directories.push(directory);
  }
  return directories;
}
function normalizeRootIndexPanelsOptions(options = void 0) {
  const layout = ownDataValue(options, "layout");
  const sort = ownDataValue(options, "sort");
  const tagCount = ownDataValue(options, "tagCount");
  const descriptionFallback = ownDataValue(options, "descriptionFallback");
  const showDescription = ownDataValue(options, "showDescription");
  const showDocCount = ownDataValue(options, "showDocCount");
  const showTags = ownDataValue(options, "showTags");
  const defaultIcon = normalizeRegistryIdentifier(ownDataValue(options, "defaultIcon")) ?? "";
  const icons = normalizeIconRegistry(ownDataValue(options, "icons"));
  const accents = normalizeAccentRegistry(ownDataValue(options, "accents"));
  return {
    layout: layout === "list" || layout === "cards" ? layout : "cards",
    showDescription: typeof showDescription === "boolean" ? showDescription : true,
    showDocCount: typeof showDocCount === "boolean" ? showDocCount : true,
    showTags: typeof showTags === "boolean" ? showTags : true,
    tagCount: typeof tagCount === "number" && Number.isFinite(tagCount) ? Math.max(0, Math.floor(tagCount)) : 3,
    sort: sort === "alphabetical" || sort === "docCount" || sort === "date" ? sort : "alphabetical",
    excludeDirs: normalizeExcludeDirs(ownDataValue(options, "excludeDirs")),
    descriptionFallback: typeof descriptionFallback === "string" ? descriptionFallback : "",
    defaultIcon,
    icons,
    defaultAccent: normalizeDefaultAccent(ownDataValue(options, "defaultAccent"), accents),
    accents
  };
}

// src/appearance.ts
var themeAccent = Object.freeze({ kind: "theme" });
function ownDataValue2(value, key) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return void 0;
  try {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    return descriptor && "value" in descriptor ? descriptor.value : void 0;
  } catch {
    return void 0;
  }
}
function resolveNamedAccent(value, accents) {
  const name = normalizeRegistryIdentifier(value);
  if (!name || name === "theme") return void 0;
  const accent = normalizeDirectAccent(ownDataValue2(accents, name));
  return accent ? { kind: "named", name, value: accent } : void 0;
}
function resolveDefaultAccent(value, accents) {
  const name = normalizeRegistryIdentifier(value);
  if (name === "theme") return themeAccent;
  const named = resolveNamedAccent(name, accents);
  if (named) return named;
  const direct = normalizeDirectAccent(value);
  return direct ? { kind: "direct", value: direct } : themeAccent;
}
function resolvePanelAccent(panelAccent, options) {
  const accents = ownDataValue2(options, "accents");
  const name = normalizeRegistryIdentifier(panelAccent);
  if (name === "theme") return themeAccent;
  const named = resolveNamedAccent(name, accents);
  if (named) return named;
  const direct = normalizeDirectAccent(panelAccent);
  if (direct) return { kind: "direct", value: direct };
  return resolveDefaultAccent(ownDataValue2(options, "defaultAccent"), accents);
}

// src/books.ts
function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function ownValue(record, key) {
  try {
    const descriptor = Object.getOwnPropertyDescriptor(record, key);
    return descriptor && "value" in descriptor ? descriptor.value : void 0;
  } catch {
    return void 0;
  }
}
function isPhysical(file) {
  const filePath = ownValue(file, "filePath");
  return typeof filePath === "string" && filePath.length > 0;
}
function toTimestamp(value) {
  if (value instanceof Date) {
    const timestamp = value.getTime();
    return Number.isFinite(timestamp) ? timestamp : void 0;
  }
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? void 0 : parsed;
  }
  return void 0;
}
function getFileTimestamp(file) {
  const rawFrontmatter = ownValue(file, "frontmatter");
  const rawDates = ownValue(file, "dates");
  const frontmatter = isRecord(rawFrontmatter) ? rawFrontmatter : {};
  const dates = isRecord(rawDates) ? rawDates : {};
  const candidates = [
    ownValue(dates, "modified"),
    ownValue(dates, "created"),
    ownValue(dates, "published"),
    ownValue(file, "modified"),
    ownValue(file, "updated"),
    ownValue(file, "created"),
    ownValue(file, "date"),
    ownValue(frontmatter, "modified"),
    ownValue(frontmatter, "updated"),
    ownValue(frontmatter, "created"),
    ownValue(frontmatter, "published"),
    ownValue(frontmatter, "date")
  ];
  for (const candidate of candidates) {
    const timestamp = toTimestamp(candidate);
    if (timestamp !== void 0) return timestamp;
  }
  return Number.NEGATIVE_INFINITY;
}
function humanizeSegment(segment) {
  const text = segment.replace(/-/g, " ");
  return text.length === 0 ? text : text.charAt(0).toUpperCase() + text.slice(1);
}
function compareTitle(a, b) {
  return a.title.localeCompare(b.title) || a.segment.localeCompare(b.segment);
}
function collectBooks(allFiles, options) {
  const excluded = new Set(options.excludeDirs);
  const destinations = /* @__PURE__ */ new Set();
  const physicalSlugs = /* @__PURE__ */ new Set();
  const books = /* @__PURE__ */ new Map();
  for (const file of allFiles) {
    const rawSlug = ownValue(file, "slug");
    const slug2 = typeof rawSlug === "string" ? rawSlug : "";
    if (slug2.length === 0) continue;
    const parts = slug2.split("/").filter(Boolean);
    if (parts.length < 2) continue;
    const segment = parts[0];
    if (!segment || segment === "tags" || excluded.has(segment)) continue;
    const physical = isPhysical(file);
    const listed = ownValue(file, "unlisted") !== true;
    const isBookIndex = parts.length === 2 && parts[1] === "index";
    if (isBookIndex && listed) {
      destinations.add(segment);
    }
    if (!physical || !listed || physicalSlugs.has(slug2)) continue;
    physicalSlugs.add(slug2);
    let book = books.get(segment);
    if (!book) {
      book = { segment, docCount: 0, date: Number.NEGATIVE_INFINITY };
      books.set(segment, book);
    }
    if (slug2 !== `${segment}/index`) book.docCount += 1;
    book.date = Math.max(book.date, getFileTimestamp(file));
    if (isBookIndex && !book.metadata) book.metadata = file;
  }
  const entries = [];
  for (const book of books.values()) {
    if (!destinations.has(book.segment)) continue;
    const rawFrontmatter = book.metadata ? ownValue(book.metadata, "frontmatter") : void 0;
    const frontmatter = isRecord(rawFrontmatter) ? rawFrontmatter : {};
    const rawTitle = ownValue(frontmatter, "title");
    const rawDescription = ownValue(frontmatter, "description");
    const rawTags = ownValue(frontmatter, "tags");
    entries.push({
      segment: book.segment,
      title: typeof rawTitle === "string" ? rawTitle : humanizeSegment(book.segment),
      description: typeof rawDescription === "string" ? rawDescription : options.descriptionFallback,
      docCount: book.docCount,
      tags: Array.isArray(rawTags) ? rawTags.filter((tag) => typeof tag === "string").slice(0, options.tagCount) : [],
      date: book.date,
      panel: ownValue(frontmatter, "panel")
    });
  }
  if (options.sort === "docCount") {
    entries.sort((a, b) => b.docCount - a.docCount || compareTitle(a, b));
  } else if (options.sort === "date") {
    entries.sort((a, b) => b.date - a.date || compareTitle(a, b));
  } else {
    entries.sort(compareTitle);
  }
  return entries;
}

// src/i18n/locales/en-US.ts
var enUS = {
  noteCount: (count) => `${count} ${count === 1 ? "note" : "notes"}`,
  emptyState: "No subdirectories found."
};

// src/i18n/locales/fi-FI.ts
var fiFI = {
  noteCount: (count) => `${count} ${count === 1 ? "muistiinpano" : "muistiinpanoa"}`,
  emptyState: "Alikansioita ei l\xF6ytynyt."
};

// src/i18n/index.ts
var catalogs = {
  "en-US": enUS,
  "fi-FI": fiFI
};
function i18n(locale) {
  return typeof locale === "string" && Object.hasOwn(catalogs, locale) ? catalogs[locale] : enUS;
}

// node_modules/lucide-preact/dist/esm/shared/src/utils/mergeClasses.mjs
var mergeClasses = (...classes) => classes.filter((className, index, array) => {
  return Boolean(className) && className.trim() !== "" && array.indexOf(className) === index;
}).join(" ").trim();

// node_modules/lucide-preact/dist/esm/shared/src/utils/toKebabCase.mjs
var toKebabCase = (string) => string.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

// node_modules/lucide-preact/dist/esm/shared/src/utils/toCamelCase.mjs
var toCamelCase = (string) => string.replace(
  /^([A-Z])|[\s-_]+(\w)/g,
  (match, p1, p2) => p2 ? p2.toUpperCase() : p1.toLowerCase()
);

// node_modules/lucide-preact/dist/esm/shared/src/utils/toPascalCase.mjs
var toPascalCase = (string) => {
  const camelCase = toCamelCase(string);
  return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
};

// node_modules/lucide-preact/dist/esm/defaultAttributes.mjs
var defaultAttributes = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": "2",
  "stroke-linecap": "round",
  "stroke-linejoin": "round"
};
var LucideContext = createContext({
  size: 24,
  color: "currentColor",
  strokeWidth: 2,
  absoluteStrokeWidth: false,
  class: ""
});
var useLucideContext = () => useContext(LucideContext);

// node_modules/lucide-preact/dist/esm/shared/src/utils/hasA11yProp.mjs
var hasA11yProp = (props) => {
  for (const prop in props) {
    if (prop.startsWith("aria-") || prop === "role" || prop === "title") {
      return true;
    }
  }
  return false;
};

// node_modules/lucide-preact/dist/esm/Icon.mjs
var Icon = ({
  color,
  size,
  strokeWidth,
  absoluteStrokeWidth,
  children,
  iconNode,
  class: classes = "",
  ...rest
}) => {
  const {
    size: contextSize = 24,
    strokeWidth: contextStrokeWidth = 2,
    absoluteStrokeWidth: contextAbsoluteStrokeWidth = false,
    color: contextColor = "currentColor",
    class: contextClass = ""
  } = useLucideContext() ?? {};
  const calculatedStrokeWidth = absoluteStrokeWidth ?? contextAbsoluteStrokeWidth ? Number(strokeWidth ?? contextStrokeWidth) * 24 / Number(size ?? contextSize) : strokeWidth ?? contextStrokeWidth;
  return h(
    "svg",
    {
      ...defaultAttributes,
      width: size ?? contextSize ?? 24,
      height: size ?? contextSize ?? 24,
      stroke: color ?? contextColor,
      ["stroke-width"]: calculatedStrokeWidth,
      class: mergeClasses("lucide", contextClass, classes),
      ...!children && !hasA11yProp(rest) && { "aria-hidden": "true" },
      ...rest
    },
    [...iconNode.map(([tag, attrs]) => h(tag, attrs)), ...toChildArray(children)]
  );
};

// node_modules/lucide-preact/dist/esm/createLucideIcon.mjs
var createLucideIcon = (iconName, iconNode) => {
  const Component = ({ class: classes = "", className = "", children, ...props }) => h(
    Icon,
    {
      ...props,
      iconNode,
      class: mergeClasses(
        `lucide-${toKebabCase(toPascalCase(iconName))}`,
        `lucide-${toKebabCase(iconName)}`,
        classes,
        className
      )
    },
    children
  );
  Component.displayName = toPascalCase(iconName);
  return Component;
};

// node_modules/lucide-preact/dist/esm/icons/book-open.mjs
var BookOpen = createLucideIcon("book-open", [
  ["path", { d: "M12 7v14", key: "1akyts" }],
  [
    "path",
    {
      d: "M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z",
      key: "ruj8y"
    }
  ]
]);

// node_modules/lucide-preact/dist/esm/icons/code-xml.mjs
var CodeXml = createLucideIcon("code-xml", [
  ["path", { d: "m18 16 4-4-4-4", key: "1inbqp" }],
  ["path", { d: "m6 8-4 4 4 4", key: "15zrgr" }],
  ["path", { d: "m14.5 4-5 16", key: "e7oirm" }]
]);

// node_modules/lucide-preact/dist/esm/icons/coffee.mjs
var Coffee = createLucideIcon("coffee", [
  ["path", { d: "M10 2v2", key: "7u0qdc" }],
  ["path", { d: "M14 2v2", key: "6buw04" }],
  [
    "path",
    {
      d: "M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1",
      key: "pwadti"
    }
  ],
  ["path", { d: "M6 2v2", key: "colzsn" }]
]);

// node_modules/lucide-preact/dist/esm/icons/container.mjs
var Container = createLucideIcon("container", [
  [
    "path",
    {
      d: "M22 7.7c0-.6-.4-1.2-.8-1.5l-6.3-3.9a1.72 1.72 0 0 0-1.7 0l-10.3 6c-.5.2-.9.8-.9 1.4v6.6c0 .5.4 1.2.8 1.5l6.3 3.9a1.72 1.72 0 0 0 1.7 0l10.3-6c.5-.3.9-1 .9-1.5Z",
      key: "1t2lqe"
    }
  ],
  ["path", { d: "M10 21.9V14L2.1 9.1", key: "o7czzq" }],
  ["path", { d: "m10 14 11.9-6.9", key: "zm5e20" }],
  ["path", { d: "M14 19.8v-8.1", key: "159ecu" }],
  ["path", { d: "M18 17.5V9.4", key: "11uown" }]
]);

// node_modules/lucide-preact/dist/esm/icons/cpu.mjs
var Cpu = createLucideIcon("cpu", [
  ["path", { d: "M12 20v2", key: "1lh1kg" }],
  ["path", { d: "M12 2v2", key: "tus03m" }],
  ["path", { d: "M17 20v2", key: "1rnc9c" }],
  ["path", { d: "M17 2v2", key: "11trls" }],
  ["path", { d: "M2 12h2", key: "1t8f8n" }],
  ["path", { d: "M2 17h2", key: "7oei6x" }],
  ["path", { d: "M2 7h2", key: "asdhe0" }],
  ["path", { d: "M20 12h2", key: "1q8mjw" }],
  ["path", { d: "M20 17h2", key: "1fpfkl" }],
  ["path", { d: "M20 7h2", key: "1o8tra" }],
  ["path", { d: "M7 20v2", key: "4gnj0m" }],
  ["path", { d: "M7 2v2", key: "1i4yhu" }],
  ["rect", { x: "4", y: "4", width: "16", height: "16", rx: "2", key: "1vbyd7" }],
  ["rect", { x: "8", y: "8", width: "8", height: "8", rx: "1", key: "z9xiuo" }]
]);

// node_modules/lucide-preact/dist/esm/icons/database.mjs
var Database = createLucideIcon("database", [
  ["ellipse", { cx: "12", cy: "5", rx: "9", ry: "3", key: "msslwz" }],
  ["path", { d: "M3 5V19A9 3 0 0 0 21 19V5", key: "1wlel7" }],
  ["path", { d: "M3 12A9 3 0 0 0 21 12", key: "mv7ke4" }]
]);

// node_modules/lucide-preact/dist/esm/icons/file-code.mjs
var FileCode = createLucideIcon("file-code", [
  [
    "path",
    {
      d: "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",
      key: "1oefj6"
    }
  ],
  ["path", { d: "M14 2v5a1 1 0 0 0 1 1h5", key: "wfsgrz" }],
  ["path", { d: "M10 12.5 8 15l2 2.5", key: "1tg20x" }],
  ["path", { d: "m14 12.5 2 2.5-2 2.5", key: "yinavb" }]
]);

// node_modules/lucide-preact/dist/esm/icons/git-branch.mjs
var GitBranch = createLucideIcon("git-branch", [
  ["path", { d: "M15 6a9 9 0 0 0-9 9V3", key: "1cii5b" }],
  ["circle", { cx: "18", cy: "6", r: "3", key: "1h7g24" }],
  ["circle", { cx: "6", cy: "18", r: "3", key: "fqmcym" }]
]);

// node_modules/lucide-preact/dist/esm/icons/globe.mjs
var Globe = createLucideIcon("globe", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20", key: "13o1zl" }],
  ["path", { d: "M2 12h20", key: "9i4pu4" }]
]);

// node_modules/lucide-preact/dist/esm/icons/layers.mjs
var Layers = createLucideIcon("layers", [
  [
    "path",
    {
      d: "M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z",
      key: "zw3jo"
    }
  ],
  [
    "path",
    {
      d: "M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12",
      key: "1wduqc"
    }
  ],
  [
    "path",
    {
      d: "M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17",
      key: "kqbvx6"
    }
  ]
]);

// node_modules/lucide-preact/dist/esm/icons/network.mjs
var Network = createLucideIcon("network", [
  ["rect", { x: "16", y: "16", width: "6", height: "6", rx: "1", key: "4q2zg0" }],
  ["rect", { x: "2", y: "16", width: "6", height: "6", rx: "1", key: "8cvhb9" }],
  ["rect", { x: "9", y: "2", width: "6", height: "6", rx: "1", key: "1egb70" }],
  ["path", { d: "M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3", key: "1jsf9p" }],
  ["path", { d: "M12 12V8", key: "2874zd" }]
]);

// node_modules/lucide-preact/dist/esm/icons/shield.mjs
var Shield = createLucideIcon("shield", [
  [
    "path",
    {
      d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
      key: "oel41y"
    }
  ]
]);

// node_modules/lucide-preact/dist/esm/icons/terminal.mjs
var Terminal = createLucideIcon("terminal", [
  ["path", { d: "M12 19h8", key: "baeox8" }],
  ["path", { d: "m4 17 6-6-6-6", key: "1yngyt" }]
]);
function readLucideIconNode(icon) {
  const wrapper = icon({});
  if (!Array.isArray(wrapper.props.iconNode)) {
    throw new TypeError("The pinned lucide-preact icon-node contract changed");
  }
  return wrapper.props.iconNode;
}
function adaptLucideIcon(icon) {
  const iconNode = readLucideIconNode(icon);
  return ({ children, ...props }) => createElement(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      width: 24,
      height: 24,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": 2,
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      ...props
    },
    ...iconNode.map(([tag, attributes]) => createElement(tag, attributes)),
    children
  );
}
var builtInIcons = {
  "book-open": adaptLucideIcon(BookOpen),
  coffee: adaptLucideIcon(Coffee),
  terminal: adaptLucideIcon(Terminal),
  container: adaptLucideIcon(Container),
  layers: adaptLucideIcon(Layers),
  "code-2": adaptLucideIcon(CodeXml),
  network: adaptLucideIcon(Network),
  "git-branch": adaptLucideIcon(GitBranch),
  database: adaptLucideIcon(Database),
  shield: adaptLucideIcon(Shield),
  cpu: adaptLucideIcon(Cpu),
  globe: adaptLucideIcon(Globe),
  "file-code-2": adaptLucideIcon(FileCode)
};
function ownDataValue3(value, key) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return void 0;
  try {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    return descriptor && "value" in descriptor ? descriptor.value : void 0;
  } catch {
    return void 0;
  }
}
function resolveCustomIcon(value, name) {
  const component = ownDataValue3(value, name);
  return typeof component === "function" ? component : void 0;
}
function resolveBuiltInIcon(name) {
  if (!Object.hasOwn(builtInIcons, name)) return void 0;
  return builtInIcons[name];
}
function resolveIconName(value, icons) {
  const name = normalizeRegistryIdentifier(value);
  if (!name) return void 0;
  const component = resolveCustomIcon(icons, name) ?? resolveBuiltInIcon(name);
  return component ? { name, component } : void 0;
}
function resolvePanelIcon(panelIcon, options) {
  const icons = ownDataValue3(options, "icons");
  return resolveIconName(panelIcon, icons) ?? resolveIconName(ownDataValue3(options, "defaultIcon"), icons);
}

// src/components/scripts/panels.inline.ts
var panels_inline_default = 'function f(){let o=document.querySelectorAll(".rip-grid, .rip-list");if(o.length===0)return;let c=[];for(let r of o){let e=Array.from(r.querySelectorAll(".rip-card, .rip-list-item"));if(e.length===0)continue;let l=n=>{if(n.altKey||n.ctrlKey||n.metaKey||n.shiftKey)return;let a=document.activeElement;if(!a)return;let d=a.closest(".rip-card-link, .rip-list-link");if(!d)return;let s=d.closest(".rip-card, .rip-list-item");if(!s)return;let i=e.indexOf(s);if(i===-1)return;let t;switch(n.key){case"ArrowRight":case"ArrowDown":t=e[i+1];break;case"ArrowLeft":case"ArrowUp":t=e[i-1];break;case"Home":t=e[0];break;case"End":t=e[e.length-1];break}t&&(n.preventDefault(),t.querySelector(".rip-card-link, .rip-list-link")?.focus())};r.addEventListener("keydown",l),c.push(()=>r.removeEventListener("keydown",l))}typeof window<"u"&&window.addCleanup&&window.addCleanup(()=>{c.forEach(r=>r())})}document.addEventListener("nav",()=>{f()});\n';

// src/components/styles/panels.scss
var panels_default = ".rip {\n  width: 100%;\n  margin: 1.5rem 0 2.5rem;\n}\n.rip * {\n  box-sizing: border-box;\n}\n\n.rip-sr-only {\n  position: absolute;\n  width: 1px;\n  height: 1px;\n  padding: 0;\n  margin: -1px;\n  overflow: hidden;\n  clip: rect(0, 0, 0, 0);\n  white-space: nowrap;\n  border: 0;\n}\n\n.rip-empty {\n  margin: 0;\n  color: var(--gray);\n  font-size: 0.9rem;\n  font-style: italic;\n}\n\n.rip-desc {\n  flex: 1 1 auto;\n  margin: 0;\n  color: var(--gray);\n  font-size: 0.84rem;\n  line-height: 1.55;\n  overflow-wrap: anywhere;\n}\n\n.rip-panel-heading {\n  display: flex;\n  min-width: 0;\n  align-items: center;\n  gap: 0.65rem;\n}\n\n.rip-panel-icon {\n  display: inline-grid;\n  width: 2.35rem;\n  height: 2.35rem;\n  flex: 0 0 2.35rem;\n  place-items: center;\n  border: 1px solid var(--rip-panel-accent, var(--lightgray));\n  border-radius: 0.65rem;\n  color: var(--rip-panel-accent, var(--secondary));\n  background: var(--highlight);\n  pointer-events: none;\n}\n.rip-panel-icon svg {\n  display: block;\n  pointer-events: none;\n}\n\n.rip-count {\n  display: inline-block;\n  flex-shrink: 0;\n  padding: 0.1em 0.45em;\n  border: 1px solid var(--lightgray);\n  border-radius: 999px;\n  color: var(--gray);\n  font-family: var(--codeFont);\n  font-size: 0.68rem;\n  line-height: 1.6;\n  white-space: nowrap;\n}\n\n.rip-tags {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.3rem;\n  margin-top: auto;\n  padding-top: 0.4rem;\n}\n\n.rip-tag {\n  padding: 0.12em 0.48em;\n  border-radius: 999px;\n  color: var(--rip-panel-accent, var(--secondary));\n  background: var(--highlight);\n  font-family: var(--codeFont);\n  font-size: 0.67rem;\n  overflow-wrap: anywhere;\n}\n\n.rip--cards .rip-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr));\n  gap: 0.85rem;\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n.rip--cards .rip-card {\n  min-width: 0;\n  margin: 0;\n}\n.rip--cards .rip-card-link {\n  display: flex;\n  min-height: 10.5rem;\n  height: 100%;\n  flex-direction: column;\n  gap: 0.65rem;\n  padding: 1.05rem 1.1rem;\n  border: 1px solid var(--lightgray);\n  border-radius: 0.8rem;\n  color: var(--darkgray);\n  background: transparent;\n  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);\n  text-decoration: none;\n  transition: border-color 150ms ease, box-shadow 150ms ease, transform 150ms ease;\n}\n.rip--cards .rip-card-link:focus-visible {\n  outline: 3px solid var(--secondary);\n  outline-offset: 3px;\n}\n.rip--cards .rip-card-top {\n  display: flex;\n  min-width: 0;\n  align-items: flex-start;\n  justify-content: space-between;\n  gap: 0.65rem;\n}\n.rip--cards .rip-card-title {\n  min-width: 0;\n  color: var(--dark);\n  font-family: var(--headerFont);\n  font-size: 1rem;\n  font-weight: 650;\n  line-height: 1.3;\n  overflow-wrap: anywhere;\n  transition: color 150ms ease;\n}\n@media (hover: hover) {\n  .rip--cards .rip-card-link:hover {\n    border-color: var(--rip-panel-accent, var(--secondary));\n    box-shadow: 0 0.45rem 1.5rem rgba(0, 0, 0, 0.09);\n    transform: translateY(-2px);\n  }\n  .rip--cards .rip-card-link:hover .rip-card-title {\n    color: var(--rip-panel-accent, var(--secondary));\n  }\n}\n\n.rip--list .rip-list {\n  margin: 0;\n  padding: 0;\n  border-top: 1px solid var(--lightgray);\n  list-style: none;\n}\n.rip--list .rip-list-item {\n  margin: 0;\n  border-bottom: 1px solid var(--lightgray);\n}\n.rip--list .rip-list-link {\n  display: flex;\n  flex-direction: column;\n  gap: 0.35rem;\n  padding: 0.8rem 0.35rem 0.8rem 0.55rem;\n  border-inline-start: 0.2rem solid transparent;\n  color: var(--darkgray);\n  text-decoration: none;\n  transition: color 120ms ease, border-color 120ms ease, background-color 120ms ease;\n}\n.rip--list .rip-list-link[data-rip-accent] {\n  border-inline-start-color: var(--rip-panel-accent);\n}\n.rip--list .rip-list-link:hover {\n  color: var(--rip-panel-accent, var(--secondary));\n  background: var(--highlight);\n}\n.rip--list .rip-list-link:hover .rip-list-title {\n  color: var(--rip-panel-accent, var(--secondary));\n}\n.rip--list .rip-list-link:focus-visible {\n  outline: 3px solid var(--secondary);\n  outline-offset: 2px;\n}\n.rip--list .rip-list-row {\n  display: flex;\n  min-width: 0;\n  align-items: center;\n  justify-content: space-between;\n  gap: 1rem;\n}\n.rip--list .rip-list-title {\n  min-width: 0;\n  color: var(--dark);\n  font-family: var(--headerFont);\n  font-size: 0.96rem;\n  font-weight: 650;\n  overflow-wrap: anywhere;\n}\n.rip--list .rip-panel-icon {\n  width: 2rem;\n  height: 2rem;\n  flex-basis: 2rem;\n  border-radius: 0.55rem;\n}\n\n@media (max-width: 600px) {\n  .rip--cards .rip-grid {\n    grid-template-columns: 1fr;\n  }\n  .rip--cards .rip-card-link {\n    min-height: 0;\n  }\n}\n@media (prefers-reduced-motion: reduce) {\n  .rip .rip-card-link,\n  .rip .rip-card-title,\n  .rip .rip-list-link {\n    transition: none;\n  }\n  .rip--cards .rip-card-link:hover {\n    transform: none;\n  }\n}\n@media (forced-colors: active) {\n  .rip .rip-card-link,\n  .rip .rip-list,\n  .rip .rip-list-item,\n  .rip .rip-count,\n  .rip .rip-panel-icon {\n    border-color: CanvasText;\n  }\n  .rip .rip-card-link:focus-visible,\n  .rip .rip-list-link:focus-visible {\n    outline-color: Highlight;\n  }\n  .rip .rip-panel-icon,\n  .rip .rip-tag {\n    color: LinkText;\n    background: Canvas;\n  }\n  .rip .rip-list-link[data-rip-accent] {\n    border-inline-start-color: LinkText;\n  }\n}";
function ownDataValue4(value, key) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return void 0;
  try {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    return descriptor && "value" in descriptor ? descriptor.value : void 0;
  } catch {
    return void 0;
  }
}
function panelAttributes(entry) {
  return {
    "data-rip-icon": entry.icon?.name,
    "data-rip-accent": entry.accent.kind === "named" ? entry.accent.name : entry.accent.kind === "direct" ? "direct" : void 0,
    style: entry.accent.kind === "theme" ? void 0 : `--rip-panel-accent: ${entry.accent.value}`
  };
}
function PanelIcon({ entry }) {
  if (!entry.icon) return null;
  const Icon2 = entry.icon.component;
  return /* @__PURE__ */ jsx("span", { class: "rip-panel-icon", "aria-hidden": "true", inert: true, children: /* @__PURE__ */ jsx(Icon2, { "aria-hidden": "true", focusable: "false", width: 20, height: 20, "stroke-width": 1.8 }) });
}
function ListPanel({
  entry,
  idPrefix,
  showDescription,
  showDocCount,
  translation
}) {
  const titleId = `${idPrefix}-title`;
  const countId = `${idPrefix}-count`;
  const descriptionId = `${idPrefix}-description`;
  const describedBy = [
    showDocCount ? countId : void 0,
    showDescription && entry.description ? descriptionId : void 0
  ].filter((id) => id !== void 0);
  return /* @__PURE__ */ jsx("li", { class: "rip-list-item", children: /* @__PURE__ */ jsxs(
    "a",
    {
      href: entry.href,
      class: "rip-list-link",
      "aria-labelledby": titleId,
      "aria-describedby": describedBy.length > 0 ? describedBy.join(" ") : void 0,
      ...panelAttributes(entry),
      children: [
        /* @__PURE__ */ jsxs("div", { class: "rip-list-row", children: [
          /* @__PURE__ */ jsxs("span", { class: "rip-panel-heading", children: [
            /* @__PURE__ */ jsx(PanelIcon, { entry }),
            /* @__PURE__ */ jsx("span", { class: "rip-list-title", id: titleId, children: entry.title })
          ] }),
          showDocCount && /* @__PURE__ */ jsx("span", { class: "rip-count", id: countId, children: translation.noteCount(entry.docCount) })
        ] }),
        showDescription && entry.description && /* @__PURE__ */ jsx("p", { class: "rip-desc", id: descriptionId, children: entry.description })
      ]
    }
  ) });
}
function CardPanel({
  entry,
  idPrefix,
  showDescription,
  showDocCount,
  showTags,
  translation
}) {
  const countLabel = translation.noteCount(entry.docCount);
  const titleId = `${idPrefix}-title`;
  const countId = `${idPrefix}-count`;
  const descriptionId = `${idPrefix}-description`;
  const tagsId = `${idPrefix}-tags`;
  const describedBy = [
    showDocCount ? countId : void 0,
    showDescription && entry.description ? descriptionId : void 0,
    showTags && entry.tags.length > 0 ? tagsId : void 0
  ].filter((id) => id !== void 0);
  return /* @__PURE__ */ jsx("li", { class: "rip-card", children: /* @__PURE__ */ jsxs(
    "a",
    {
      href: entry.href,
      class: "rip-card-link",
      "aria-labelledby": titleId,
      "aria-describedby": describedBy.length > 0 ? describedBy.join(" ") : void 0,
      ...panelAttributes(entry),
      children: [
        /* @__PURE__ */ jsxs("div", { class: "rip-card-top", children: [
          /* @__PURE__ */ jsxs("span", { class: "rip-panel-heading", children: [
            /* @__PURE__ */ jsx(PanelIcon, { entry }),
            /* @__PURE__ */ jsx("span", { class: "rip-card-title", id: titleId, children: entry.title })
          ] }),
          showDocCount && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("span", { class: "rip-count", "aria-hidden": "true", children: entry.docCount }),
            /* @__PURE__ */ jsx("span", { class: "rip-sr-only", id: countId, children: countLabel })
          ] })
        ] }),
        showDescription && entry.description && /* @__PURE__ */ jsx("p", { class: "rip-desc", id: descriptionId, children: entry.description }),
        showTags && entry.tags.length > 0 && /* @__PURE__ */ jsx("div", { class: "rip-tags", id: tagsId, children: entry.tags.map((tag, index) => /* @__PURE__ */ jsxs("span", { class: "rip-tag", children: [
          "#",
          tag
        ] }, `${tag}-${index}`)) })
      ]
    }
  ) });
}
var RootIndexPanels_default = ((userOptions) => {
  const options = normalizeRootIndexPanelsOptions(userOptions);
  const RootIndexPanels = ({ fileData, allFiles, cfg }) => {
    if (fileData.slug !== "index") return /* @__PURE__ */ jsx(Fragment, {});
    const translation = i18n(cfg.locale);
    const entries = collectBooks(allFiles, options).map((entry) => ({
      ...entry,
      href: resolveRelative(fileData.slug, `${entry.segment}/index`),
      icon: resolvePanelIcon(ownDataValue4(entry.panel, "icon"), options),
      accent: resolvePanelAccent(ownDataValue4(entry.panel, "accent"), options)
    }));
    if (entries.length === 0) {
      return /* @__PURE__ */ jsx("div", { class: "rip", children: /* @__PURE__ */ jsx("p", { class: "rip-empty", children: translation.emptyState }) });
    }
    if (options.layout === "list") {
      return /* @__PURE__ */ jsx("div", { class: "rip rip--list", children: /* @__PURE__ */ jsx("ul", { class: "rip-list", children: entries.map((entry, index) => /* @__PURE__ */ jsx(
        ListPanel,
        {
          entry,
          idPrefix: `rip-panel-${index}`,
          showDescription: options.showDescription,
          showDocCount: options.showDocCount,
          translation
        },
        entry.segment
      )) }) });
    }
    return /* @__PURE__ */ jsx("div", { class: "rip rip--cards", children: /* @__PURE__ */ jsx("ul", { class: "rip-grid", children: entries.map((entry, index) => /* @__PURE__ */ jsx(
      CardPanel,
      {
        entry,
        idPrefix: `rip-panel-${index}`,
        showDescription: options.showDescription,
        showDocCount: options.showDocCount,
        showTags: options.showTags,
        translation
      },
      entry.segment
    )) }) });
  };
  RootIndexPanels.css = panels_default;
  RootIndexPanels.afterDOMLoaded = panels_inline_default;
  return RootIndexPanels;
});

// src/pageType.ts
function isPhysicalRoot(fileData) {
  try {
    const descriptor = Object.getOwnPropertyDescriptor(fileData, "filePath");
    return descriptor !== void 0 && "value" in descriptor && typeof descriptor.value === "string" && descriptor.value.length > 0;
  } catch {
    return false;
  }
}
var RootIndexPanelsPage = (userOptions) => {
  const ownedRootFiles = /* @__PURE__ */ new WeakSet();
  return {
    name: "RootIndexPanelsPage",
    priority: 100,
    match: ({ slug: slug2, fileData }) => {
      const ownsRoot = slug2 === "index" && isPhysicalRoot(fileData);
      if (ownsRoot) ownedRootFiles.add(fileData);
      return ownsRoot;
    },
    layout: "content",
    body: () => RootIndexPanels_default(userOptions),
    treeTransforms: () => [
      (_root, slug2, componentData) => {
        if (slug2 !== "index" || !ownedRootFiles.has(componentData.fileData)) return;
        const renderFileData = { ...componentData.fileData };
        delete renderFileData.toc;
        delete renderFileData.readingTime;
        delete renderFileData.text;
        componentData.fileData = renderFileData;
      }
    ]
  };
};
/*! Bundled license information:

lucide-preact/dist/esm/shared/src/utils/mergeClasses.mjs:
lucide-preact/dist/esm/shared/src/utils/toKebabCase.mjs:
lucide-preact/dist/esm/shared/src/utils/toCamelCase.mjs:
lucide-preact/dist/esm/shared/src/utils/toPascalCase.mjs:
lucide-preact/dist/esm/defaultAttributes.mjs:
lucide-preact/dist/esm/context.mjs:
lucide-preact/dist/esm/shared/src/utils/hasA11yProp.mjs:
lucide-preact/dist/esm/Icon.mjs:
lucide-preact/dist/esm/createLucideIcon.mjs:
lucide-preact/dist/esm/icons/book-open.mjs:
lucide-preact/dist/esm/icons/code-xml.mjs:
lucide-preact/dist/esm/icons/coffee.mjs:
lucide-preact/dist/esm/icons/container.mjs:
lucide-preact/dist/esm/icons/cpu.mjs:
lucide-preact/dist/esm/icons/database.mjs:
lucide-preact/dist/esm/icons/file-code.mjs:
lucide-preact/dist/esm/icons/git-branch.mjs:
lucide-preact/dist/esm/icons/globe.mjs:
lucide-preact/dist/esm/icons/layers.mjs:
lucide-preact/dist/esm/icons/network.mjs:
lucide-preact/dist/esm/icons/shield.mjs:
lucide-preact/dist/esm/icons/terminal.mjs:
lucide-preact/dist/esm/lucide-preact.mjs:
  (**
   * @license lucide-preact v1.25.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)
*/

export { RootIndexPanels_default as RootIndexPanels, RootIndexPanelsPage };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map