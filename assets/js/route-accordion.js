(function ($) {
  'use strict';

  $(function () {
    // 동적 생성 대응 위해 delegated 바인딩 추천
    $(document).on('click', '.route-list-box .route-list-top', function (e) {
      e.preventDefault();

      const $header = $(this);
      const $route = $header.closest('.route-list');
      const $box = $route.closest('.route-list-box');

      if (!$route.length || !$box.length) return;

      const isActive = $route.hasClass('active');

      $box.find('.route-list').removeClass('active');

      // 기존에 active 아니었으면 활성화
      if (!isActive) {
        $route.addClass('active');
      }
    });
  });
})(jQuery);
