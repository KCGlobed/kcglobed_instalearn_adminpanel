import React from 'react';
import { FiChevronLeft, FiChevronRight, FiChevronUp, FiChevronDown } from 'react-icons/fi';

export type ColumnDefinition<T> = {
  key: keyof T;
  title: string;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  onClick?: (value: T[keyof T], row: T) => void;
  width?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
};

type Props<T> = {
  data: T[];
  columns: ColumnDefinition<T>[];
  currentPage: number;
  pageSize: number;
  totalCount: number;
  loading?: boolean;
  onPageChange: (page: number) => void;
  onSort?: (key: keyof T, direction: 'asc' | 'desc') => void;
  className?: string;
};

function DynamicServerTable<T extends object>({
  data,
  columns,
  currentPage,
  pageSize,
  totalCount,
  loading = false,
  onPageChange,
  onSort,
  className = '',
}: Props<T>) {
  const totalPages = Math.ceil(totalCount / pageSize);
  const [activeSort, setActiveSort] = React.useState<{ key: keyof T | null; direction: 'asc' | 'desc' }>({
    key: null,
    direction: 'asc',
  });

  const handleSort = (key: keyof T) => {
    const direction = activeSort.key === key && activeSort.direction === 'asc' ? 'desc' : 'asc';
    setActiveSort({ key, direction });

    if (onSort) {
      onSort(key, direction);
    }
  };

  const sortedData = React.useMemo(() => {
    // If onSort is provided, we assume the parent handles sorting (server-side)
    if (onSort || !activeSort.key) return data;

    return [...data].sort((a, b) => {
      const aVal = a[activeSort.key!];
      const bVal = b[activeSort.key!];

      if (aVal === bVal) return 0;

      // Handle different types (strings, numbers, etc.)
      const factor = activeSort.direction === 'asc' ? 1 : -1;

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return factor * aVal.localeCompare(bVal);
      }

      return aVal > bVal ? factor : -factor;
    });
  }, [data, activeSort, onSort]);

  const renderSkeleton = () =>
    Array.from({ length: pageSize }).map((_, i) => (
      <tr key={i} className="border-b border-gray-50 last:border-0 animate-pulse">
        {columns.map((col, j) => (
          <td
            key={j}
            className="px-6 py-4 mr-2"
            style={{
              textAlign: col.align || 'left',
              width: col.width || 'auto',
              minWidth: col.width || '150px',
            }}
          >
            <div className="h-4 bg-gray-100 rounded-md w-3/4"></div>
          </td>
        ))}
      </tr>
    ));

  return (
    <div className={`flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>
      {/* Table Container */}
      <div className="overflow-x-auto custom-scrollbar">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 border-separate border-spacing-0">
              <thead className="sticky top-0 z-20 shadow-sm">
                <tr>
                  {columns.map(col => (
                    <th
                      key={String(col.key)}
                      className={`px-6 py-4 text-[11px] font-bold uppercase tracking-widest transition-colors bg-[#1e1b4b] text-white border-b border-white/10 ${col.sortable ? 'cursor-pointer select-none active:bg-indigo-950' : ''
                        }`}
                      style={{
                        textAlign: col.align || 'left',
                        width: col.width || 'auto',
                        minWidth: col.width || '150px',
                      }}
                      onClick={() => col.sortable && handleSort(col.key)}
                    >
                      <div className={`flex items-center gap-2 ${col.align === 'right' ? 'justify-end' :
                          col.align === 'center' ? 'justify-center' : 'justify-start'
                        }`}>
                        <span>{col.title}</span>
                        {col.sortable && (
                          <div className="flex flex-col -space-y-1.5 translate-y-[1px]">
                            <FiChevronUp
                              className={`h-3.5 w-3.5 transition-all duration-200 ${activeSort.key === col.key && activeSort.direction === 'asc'
                                  ? 'text-blue-400 scale-110'
                                  : 'text-white/30'
                                }`}
                            />
                            <FiChevronDown
                              className={`h-3.5 w-3.5 transition-all duration-200 ${activeSort.key === col.key && activeSort.direction === 'desc'
                                  ? 'text-blue-400 scale-110'
                                  : 'text-white/30'
                                }`}
                            />
                          </div>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {loading ? (
                  renderSkeleton()
                ) : sortedData.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center max-w-xs mx-auto">
                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 border border-gray-100">
                          <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <h3 className="text-sm font-bold text-gray-900">No records found</h3>
                        <p className="text-xs text-gray-400 mt-1">There are no entries to display at the moment.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sortedData.map((row, i) => (
                    <tr
                      key={i}
                      className="group hover:bg-blue-50/20 transition-colors duration-150 ease-in-out"
                    >
                      {columns.map(col => (
                        <td
                          key={String(col.key)}
                          className={`px-6 py-4 text-xs whitespace-nowrap ${col.onClick ? 'cursor-pointer' : ''
                            }`}
                          style={{
                            textAlign: col.align || 'left',
                            width: col.width || 'auto',
                            minWidth: col.width || '150px',
                          }}
                          onClick={() => col.onClick?.(row[col.key], row)}
                        >
                          <div className={`
                            ${col.onClick ? 'text-blue-600 font-semibold hover:text-blue-700 hover:underline decoration-blue-200 underline-offset-[6px]' : 'text-gray-600 font-medium'}
                            ${col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : 'justify-start'}
                            flex items-center
                          `}>
                            {col.render ? col.render(row[col.key], row) : String(row[col.key])}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="px-6 py-4 bg-[#fcfcfd] border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-gray-400 font-medium">
          Showing <span className="text-gray-900">{(currentPage - 1) * pageSize + 1}</span> to{' '}
          <span className="text-gray-900">{Math.min(currentPage * pageSize, totalCount)}</span> of{' '}
          <span className="text-gray-900">{totalCount}</span> entries
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Previous Page"
            >
              <FiChevronLeft size={18} />
            </button>

            <div className="flex items-center gap-1 px-1">
              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                let pageNum;
                if (totalPages <= 5) pageNum = i + 1;
                else if (currentPage <= 3) pageNum = i + 1;
                else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                else pageNum = currentPage - 2 + i;

                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={`min-w-[34px] h-[34px] rounded-lg text-xs font-bold transition-all ${currentPage === pageNum
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-100'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {totalPages > 5 && currentPage < totalPages - 2 && (
                <>
                  <span className="px-2 text-gray-300 text-xs font-bold">...</span>
                  <button
                    onClick={() => onPageChange(totalPages)}
                    className={`min-w-[34px] h-[34px] rounded-lg text-xs font-bold transition-all ${currentPage === totalPages
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-100'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                      }`}
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Next Page"
            >
              <FiChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DynamicServerTable;
