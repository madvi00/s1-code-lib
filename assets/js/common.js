(function ($) {
  'use strict';

  function initFilterSwiper(containerSelector) {
    const $container = $(containerSelector);

    if (!$container.length) return null;

    const options = {
      loop: false,
      slidesPerView: 'auto',
      spaceBetween: 4,
      slidesOffsetAfter: 20,
      slidesOffsetBefore: 20,
    };

    return new Swiper($container[0], options);
  }

  $(function () {
    if (typeof Swiper === 'undefined') {
      console.error('Swiper 로드 안됨');
      return;
    }

    initFilterSwiper('.swiper.map-filter-box');
  });
})(jQuery);
