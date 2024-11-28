const Pagination = ({currentPage, totalPages, onPageChange}) => {
  if (totalPages <= 1) {
    return null;
  }

  return (
      <div className="mt-4">
        {Array.from({length: totalPages}, (_, i) => i + 1).map((number) => (
            <button
                key={number}
                onClick={() => onPageChange(number)}
                className={`px-2 py-1 m-1 ${
                    number === currentPage
                        ? "bg-blue-500 text-white"
                        : "bg-gray-300 hover:bg-gray-400 transition-colors"
                }`}
            >
              {number}
            </button>
        ))}
      </div>
  );
};

export default Pagination
