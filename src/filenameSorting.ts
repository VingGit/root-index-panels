export type FilenameSortDirection = "ascending" | "descending"

type TemporalKind = "plain" | "date-time" | "date" | "time"

interface TokenMatch {
  start: number
  end: number
  value: number
}

interface FilenameSortValue {
  raw: string
  residual: string
  kind: TemporalKind
  date?: number
  time?: number
}

const temporalKindRank: Record<TemporalKind, number> = {
  plain: 0,
  "date-time": 1,
  date: 2,
  time: 3,
}
const uppercaseLetterPattern = /^\p{Lu}$/u
const lowercaseLetterPattern = /^\p{Ll}$/u

export function normalizeFilenameSortDirection(value: unknown): FilenameSortDirection | undefined {
  return value === "ascending" || value === "descending" ? value : undefined
}

export function filenameSortName(filePath: unknown, fallbackSegment: string): string {
  const source = typeof filePath === "string" && filePath.length > 0 ? filePath : fallbackSegment
  const parts = source.split(/[\\/]/)
  const basename = parts.at(-1) ?? fallbackSegment
  return basename.replace(/\.[^.]+$/, "")
}

function isDigit(value: string | undefined): boolean {
  return value !== undefined && value >= "0" && value <= "9"
}

function firstValidDate(name: string): TokenMatch | undefined {
  const matcher = /\d{2}\.\d{2}\.\d{4}/g
  for (const match of name.matchAll(matcher)) {
    const text = match[0]
    const start = match.index
    const end = start + text.length
    if (isDigit(name[start - 1]) || isDigit(name[end])) continue

    const day = Number(text.slice(0, 2))
    const month = Number(text.slice(3, 5))
    const year = Number(text.slice(6, 10))
    if (month < 1 || month > 12 || day < 1) continue

    const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
    const daysInMonth = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    if (day > daysInMonth[month - 1]!) continue

    return { start, end, value: year * 10_000 + month * 100 + day }
  }
  return undefined
}

function firstValidTime(name: string): TokenMatch | undefined {
  const matcher = /\d{2}-\d{2}/g
  for (const match of name.matchAll(matcher)) {
    const text = match[0]
    const start = match.index
    const end = start + text.length
    if (isDigit(name[start - 1]) || isDigit(name[end])) continue

    const hour = Number(text.slice(0, 2))
    const minute = Number(text.slice(3, 5))
    if (hour > 23 || minute > 59) continue

    return { start, end, value: hour * 100 + minute }
  }
  return undefined
}

function residualName(name: string, date: TokenMatch | undefined, time: TokenMatch | undefined): string {
  const ranges: Array<{ start: number; end: number }> = []
  if (date) ranges.push({ start: date.start, end: date.end })
  if (time) ranges.push({ start: time.start, end: time.end })

  if (date && time && date.end <= time.start) {
    const connector = name.slice(date.end, time.start)
    if (/^[\s_.-]*at[\s_.-]*$/i.test(connector)) {
      ranges.length = 0
      ranges.push({ start: date.start, end: time.end })
    }
  }

  ranges.sort((left, right) => right.start - left.start)
  let result = name
  for (const range of ranges) {
    result = result.slice(0, range.start) + result.slice(range.end)
  }

  return result
    .replace(/[_\s]+/g, " ")
    .replace(/^[\s_.-]+|[\s_.-]+$/g, "")
    .trim()
}

function parseFilenameSortValue(name: string): FilenameSortValue {
  const date = firstValidDate(name)
  const time = firstValidTime(name)
  const kind: TemporalKind = date ? (time ? "date-time" : "date") : time ? "time" : "plain"
  return {
    raw: name,
    residual: residualName(name, date, time),
    kind,
    ...(date ? { date: date.value } : {}),
    ...(time ? { time: time.value } : {}),
  }
}

function characterClass(character: string): number {
  if (character >= "0" && character <= "9") return 0
  if (uppercaseLetterPattern.test(character)) return 1
  if (lowercaseLetterPattern.test(character)) return 2
  return 3
}

function readDigits(value: string, start: number): { text: string; end: number } {
  let end = start
  while (end < value.length && characterClass(value[end]!) === 0) end += 1
  return { text: value.slice(start, end), end }
}

function compareDigitRuns(left: string, right: string): number {
  const normalizedLeft = left.replace(/^0+/, "") || "0"
  const normalizedRight = right.replace(/^0+/, "") || "0"
  if (normalizedLeft.length !== normalizedRight.length) {
    return normalizedLeft.length < normalizedRight.length ? -1 : 1
  }
  if (normalizedLeft < normalizedRight) return -1
  if (normalizedLeft > normalizedRight) return 1
  if (left.length !== right.length) return left.length < right.length ? -1 : 1
  return left < right ? -1 : left > right ? 1 : 0
}

function compareNaturalName(
  left: string,
  right: string,
  direction: FilenameSortDirection,
): number {
  let leftIndex = 0
  let rightIndex = 0

  while (leftIndex < left.length && rightIndex < right.length) {
    const leftPoint = left.codePointAt(leftIndex)!
    const rightPoint = right.codePointAt(rightIndex)!
    const leftCharacter = String.fromCodePoint(leftPoint)
    const rightCharacter = String.fromCodePoint(rightPoint)
    const leftClass = characterClass(leftCharacter)
    const rightClass = characterClass(rightCharacter)

    if (leftClass !== rightClass) return leftClass < rightClass ? -1 : 1

    const multiplier = direction === "descending" ? -1 : 1
    if (leftClass === 0) {
      const leftDigits = readDigits(left, leftIndex)
      const rightDigits = readDigits(right, rightIndex)
      const compared = compareDigitRuns(leftDigits.text, rightDigits.text)
      if (compared !== 0) return compared * multiplier
      leftIndex = leftDigits.end
      rightIndex = rightDigits.end
      continue
    }

    if (leftPoint !== rightPoint) return (leftPoint < rightPoint ? -1 : 1) * multiplier
    leftIndex += leftCharacter.length
    rightIndex += rightCharacter.length
  }

  if (left.length === right.length) return 0
  return (left.length < right.length ? -1 : 1) * (direction === "descending" ? -1 : 1)
}

function compareNumber(left: number | undefined, right: number | undefined): number {
  if (left === right) return 0
  if (left === undefined) return 1
  if (right === undefined) return -1
  return left < right ? -1 : 1
}

export function compareFilenameSortNames(
  leftName: string,
  rightName: string,
  direction: FilenameSortDirection,
): number {
  const left = parseFilenameSortValue(leftName)
  const right = parseFilenameSortValue(rightName)

  const kindDifference = temporalKindRank[left.kind] - temporalKindRank[right.kind]
  if (kindDifference !== 0) return kindDifference

  const multiplier = direction === "descending" ? -1 : 1
  if (left.kind === "date-time") {
    const dateDifference = compareNumber(left.date, right.date)
    if (dateDifference !== 0) return dateDifference * multiplier
    const timeDifference = compareNumber(left.time, right.time)
    if (timeDifference !== 0) return timeDifference * multiplier
  } else if (left.kind === "date") {
    const dateDifference = compareNumber(left.date, right.date)
    if (dateDifference !== 0) return dateDifference * multiplier
  } else if (left.kind === "time") {
    const timeDifference = compareNumber(left.time, right.time)
    if (timeDifference !== 0) return timeDifference * multiplier
  }

  const residualDifference = compareNaturalName(left.residual, right.residual, direction)
  if (residualDifference !== 0) return residualDifference

  return compareNaturalName(left.raw, right.raw, direction)
}
