'use client';
import * as React from 'react';

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  ArrowUpDown,
  ChevronDown,
  Loader2,
  MoreHorizontal,
  RefreshCw,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';
import { cleanText, fetchCityName } from '@/lib/utils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const columns: ColumnDef<any>[] = [
  {
    id: 'sno',
    header: 'S.No',
    cell: ({ row }) => row.index + 1,
    enableSorting: false,
  },
  {
    accessorKey: 'Name',
    header: 'Name',
  },
  {
    accessorKey: 'state',
    header: 'Location',
    cell: ({ row }) => <div>{row.getValue('state') || 'Loading...'}</div>,
  },
  {
    accessorKey: 'Severity of domestic violence',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Severity
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => {
      const severity = cleanText(row.getValue('Severity of domestic violence'));
      const severityColors = {
        'Very High': 'bg-red-500 text-white',
        High: 'bg-yellow-500 text-white',
        Medium: 'bg-blue-500 text-white',
        Low: 'bg-green-500 text-white',
      };
      const severityClass =
        severityColors[severity as keyof typeof severityColors] ||
        'bg-gray-300 text-black'; // Default to gray if severity is unknown

      return (
        <div
          className={`priority-badge ${severityClass} mx-auto text-center max-w-[80px] text-[10px] border px-1 py-1 rounded-full`}
        >
          {severity}
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      const priorityOrder = { 'Very High': 0, High: 1, Medium: 2, Low: 3 };
      const severityA = cleanText(
        rowA.getValue('Severity of domestic violence')
      );
      const severityB = cleanText(
        rowB.getValue('Severity of domestic violence')
      );
      return (
        priorityOrder[severityA as keyof typeof priorityOrder] -
        priorityOrder[severityB as keyof typeof priorityOrder]
      );
    },
  },
  {
    accessorKey: 'Nature of domestic violence',
    header: 'Issue',
    cell: ({ row }) => cleanText(row.getValue('Nature of domestic violence')),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status');
      return (
        <div>
          {typeof status === 'string'
            ? status.charAt(0).toUpperCase() + status.slice(1)
            : ''}
        </div>
      );
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const post = row.original;
      const postId = post._id || post.id || '';
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(postId)}
            >
              Copy ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href={`/post/${postId}`}>View Details</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default function RealtimeList() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/getPosts');
      let serverPosts: any[] = [];
      try {
        serverPosts = await response.json();
      } catch {
        serverPosts = [];
      }

      if (!Array.isArray(serverPosts)) {
        serverPosts = [];
      }

      // Check for user-submitted posts stored in browser localStorage
      let localUserPosts: any[] = [];
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('antara_user_posts');
          if (stored) {
            localUserPosts = JSON.parse(stored);
          }
        } catch {}
      }

      // Merge local user submissions with server posts, deduplicating by ID
      const seenIds = new Set<string>();
      const combined: any[] = [];

      for (const item of [...localUserPosts, ...serverPosts]) {
        const id = item._id || item.id || Math.random().toString();
        if (!seenIds.has(id)) {
          seenIds.add(id);
          combined.push({
            ...item,
            _id: id,
          });
        }
      }

      const enrichedData = await Promise.all(
        combined.map(async (post: any) => {
          let state = post.state;
          if (!state && post.Location && typeof post.Location === 'string' && post.Location.includes(',')) {
            try {
              const clenLoc = cleanText(post.Location);
              const [latitude, longitude] = clenLoc.split(',').map(Number);
              if (!isNaN(latitude) && !isNaN(longitude)) {
                state = await fetchCityName(latitude, longitude);
              }
            } catch {}
          }

          return {
            ...post,
            state: state || 'Delhi, India',
          };
        })
      );

      setData(enrichedData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();

    const handleStorage = () => {
      fetchData();
    };

    window.addEventListener('storage', handleStorage);
    const timer = setInterval(() => {
      fetchData();
    }, 5000);

    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(timer);
    };
  }, [fetchData]);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  if (loading) {
    return (
      <div>
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter by name..."
          value={(table.getColumn('Name')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('Name')?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchData()}
            className="gap-1.5 text-xs font-semibold h-9"
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
            Refresh Feed
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-9">
                Columns <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-center">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-center">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length}>No results.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
