import highlightGamblingContent from "./GamblingDetection";

const ContentPreview = ({content}) => (
    <details open={true}>
      <summary
          className="cursor-pointer py-1 sm:py-2 font-semibold hover:text-blue-500 text-sm sm:text-base">
        URL 텍스트 내용
      </summary>
      <div
          className="mt-2 p-2 sm:p-4 bg-gray-50 rounded shadow-inner"
          style={{
            maxHeight: '300px',
            overflowX: 'hidden',
            overflowY: 'auto',
            scrollbarWidth: 'thin',
            scrollbarColor: '#CBD5E0 #EDF2F7'
          }}
      >
        <p
            className="content-preview text-xs sm:text-sm break-words"
            dangerouslySetInnerHTML={highlightGamblingContent(content)}
        />
      </div>
    </details>
);

export default ContentPreview