(function ($) {
  'use strict';

  function initFilterSwiper(containerSelector) {
    const $container = $(containerSelector);

    if (!$container.length) return null;

    const $nextBtn = $container.find('.filter-swiper-control.swiper-button-next');
    const $prevBtn = $container.find('.filter-swiper-control.swiper-button-prev');

    const options = {
      loop: false,
      slidesPerView: 'auto',
      spaceBetween: 4,
      slidesOffsetAfter: 20,
      slidesOffsetBefore: 20,
    };

    if ($nextBtn.length && $prevBtn.length) {
      options.navigation = {
        nextEl: $nextBtn[0],
        prevEl: $prevBtn[0],
      };
    }

    return new Swiper($container[0], options);
  }

  $(function () {
    if (typeof Swiper === 'undefined') {
      console.error('Swiper 로드 안됨');
      return;
    }

    initFilterSwiper('.swiper.map-filter-box');
    initFilterSwiper('.swiper.station-filter-box');
  });
})(jQuery);
