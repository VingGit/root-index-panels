from __future__ import annotations

import re
from pathlib import Path

PATH = Path("test/integration/parent-build.mjs")


def rewrite(pattern: str, replacement: str) -> None:
    text = PATH.read_text()
    updated, count = re.subn(pattern, lambda _match: replacement, text, count=1, flags=re.DOTALL)
    if count == 0:
        if replacement.strip() in text:
            print(f"already synchronized: {pattern[:80]}")
            return
        raise SystemExit(f"missing integration boundary: {pattern[:120]}")
    PATH.write_text(updated)


text = PATH.read_text()
text = text.replace("switchManual", "switchBook")
text = text.replace("Switch manual", "Switch book")
text = text.replace("Vaihda käsikirjaa", "Vaihda kirjaa")
text = text.replace("selected manual", "selected book")
text = text.replace("manual-switcher", "book-switcher")
text = text.replace("root manual", "root scope")
PATH.write_text(text)

rewrite(
    r'function anchorForHref\(html, href\) \{.*?\n\}\n\nfunction panelHrefs\(html\) \{.*?\n\}',
    '''function librarySectionHtml(html) {
  const start = html.indexOf('<section id="rip-books"')
  const end = html.indexOf("</section>", start)
  assert.ok(start >= 0 && end > start, "missing complete root library section")
  return html.slice(start, end + "</section>".length)
}

function anchorForHref(html, href) {
  const library = librarySectionHtml(html)
  for (const match of library.matchAll(/<a\\b[^>]*>[\\s\\S]*?<\\/a>/g)) {
    const openingTag = match[0].slice(0, match[0].indexOf(">") + 1)
    if (
      openingTag.includes(`href="${href}"`) &&
      /\\bclass="[^"]*\\brip-(?:card|list)-link\\b/.test(openingTag)
    ) {
      return match[0]
    }
  }
  assert.fail(`missing complete-library panel link ${href}`)
}

function panelHrefs(html) {
  const library = librarySectionHtml(html)
  const hrefs = []
  for (const match of library.matchAll(/<a\\b[^>]*>/g)) {
    if (!/\\bclass="[^"]*\\brip-(?:card|list)-link\\b/.test(match[0])) continue
    const href = match[0].match(/\\bhref="([^"]+)"/)?.[1]
    if (href) hrefs.push(href)
  }
  return hrefs
}''',
)

text = PATH.read_text()
fixture_marker = '''  "content/java/nested/index.md": `---
title: Authored nested index
---
# Nested index
`,'''
fixture_replacement = '''  "content/java/nested/index.md": `---
title: Authored nested index
---
# Nested index
`,
  "content/java/nested/page.md": `---
title: Nested Java page
---
# Nested page
`,'''
if fixture_marker in text:
    text = text.replace(fixture_marker, fixture_replacement)
elif '"content/java/nested/page.md"' not in text:
    raise SystemExit("missing nested fixture boundary")
PATH.write_text(text)

text = PATH.read_text()
text = text.replace("const directoriesStart = bodyHtml.indexOf('<section id=\"rip-directories\"')", "const directoriesStart = bodyHtml.indexOf('<section id=\"rip-books\"')")
text = text.replace("bodyHtml.indexOf('id=\"rip-directories\"')", "bodyHtml.indexOf('id=\"rip-books\"')")
text = text.replace('class="rip-browse-link" href="#rip-directories"', 'class="rip-browse-link" href="#rip-books"')
text = text.replace("root directories section", "complete root library section")
text = text.replace("then directories", "then the complete library")
text = text.replace("root directory statistic drifted", "root book statistic drifted")
PATH.write_text(text)

rewrite(
    r'''  assert\.ok\(
    bodyHtml\.indexOf\('class="rip-overview"'\) < bodyHtml\.indexOf\("ROOT BODY SENTINEL"\) &&
      bodyHtml\.indexOf\("ROOT BODY SENTINEL"\) < bodyHtml\.indexOf\('id="rip-books"'\),
    "root order must be overview, authored Markdown, then the complete library",
  \)''',
    '''  assert.ok(
    bodyHtml.indexOf('class="rip-overview"') < bodyHtml.indexOf('class="rip-latest"') &&
      bodyHtml.indexOf('class="rip-latest"') < bodyHtml.indexOf("ROOT BODY SENTINEL") &&
      bodyHtml.indexOf("ROOT BODY SENTINEL") < bodyHtml.indexOf('id="rip-books"'),
    "root order must be overview, latest preview, authored Markdown, then the complete library",
  )''',
)

