/**
 * jqGrid 높이 계산 공통 함수
 * @param {Object} options - 설정 옵션
 * @param {string} options.containerSelector - 컨테이너 셀렉터 (기본값: '#div_list')
 * @param {string} options.gridSelector - 그리드 셀렉터 (기본값: '#list')
 * @param {string} options.headerSelector - 헤더 셀렉터 (기본값: '.data-list-table-header')
 * @param {string} options.footerSelector - 푸터 셀렉터 (기본값: '.data-list-table-footer')
 * @param {number} options.padding - 추가 여백 (기본값: 56)
 * @param {number} options.initialHeight - 초기 높이 (기본값: 510)
 * @param {number} options.maxHeight - 최대 높이 (기본값: 510)
 * @param {number} options.minHeight - 최소 높이 (기본값: 200)
 * @param {number} options.scrollbarWidth - 스크롤바 너비 (스크롤바가 숨겨진 경우 추가할 높이, 기본값: 0)
 * @returns {number} 계산된 그리드 높이
 */
function calculateJqGridHeight(options) {
  options = options || {};
  var windowHeight = $(window).height();
  var containerSelector = options.containerSelector || '#div_list';
  var container = $(containerSelector);
  var containerOffset = container.offset();
  var containerTop = containerOffset ? containerOffset.top : 0;

  // 헤더, 푸터, 여백 등을 고려한 패딩값
  var headerSelector = options.headerSelector;
  var footerSelector = options.footerSelector;
  var headerHeight = $(headerSelector).outerHeight() || 0;
  var footerHeight = $(footerSelector).outerHeight() || 0;
  var padding = options.padding !== undefined ? options.padding : 56; // 추가 여백
  var scrollbarWidth = options.scrollbarWidth !== undefined ? options.scrollbarWidth : 0; // 스크롤바 너비
  var calculatedHeight = windowHeight - containerTop - headerHeight - footerHeight - padding + scrollbarWidth;

  // 초기 높이, 최대 높이, 최소 높이 설정 (기본값: 510, 510, 200)
  var initialHeight = options.initialHeight !== undefined ? options.initialHeight : 510;
  var maxHeight = options.maxHeight !== undefined ? options.maxHeight : 510;
  var minHeight = options.minHeight !== undefined ? options.minHeight : 200;

  // 초기 높이가 지정된 경우 초기 높이를 사용, 지정되지 않은 경우 계산된 높이 사용
  var targetHeight = options.initialHeight !== undefined ? initialHeight : calculatedHeight;

  // 계산된 높이가 최대값을 초과하지 않도록 제한, 최소값 이하로는 내려가지 않도록
  return Math.max(minHeight, Math.min(targetHeight, maxHeight));
}

/**
 * jqGrid 리사이즈 이벤트 핸들러 설정
 * @param {Object} options - 설정 옵션
 * @param {string} options.containerSelector - 컨테이너 셀렉터 (기본값: '#div_list')
 * @param {string} options.gridSelector - 그리드 셀렉터 (기본값: '#list')
 */
function setupJqGridResize(options) {
  options = options || {};
  var containerSelector = options.containerSelector || '#div_list';
  var gridSelector = options.gridSelector || '#list';

  $(window).resize(function () {
    $(gridSelector).setGridWidth($(containerSelector).width(), true);
  });
}
