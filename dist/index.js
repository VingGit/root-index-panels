import { createRequire } from 'module';
import { jsx, Fragment, jsxs } from 'preact/jsx-runtime';

createRequire(import.meta.url);

// src/components/scripts/panels.inline.ts
var panels_inline_default = 'function u(){let i=document.querySelectorAll(".rip-grid, .rip-list");if(i.length===0)return;let o=[];for(let r of i){let e=Array.from(r.querySelectorAll(".rip-card, .rip-list-item"));if(e.length===0)continue;let c=d=>{let l=document.activeElement;if(!l)return;let s=l.closest(".rip-card-link, .rip-list-link");if(!s)return;let a=s.closest(".rip-card, .rip-list-item");if(!a)return;let t=e.indexOf(a);if(t===-1)return;let n;switch(d.key){case"ArrowRight":case"ArrowDown":n=e[t+1];break;case"ArrowLeft":case"ArrowUp":n=e[t-1];break;case"Home":n=e[0];break;case"End":n=e[e.length-1];break}n&&(d.preventDefault(),n.querySelector(".rip-card-link, .rip-list-link")?.focus())};r.addEventListener("keydown",c),o.push(()=>r.removeEventListener("keydown",c))}typeof window<"u"&&window.addCleanup&&window.addCleanup(()=>{o.forEach(r=>r())})}document.addEventListener("nav",()=>{u()});\n';