text = PATH.read_text()
text = text.replace(
    '  assert.equal(classCount(bodyHtml, "rip-directories"), 1, "root directories section duplicated")',
    '  assert.equal(classCount(bodyHtml, "rip-latest"), 1, "latest preview must render once")\n'
    '  assert.equal(classCount(bodyHtml, "rip-directories"), 1, "complete library section duplicated")\n'
    '  assert.equal(classCount(bodyHtml, "rip-return-link"), 1, "return-to-library action must render once")',
)
text = text.replace(
    '    bodyHtml.includes(`<dd>${expectedUpdated}</dd>`),',
    '    bodyHtml.includes(`>${expectedUpdated}</time></dd>`),',
)
text = text.replace(
    '    assert.equal(classCount(rootHtml, "rip-grid"), 1, "card grid must render once")\n'
    '    assert.equal(classCount(rootHtml, "rip-card"), expectedHrefs.length, "card count drifted")',
    '    const libraryHtml = librarySectionHtml(rootHtml)\n'
    '    assert.equal(classCount(rootHtml, "rip-grid"), 2, "latest and complete card grids must render")\n'
    '    assert.equal(classCount(libraryHtml, "rip-card"), expectedHrefs.length, "complete card count drifted")\n'
    '    assert.ok(classCount(rootHtml, "rip-card") <= expectedHrefs.length + 3, "latest preview exceeded three cards")',
)
text = text.replace(
    '    assert.equal(classCount(rootHtml, "rip-list"), 1, "list must render once")\n'
    '    assert.equal(classCount(rootHtml, "rip-list-item"), expectedHrefs.length, "list count drifted")',
    '    const libraryHtml = librarySectionHtml(rootHtml)\n'
    '    assert.equal(classCount(rootHtml, "rip-list"), 2, "latest and complete lists must render")\n'
    '    assert.equal(classCount(libraryHtml, "rip-list-item"), expectedHrefs.length, "complete list count drifted")',
)
PATH.write_text(text)

rewrite(
    r'''  assert\.match\(
    topicScope,
    /class="rip-sidebar-note-link rip-sidebar-book-overview-link" href="\\\.\\\.\\/java\\/"\[\^>\]\*data-rip-state="ancestor"/,
  \)
  assert\.match\(sidebarDocumentAnchorForHref\(topicHtml, "\.\./java/"\), /data-rip-node-kind="note"/\)''',
    '''  assert.doesNotMatch(topicScope, /rip-sidebar-book-overview-link|>Overview</)
  assert.match(
    topicSidebar,
    /class="rip-sidebar-home-mark" href="\.\.\/java\/"[^>]*aria-label="Open iOS home"/,
  )
  assert.doesNotMatch(
    topicSidebar.match(/<a\\b[^>]*class="rip-sidebar-home-mark"[^>]*>/)?.[0] ?? "",
    /aria-current=/,
    "book home mark must be neutral on a descendant note",
  )''',
)

rewrite(
    r'''  assert\.match\(
    topicScope,
    /<li class="rip-sidebar-folder"><details open><summary>\[\\s\\S\]\*\?Authored nested index<\\/span>/,
    "inactive top-level folders must remain expanded",
  \)''',
    '''  assert.match(
    topicScope,
    /class="rip-sidebar-folder" data-rip-open="true"[\\s\\S]*?class="rip-sidebar-folder-link" href="\.\.\/java\/nested\/"[\\s\\S]*?Authored nested index<\/span>/,
    "top-level nested folder must remain expanded and link to its landing page",
  )
  assert.match(
    topicScope,
    /class="rip-sidebar-disclosure" aria-expanded="true"[^>]*aria-controls="rip-sidebar-children-/,
    "nested folder must expose an independent disclosure control",
  )
  assert.match(
    sidebarDocumentAnchorForHref(topicHtml, "../java/nested/page"),
    /data-rip-node-kind="note"/,
  )''',
)

text = PATH.read_text()
text = text.replace('"book Overview link"', '"book home link"')
text = text.replace('"second book Overview link"', '"second book home link"')
text = text.replace('"book route must mark exactly one selected manual"', '"book route must mark exactly one selected book"')
text = text.replace('"./java/": ">2 notes</span>"', '"./java/": ">3 notes</span>"')
text = text.replace('"./java/": "2 muistiinpanoa"', '"./java/": "3 muistiinpanoa"')
text = text.replace('{ switchBook: "Switch book", explorer: "Explorer" }', '{ switchBook: "Switch book", explorer: "Explorer" }')
PATH.write_text(text)

print("integration assertions synchronized")
