// Modal.js
import React, {forwardRef, useEffect} from 'react';

const ImageModal = forwardRef(({ isOpen, onClose, imageSrc }, ref) => {
  if (!isOpen) return null; // 모달이 열리지 않으면 아무것도 렌더링하지 않음



  return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-lg p-4 relative">
          <button
              className="absolute top-2 right-2 text-red-500"
              onClick={onClose}
          >
            X
          </button>
              <img
                  src={imageSrc}
                  alt="Canvas"
                  style={{ width: '100%', height: '800px', objectFit: 'contain' , padding : '16px' }}
              />
        </div>
      </div>
  );
});

export default ImageModal;
