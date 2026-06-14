import type {
  QuartzComponent,
  QuartzComponentProps,
  QuartzComponentConstructor,
} from "@quartz-community/types";
// @ts-expect-error — .inline.ts files are processed by the tsup inline-script-loader
import script from "./scripts/panels.inline.ts";
import style from "./styles/panels.scss";

// ── Options ─────────────────────────────────────────────────────────────

export interface RootIndexPanelsOptions {
  /** "cards" (default) or "list" */
  layout?: "cards" | "list";
  /** Show description from frontmatter. Default: true */
  showDescription?: boolean;
  /** Show note-count badge. Default: true */
  showDocCount?: boolean;
  /** Show tags from frontmatter (cards only). Default: true */
  showTags?: boolean;
  /** Max tags per card. Default: 3 */
  tagCount?: number;
  /** Sort order. Default: "alphabetical" */
  sort?: "alphabetical" | "docCount" | "date";
  /** Directory names (first path segment) to exclude. Default: [] */
  excludeDirs?: string[];
  /** Fallback description when frontmatter has none. Default: "" */
  descriptionFallback?: string;
}

// ── Internal types ───────────────────────────────────────────────────────

interface DirEntry {
  seg: string;
  title: string;
  description: string;
  docCount: number;
  tags: string[];
}

// ── Helpers ──────────────────────────────────────────────────────────────

/**
 * Returns the relative path from the current page back to the site root.
 * For the root index ("index"), this is ".".
 */
function relativeBase(slug: string): string {
  const parts = slug.split("/").filter(Boolean);
  if (parts[parts.length - 1] === "index") parts.pop();
  return parts.length === 0 ? "." : parts.map(() => "..").join("/");
}

// ── Component ────────────────────────────────────────────────────────────

export default ((userOpts?: RootIndexPanelsOptions) => {
  const opts: Required<RootIndexPanelsOptions> = {
    layout: "cards",
    showDescription: true,
    showDocCount: true,
    showTags: true,
    tagCount: 3,
    sort: "alphabetical",
    excludeDirs: [],
    descriptionFallback: "",
    ...userOpts,
  };

  const RootIndexPanels: QuartzComponent = ({
    fileData,
    allFiles,
  }: QuartzComponentProps) => {
    const slug = String(fileData.slug ?? "");

    // Only render on the vault's root index page
    if (slug !== "index") return <></>;

    // ── Collect first-level directory slugs ──────────────────────────────
    const seenDirs = new Set<string>();
    for (const f of allFiles) {
      const s = String(f.slug ?? "");
      const head = s.split("/")[0];
      if (head && head !== "index" && !opts.excludeDirs.includes(head)) {
        seenDirs.add(head);
      }
    }

    // ── Build a DirEntry for each directory ──────────────────────────────
    const entries: DirEntry[] = [];

    for (const seg of seenDirs) {
      // Prefer <seg>/index.md for metadata; fall back to any file at <seg>
      const indexFile = allFiles.find((f) => {
        const s = String(f.slug ?? "");
        return s === `${seg}/index` || s === seg;
      });

      // Count notes inside the directory, excluding the index itself
      const docCount = allFiles.filter((f) => {
        const s = String(f.slug ?? "");
        return s.startsWith(`${seg}/`) && s !== `${seg}/index`;
      }).length;

      const fm = (indexFile?.frontmatter ?? {}) as Record<string, unknown>;

      const rawTitle =
        typeof fm["title"] === "string" ? fm["title"] : seg;
      const title =
        rawTitle.charAt(0).toUpperCase() +
        rawTitle.slice(1).replace(/-/g, " ");

      const rawTags = fm["tags"];
      const tags = Array.isArray(rawTags)
        ? rawTags
            .filter((t): t is string => typeof t === "string")
            .slice(0, opts.tagCount)
        : [];

      const description =
        typeof fm["description"] === "string"
          ? fm["description"]
          : opts.descriptionFallback;

      entries.push({ seg, title, description, docCount, tags });
    }

    // ── Sort ─────────────────────────────────────────────────────────────
    if (opts.sort === "alphabetical") {
      entries.sort((a, b) => a.title.localeCompare(b.title));
    } else if (opts.sort === "docCount") {
      entries.sort((a, b) => b.docCount - a.docCount);
    }

    const base = relativeBase(slug);

    // ── Empty state ───────────────────────────────────────────────────────
    if (entries.length === 0) {
      return (
        <div class="rip">
          <p class="rip-empty">
            No subdirectories found. Create a folder inside your content
            directory and add an <code>index.md</code> with a{" "}
            <code>description</code> in its frontmatter.
          </p>
        </div>
      );
    }

    // ── List layout ───────────────────────────────────────────────────────
    if (opts.layout === "list") {
      return (
        <div class="rip rip--list">
          <ul class="rip-list">
            {entries.map((entry) => (
              <li class="rip-list-item">
                <a href={`${base}/${entry.seg}`} class="rip-list-link">
                  <div class="rip-list-row">
                    <span class="rip-list-title">{entry.title}</span>
                    {opts.showDocCount && (
                      <span class="rip-count">{entry.docCount}&nbsp;notes</span>
                    )}
                  </div>
                  {opts.showDescription && entry.description && (
                    <p class="rip-desc">{entry.description}</p>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </div>
      );
    }

    // ── Cards layout (default) ────────────────────────────────────────────
    return (
      <div class="rip rip--cards">
        <ul class="rip-grid">
          {entries.map((entry) => (
            <li class="rip-card">
              <a href={`${base}/${entry.seg}`} class="rip-card-link">
                <div class="rip-card-top">
                  <span class="rip-card-title">{entry.title}</span>
                  {opts.showDocCount && (
                    <span class="rip-count">{entry.docCount}</span>
                  )}
                </div>
                {opts.showDescription && entry.description && (
                  <p class="rip-desc">{entry.description}</p>
                )}
                {opts.showTags && entry.tags.length > 0 && (
                  <div class="rip-tags">
                    {entry.tags.map((tag) => (
                      <span class="rip-tag">#{tag}</span>
                    ))}
                  </div>
                )}
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  RootIndexPanels.css = style;
  RootIndexPanels.afterDOMLoaded = script;
  return RootIndexPanels;
}) satisfies QuartzComponentConstructor;
