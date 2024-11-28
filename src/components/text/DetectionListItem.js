import {calculateGamblingPercent} from "./GamblingDetection";
import {Trash2}                   from 'lucide-react';

const DetectionListItem = ({detection, isSelected, onClick, onDelete}) => (
    <div
        className={`cursor-pointer p-2 sm:p-4 rounded transition-all relative group ${
            isSelected
                ? 'bg-blue-100 border-l-4 border-blue-500'
                : 'bg-white hover:bg-gray-50'
        }`}
        onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div className="flex-grow pr-8">
          <h4 className="font-semibold text-sm sm:text-base">
            {detection.title || 'No Title'}
          </h4>
          <p className="text-xs sm:text-sm text-gray-600 truncate">
            URL: {detection.url}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            검출 시각: {new Date(detection.detectedAt).toLocaleString()}
            {calculateGamblingPercent(detection.content) > 0 && (
                <span className="text-red-400 pl-4">
              score: {detection.score}
            </span>
            )}
          </p>
        </div>
        <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(detection.id);
            }}
            className="absolute top-2 sm:top-4 right-2 sm:right-4 opacity-0 group-hover:opacity-100
                  transition-opacity p-1 sm:p-2 hover:bg-red-100 rounded"
            title="삭제"
        >
          <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-red-500"/>
        </button>
      </div>
    </div>
);

export default DetectionListItem