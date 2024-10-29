import {Card} from "../components/ui/card";
import React, {useContext, useEffect} from "react";
import {UrlHistoryContext} from "../components/UrlHistoryContext";
import ScreenShareContext from "../components/ScreenShareProvider";


const TextView = () => {
  const urlHistory = useContext(UrlHistoryContext);
  const { stream, videoRef, startScreenShare } = useContext(ScreenShareContext);
  
  // 선정성
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, videoRef]);


  return (
      <>
        <div className="min-h-screen bg-gray-100 p-8 w-full flex flex-col">
          <Card
              className="w-full mt-6 h-full"
              style={{
                maxHeight: '90vh',
                maxWidth: '90vw',
                overflow: 'hidden',
                margin: 'auto',
              }}
          >

            <ul>
              {urlHistory.map((item, index) => (
                  <li key={index} className="url-history-item">
                    <h4>{item.title || 'No Title'}</h4>
                    <p className="url-text">URL : {item.url}</p>
                    <details open={true}>
                      <summary className="details-summary">URL 텍스트 펼치기</summary>
                      <div className="content-container">
                        <p className="content-preview">
                          {item.content ? item.content + '@@@---끝---@@@@'
                              : 'No content available'}
                        </p>
                      </div>
                    </details>
                  </li>
              ))}
            </ul>

          </Card>
        </div>
        {/*선정성 비디오 삭제 금지*/}
        <video ref={videoRef} hidden={true} autoPlay playsInline
               style={{width: '10%', height: 'auto'}}/>
      </>
  )
}

export default TextView