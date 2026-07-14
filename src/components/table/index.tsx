import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

type DataTableProps = {
  headers: string[]
  children: React.ReactNode
}

export const DataTable = ({ headers, children }: DataTableProps) => {
  return (
    <Table className="overflow-hidden">
      <TableHeader>
        <TableRow className="border-slate-100 bg-slate-50/70 hover:bg-slate-50/70">
          {headers.map((header, key) => (
            <TableHead
              key={key}
              className={cn(
                key == headers.length - 1 && 'text-right',
                'h-11 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400'
              )}
            >
              {header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>{children}</TableBody>
    </Table>
  )
}
