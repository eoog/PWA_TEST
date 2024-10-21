import React, {useEffect, useState} from 'react';
import './App.css';
import YOLOv8ObjectDetection from "./YOLOv8ObjectDetection";
const channel = new BroadcastChannel('url_channel');


function App() {

  const [urls, setUrls] = useState([]);

  useEffect(() => {
    // 현재 URL을 저장
    const currentUrl = window.location.href;
    const storedUrls = JSON.parse(localStorage.getItem('urls')) || [];

    // 새로운 URL 추가
    if (!storedUrls.includes(currentUrl)) {
      storedUrls.push(currentUrl);
      localStorage.setItem('urls', JSON.stringify(storedUrls));
    }

    // 저장된 URL 목록 업데이트
    setUrls(storedUrls);

    // 클린업: 페이지를 떠날 때 URL 제거
    const handleBeforeUnload = () => {
      const updatedUrls = storedUrls.filter(url => url !== currentUrl);
      localStorage.setItem('urls', JSON.stringify(updatedUrls));
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
      <>
      <ul>
        {urls.map((url, index) => (
            <li key={index}>{url}</li>
        ))}
      </ul>
  <YOLOv8ObjectDetection/>
      </>
)
  ;
}

export default App;
