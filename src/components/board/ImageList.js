const ImageList = ({images, selectedId, onImageSelect}) => {
  if (images.length === 0) {
    return <p className="text-gray-500">저장된 이미지가 없습니다.</p>;
  }

  return images.map((image) => (
      <div
          key={image.id}
          className={`cursor-pointer p-2 mb-2 w-full text-center transition-colors ${
              image.id === selectedId
                  ? "bg-blue-200"
                  : "bg-gray-200 hover:bg-gray-300"
          }`}
          onClick={() => onImageSelect(image)}
      >
        검출된 이미지 {image.id}
      </div>
  ));
};

export default ImageList