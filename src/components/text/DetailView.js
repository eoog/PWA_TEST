import {VIEW_MODES}         from "../../constants";
import {hasGamblingContent} from "./GamblingDetection";
import ContentPreview       from "./ContentPreview";
import ScreenshotView       from "./ScreenshotView";

const DetailView = ({item, viewMode, onImageClick}) => {
  if (!item) {
    return (
        <div
            className="flex items-center justify-center h-full text-gray-500 text-sm sm:text-base">
          URL을 선택해주세요.
        </div>
    );
  }

  return (
      <div className="space-y-2 sm:space-y-4">
        <div className="bg-white p-2 sm:p-4 rounded">
          <h2 className="text-lg sm:text-xl font-bold break-words">
            {item.title}
            {viewMode === VIEW_MODES.DETECTIONS && (
                <span className="text-red-400 pl-4">
              score: {item.score}
            </span>
            )}
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 break-words">{item.url}</p>
        </div>

        {item.screenshot && (
            <ScreenshotView
                screenshot={item.screenshot}
                title={item.title}
                viewMode={viewMode}
                onImageClick={onImageClick}
            />
        )}

        {hasGamblingContent(item.content) && (
            <div
                className="bg-red-50 border-l-4 border-red-500 p-2 sm:p-4 rounded">
          <span
              className="text-red-700 font-semibold flex items-center gap-2 text-sm sm:text-base">
            ⚠️ 도박성 컨텐츠 검출
          </span>
            </div>
        )}

        <ContentPreview content={item.content}/>
      </div>
  );
};

export default DetailView