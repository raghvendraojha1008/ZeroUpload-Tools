interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

export function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
  const iconSizes = {
    sm: 'size-7',
    md: 'size-9',
    lg: 'size-11',
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Brand Icon Mark */}
      <span
        className={`relative flex ${iconSizes[size]} shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-cyan-500 p-1.5 shadow-md shadow-indigo-500/20`}
      >
        <svg
          viewBox="0 0 32 32"
          className="size-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Code Chevron */}
          <path
            d="M 11 9 L 17 16 L 11 23"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Clean Sparkle */}
          <path
            d="M 22 10.5 C 22 13 24.5 13 24.5 13 C 24.5 13 22 13 22 15.5 C 22 13 19.5 13 19.5 13 C 19.5 13 22 13 22 10.5 Z"
            fill="#ffffff"
          />
          {/* Accent dot */}
          <circle cx="21.5" cy="20.5" r="1.8" fill="#a5f3fc" />
        </svg>
      </span>

      {showText && (
        <span className="flex flex-col leading-none">
          <span className="text-[15px] font-bold tracking-tight text-slate-900 dark:text-slate-100">
            CleanDev
          </span>
          <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-cyan-400">
            Tools
          </span>
        </span>
      )}
    </div>
  )
}
