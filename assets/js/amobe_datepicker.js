/**
 * Datepicker 초기화 모듈
 * bootstrap-datepicker를 사용하여 날짜 선택 기능을 제공합니다.
 *
 * 사용법:
 * 1. HTML에 datepicker 클래스를 가진 input 요소 추가
 * 2. DatePicker.init() 호출 또는 자동 초기화 대기
 *
 * 예시:
 * - Single datepicker: <input type="text" class="datepicker" />
 * - Range datepicker: <div class="input-daterange"><input class="datepicker" />...</div>
 * - Monthly datepicker: <input type="text" class="datepicker monthly" />
 */

(function (window, $) {
  'use strict';

  // DatePicker 네임스페이스
  var DatePicker = {
    /**
     * 한국어 locale 설정
     */
    setKoreanLocale: function () {
      if (typeof $.fn.datepicker === 'undefined') {
        console.warn('bootstrap-datepicker.js가 로드되지 않았습니다.');
        return;
      }

      $.fn.datepicker.dates['ko'] = {
        days: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
        daysShort: ['일', '월', '화', '수', '목', '금', '토'],
        daysMin: ['일', '월', '화', '수', '목', '금', '토'],
        months: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'],
        monthsShort: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        today: '이번 달 보기',
        clear: '지우기',
        format: 'yyyy.mm.dd',
        titleFormat: 'yyyy.mm',
        showWeekDays: true,
        weekStart: 0,
      };
    },

    /**
     * bootstrap-datepicker 메시지 변수 설정
     */
    setMessageVariables: function () {
      if (typeof cldMsg_prevMonth === 'undefined') {
        window.cldMsg_prevMonth = '이전달';
        window.cldMsg_nextMonth = '다음달';
        window.cldMsg_prevYear = '이전년';
        window.cldMsg_nextYear = '다음년';
        window.cldMsg_prev = '이전';
        window.cldMsg_next = '다음';
      }
    },

    /**
     * 일반 datepicker 초기화
     * @param {jQuery} $target - 초기화할 요소 (선택사항, 없으면 전체 .datepicker 요소)
     */
    initSingle: function ($target) {
      var $elements = $target || $('.datepicker');

      $elements.each(function () {
        var $target = $(this);

        // 이미 range에 속한 datepicker인지 확인
        if ($target.closest('.input-daterange').length > 0) {
          return; // range datepicker는 DateRangePicker로 처리
        }

        // 월별 datepicker 설정
        if ($target.hasClass('monthly')) {
          $target.datepicker({
            language: 'ko',
            format: 'yyyy.mm',
            startView: 'months',
            viewMode: 'months',
            minViewMode: 'months',
            maxViewMode: 2,
            clearBtn: false,
            autoclose: true,
          });
        } else {
          // 일반 datepicker 설정
          $target.datepicker({
            language: 'ko',
            format: 'yyyy.mm.dd',
            todayBtn: false,
            todayHighlight: true,
            clearBtn: false,
            autoclose: true,
            maxViewMode: 2,
            templates: {
              leftArrow: '<i class="icon icon-arrow-left"></i>',
              rightArrow: '<i class="icon icon-arrow-right"></i>',
            },
          });
        }

        // 아이콘 클릭 이벤트
        $target
          .parent()
          .find('.icon-calendar')
          .off('click.datepicker')
          .on('click.datepicker', function () {
            $target.focus();
          });
      });
    },

    /**
     * Range datepicker 초기화
     * @param {jQuery} $target - 초기화할 요소 (선택사항, 없으면 전체 .input-daterange 요소)
     */
    initRange: function ($target) {
      var $groups = $target || $('.input-daterange');

      $groups.each(function () {
        var $group = $(this);
        var $inputs = $group.find('input.datepicker');

        // input이 2개가 아니면 스킵
        if ($inputs.length !== 2) {
          console.warn('Range datepicker는 정확히 2개의 input.datepicker 요소가 필요합니다.');
          return;
        }

        // DateRangePicker 초기화
        $group.datepicker({
          language: 'ko',
          format: 'yyyy.mm.dd',
          todayBtn: false,
          todayHighlight: true,
          clearBtn: false,
          autoclose: true,
          maxViewMode: 2,
          inputs: $inputs.toArray(),
        });

        // 아이콘 클릭 이벤트
        $group
          .find('.icon-calendar')
          .off('click.datepicker')
          .on('click.datepicker', function () {
            $(this).closest('.input-wrap').find('.datepicker').focus();
          });
      });
    },

    /**
     * 모든 datepicker 초기화
     * @param {Object} options - 초기화 옵션
     * @param {boolean} options.autoInit - 자동 초기화 여부 (기본값: true)
     */
    init: function (options) {
      options = options || {};
      var autoInit = options.autoInit !== false;

      // 메시지 변수 설정
      this.setMessageVariables();

      // 한국어 locale 설정
      this.setKoreanLocale();

      // 자동 초기화가 활성화되어 있고 DOM이 준비되지 않았다면 대기
      if (autoInit) {
        if (document.readyState === 'loading') {
          $(document).ready(function () {
            DatePicker.initSingle();
            DatePicker.initRange();
          });
        } else {
          // DOM이 이미 준비된 경우 즉시 초기화
          this.initSingle();
          this.initRange();
        }
      }
    },

    /**
     * 특정 요소의 datepicker 제거
     * @param {jQuery|string} target - 제거할 요소 또는 선택자
     */
    destroy: function (target) {
      var $target = typeof target === 'string' ? $(target) : target;
      $target.datepicker('destroy');
      $target.off('.datepicker');
      $target.parent().find('.icon-calendar').off('click.datepicker');
    },

    /**
     * 특정 요소의 datepicker 새로고침
     * @param {jQuery|string} target - 새로고침할 요소 또는 선택자
     */
    refresh: function (target) {
      var $target = typeof target === 'string' ? $(target) : target;
      $target.datepicker('update');
    },
  };

  // 전역으로 노출
  window.DatePicker = DatePicker;

  // 자동 초기화 (기본 동작)
  if (typeof $ !== 'undefined' && typeof $.fn.datepicker !== 'undefined') {
    DatePicker.init();
  } else {
    // jQuery나 datepicker가 아직 로드되지 않은 경우, 로드 후 초기화
    $(document).ready(function () {
      if (typeof $.fn.datepicker !== 'undefined') {
        DatePicker.init();
      } else {
        console.warn('bootstrap-datepicker.js가 로드되지 않았습니다. DatePicker.init()을 수동으로 호출하세요.');
      }
    });
  }
})(window, jQuery || window.jQuery || window.$);
