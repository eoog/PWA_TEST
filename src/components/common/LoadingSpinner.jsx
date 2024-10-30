import React from 'react';

const Spinner = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-neutral-200 border-t-blue-500 rounded-full animate-spin"></div>
      <p className="mt-4 text-neutral-500">로딩 중...</p>
    </div>
  );
};

export default Spinner;