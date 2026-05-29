(function ($) {
  'use strict';

  $(function () {
    // 메뉴 클릭 시 active 이동 (Underline Tab과 동일한 인터랙션)
    $(document).on('click', '.navigation-menu a', function (e) {
      e.preventDefault();

      var $clicked = $(this);
      var $menu = $clicked.closest('.navigation-menu');

      $menu.find('a').removeClass('active').removeAttr('aria-current');
      $clicked.addClass('active').attr('aria-current', 'page');
    });
  });
})(jQuery);
