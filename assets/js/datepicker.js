/**
 * Modal Datepicker 초기화 모듈 (Single only)
 * - input-datepicker 클릭 시 modal-datepicker(active) 오픈
 * - 모달 내부 .datepicker-box(Inline)에서 날짜 선택 시 input에 즉시 반영(확정은 Confirm)
 * - 취소/닫기/dim 클릭 시: input 값을 마지막 확정값으로 롤백 + 모달 닫기
 * - 확인 클릭 시: 현재 input 값을 확정값으로 저장 + 모달 닫기
 *
 * 필요 구조(예):
 * <div className="input-wrap date">
 *   <input type="text" className="input-datepicker input-@@size" id="@@id" name="@@id" placeholder="@@placeholder" value="@@value" @@property="" data-value="@@modalId" />
 *   <i className="icon icon-calendar" />
 * </div>
 * <div class="modal-datepicker" id="modalId">
 *   <div class="dim"></div>
 *   <div class="datepicker-picker">
 *     ...
 *     <div class="datepicker-body">
 *       <div class="datepicker-box"></div>
 *     </div>
 *     ...
 *     <button class="cancel-button">취소</button>
 *     <button class="confirm-button">확인</button>
 *   </div>
 * </div>
 */

(function (window, $) {
  'use strict';

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
        daysShort: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        daysMin: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        months: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'],
        monthsShort: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        today: '오늘',
        clear: '지우기',
        format: 'yyyy.mm.dd',
        titleFormat: 'yyyy.mm',
        showWeekDays: true,
        weekStart: 0,
      };
    },

    /**
     * bootstrap-datepicker 메시지 변수 설정(필요 시)
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
     * 모달 show/hide
     */
    openModal: function ($input) {
      var modalId = $input.attr('data-value');
      if (!modalId) return;

      var $modal = $('#' + modalId);
      if ($modal.length === 0) return;

      $modal.data('dpActiveInput', $input);

      if (typeof $input.data('dpOriginal') === 'undefined') {
        $input.data('dpOriginal', $input.val() || '');
      }

      $modal.addClass('active');

      var $picker = $modal.data('dpPicker') || $modal.find('.datepicker-body > .datepicker-box').first();

      if ($picker && $picker.length && $picker.data('datepicker')) {
        var v = $input.val();

        if (v) {
          $picker.datepicker('update', v);
        } else {
          // 비어있으면 선택 해제
          try {
            $picker.datepicker('clearDates');
          } catch (e) {
            $picker.datepicker('update', '');
          }
        }
      }
    },

    closeModal: function ($modal) {
      $modal.removeClass('active');
      // $modal.removeData('dpActiveInput'); // 원하면 닫을 때 제거 가능
    },

    /**
     * input을 마지막 확정값으로 롤백 + picker도 동일하게 롤백
     */
    rollbackInput: function ($input) {
      var original = $input.data('dpOriginal');
      var value = typeof original === 'string' ? original : '';

      // input 롤백
      $input.val(value);

      // 연결 모달의 picker도 롤백
      var modalId = $input.attr('data-value');
      if (!modalId) return;

      var $modal = $('#' + modalId);
      if ($modal.length === 0) return;

      var $picker = $modal.data('dpPicker') || $modal.find('.datepicker-body > .datepicker-box').first();

      if ($picker && $picker.length && $picker.data('datepicker')) {
        if (value) {
          $picker.datepicker('update', value);
        } else {
          try {
            $picker.datepicker('clearDates');
          } catch (e) {
            $picker.datepicker('update', '');
          }
        }
      }
    },

    /**
     * 현재 input 값을 확정값으로 저장(취소 롤백 기준)
     */
    commitInput: function ($input) {
      $input.data('dpOriginal', $input.val() || '');
    },

    /**
     * 모달 내 inline datepicker 초기화
     */
    initModalPickers: function ($target) {
      var self = this;
      var $modals = $target || $('.modal-datepicker');

      $modals.each(function () {
        var $modal = $(this);

        var $picker = $modal.find('.datepicker-body > .datepicker-box').first();
        if ($picker.length === 0) return;

        // 모달에 picker 저장
        $modal.data('dpPicker', $picker);

        // 이미 초기화된 경우 스킵
        if ($picker.data('datepicker')) return;

        $picker.datepicker({
          language: 'ko',
          format: 'yyyy.mm.dd',
          todayBtn: false,
          todayHighlight: true,
          clearBtn: false,
          autoclose: false, // 모달이므로 자동 닫기 X
          maxViewMode: 2,
          templates: {
            leftArrow: '<i class="icon icon-arrow-left"></i>',
            rightArrow: '<i class="icon icon-arrow-right"></i>',
          },
        });

        // 날짜 선택 시 input에 즉시 반영(확정은 Confirm에서)
        $picker.on('changeDate.datepicker', function () {
          var selected = $picker.datepicker('getFormattedDate');

          var $activeInput = $modal.data('dpActiveInput');
          if (!$activeInput || $activeInput.length === 0) return;

          $activeInput.val(selected);
        });

        // 모달 클릭 핸들러 바인딩(중복 방지)
        $modal.off('click.dpModal');

        $modal.on('click.dpModal', '.cancel-button, .close-button, .dim', function (e) {
          e.preventDefault();

          var $input = $modal.data('dpActiveInput');
          if ($input && $input.length) self.rollbackInput($input);

          self.closeModal($modal);
        });

        $modal.on('click.dpModal', '.confirm-button', function (e) {
          e.preventDefault();

          var $input = $modal.data('dpActiveInput');
          if ($input && $input.length) self.commitInput($input);

          self.closeModal($modal);
        });
      });
    },

    /**
     * input 클릭/아이콘 클릭으로 모달 오픈 이벤트 바인딩
     */
    bindModalOpenEvents: function ($target) {
      var self = this;
      var $inputs = $target || $('.input-datepicker');

      // input 클릭
      $inputs.off('click.dpOpen').on('click.dpOpen', function (e) {
        e.preventDefault();
        self.openModal($(this));
      });

      // 캘린더 아이콘 클릭 -> 같은 wrap의 input 오픈
      $inputs
        .closest('.input-wrap')
        .find('.icon-calendar')
        .off('click.dpOpen')
        .on('click.dpOpen', function (e) {
          e.preventDefault();
          var $input = $(this).closest('.input-wrap').find('.input-datepicker').first();
          if ($input.length) self.openModal($input);
        });
    },

    /**
     * 전체 초기화
     */
    init: function () {
      this.setMessageVariables();
      this.setKoreanLocale();

      this.initModalPickers();
      this.bindModalOpenEvents();
    },

    /**
     * 제거(필요 시)
     */
    destroy: function () {
      // input 이벤트 제거
      $('.input-datepicker').off('.dpOpen');
      $('.input-wrap .icon-calendar').off('.dpOpen');

      // 모달 이벤트 제거
      $('.modal-datepicker').off('.dpModal');

      // datepicker 인스턴스 제거
      $('.modal-datepicker .datepicker-body > .datepicker-box').each(function () {
        var $picker = $(this);
        if ($picker.data('datepicker')) $picker.datepicker('destroy');
        $picker.off('.datepidatepicker-boxcker');
      });
    },
  };

  // 전역 노출
  window.DatePicker = DatePicker;

  // 자동 초기화
  if (typeof $ !== 'undefined' && typeof $.fn.datepicker !== 'undefined') {
    if (document.readyState === 'loading') {
      $(document).ready(function () {
        DatePicker.init();
      });
    } else {
      DatePicker.init();
    }
  } else {
    $(document).ready(function () {
      if (typeof $.fn.datepicker !== 'undefined') {
        DatePicker.init();
      } else {
        console.warn('bootstrap-datepicker.js가 로드되지 않았습니다. DatePicker.init()을 수동으로 호출하세요.');
      }
    });
  }
})(window, jQuery || window.jQuery || window.$);
