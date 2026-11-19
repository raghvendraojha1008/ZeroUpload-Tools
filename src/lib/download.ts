/** Human-readable byte size used by the newer tools (1.4 KB, 12 MB, …). */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '—'
  if (bytes < 1024) return `${bytes} B`

  const units = ['KB', 'MB', 'GB']
  let value = bytes / 1024
  let unit = 0

  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit += 1
  }

  return `${value < 10 ? value.toFixed(1) : Math.round(value).toLocaleString()} ${units[unit]}`
}

/**
 * Saves data with an object URL. Everything stays on the device: the browser
 * writes the Blob straight to the downloads folder, with no network round-trip.
 */
export function triggerDownload(data: BlobPart, filename: string, mime: string): void {
  const blob = new Blob([data], { type: mime })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
