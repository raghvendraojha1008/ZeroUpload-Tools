import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

export interface Crumb {
  label: string
  to?: string
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
        <li>
          <Link
            to="/"
            aria-label="Home"
            className="flex items-center transition hover:text-slate-900 dark:hover:text-slate-200"
          >
            <Home className="size-3.5" />
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <Fragment key={`${item.label}-${index}`}>
              <li aria-hidden="true" className="text-slate-500 dark:text-slate-400">
                <ChevronRight className="size-3.5" />
              </li>
              <li>
                {item.to && !isLast ? (
                  <Link
                    to={item.to}
                    className="transition hover:text-slate-900 dark:hover:text-slate-200"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span aria-current={isLast ? 'page' : undefined} className="text-slate-700 dark:text-slate-300">
                    {item.label}
                  </span>
                )}
              </li>
            </Fragment>
          )
        })}
      </ol>
    </nav>
  )
}
