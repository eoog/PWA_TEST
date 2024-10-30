import React, {useEffect, useState} from "react";
import ScreenCapture from "./components/ScreenCapture";
import YOLOv8ObjectDetection from "./components/YOLOv8ObjectDetection";

const Pro = () => {
  const [capturedFile, setCapturedFile] = useState(null); // 캡처된 파일 상태
  const [stream, setStream] = useState(null); // 스트림 상태 관리

  useEffect(() => {
    console.log("111")
  }, []);

  return (
      <>
        <ScreenCapture setCapturedFile={setCapturedFile} stream={stream} setStream={setStream}/>
        <YOLOv8ObjectDetection capturedFile={capturedFile}/>
      </>
  );
};

export default Pro;
