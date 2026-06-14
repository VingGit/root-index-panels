import { createRequire } from 'module';

createRequire(import.meta.url);

// src/components/scripts/panels.inline.ts
var panels_inline_default = 'function u(){let i=document.querySelectorAll(".rip-grid, .rip-list");if(i.length===0)return;let o=[];for(let r of i){let e=Array.from(r.querySelectorAll(".rip-card, .rip-list-item"));if(e.length===0)continue;let c=d=>{let l=document.activeElement;if(!l)return;let s=l.closest(".rip-card-link, .rip-list-link");if(!s)return;let a=s.closest(".rip-card, .rip-list-item");if(!a)return;let t=e.indexOf(a);if(t===-1)return;let n;switch(d.key){case"ArrowRight":case"ArrowDown":n=e[t+1];break;case"ArrowLeft":case"ArrowUp":n=e[t-1];break;case"Home":n=e[0];break;case"End":n=e[e.length-1];break}n&&(d.preventDefault(),n.querySelector(".rip-card-link, .rip-list-link")?.focus())};r.addEventListener("keydown",c),o.push(()=>r.removeEventListener("keydown",c))}typeof window<"u"&&window.addCleanup&&window.addCleanup(()=>{o.forEach(r=>r())})}document.addEventListener("nav",()=>{u()});\n';

// src/components/styles/panels.scss
var panels_default = ".rip {\n  margin: 1.5rem 0 2.5rem;\n  width: 100%;\n}\n\n.rip-empty {\n  color: var(--gray);\n  font-size: 0.9rem;\n  font-style: italic;\n}\n\n.rip-desc {\n  font-size: 0.82rem;\n  line-height: 1.55;\n  color: var(--gray);\n  margin: 0;\n  flex: 1 1 auto;\n}\n\n.rip-count {\n  display: inline-block;\n  font-size: 0.68rem;\n  font-family: var(--codeFont);\n  color: var(--gray);\n  border: 1px solid var(--lightgray);\n  border-radius: 4px;\n  padding: 0.1em 0.4em;\n  white-space: nowrap;\n  flex-shrink: 0;\n  line-height: 1.6;\n}\n\n.rip-tags {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.3rem;\n  margin-top: auto;\n  padding-top: 0.4rem;\n}\n\n.rip-tag {\n  font-size: 0.67rem;\n  font-family: var(--codeFont);\n  color: var(--secondary);\n  background: var(--highlight);\n  border-radius: 3px;\n  padding: 0.1em 0.45em;\n}\n\n.rip--cards .rip-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));\n  gap: 0.75rem;\n  list-style: none;\n  padding: 0;\n  margin: 0;\n}\n.rip--cards .rip-card {\n  border: 1px solid var(--lightgray);\n  border-radius: 8px;\n  background: transparent;\n  transition: border-color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;\n}\n.rip--cards .rip-card:hover {\n  border-color: var(--secondary);\n  transform: translateY(-2px);\n  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.09);\n}\n.rip--cards .rip-card:focus-within {\n  outline: 2px solid var(--secondary);\n  outline-offset: 2px;\n}\n.rip--cards .rip-card-link {\n  display: flex;\n  flex-direction: column;\n  gap: 0.45rem;\n  padding: 1.1rem 1.2rem;\n  height: 100%;\n  box-sizing: border-box;\n  text-decoration: none;\n  color: var(--darkgray);\n  border-radius: inherit;\n}\n.rip--cards .rip-card-link:hover {\n  background: var(--highlight);\n  color: var(--dark);\n}\n.rip--cards .rip-card-link:focus {\n  outline: none;\n}\n.rip--cards .rip-card-top {\n  display: flex;\n  align-items: flex-start;\n  justify-content: space-between;\n  gap: 0.5rem;\n}\n.rip--cards .rip-card-title {\n  font-family: var(--headerFont);\n  font-weight: 600;\n  font-size: 0.975rem;\n  color: var(--dark);\n  line-height: 1.3;\n}\n\n.rip--list .rip-list {\n  list-style: none;\n  padding: 0;\n  margin: 0;\n}\n.rip--list .rip-list-item {\n  border-bottom: 1px solid var(--lightgray);\n}\n.rip--list .rip-list-item:first-child {\n  border-top: 1px solid var(--lightgray);\n}\n.rip--list .rip-list-item:focus-within {\n  outline: 2px solid var(--secondary);\n  outline-offset: -2px;\n}\n.rip--list .rip-list-link {\n  display: flex;\n  flex-direction: column;\n  gap: 0.2rem;\n  padding: 0.8rem 0.3rem;\n  text-decoration: none;\n  color: var(--darkgray);\n  transition: color 0.12s;\n}\n.rip--list .rip-list-link:hover {\n  color: var(--secondary);\n}\n.rip--list .rip-list-link:focus {\n  outline: none;\n}\n.rip--list .rip-list-row {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 1rem;\n}\n.rip--list .rip-list-title {\n  font-family: var(--headerFont);\n  font-weight: 600;\n  font-size: 0.95rem;\n  color: var(--dark);\n}\n\n@media (max-width: 600px) {\n  .rip--cards .rip-grid {\n    grid-template-columns: 1fr;\n  }\n}";
var l;
function k(n2) {
  return n2.children;
}
l = { __e: function(n2, l2, u3, t2) {
  for (var i2, o2, r2; l2 = l2.__; ) if ((i2 = l2.__c) && !i2.__) try {
    if ((o2 = i2.constructor) && null != o2.getDerivedStateFromError && (i2.setState(o2.getDerivedStateFromError(n2)), r2 = i2.__d), null != i2.componentDidCatch && (i2.componentDidCatch(n2, t2 || {}), r2 = i2.__d), r2) return i2.__E = i2;
  } catch (l3) {
    n2 = l3;
  }
  throw n2;
} }, "function" == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout;

