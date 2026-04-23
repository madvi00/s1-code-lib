(function ($) {
  'use strict';

  $(function () {
    const $multiMapCont = $('.multi-map-container');
    const $closeBtn = $multiMapCont.find('.btn-close');

    $closeBtn.on('click', function () {
      window.close();
    });
  });
})(jQuery);
