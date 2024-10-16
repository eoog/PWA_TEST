import React, {useEffect} from 'react';
import './App.css';
import YOLOv8ObjectDetection from "./YOLOv8ObjectDetection";



function App() {

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        const messageChannel = new MessageChannel();

        // 서비스 워커에 메시지 전송
        registration.active.postMessage(
            { type: 'GET_CLIENT_URLS' },
            [messageChannel.port2]
        );

        // 서비스 워커로부터 메시지 수신
        messageChannel.port1.onmessage = (event) => {
          const urls = event.data;
          console.log('Opened URLs:', urls);
          // 여기에 URL들을 사용하여 추가적인 로직을 구현할 수 있습니다.
        };
      });
    }
  }, []);

  return (
    <YOLOv8ObjectDetection />
  );
}

export default App;
