from pathlib import Path


def replace_once(path: str, old: str, new: str) -> None:
    file = Path(path)
    text = file.read_text()
    if new in text:
        return
    if old not in text:
        raise SystemExit(f"Expected documentation anchor missing from {path}")
    file.write_text(text.replace(old, new, 1))


replace_once(
    "README.md",
    """The plugin preserves an authored title exactly. If no title exists, it derives one from the
directory name.

Built-in icons:
""",
    """The plugin preserves an authored title exactly. If no title exists, it derives one from the
directory name.

### Folder-local filename sorting

A physical `index.md` can opt the files directly in its own folder into filename-aware sidebar
sorting:

```yaml
---
quartz-sorting-direction: ascending
---
```

Use `descending` to reverse values within each sort class. Putting the key on `content/index.md`
controls root-level notes. A nested folder does not inherit its parent's setting; give that folder's
own physical `index.md` the key when it should use the same behavior. Folder rows themselves remain
first and keep their normal alphabetical ordering.

The sorter reads the source filename, not frontmatter `title`. It recognizes the first valid
`DD.MM.YYYY` date and the first valid `HH-MM` time anywhere in the filename. Dates must be real
Gregorian calendar dates and times must be between `00-00` and `23-59`; invalid-looking tokens are
treated as ordinary filename text.

The file buckets stay in this order for both directions:

1. filenames without a valid date or time;
2. filenames containing both a date and a time;
3. filenames containing a date only; and
4. filenames containing a time only.

Ordinary filenames use natural ordering with numeric runs first, then Unicode uppercase letters,
then Unicode lowercase letters, then other characters. Numeric runs compare by value, so `2` sorts
before `10`. Date-and-time files compare by date and then time, so files sharing a date stay grouped
and their times determine their order. Date-only and time-only files compare their parsed values.
Remaining filename text provides deterministic ties after parsed values are equal.

`ascending` and `descending` reverse values inside those fixed buckets and character classes; they
do not move the date/time buckets ahead of ordinary filenames or move lowercase names ahead of
uppercase names. Missing values, booleans such as `true`/`false`, and any string other than exactly
`ascending` or `descending` preserve the sidebar's normal title-based ordering for that folder.

Built-in icons:
""",
)

replace_once(
    "CHANGELOG.md",
    "## [Unreleased]\n",
    """## [Unreleased]

### Added

- Add opt-in folder-local sidebar filename sorting through
  `quartz-sorting-direction: ascending|descending` on physical `index.md` files, with strict
  `DD.MM.YYYY`/`HH-MM` parsing, deterministic natural filename ordering, same-date time grouping,
  and non-inherited folder scope.
""",
)

replace_once(
    ".github/instructions/architecture.instructions.md",
    """- Folders sort before leaves, followed by case-insensitive title, exact title, and stable key.
  Ordinary notes, Canvas, and Base use distinct icons.
""",
    """- Folders always sort before leaves and retain case-insensitive title, exact-title, and stable-key
  ordering. A first listed physical folder `index` may opt only that folder's direct file children
  into filename ordering with frontmatter `quartz-sorting-direction: ascending|descending`; the
  physical root `index` controls root notes. The setting never inherits into nested folders, and
  missing or invalid values preserve normal title ordering.
- Filename ordering uses the physical `filePath` basename, with the slug leaf only as the generated
  Canvas/Base fallback. Parse the first valid `DD.MM.YYYY` Gregorian date and `HH-MM` 24-hour time
  anywhere in the name. Keep fixed buckets for plain, date-and-time, date-only, then time-only names.
  Plain names use natural numeric runs plus Unicode uppercase, Unicode lowercase, then other-character
  classes. Direction reverses values inside fixed buckets/classes without reversing their priority;
  date-and-time values compare date then time so equal dates stay grouped. Parsed-value ties use the
  remaining name and then the raw name deterministically. Ordinary notes, Canvas, and Base use
  distinct icons.
""",
)

replace_once(
    ".github/instructions/verification.instructions.md",
    """For sidebar inventory, parameterize input order and duplicates. Assert:

- root/book context selection and authored-root fallback;
""",
    """For sidebar inventory, parameterize input order and duplicates. Assert:

- root/book context selection and authored-root fallback;
- folder-local filename sorting from physical `index.md` frontmatter, including root and nested
  scopes, non-inheritance, invalid-value fallback, filename-versus-title independence, strict
  `DD.MM.YYYY`/`HH-MM` validation, natural numeric/Unicode case classes, fixed temporal buckets,
  same-date time grouping, deterministic ties, and both directions;
""",
)
