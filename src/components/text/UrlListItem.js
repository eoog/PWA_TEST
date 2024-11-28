import {hasGamblingContent} from "./GamblingDetection";

const UrlListItem = ({item, isSelected, onClick}) => (
    <div
        className={`cursor-pointer p-2 sm:p-4 rounded transition-all hover:shadow-md ${
            isSelected
                ? 'bg-blue-100 border-l-4 border-blue-500'
                : 'bg-white hover:bg-gray-50'
        }`}
        onClick={() => onClick(item)}
    >
      <h4 className="font-semibold text-sm sm:text-base">{item.title
          || 'No Title'}</h4>
      <p className="text-xs sm:text-sm text-gray-600 truncate">URL: {item.url}</p>
      {hasGamblingContent(item.content) && (
          <div
              className="mt-1 sm:mt-2 text-red-600 text-xs sm:text-sm flex items-center">
            <span>⚠️ 도박성 컨텐츠 검출</span>
          </div>
      )}
    </div>
);

export default UrlListItem