// src/components/styles/panels.scss
var panels_default = ".rip {\n  margin: 1.5rem 0 2.5rem;\n  width: 100%;\n}\n\n.rip-empty {\n  color: var(--gray);\n  font-size: 0.9rem;\n  font-style: italic;\n}\n\n.rip-desc {\n  font-size: 0.82rem;\n  line-height: 1.55;\n  color: var(--gray);\n  margin: 0;\n  flex: 1 1 auto;\n}\n\n.rip-count {\n  display: inline-block;\n  font-size: 0.68rem;\n  font-family: var(--codeFont);\n  color: var(--gray);\n  border: 1px solid var(--lightgray);\n  border-radius: 4px;\n  padding: 0.1em 0.4em;\n  white-space: nowrap;\n  flex-shrink: 0;\n  line-height: 1.6;\n}\n\n.rip-tags {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.3rem;\n  margin-top: auto;\n  padding-top: 0.4rem;\n}\n\n.rip-tag {\n  font-size: 0.67rem;\n  font-family: var(--codeFont);\n  color: var(--secondary);\n  background: var(--highlight);\n  border-radius: 3px;\n  padding: 0.1em 0.45em;\n}\n\n.rip--cards .rip-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));\n  gap: 0.75rem;\n  list-style: none;\n  padding: 0;\n  margin: 0;\n}\n.rip--cards .rip-card {\n  border: 1px solid var(--lightgray);\n  border-radius: 8px;\n  background: transparent;\n  transition: border-color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;\n}\n.rip--cards .rip-card:hover {\n  border-color: var(--secondary);\n  transform: translateY(-2px);\n  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.09);\n}\n.rip--cards .rip-card:focus-within {\n  outline: 2px solid var(--secondary);\n  outline-offset: 2px;\n}\n.rip--cards .rip-card-link {\n  display: flex;\n  flex-direction: column;\n  gap: 0.45rem;\n  padding: 1.1rem 1.2rem;\n  height: 100%;\n  box-sizing: border-box;\n  text-decoration: none;\n  color: var(--darkgray);\n  border-radius: inherit;\n}\n.rip--cards .rip-card-link:hover {\n  background: var(--highlight);\n  color: var(--dark);\n}\n.rip--cards .rip-card-link:focus {\n  outline: none;\n}\n.rip--cards .rip-card-top {\n  display: flex;\n  align-items: flex-start;\n  justify-content: space-between;\n  gap: 0.5rem;\n}\n.rip--cards .rip-card-title {\n  font-family: var(--headerFont);\n  font-weight: 600;\n  font-size: 0.975rem;\n  color: var(--dark);\n  line-height: 1.3;\n}\n\n.rip--list .rip-list {\n  list-style: none;\n  padding: 0;\n  margin: 0;\n}\n.rip--list .rip-list-item {\n  border-bottom: 1px solid var(--lightgray);\n}\n.rip--list .rip-list-item:first-child {\n  border-top: 1px solid var(--lightgray);\n}\n.rip--list .rip-list-item:focus-within {\n  outline: 2px solid var(--secondary);\n  outline-offset: -2px;\n}\n.rip--list .rip-list-link {\n  display: flex;\n  flex-direction: column;\n  gap: 0.2rem;\n  padding: 0.8rem 0.3rem;\n  text-decoration: none;\n  color: var(--darkgray);\n  transition: color 0.12s;\n}\n.rip--list .rip-list-link:hover {\n  color: var(--secondary);\n}\n.rip--list .rip-list-link:focus {\n  outline: none;\n}\n.rip--list .rip-list-row {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 1rem;\n}\n.rip--list .rip-list-title {\n  font-family: var(--headerFont);\n  font-weight: 600;\n  font-size: 0.95rem;\n  color: var(--dark);\n}\n\n@media (max-width: 600px) {\n  .rip--cards .rip-grid {\n    grid-template-columns: 1fr;\n  }\n}";
function relativeBase(slug) {
  const parts = slug.split("/").filter(Boolean);
  if (parts[parts.length - 1] === "index") parts.pop();
  return parts.length === 0 ? "." : parts.map(() => "..").join("/");
}
function toTimestamp(value) {
  if (value instanceof Date) return value.getTime();
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}
function getFileTimestamp(file) {
  const data = file;
  const frontmatter = file.frontmatter ?? {};
  const dates = data["dates"] ?? {};
  const candidates = [
    dates["modified"],
    dates["created"],
    dates["published"],
    data["modified"],
    data["updated"],
    data["created"],
    data["date"],
    frontmatter["modified"],
    frontmatter["updated"],
    frontmatter["created"],
    frontmatter["published"],
    frontmatter["date"]
  ];
  for (const candidate of candidates) {
    const timestamp = toTimestamp(candidate);
    if (timestamp > 0) return timestamp;
  }
  return 0;
}
function noteCountLabel(count) {
  return `${count} ${count === 1 ? "note" : "notes"}`;
}
var RootIndexPanels_default = ((userOpts) => {
  const opts = {
    layout: "cards",
    showDescription: true,
    showDocCount: true,
    showTags: true,
    tagCount: 3,
    sort: "alphabetical",
    excludeDirs: [],
    descriptionFallback: "",
    ...userOpts
  };
  const RootIndexPanels = ({ fileData, allFiles }) => {
    const slug = String(fileData.slug ?? "");
    if (slug !== "index") return /* @__PURE__ */ jsx(Fragment, {});
    const seenDirs = /* @__PURE__ */ new Set();
    for (const f of allFiles) {
      const s = String(f.slug ?? "");
      const parts = s.split("/").filter(Boolean);
      if (parts.length < 2) continue;
      const head = parts[0];
      if (head && head !== "index" && !opts.excludeDirs.includes(head)) {
        seenDirs.add(head);
      }
    }
    const entries = [];
    for (const seg of seenDirs) {
      const indexFile = allFiles.find((f) => {
        const s = String(f.slug ?? "");
        return s === `${seg}/index` || s === seg;
      });
      const directoryFiles = allFiles.filter((f) => {
        const s = String(f.slug ?? "");
        return s === seg || s.startsWith(`${seg}/`);
      });
      const docCount = directoryFiles.filter((f) => {
        const s = String(f.slug ?? "");
        return s.startsWith(`${seg}/`) && s !== `${seg}/index`;
      }).length;
      const fm = indexFile?.frontmatter ?? {};
      const rawTitle = typeof fm["title"] === "string" ? fm["title"] : seg;
      const title = rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1).replace(/-/g, " ");
      const rawTags = fm["tags"];
      const tags = Array.isArray(rawTags) ? rawTags.filter((t) => typeof t === "string").slice(0, opts.tagCount) : [];
      const description = typeof fm["description"] === "string" ? fm["description"] : opts.descriptionFallback;
      const date = Math.max(...directoryFiles.map(getFileTimestamp), 0);
      entries.push({ seg, title, description, docCount, tags, date });
    }
    if (opts.sort === "alphabetical") {
      entries.sort((a, b) => a.title.localeCompare(b.title));
    } else if (opts.sort === "docCount") {
      entries.sort((a, b) => b.docCount - a.docCount);
    } else if (opts.sort === "date") {
      entries.sort((a, b) => b.date - a.date || a.title.localeCompare(b.title));
    }
    const base = relativeBase(slug);
    if (entries.length === 0) {
      return /* @__PURE__ */ jsx("div", { class: "rip", children: /* @__PURE__ */ jsx("p", { class: "rip-empty", children: "No subdirectories found." }) });
    }
    if (opts.layout === "list") {
      return /* @__PURE__ */ jsx("div", { class: "rip rip--list", children: /* @__PURE__ */ jsx("ul", { class: "rip-list", children: entries.map((entry) => /* @__PURE__ */ jsx("li", { class: "rip-list-item", children: /* @__PURE__ */ jsxs("a", { href: `${base}/${entry.seg}`, class: "rip-list-link", children: [
        /* @__PURE__ */ jsxs("div", { class: "rip-list-row", children: [
          /* @__PURE__ */ jsx("span", { class: "rip-list-title", children: entry.title }),
          opts.showDocCount && /* @__PURE__ */ jsx("span", { class: "rip-count", children: noteCountLabel(entry.docCount) })
        ] }),
        opts.showDescription && entry.description && /* @__PURE__ */ jsx("p", { class: "rip-desc", children: entry.description })
      ] }) }, entry.seg)) }) });
    }
    return /* @__PURE__ */ jsx("div", { class: "rip rip--cards", children: /* @__PURE__ */ jsx("ul", { class: "rip-grid", children: entries.map((entry) => /* @__PURE__ */ jsx("li", { class: "rip-card", children: /* @__PURE__ */ jsxs("a", { href: `${base}/${entry.seg}`, class: "rip-card-link", children: [
      /* @__PURE__ */ jsxs("div", { class: "rip-card-top", children: [
        /* @__PURE__ */ jsx("span", { class: "rip-card-title", children: entry.title }),
        opts.showDocCount && /* @__PURE__ */ jsx("span", { class: "rip-count", children: entry.docCount })
      ] }),
      opts.showDescription && entry.description && /* @__PURE__ */ jsx("p", { class: "rip-desc", children: entry.description }),
      opts.showTags && entry.tags.length > 0 && /* @__PURE__ */ jsx("div", { class: "rip-tags", children: entry.tags.map((tag) => /* @__PURE__ */ jsxs("span", { class: "rip-tag", children: [
        "#",
        tag
      ] }, tag)) })
    ] }) }, entry.seg)) }) });
  };
  RootIndexPanels.css = panels_default;
  RootIndexPanels.afterDOMLoaded = panels_inline_default;
  return RootIndexPanels;
});

// src/pageType.ts
var RootIndexPanelsPage = (userOptions) => ({
  name: "RootIndexPanelsPage",
  priority: 100,
  match: ({ slug }) => slug === "index",
  layout: "content",
  body: () => RootIndexPanels_default(userOptions)
});

export { RootIndexPanels_default as RootIndexPanels, RootIndexPanelsPage };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map