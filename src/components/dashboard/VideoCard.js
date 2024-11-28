import React                           from 'react';
import {Card, CardContent, CardHeader} from "../common/Card";

const VideoCard = ({stream, videoRef, startScreenShare, onVideoClick}) => {
  const isStreamEnded = !stream || stream.getTracks().every(
      track => track.readyState === "ended");

  const StartSharingMessage = () => (
      <div
          onClick={startScreenShare}
          className="flex flex-col items-center justify-center h-[50vh] text-neutral-500 cursor-pointer rounded-lg hover:bg-neutral-200 transition-colors"
      >
        <img
            className="w-24 h-24 mb-4 opacity-80"
            src={require('../../images/meer.ico')}
            alt="Start sharing"
        />
        <p className="text-xl font-semibold">
          {stream ? "화면 공유가 중지되었습니다" : "화면 공유가 시작되지 않았습니다"}
        </p>
        <p className="mt-2">화면 공유를 {stream ? "다시 " : ""}시작하려면 클릭하세요</p>
      </div>
  );

  const VideoStream = () => (
      <video
          ref={videoRef}
          autoPlay
          playsInline
          onClick={onVideoClick}
          className="w-full h-full object-contain"
      />
  );

  return (
      <Card className="w-full mt-4 md:mt-6 mx-auto overflow-hidden">
        <CardContent
            className="p-2 md:p-4"
            style={{
              cursor: stream ? 'pointer' : 'default',
              maxHeight: '90vh',
            }}
        >
          <CardHeader
              className="text-neutral-500 font-bold text-lg md:text-2xl mb-4">
            <div className="flex gap-4 md:gap-6 items-center justify-center">
              <div>실시간 화면 공유</div>
            </div>
          </CardHeader>
          <div className="w-full h-full">
            {isStreamEnded ? <StartSharingMessage/> : <VideoStream/>}
          </div>
        </CardContent>
      </Card>
  );
};

export default VideoCard;