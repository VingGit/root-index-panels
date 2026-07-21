import { describe, expect, it } from "vitest"

import { compareBooks } from "../src/components/scripts/panels.inline"

function book(title: string, date: number, index: number) {
  return {
    element: document.createElement("li"),
    title,
    date,
    index,
  }
}

describe("root library sorting", () => {
  const books = [book("Zulu", 10, 0), book("alpha", 30, 1), book("Alpha", 20, 2)]

  it("sorts dates in both directions with deterministic title ties", () => {
    expect(
      [...books].sort((a, b) => compareBooks(a, b, "date-desc")).map((item) => item.date),
    ).toEqual([30, 20, 10])
    expect(
      [...books].sort((a, b) => compareBooks(a, b, "date-asc")).map((item) => item.date),
    ).toEqual([10, 20, 30])
  })

  it("sorts titles in both directions without dropping entries", () => {
    expect(
      [...books].sort((a, b) => compareBooks(a, b, "title-asc")).map((item) => item.title),
    ).toEqual(["Alpha", "alpha", "Zulu"])
    expect(
      [...books].sort((a, b) => compareBooks(a, b, "title-desc")).map((item) => item.title),
    ).toEqual(["Zulu", "alpha", "Alpha"])
  })
})
