import {Card, CardContent, CardHeader} from "../common/Card";
import Spinner                         from "../common/LoadingSpinner";

const ImageCard = ({title, image, isLoading, error, onClick}) => {
  const renderEmptyState = () => (
      <div className="flex flex-col items-center justify-center">
        <img
            className="w-24 h-24 mb-4"
            src={require('../../images/meer.ico')}
            alt="Empty state"
        />
        <p className="text-xl font-semibold text-center text-neutral-500">
          저장된 이미지가 없습니다.
        </p>
      </div>
  );

  return (
      <Card className="h-full">
        <CardContent
            className="h-full items-center justify-center"
            onClick={() => image && onClick(image, title)}
            style={{cursor: image ? 'pointer' : 'default'}}
        >
          <CardHeader
              className="text-neutral-500 font-bold text-lg md:text-2xl">
            <div className="flex gap-4 md:gap-6 items-center justify-center">
              <div>{title}</div>
            </div>
          </CardHeader>
          <div
              className="items-center flex justify-center min-h-[200px] md:min-h-[300px]">
            {isLoading ? (
                <Spinner/>
            ) : image ? (
                <div className="relative group">
                  <img
                      src={image}
                      alt={title}
                      className="max-h-[300px] md:max-h-[500px] w-full object-contain"
                  />
                  <div
                      className="absolute bottom-2 right-2 text-xs md:text-sm text-gray-500 bg-white bg-opacity-75 px-2 py-1 rounded">
                    클릭하여 확대
                  </div>
                </div>
            ) : error ? (
                renderEmptyState()
            ) : null}
          </div>
        </CardContent>
      </Card>
  );
};

export default ImageCard