import React, {useState} from "react";
import {Button, Snackbar} from "@mui/material";
import ScreenCapture from "./ScreenCapture";
import YOLOv8ObjectDetection from "./YOLOv8ObjectDetection";

const Pro = () => {
  const [capturedFile, setCapturedFile] = useState(null); // 캡처된 파일 상태
  const [stream, setStream] = useState(null); // 스트림 상태 관리

  return (
     <>
       <ScreenCapture setCapturedFile={setCapturedFile} stream={stream} setStream={setStream} />
       <YOLOv8ObjectDetection capturedFile={capturedFile} />
     </>
  );
};

export default Pro;
