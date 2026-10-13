"use client";

export interface PaginationProps {
  readonly currentPage: number;
  readonly label?: string;
  readonly nextLabel?: string;
  readonly onPageChange: (page: number) => void;
  readonly pageLabel?: (page: number) => string;
  readonly previousLabel?: string;
  readonly totalPages: number;
}

export function paginationWindow(currentPage: number, totalPages: number): number[] {
  const safeTotal = Math.max(1, totalPages);
  const safeCurrent = Math.min(Math.max(1, currentPage), safeTotal);
  const start = Math.max(1, Math.min(safeCurrent - 2, safeTotal - 4));
  return Array.from({ length: Math.min(5, safeTotal) }, (_, index) => start + index);
}

export function Pagination({
  currentPage,
  label = "Pagination",
  nextLabel = "Next page",
  onPageChange,
  pageLabel = (page) => `Page ${page}`,
  previousLabel = "Previous page",
  totalPages,
}: PaginationProps) {
  const safeTotal = Math.max(1, totalPages);
  const safeCurrent = Math.min(Math.max(1, currentPage), safeTotal);
  const pages = paginationWindow(safeCurrent, safeTotal);

  return (
    <nav className="pagination" aria-label={label}>
      <button type="button" onClick={() => onPageChange(safeCurrent - 1)} disabled={safeCurrent === 1} aria-label={previousLabel}>‹</button>
      {pages.map((page) => (
        <button
          aria-current={page === safeCurrent ? "page" : undefined}
          aria-label={pageLabel(page)}
          key={page}
          onClick={() => onPageChange(page)}
          type="button"
        >
          {page}
        </button>
      ))}
      <button type="button" onClick={() => onPageChange(safeCurrent + 1)} disabled={safeCurrent === safeTotal} aria-label={nextLabel}>›</button>
    </nav>
  );
}
