// Modal.js
import React, {forwardRef, useContext, useEffect} from 'react';
import ScreenShareContext from "./ScreenShareProvider";

const Modal = forwardRef(({ isOpen, onClose }, ref) => {
  const { stream, videoRef } = useContext(ScreenShareContext);
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [isOpen]);
  if (!isOpen) return null; // 모달이 열리지 않으면 아무것도 렌더링하지 않음

  return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-lg p-8 relative">
          <button
              className="absolute top-2 right-2 text-red-500"
              onClick={onClose}
          >
            <img src={require("../close.png")} width={50} height={20}/>
          </button>
          <video
              ref={videoRef} // 비디오 스트림을 모달에 전달
              autoPlay
              playsInline
              style={{ width: '100%', height: '800px', objectFit: 'contain' , padding : '16px' }}
          />
        </div>
      </div>
  );
});

export default Modal;
