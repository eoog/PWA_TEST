const TabButton = ({active, onClick, children}) => (
    <button
        onClick={onClick}
        className={`px-2 sm:px-4 py-1 sm:py-2 text-sm sm:text-base rounded transition-colors ${
            active
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
        }`}
    >
      {children}
    </button>
);

export default TabButton