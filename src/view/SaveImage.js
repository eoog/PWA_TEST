import { useEffect, useState } from "react";

export default function SaveImage() {
  const [images, setImages] = useState([]); // IndexedDB에서 불러온 이미지 목록
  const [selectedImageIndex, setSelectedImageIndex] = useState(0); // 현재 선택된 이미지 인덱스
  const [currentPage, setCurrentPage] = useState(0); // 현재 페이지 인덱스
  const [loading, setLoading] = useState(false); // 이미지 삭제 중 여부

  // 컴포넌트가 마운트될 때 IndexedDB에서 이미지 불러오기
  useEffect(() => {
    const loadImages = () => {
      loadImagesFromIndexedDB().then((loadedImages) => {
        setImages(loadedImages); // 불러온 이미지 목록을 상태에 저장
      });
    };

    loadImages(); // 처음 한 번 이미지를 불러옴

    // 10초마다 이미지를 다시 불러옴
    const intervalId = setInterval(loadImages, 5000);

    // 컴포넌트 언마운트 시 인터벌 정리
    return () => clearInterval(intervalId);
  }, []);

  // 다음 이미지로 이동
  const handleNextClick = () => {
    const nextIndex = selectedImageIndex + 1;

    // 현재 선택된 이미지가 마지막 이미지인지 확인
    if (nextIndex >= endIndex) {
      // 다음 페이지가 있을 때
      if ((currentPage + 1) * 10 < images.length) {
        const newPage = currentPage + 1;
        setCurrentPage(newPage); // 페이지 변경
        setSelectedImageIndex(newPage * 10); // 새 페이지의 첫 번째 이미지 선택
      }
    } else {
      // 선택된 이미지 인덱스 변경
      setSelectedImageIndex(nextIndex);
    }
  };

  // 이전 이미지로 이동
  const handlePrevClick = () => {
    const prevIndex = selectedImageIndex - 1;

    // 현재 선택된 이미지가 첫 페이지의 첫 번째 이미지인지 확인
    if (prevIndex < startIndex) {
      // 이전 페이지가 있을 때
      if (currentPage > 0) {
        const newPage = currentPage - 1;
        setCurrentPage(newPage); // 페이지 변경
        setSelectedImageIndex(newPage * 10 + 9); // 새 페이지의 마지막 이미지 선택
      }
    } else {
      // 선택된 이미지 인덱스 변경
      setSelectedImageIndex(prevIndex);
    }
  };

  // 페이지를 전환하여 다음 10개의 이미지 표시
  const handleNextPage = () => {
    if ((currentPage + 1) * 10 < images.length) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      setSelectedImageIndex(newPage * 10); // 새 페이지의 첫 번째 이미지 선택
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      setSelectedImageIndex(newPage * 10 + 9); // 새 페이지의 마지막 이미지 선택
    }
  };

  // 이미지 리스트에서 클릭한 이미지를 선택
  const handleImageClick = (index) => {
    setSelectedImageIndex(index); // 선택한 이미지 인덱스로 설정
  };

  // 모든 이미지 삭제
  const clearImages = () => {
    setImages([]); // 상태를 초기화하여 UI 업데이트
    setSelectedImageIndex(0);
    setCurrentPage(0);
    setLoading(true); // 로딩 상태 설정
    clearDatabase().then(() => {
      setImages([]); // 상태를 초기화하여 UI 업데이트
      setSelectedImageIndex(0);
      setCurrentPage(0);
      setLoading(false); // 로딩 상태 해제
    });
  };

  // 표시할 이미지 슬라이스 계산
  const startIndex = currentPage * 10;
  const endIndex = startIndex + 10;
  const displayedImages = images.slice(startIndex, endIndex);

  return (
      <div style={styles.container}>
        {/* 이미지 삭제 버튼 */}
        <button onClick={clearImages} style={styles.deleteButton}>
          이미지 삭제
        </button>

        {/* 로딩 상태에 따른 스피너 표시 */}
        {loading && <div style={styles.spinner}></div>}

        {/* 중앙: 선택한 이미지 표시 */}
        <div style={styles.centerPanel}>
          {images.length > 0 ? (
              <div style={styles.selectedImageContainer}>
                <img
                    src={images[selectedImageIndex]?.data}
                    alt="Selected"
                    style={styles.selectedImage}
                />
              </div>
          ) : (
              <div style={styles.placeholderImage}>
                <p>검출된 이미지가 없습니다.</p>
              </div>
          )}
        </div>

        {/* 아래: 이미지 미리보기 리스트 */}
        <div style={styles.thumbnailContainer}>
          {currentPage > 0 && (
              <button onClick={handlePrevClick} style={styles.arrowButton}>
                ◀&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </button>
          )}
          <div style={styles.thumbnailWrapper}>
            {displayedImages.map((image, index) => {
              const currentIndex = startIndex + index; // 현재 이미지 인덱스 계산
              return (
                  <div key={index} style={styles.thumbnailItem}>
                    <img
                        src={image.data}
                        alt={`Thumbnail ${currentIndex + 1}`} // 인덱스 조정
                        style={{
                          ...styles.thumbnail,
                          border: currentIndex === selectedImageIndex
                              ? '5px solid green' : 'none' // 선택된 이미지에 초록색 테두리
                        }}
                        onClick={() => handleImageClick(currentIndex)} // 선택한 이미지 인덱스 설정
                        onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.5)")}
                        onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
                    />
                  </div>
              );
            })}
          </div>
          {endIndex >= images.length ? (
              <span style={styles.endText}>  </span>
          ) : (
              <button onClick={handleNextClick} style={styles.pageButton}>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ▶
              </button>
          )}
        </div>
      </div>
  );
}

