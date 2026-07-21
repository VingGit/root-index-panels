from pathlib import Path

appearance_path = Path("test/appearance.test.tsx")
appearance = appearance_path.read_text()
old_icon_count = '    expect(countOccurrences(html, "rip-panel-icon")).toBe(2)\n'
new_icon_count = '''    expect(countOccurrences(html, "rip-panel-icon")).toBe(4)\n    expect(countOccurrences(html, 'data-rip-icon="book-open"')).toBe(2)\n'''
if appearance.count(old_icon_count) != 1:
    raise SystemExit(
        f"expected one stale icon-count assertion, found {appearance.count(old_icon_count)}"
    )
appearance_path.write_text(appearance.replace(old_icon_count, new_icon_count))

integration_path = Path("test/integration/parent-build.mjs")
integration = integration_path.read_text()
old_latest_assertion = '''  assert.doesNotMatch(
    bodyHtml.slice(latestStart, latestEnd + 10),
    /<p(?:\\s|>)/,
    "latest section retained its redundant explanatory paragraph",
  )
'''
new_latest_assertion = '''  const latestHeadingStart = bodyHtml.indexOf('<div class="rip-section-heading">', latestStart)
  const latestHeadingEnd = bodyHtml.indexOf("</div>", latestHeadingStart)
  assert.ok(
    latestHeadingStart >= latestStart && latestHeadingEnd > latestHeadingStart,
    "could not isolate latest section heading",
  )
  assert.doesNotMatch(
    bodyHtml.slice(latestHeadingStart, latestHeadingEnd + 6),
    /<p(?:\\s|>)/,
    "latest heading retained its redundant explanatory paragraph",
  )
'''
if integration.count(old_latest_assertion) != 1:
    raise SystemExit(
        "expected one broad latest-description assertion, "
        f"found {integration.count(old_latest_assertion)}"
    )
integration_path.write_text(
    integration.replace(old_latest_assertion, new_latest_assertion)
)