// node_modules/preact/jsx-runtime/dist/jsxRuntime.mjs
var f2 = 0;
function u2(e2, t2, n2, o2, i2, u3) {
  t2 || (t2 = {});
  var a2, c2, p2 = t2;
  if ("ref" in p2) for (c2 in p2 = {}, t2) "ref" == c2 ? a2 = t2[c2] : p2[c2] = t2[c2];
  var l2 = { type: e2, props: p2, key: n2, ref: a2, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: --f2, __i: -1, __u: 0, __source: i2, __self: u3 };
  if ("function" == typeof e2 && (a2 = e2.defaultProps)) for (c2 in a2) void 0 === p2[c2] && (p2[c2] = a2[c2]);
  return l.vnode && l.vnode(l2), l2;
}

// src/components/RootIndexPanels.tsx
function relativeBase(slug) {
  const parts = slug.split("/").filter(Boolean);
  if (parts[parts.length - 1] === "index") parts.pop();
  return parts.length === 0 ? "." : parts.map(() => "..").join("/");
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
    if (slug !== "index") return /* @__PURE__ */ u2(k, {});
    const seenDirs = /* @__PURE__ */ new Set();
    for (const f3 of allFiles) {
      const s2 = String(f3.slug ?? "");
      const head = s2.split("/")[0];
      if (head && head !== "index" && !opts.excludeDirs.includes(head)) {
        seenDirs.add(head);
      }
    }
    const entries = [];
    for (const seg of seenDirs) {
      const indexFile = allFiles.find((f3) => {
        const s2 = String(f3.slug ?? "");
        return s2 === `${seg}/index` || s2 === seg;
      });
      const docCount = allFiles.filter((f3) => {
        const s2 = String(f3.slug ?? "");
        return s2.startsWith(`${seg}/`) && s2 !== `${seg}/index`;
      }).length;
      const fm = indexFile?.frontmatter ?? {};
      const rawTitle = typeof fm["title"] === "string" ? fm["title"] : seg;
      const title = rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1).replace(/-/g, " ");
      const rawTags = fm["tags"];
      const tags = Array.isArray(rawTags) ? rawTags.filter((t2) => typeof t2 === "string").slice(0, opts.tagCount) : [];
      const description = typeof fm["description"] === "string" ? fm["description"] : opts.descriptionFallback;
      entries.push({ seg, title, description, docCount, tags });
    }
    if (opts.sort === "alphabetical") {
      entries.sort((a2, b) => a2.title.localeCompare(b.title));
    } else if (opts.sort === "docCount") {
      entries.sort((a2, b) => b.docCount - a2.docCount);
    }
    const base = relativeBase(slug);
    if (entries.length === 0) {
      return /* @__PURE__ */ u2("div", { class: "rip", children: /* @__PURE__ */ u2("p", { class: "rip-empty", children: "No subdirectories found." }) });
    }
    if (opts.layout === "list") {
      return /* @__PURE__ */ u2("div", { class: "rip rip--list", children: /* @__PURE__ */ u2("ul", { class: "rip-list", children: entries.map((entry) => /* @__PURE__ */ u2("li", { class: "rip-list-item", children: /* @__PURE__ */ u2("a", { href: `${base}/${entry.seg}`, class: "rip-list-link", children: [
        /* @__PURE__ */ u2("div", { class: "rip-list-row", children: [
          /* @__PURE__ */ u2("span", { class: "rip-list-title", children: entry.title }),
          opts.showDocCount && /* @__PURE__ */ u2("span", { class: "rip-count", children: [
            entry.docCount,
            "\xA0notes"
          ] })
        ] }),
        opts.showDescription && entry.description && /* @__PURE__ */ u2("p", { class: "rip-desc", children: entry.description })
      ] }) })) }) });
    }
    return /* @__PURE__ */ u2("div", { class: "rip rip--cards", children: /* @__PURE__ */ u2("ul", { class: "rip-grid", children: entries.map((entry) => /* @__PURE__ */ u2("li", { class: "rip-card", children: /* @__PURE__ */ u2("a", { href: `${base}/${entry.seg}`, class: "rip-card-link", children: [
      /* @__PURE__ */ u2("div", { class: "rip-card-top", children: [
        /* @__PURE__ */ u2("span", { class: "rip-card-title", children: entry.title }),
        opts.showDocCount && /* @__PURE__ */ u2("span", { class: "rip-count", children: entry.docCount })
      ] }),
      opts.showDescription && entry.description && /* @__PURE__ */ u2("p", { class: "rip-desc", children: entry.description }),
      opts.showTags && entry.tags.length > 0 && /* @__PURE__ */ u2("div", { class: "rip-tags", children: entry.tags.map((tag) => /* @__PURE__ */ u2("span", { class: "rip-tag", children: [
        "#",
        tag
      ] })) })
    ] }) })) }) });
  };
  RootIndexPanels.css = panels_default;
  RootIndexPanels.afterDOMLoaded = panels_inline_default;
  return RootIndexPanels;
});