// IndexedDB 열기 및 데이터베이스 설정
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("CanvasDB", 1);

    request.onerror = (event) => {
      console.error("IndexedDB error:", event.target.errorCode);
      reject(event.target.errorCode);
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      db.createObjectStore("images", {keyPath: "id", autoIncrement: true});
    };
  });
}

// 모든 이미지 삭제 함수
function clearDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase("CanvasDB");

    request.onerror = (event) => {
      console.error("Error deleting IndexedDB:", event.target.errorCode);
      reject(event.target.errorCode);
    };

    request.onsuccess = () => {
      console.log("IndexedDB deleted successfully");
      resolve();
    };
  });
}

// IndexedDB에서 저장된 모든 이미지를 불러오는 함수
function loadImagesFromIndexedDB() {
  return new Promise((resolve, reject) => {
    openDatabase().then((db) => {
      const transaction = db.transaction("images", "readonly");
      const store = transaction.objectStore("images");
      const request = store.getAll(); // 모든 이미지 불러오기

      request.onsuccess = (event) => {
        resolve(event.target.result); // 모든 이미지를 배열로 반환
      };

      request.onerror = (event) => {
        console.error("Error loading images from IndexedDB:", event.target.errorCode);
        reject(event.target.errorCode);
      };
    });
  });
}

// 스타일 객체
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    width: '100%',
    position: 'relative',
  },
  centerPanel: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '80%',
    height: '60%',
  },
  selectedImageContainer: {
    position: 'relative',
  },
  thumbnailContainer: {
    display: 'flex',
    alignItems: 'center',
    marginTop: '5px',
    overflow: 'hidden',
  },
  thumbnailWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  thumbnailItem: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '0 5px',
  },
  thumbnail: {
    width: '100px',
    height: '100px',
    objectFit: 'cover',
    cursor: 'pointer',
    transition: 'transform 0.3s',
  },
  selectedImage: {
    maxWidth: '100%',
    maxHeight: '100%',
  },
  arrowButton: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '2rem',
    cursor: 'pointer',
    color: '#333',
    margin: '10px',
  },
  pageButton: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: '#333',
    margin: '10px',
  },
  endText: {
    color: '#999',
  },
  clearButton: {
    marginTop: '10px',
    padding: '10px 20px',
    backgroundColor: '#ff4d4d',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  placeholderImage: {
    width: '80%',
    height: '60%',
    display: 'flex',
    justifyContent: 'center', // 수평 중앙 정렬
    alignItems: 'center', // 수직 중앙 정렬
    border: '1px dashed #ccc',
    backgroundColor: '#f9f9f9',
    textAlign: 'center', // 텍스트 중앙 정렬
  },
  placeholderThumbnail: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100px',
    width: '100%',
    color: '#999',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '8px solid rgba(0, 0, 0, 0.1)', // 배경
    borderTop: '8px solid #3498db', // 스피너 색상
    borderRadius: '50%',
    animation: 'spin 1s linear infinite', // 회전 애니메이션
    margin: '20px auto', // 중앙 정렬
  },
};

// CSS 애니메이션 정의
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}`, styleSheet.cssRules.length);
