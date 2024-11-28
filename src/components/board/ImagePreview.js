const ImagePreview = ({image, onClick}) => {
  if (!image) {
    return <p className="text-gray-500">이미지를 선택하세요.</p>;
  }

  return (
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4">선택된 이미지</h2>
        <div
            className="relative group cursor-pointer"
            onClick={() => onClick(image)}
        >
          <img
              src={image.data}
              alt={`이미지 ${image.id}`}
              className="max-w-full h-auto rounded-lg shadow-lg"
          />
          <div
              className="absolute bottom-2 right-2 text-sm text-gray-500 bg-white bg-opacity-75 px-2 py-1 rounded">
            클릭하여 확대
          </div>
        </div>
      </div>
  );
};

export default ImagePreview