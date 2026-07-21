from pathlib import Path

path = Path("test/appearance.test.tsx")
source = path.read_text()
old = '    expect(countOccurrences(html, "rip-panel-icon")).toBe(2)\n'
new = '''    expect(countOccurrences(html, "rip-panel-icon")).toBe(4)\n    expect(countOccurrences(html, 'data-rip-icon="book-open"')).toBe(2)\n'''
if source.count(old) != 1:
    raise SystemExit(f"expected one stale icon-count assertion, found {source.count(old)}")
path.write_text(source.replace(old, new))
