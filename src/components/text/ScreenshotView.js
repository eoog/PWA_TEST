import {VIEW_MODES} from "../../constants";

const ScreenshotView = ({screenshot, title, viewMode, onImageClick}) => (
    <div className="mb-4 sm:mb-6">
      <h4 className="font-semibold mb-2 text-sm sm:text-base">
        {viewMode === VIEW_MODES.DETECTIONS ? '검출 스크린샷' : '스크린샷'}
      </h4>
      <div className="relative w-full sm:flex sm:justify-center">
        <div
            className="relative group cursor-pointer"
            onClick={() => onImageClick(screenshot, title)}
        >
          <img
              src={screenshot}
              alt={`${viewMode === VIEW_MODES.DETECTIONS ? '검출' : ''} 스크린샷`}
              className="w-full sm:w-auto rounded-lg shadow-md object-contain max-h-[50vh]"
          />
          <div
              className="absolute bottom-2 right-2 text-sm text-gray-500 bg-white bg-opacity-75 px-2 py-1 rounded">
            클릭하여 확대
          </div>
        </div>
      </div>
    </div>
);

export default ScreenshotView