// node_modules/@quartz-community/utils/dist/lang.js
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

// src/components/styles/example.scss
var example_default = ".example-component {\n  padding: 8px 16px;\n  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n  color: white;\n  border-radius: 4px;\n  font-weight: 600;\n  display: inline-block;\n}";

// src/components/scripts/example.inline.ts
var example_inline_default = 'function l(){let e=window.location.pathname;return e.startsWith("/")&&(e=e.slice(1)),e.endsWith("/")&&(e=e.slice(0,-1)),e||"index"}function r(){let e=document.querySelectorAll(".example-component");if(e.length===0)return;let t=[];function o(n){(n.ctrlKey||n.metaKey)&&n.shiftKey&&n.key.toLowerCase()==="e"&&(n.preventDefault(),console.log("[ExampleComponent] Keyboard shortcut triggered!"))}document.addEventListener("keydown",o),t.push(()=>document.removeEventListener("keydown",o));for(let n of e){let i=()=>{console.log("[ExampleComponent] Clicked!")};n.addEventListener("click",i),t.push(()=>n.removeEventListener("click",i))}typeof window<"u"&&window.addCleanup&&window.addCleanup(()=>{t.forEach(n=>n())}),console.log("[ExampleComponent] Initialized with",e.length,"component(s)")}document.addEventListener("nav",e=>{let t=e.detail?.url||l();console.log("[ExampleComponent] Navigation to:",t),r()});document.addEventListener("render",()=>{console.log("[ExampleComponent] Render event - re-initializing"),r()});document.addEventListener("prenav",()=>{let e=document.querySelector(".example-component");e&&sessionStorage.setItem("exampleScrollTop",e.scrollTop?.toString()||"0")});\n';

// src/components/ExampleComponent.tsx
var ExampleComponent_default = ((opts) => {
  const { prefix = "", suffix = "", className = "example-component" } = opts ?? {};
  const Component = (props) => {
    const frontmatter = props.fileData?.frontmatter;
    const title = frontmatter?.title ?? "Untitled";
    const fullText = `${prefix}${title}${suffix}`;
    return /* @__PURE__ */ u2("div", { class: classNames(className), children: fullText });
  };
  Component.css = example_default;
  Component.afterDOMLoaded = example_inline_default;
  return Component;
});

export { ExampleComponent_default as ExampleComponent, RootIndexPanels_default as RootIndexPanels };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map