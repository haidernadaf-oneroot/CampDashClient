import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo } from "react";

const Pagination = ({
  currentPage,
  totalPages,
  totalRecords,
  limit,
  handlePageChange,
  loading,
}) => {
  const pageNumbers = useMemo(() => {
    const pages = [];
    let startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);
    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }, [currentPage, totalPages]);

  return (
    <div className="flex items-center justify-between p-4 border-t bg-slate-50">
      <div className="text-sm text-slate-600">
        Showing{" "}
        <span className="font-medium">{(currentPage - 1) * limit + 1}</span> to{" "}
        <span className="font-medium">
          {Math.min(currentPage * limit, totalRecords)}
        </span>{" "}
        of <span className="font-medium">{totalRecords}</span> records
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1 || loading}
          className={`h-8 w-8 rounded border text-sm font-medium transition-colors ${
            currentPage === 1 || loading
              ? "border-slate-200 text-slate-400 cursor-not-allowed"
              : "border-slate-300 text-slate-700 hover:bg-slate-50"
          }`}
        >
          {"<<"}
        </button>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading}
          className={`h-8 w-8 rounded border flex items-center justify-center transition-colors ${
            currentPage === 1 || loading
              ? "border-slate-200 text-slate-400 cursor-not-allowed"
              : "border-slate-300 text-slate-700 hover:bg-slate-50"
          }`}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pageNumbers.map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            disabled={loading}
            className={`h-8 w-8 rounded text-sm font-medium transition-colors ${
              currentPage === page
                ? "bg-purple-600 text-white border border-purple-600"
                : loading
                ? "border-slate-200 text-slate-400 cursor-not-allowed"
                : "border border-slate-300 text-slate-700 hover:bg-slate-50"
            }`}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || loading}
          className={`h-8 w-8 rounded border flex items-center justify-center transition-colors ${
            currentPage === totalPages || loading
              ? "border-slate-200 text-slate-400 cursor-not-allowed"
              : "border-slate-300 text-slate-700 hover:bg-slate-50"
          }`}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages || loading}
          className={`h-8 w-8 rounded border text-sm font-medium transition-colors ${
            currentPage === totalPages || loading
              ? "border-slate-200 text-slate-400 cursor-not-allowed"
              : "border-slate-300 text-slate-700 hover:bg-slate-50"
          }`}
        >
          {">>"}
        </button>
      </div>
    </div>
  );
};

export default Pagination;
