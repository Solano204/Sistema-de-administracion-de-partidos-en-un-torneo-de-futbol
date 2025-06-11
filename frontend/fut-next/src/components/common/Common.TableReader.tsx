"use client";
import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import clsx from "clsx";
import { Button } from "../ui/button";
import { useTheme } from "next-themes";
import { FaArrowLeft, FaArrowRight, FaSearch } from "react-icons/fa";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  className: string;
  classTable: string;
  title?: string;
}

export function TableReader<TData, TValue>({
  columns,
  data,
  className,
  classTable,
  title = "Table Data",
}: DataTableProps<TData, TValue>) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [searchQuery, setSearchQuery] = React.useState("");

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  // Global filter function
  React.useEffect(() => {
    if (searchQuery) {
      table.setGlobalFilter(searchQuery);
    }
  }, [searchQuery, table]);

  return (
    <div className={clsx("flex flex-col h-full rounded-xl font-sans  ", 
      className,
      isDark 
        ? "bg-gradient-to-br from-slate-900/90 to-slate-800/90 text-white border border-slate-700/50" 
        : "bg-gradient-to-br from-white/90 to-slate-100/90 text-slate-800 border border-slate-200/50",
      "shadow-lg backdrop-blur-md"
    )}>
      {/* Table Header */}
      <div className={clsx(
        "flex items-center justify-between p-4 border-b",
        isDark 
          ? "bg-slate-800/90 border-slate-700/50" 
          : "bg-white/90 border-slate-200/50"
      )}>
        <h3 className="font-bold text-lg">{title}</h3>
        
        {/* Search Input */}
        <div className={clsx(
          "relative flex items-center w-1/3 min-w-48 rounded-full overflow-hidden transition-all duration-300",
          isDark 
            ? "bg-slate-700/50 hover:bg-slate-700/90" 
            : "bg-slate-100 hover:bg-white",
          "hover:shadow-md"
        )}>
          <input
            type="text"
            placeholder="Search..."
            className={clsx(
              "w-full py-2 px-4 outline-none border-none",
              isDark ? "bg-transparent text-white" : "bg-transparent text-slate-800"
            )}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <FaSearch className="mr-4 text-slate-400" />
        </div>
      </div>

      {/* Table Content */}
      <div className="w-full flex-grow overflow-auto">
        <Table className={clsx(classTable, "w-full border-collapse")} >
          <TableHeader className={clsx(
            "sticky top-0 z-10",
            isDark 
              ? "bg-slate-800/90 text-white border-b border-slate-700" 
              : "bg-white/90 text-slate-800 border-b border-slate-300",
            "backdrop-blur-md"
          )}>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className={clsx(
                    "p-3 text-left font-medium cursor-pointer transition-colors",
                    isDark ? "text-white hover:text-indigo-300" : "text-slate-800 hover:text-indigo-600"
                  )}>
                    {flexRender(
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
              table.getRowModel().rows.map((row, index) => (
                <TableRow key={row.id} className={clsx(
                  "transition-all",
                  isDark && index % 2 === 0 
                    ? "bg-slate-800/40 hover:bg-slate-700/60" 
                    : isDark 
                      ? "bg-slate-800/20 hover:bg-slate-700/60" 
                      : index % 2 === 0 
                        ? "bg-slate-100/60 hover:bg-slate-200/80" 
                        : "bg-white/60 hover:bg-slate-200/80"
                )}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="p-3 border-b border-slate-200/20">
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
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className={clsx(
                    "rounded-lg py-8",
                    isDark ? "text-slate-400" : "text-slate-500"
                  )}>
                    No results found
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className={clsx(
        "flex items-center justify-between p-4 border-t",
        isDark 
          ? "bg-slate-800/90 border-slate-700/50" 
          : "bg-white/90 border-slate-200/50"
      )}>
        <div className="text-sm text-slate-500">
          {table.getFilteredRowModel().rows.length} results
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={isDark ? "outline" : "secondary"}
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className={clsx(
              "rounded-full",
              !table.getCanPreviousPage() 
                ? "opacity-50 " 
                : isDark 
                  ? "hover:bg-slate-700 hover:text-white" 
                  : "hover:bg-slate-200"
            )}
          >
            <FaArrowLeft className="mr-2" size={12} />
            Previous
          </Button>
          
          <span className={clsx(
            "px-3 py-1 rounded",
            isDark ? "bg-slate-700 text-white" : "bg-slate-100 text-slate-800"
          )}>
            {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </span>
          
          <Button
            variant={isDark ? "outline" : "secondary"}
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className={clsx(
              "rounded-full",
              !table.getCanNextPage() 
                ? "opacity-50 " 
                : isDark 
                  ? "hover:bg-slate-700 hover:text-white" 
                  : "hover:bg-slate-200"
            )}
          >
            Next
            <FaArrowRight className="ml-2" size={12} />
          </Button>
        </div>
      </div>
    </div>
  );
}