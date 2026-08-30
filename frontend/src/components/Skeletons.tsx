import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'

// A table-shaped skeleton: real header labels (so the columns read
// immediately) over shimmering body rows with varied bar widths, so it
// doesn't look like one flat gray block.
export function TableSkeleton({ columns, rows = 6 }: { columns: string[]; rows?: number }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((label) => (
            <TableHead key={label}>{label}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: rows }).map((_, row) => (
          <TableRow key={row} className="hover:bg-transparent">
            {columns.map((label, col) => (
              <TableCell key={label}>
                <Skeleton className="h-4" style={{ width: `${55 + ((row * 7 + col * 17) % 35)}%` }} />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

// Matches StatCard/StatTile/QuickLink: an icon square beside a label +
// value (or title + description). `compact` matches the smaller tile size
// used for secondary stats and quick links.
export function StatCardSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <Card>
      <CardContent className={cn('flex items-center pt-6', compact ? 'gap-3' : 'gap-4')}>
        <Skeleton className={compact ? 'size-10 shrink-0 rounded-lg' : 'size-12 shrink-0 rounded-xl'} />
        <div className="space-y-2">
          <Skeleton className={compact ? 'h-3 w-16' : 'h-3 w-20'} />
          <Skeleton className={compact ? 'h-5 w-12' : 'h-7 w-14'} />
        </div>
      </CardContent>
    </Card>
  )
}

// Matches the small bordered "value over label" tiles used for cohort/
// meditation metrics (e.g. "12/40 (30%)" over "Checked in this week").
export function MetricTileSkeleton() {
  return (
    <div className="rounded-lg border bg-muted/30 px-4 py-3">
      <Skeleton className="h-6 w-16" />
      <Skeleton className="mt-2 h-3 w-24" />
    </div>
  )
}

// A row of bars with varied heights standing in for a bar/line chart,
// instead of one flat rectangle.
export function ChartSkeleton({ className }: { className?: string }) {
  const heights = [42, 68, 55, 80, 60, 90, 48, 72, 58, 85, 62, 76]
  return (
    <div className={className ?? 'flex h-44 items-end gap-2 sm:h-52'}>
      {heights.map((height, i) => (
        <Skeleton key={i} className="flex-1 rounded-b-none" style={{ height: `${height}%` }} />
      ))}
    </div>
  )
}
