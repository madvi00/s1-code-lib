(function ($) {
  'use strict';

  $(function () {
    const $mapContentLists = $('.map-content-list');
    const $mapPreview = $('.map-preview-box');

    $mapContentLists.on('mouseenter', function () {
      // active가 하나라도 있으면 hover 동작 막기
      if ($mapContentLists.filter('.active').length > 0) return;

      $mapPreview.addClass('show');
    });

    $mapContentLists.on('mouseleave', function () {
      // active 상태에서는 굳이 건드리지 않음 (원하면 조건 추가 가능)
      if ($mapContentLists.filter('.active').length > 0) return;

      $mapPreview.removeClass('show');
    });
  });
})(jQuery);
