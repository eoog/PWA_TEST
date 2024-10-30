import React, { createContext, useState, useRef } from 'react';

// ScreenShare Context 생성
const ScreenShareContext = createContext();

export const ScreenShareProvider = ({ children }) => {
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });
      setStream(stream);
    } catch (err) {
      console.error('Error starting screen capture: ', err);
    }
  };

  return (
      <ScreenShareContext.Provider value={{ stream, videoRef, startScreenShare }}>
        {children}
      </ScreenShareContext.Provider>
  );
};

export default ScreenShareContext;
