/* modal jQuery Plugin */
(function ($) {
  'use strict';

  // 플러그인 기본 설정
  const defaults = {
    modalClass: 'modal',
    showClass: 'show',
  };

  // 모달 열기 메서드
  function openModal($modal) {
    $modal.css('display', 'block').addClass(defaults.showClass);
    $('body').css('overflow', 'hidden');
  }

  // 모달 닫기 메서드
  function closeModal($modal) {
    $modal.css('display', 'none').removeClass(defaults.showClass);
    $('body').css('overflow', '');
  }

  // 전역 함수: 모달 ID로 열기 (onclick에서 사용)
  window.openModalById = function (modalId) {
    $('#' + modalId).modal('open');
  };

  // 전역 함수: 모달 ID로 닫기 (onclick에서 사용)
  window.closeModalById = function (modalId) {
    $('#' + modalId).modal('close');
  };

  // jQuery 플러그인 정의
  $.fn.modal = function (method, options) {
    // 메서드 호출인 경우 (예: $('#modal').modal('open'))
    if (typeof method === 'string') {
      return this.each(function () {
        const $modal = $(this);
        switch (method) {
          case 'open':
            openModal($modal);
            break;
          case 'close':
            closeModal($modal);
            break;
          default:
            console.warn('Unknown method: ' + method);
        }
      });
    }

    // 초기화인 경우 (예: $('#modal').modal() 또는 $('#modal').modal({ ... }))
    options = method || {};
    const settings = $.extend({}, defaults, options);

    return this.each(function () {
      const $modal = $(this);

      // 이미 초기화된 경우 중복 이벤트 방지
      if ($modal.data('modal-initialized')) {
        return;
      }

      // 닫기 버튼 클릭
      $modal.find('.btn-close').on('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        closeModal($modal);
      });

      // dim 영역 클릭 시 닫기
      $modal.find('.dim').on('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        closeModal($modal);
      });

      // 일괄 변경 모달: 항목 선택에 따라 내용 영역 show/hide
      if ($modal.attr('id') === 'modal-bulk-change') {
        const $content = $modal.find('.bulk-change-content');
        const $itemOperation = $content.find('.bulk-change-content-item-operation');
        const $itemReservation = $content.find('.bulk-change-content-item-reservation');
        const $itemPassenger = $content.find('.bulk-change-content-item-passenger');

        function toggleBulkChangeContent() {
          const selected = $modal.find('input[name="usage-status"]:checked').val();
          $itemOperation.addClass('hidden');
          $itemReservation.addClass('hidden');
          $itemPassenger.addClass('hidden');
          if (selected === 'operation-status') {
            $itemOperation.removeClass('hidden');
          } else if (selected === 'reservation-status') {
            $itemReservation.removeClass('hidden');
          } else if (selected === 'passenger-count') {
            $itemPassenger.removeClass('hidden');
          }
        }

        $modal.find('input[name="usage-status"]').on('change', toggleBulkChangeContent);
        toggleBulkChangeContent();
      }

      // 초기화 완료 표시
      $modal.data('modal-initialized', true);
    });
  };

  // DOM 로드 시 자동 초기화
  $(document).ready(function () {
    // 모달 초기화
    $('.' + defaults.modalClass).modal();

    // 모달 열기 버튼 이벤트 (이벤트 위임 사용)
    $(document).on('click', '.btn-modal', function (e) {
      e.preventDefault();
      const modalId = $(this).data('modal');
      if (modalId) {
        const $targetModal = $('#' + modalId);
        if ($targetModal.length) {
          openModal($targetModal);
        }
      }
    });
  });
})(jQuery);
