from pathlib import Path

architecture_path = Path(".github/instructions/architecture.instructions.md")
architecture = architecture_path.read_text()
old_architecture = (
    "Cards/list reflow to one column, preserve forced-color focus, and remove nonessential motion "
    "under\nreduced-motion. Return actions never obscure narrow content. Folder rows, disclosures, "
    "switchers,\nlinks, and sort controls must remain keyboard accessible at zoom and mobile widths.\n"
)
new_architecture = (
    "Cards/list reflow to one column, preserve forced-color focus, and remove nonessential motion "
    "under\nreduced-motion. The Explore library action, folder rows, disclosures, switchers, links, "
    "and sort\ncontrols must remain keyboard accessible at zoom and mobile widths.\n"
)
if architecture.count(old_architecture) != 1:
    raise SystemExit(
        f"expected one stale return-action sentence, found {architecture.count(old_architecture)}"
    )
architecture_path.write_text(architecture.replace(old_architecture, new_architecture))

verification_path = Path(".github/instructions/verification.instructions.md")
verification = verification_path.read_text()
old_verification = (
    "- safe decorative hooks, distinct note/Canvas/Base SVGs, Explorer opt-in emission, and valid\n"
    "  zero/one/many/long-label states; and\n"
    "- scoped book accents on selected rows, exact-current home, and collapsed hidden active paths "
    "without\n  cross-book leakage; and\n"
)
new_verification = (
    "- safe decorative hooks, distinct note/Canvas/Base SVGs, Explorer opt-in emission, and valid\n"
    "  zero/one/many/long-label states;\n"
    "- scoped book accents on selected rows, exact-current home, and collapsed hidden active paths "
    "without\n  cross-book leakage; and\n"
)
if verification.count(old_verification) != 1:
    raise SystemExit(
        f"expected one duplicated conjunction, found {verification.count(old_verification)}"
    )
verification_path.write_text(verification.replace(old_verification, new_verification))
