import { useRef, useState, type DragEvent } from 'react'
import { FileUp, Upload, type LucideIcon } from 'lucide-react'
import { cn } from '../lib/cn'

interface FileDropZoneProps {
  accept: string
  fileName: string | null
  onFile: (file: File) => void
  title: string
  hint: string
  icon?: LucideIcon
}

/** Drag-and-drop file picker shared by the file-based tools. */
export function FileDropZone({
  accept,
  fileName,
  onFile,
  title,
  hint,
  icon: Icon = Upload,
}: FileDropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  function handleFiles(files: FileList | null) {
    const file = files?.[0]
    if (file) onFile(file)
  }

  function handleDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault()
    setIsDragging(false)
    handleFiles(event.dataTransfer.files)
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(event) => {
          handleFiles(event.target.files)
          event.target.value = ''
        }}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'group flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-6 text-center transition',
          isDragging
            ? 'border-indigo-500 bg-indigo-500/[0.06]'
            : 'border-slate-300 bg-slate-50/60 hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900/40 dark:hover:border-slate-600 dark:hover:bg-slate-800/60',
        )}
      >
        <span
          className={cn(
            'flex size-9 items-center justify-center rounded-lg border transition',
            isDragging
              ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300'
              : 'border-slate-200 bg-white text-slate-500 group-hover:text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400 dark:group-hover:text-slate-200',
          )}
        >
          {fileName ? <FileUp className="size-4" /> : <Icon className="size-4" />}
        </span>

        {fileName ? (
          <>
            <span className="max-w-full truncate font-mono text-xs text-slate-700 dark:text-slate-300">
              {fileName}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Loaded locally — drop another file to replace it
            </span>
          </>
        ) : (
          <>
            <span className="text-[13px] font-medium text-slate-700 dark:text-slate-300">
              {title}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">{hint}</span>
          </>
        )}
      </button>
    </>
  )
}
