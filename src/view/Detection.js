// import React, {useEffect, useState} from "react";
//
// const Detection = () => {
//   const [canvasImage, setCanvasImage] = useState(null);
//   const [currentDateTime, setCurrentDateTime] = useState("");
//
//   useEffect(() => {
//     const getImageFromLocalStorage = () => {
//       const image = localStorage.getItem('canvasImage');
//       if (image) {
//         setCanvasImage(image);
//       }
//     };
//
//     // 현재 날짜와 시간을 설정하는 함수
//     const updateCurrentDateTime = () => {
//       const now = new Date();
//       const date = now.toLocaleDateString(); // 날짜 형식: YYYY/MM/DD
//       const time = now.toLocaleTimeString(); // 시간 형식: HH:MM:SS
//       setCurrentDateTime(`${date} ${time}`); // 날짜와 시간 결합
//     };
//
//     getImageFromLocalStorage();
//     const intervalId = setInterval(getImageFromLocalStorage, 1000);
//     updateCurrentDateTime(); // 컴포넌트가 마운트될 때 날짜와 시간을 초기화
//     const dateTimeIntervalId = setInterval(updateCurrentDateTime, 1000); // 매 초마다 날짜와 시간 업데이트
//
//     return () => {
//       clearInterval(intervalId);
//       clearInterval(dateTimeIntervalId); // 클린업: 날짜와 시간 업데이트 인터벌 제거
//     };
//   }, []);
//
//   return (
//       <div className="card-body flex-column">
//         <div style={styles.container}>
//           <div style={styles.dateTime}>일정 시간 실시간 캡쳐 화면 ( 3초 간격 )</div>
//           {canvasImage ? (
//               <>
//                 <img src={canvasImage} alt="Canvas" style={styles.image}/>
//                 <p style={styles.dateTime}>{currentDateTime}</p> {/* 현재 날짜와 시간 표시 */}
//               </>
//           ) : (
//               <p>No image found</p>
//           )}
//         </div>
//       </div>
//   );
// };
//
// const styles = {
//   container: {
//     display: 'flex',
//     flexDirection: 'column', // 세로 방향으로 배치
//     justifyContent: 'center',
//     alignItems: 'center',
//     height: '100vh',
//     textAlign: 'center',
//   },
//   image: {
//     maxWidth: '80%',
//     height: 'auto',
//   },
//   dateTime: {
//     marginTop: '40px', // 이미지와 날짜/시간 간격
//     fontSize: '32px', // 날짜/시간 글자 크기
//     color: '#333', // 날짜/시간 색상
//   },
// };
//
// export default Detection;
