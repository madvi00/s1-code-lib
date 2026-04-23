$(function () {
  var swiperDefaults = {
    slidesPerView: 3,
    spaceBetween: 32,
    freeMode: {
      enabled: true,
      sticky: true,
      minimumVelocity: 0.5,
      momentumBounce: 0.01,
      momentumVelocityRatio: 0.25,
    },
    loop: true,
    loopAdditionalSlides: 5,
    direction: 'vertical',
    slideToClickedSlide: true,
    centeredSlides: true,
  };

  var ACTIVE_CLASS = 'active';
  var PORTAL_CLASS = 'is-portal';

  var $boxes = $('.range-timepicker-box');
  var uid = 0;

  $boxes.each(function () {
    var $box = $(this);

    if (!$box.attr('data-rtp-id')) {
      uid += 1;
      $box.attr('data-rtp-id', 'rtp-' + uid);
    }

    if ($box.data('rtpInited')) return;

    var committed = { start: '00:00', end: '00:00' };

    var dataText = $.trim($box.find('.time-input .data').text());
    var parsed = parseRangeText(dataText);
    if (parsed) committed = parsed;

    $box.data('rtpCommitted', committed);

    $box.data('rtpDirtyStart', false);
    $box.data('rtpDirtyEnd', false);

    $box.data('rtpSyncing', false);

    var $panels = $box.find('.tab-pannel');

    var startHoursEl = $panels.eq(0).find('.swiper-container.hours')[0];
    var startMinutesEl = $panels.eq(0).find('.swiper-container.minutes')[0];
    var endHoursEl = $panels.eq(1).find('.swiper-container.hours')[0];
    var endMinutesEl = $panels.eq(1).find('.swiper-container.minutes')[0];

    destroyIfSwiperExists(startHoursEl);
    destroyIfSwiperExists(startMinutesEl);
    destroyIfSwiperExists(endHoursEl);
    destroyIfSwiperExists(endMinutesEl);

    var sw = {
      startHours: new Swiper(startHoursEl, $.extend({}, swiperDefaults)),
      startMinutes: new Swiper(startMinutesEl, $.extend({}, swiperDefaults)),
      endHours: new Swiper(endHoursEl, $.extend({}, swiperDefaults)),
      endMinutes: new Swiper(endMinutesEl, $.extend({}, swiperDefaults)),
    };

    bindDirtyHandlers($box, sw);

    $box.data('rtpSwipers', sw);
    $box.data('rtpInited', true);

    syncSwipersToRange($box, committed);

    if (!parsed) setRangeText($box, committed);
  });

  $boxes.on('click', '.time-input', function (e) {
    e.preventDefault();

    var $box = $(this).closest('.range-timepicker-box');
    closeAllPickers();

    $box.data('rtpDirtyStart', false);
    $box.data('rtpDirtyEnd', false);

    openPickerPortal($box);

    var $picker = getPickerByBox($box);
    forceStartTabByPicker($picker);

    var dataText = $.trim($box.find('.time-input .data').text());
    var parsed = parseRangeText(dataText);
    var committed = $box.data('rtpCommitted') || { start: '00:00', end: '00:00' };

    raf2(function () {
      syncSwipersToRange($box, parsed || committed);
    });
  });

  $(document).on('click', '.range-timepicker-dropdown .btn-confirm, .range-timepicker-dropdown .btn-apply', function (e) {
    e.preventDefault();

    var $picker = $(this).closest('.range-timepicker-dropdown');
    var $box = getBoxByPicker($picker);
    if (!$box.length) return;

    var committed = $box.data('rtpCommitted') || { start: '00:00', end: '00:00' };

    // 🔥 여기 핵심: 탭별 dirty 기준으로 값 확정
    var range = readRangeFromSwipersWithDirty($box, committed);

    if (toMinutes(range.end) < toMinutes(range.start)) {
      alert('종료시간이 시작시간보다 작습니다.');
      return;
    }

    $box.data('rtpCommitted', range);
    setRangeText($box, range);

    closePickerPortalByPicker($picker);
    forceStartTabByPicker($picker);
  });

  $(document).on('click', '.range-timepicker-dropdown .dim, .range-timepicker-dropdown .btn-range-timepicker-close', function (e) {
    e.preventDefault();

    var $picker = $(this).closest('.range-timepicker-dropdown');
    var $box = getBoxByPicker($picker);
    if (!$box.length) return;

    var committed = $box.data('rtpCommitted') || { start: '00:00', end: '00:00' };
    syncSwipersToRange($box, committed);

    forceStartTabByPicker($picker);
    closePickerPortalByPicker($picker);
  });

  function openPickerPortal($box) {
    var $picker = $box.find('.range-timepicker-dropdown');
    if (!$picker.length) return;
    if ($picker.hasClass(ACTIVE_CLASS)) return;

    var ownerId = $box.attr('data-rtp-id');

    $picker.addClass(PORTAL_CLASS).attr('data-owner', ownerId).detach().appendTo('body');

    $picker.addClass(ACTIVE_CLASS);
    $('body').css('overflow', 'hidden');
  }

  function closePickerPortal($box) {
    var ownerId = $box.attr('data-rtp-id');
    var $picker = $('.range-timepicker-dropdown.' + PORTAL_CLASS + '[data-owner="' + ownerId + '"]');

    if (!$picker.length) $picker = $box.find('.range-timepicker-dropdown');
    if (!$picker.length) return;

    $picker.removeClass(ACTIVE_CLASS);

    if ($picker.hasClass(PORTAL_CLASS)) {
      $picker.removeClass(PORTAL_CLASS).removeAttr('data-owner').detach().appendTo($box);
    }

    $('body').removeAttr('style');
  }

  function closePickerPortalByPicker($picker) {
    if (!$picker || !$picker.length) return;

    var ownerId = $picker.attr('data-owner');
    var $box = ownerId ? $('.range-timepicker-box[data-rtp-id="' + ownerId + '"]') : $picker.closest('.range-timepicker-box');

    if ($box.length) {
      closePickerPortal($box);
      return;
    }

    $picker.removeClass(ACTIVE_CLASS + ' ' + PORTAL_CLASS).removeAttr('data-owner');
    $('body').removeAttr('style');
  }

  function closeAllPickers() {
    $('.range-timepicker-dropdown.' + ACTIVE_CLASS).each(function () {
      var $picker = $(this);
      var $box = getBoxByPicker($picker);

      if ($box.length) {
        var committed = $box.data('rtpCommitted') || { start: '00:00', end: '00:00' };
        syncSwipersToRange($box, committed);
      }

      forceStartTabByPicker($picker);
      closePickerPortalByPicker($picker);
    });

    $('body').removeAttr('style');
  }

  function getBoxByPicker($picker) {
    if (!$picker || !$picker.length) return $();
    var ownerId = $picker.attr('data-owner');
    if (ownerId) return $('.range-timepicker-box[data-rtp-id="' + ownerId + '"]');
    return $picker.closest('.range-timepicker-box');
  }

  function getPickerByBox($box) {
    var ownerId = $box.attr('data-rtp-id');
    return $('.range-timepicker-dropdown[data-owner="' + ownerId + '"]');
  }

  function forceStartTabByPicker($picker) {
    if (!$picker || !$picker.length) return;

    var $tabs = $picker.find('.tabs .tab a');
    var $panels = $picker.find('.tab-content-box .tab-pannel');

    $tabs.removeClass('on').attr('aria-selected', 'false').eq(0).addClass('on').attr('aria-selected', 'true');
    $panels.removeClass('active').attr('aria-hidden', 'true').eq(0).addClass('active').attr('aria-hidden', 'false');
  }

  function destroyIfSwiperExists(el) {
    if (!el) return;
    if (el.swiper && typeof el.swiper.destroy === 'function') {
      el.swiper.destroy(true, true);
    }
  }

  function safeUpdate(sw) {
    if (!sw) return;
    if (sw.startHours && sw.startHours.update) sw.startHours.update();
    if (sw.startMinutes && sw.startMinutes.update) sw.startMinutes.update();
    if (sw.endHours && sw.endHours.update) sw.endHours.update();
    if (sw.endMinutes && sw.endMinutes.update) sw.endMinutes.update();
  }

  function getSafeRealIndex(swiper, mod) {
    if (!swiper) return 0;
    var i = typeof swiper.realIndex === 'number' ? swiper.realIndex : 0;
    if (isNaN(i)) i = 0;
    i = Math.max(0, i);
    if (mod) i = i % mod;
    return i;
  }

  function readRangeFromSwipersWithDirty($box, committed) {
    var sw = $box.data('rtpSwipers');
    if (!sw) return committed || { start: '00:00', end: '00:00' };

    safeUpdate(sw);

    var start = committed.start;
    var end = committed.end;

    if ($box.data('rtpDirtyStart')) {
      var sh = getSafeRealIndex(sw.startHours, 24);
      var sm = getSafeRealIndex(sw.startMinutes, 60);
      start = formatTime(sh, sm);
    }

    if ($box.data('rtpDirtyEnd')) {
      var eh = getSafeRealIndex(sw.endHours, 24);
      var em = getSafeRealIndex(sw.endMinutes, 60);
      end = formatTime(eh, em);
    }

    return { start: start, end: end };
  }

  function slideToIndex(swiper, idx) {
    if (!swiper) return;
    // speed=0, runCallbacks=false(3번째 인자)
    if (typeof swiper.slideToLoop === 'function') swiper.slideToLoop(idx, 0, false);
    else swiper.slideTo(idx, 0, false);
  }

  function syncSwipersToRange($box, range) {
    var sw = $box.data('rtpSwipers');
    if (!sw) return;

    var r = range || { start: '00:00', end: '00:00' };
    var s = splitTime(r.start);
    var e = splitTime(r.end);

    $box.data('rtpSyncing', true);

    slideToIndex(sw.startHours, s.hh);
    slideToIndex(sw.startMinutes, s.mm);
    slideToIndex(sw.endHours, e.hh);
    slideToIndex(sw.endMinutes, e.mm);

    safeUpdate(sw);

    $box.data('rtpDirtyStart', false);
    $box.data('rtpDirtyEnd', false);

    raf1(function () {
      $box.data('rtpSyncing', false);
    });
  }

  function setRangeText($box, range) {
    var text = normalizeTime(range.start) + '~' + normalizeTime(range.end);
    $box.find('.time-input .data').text(text);
  }

  function parseRangeText(text) {
    var s = (text || '').trim();
    if (!s || s.indexOf('~') === -1) return null;
    var p = s.split('~');
    if (p.length < 2) return null;
    return {
      start: normalizeTime(p[0]),
      end: normalizeTime(p[1]),
    };
  }

  function splitTime(timeStr) {
    var t = normalizeTime(timeStr);
    var p = t.split(':');
    return {
      hh: parseInt(p[0], 10) || 0,
      mm: parseInt(p[1], 10) || 0,
    };
  }

  function formatTime(hh, mm) {
    hh = Math.min(23, Math.max(0, hh));
    mm = Math.min(59, Math.max(0, mm));
    return String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
  }

  function normalizeTime(str) {
    var s = (str || '').trim();
    if (s.indexOf(':') === -1) return '00:00';
    var p = s.split(':');
    var hh = parseInt(p[0], 10);
    var mm = parseInt(p[1], 10);
    if (isNaN(hh)) hh = 0;
    if (isNaN(mm)) mm = 0;
    hh = Math.min(23, Math.max(0, hh));
    mm = Math.min(59, Math.max(0, mm));
    return String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
  }

  function toMinutes(timeStr) {
    var t = normalizeTime(timeStr);
    var p = t.split(':');
    return (parseInt(p[0], 10) || 0) * 60 + (parseInt(p[1], 10) || 0);
  }

  function raf1(fn) {
    window.requestAnimationFrame(function () {
      fn && fn();
    });
  }

  function raf2(fn) {
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        fn && fn();
      });
    });
  }

  function bindDirtyHandlers($box, sw) {
    function markStart() {
      if ($box.data('rtpSyncing')) return;
      $box.data('rtpDirtyStart', true);
    }
    function markEnd() {
      if ($box.data('rtpSyncing')) return;
      $box.data('rtpDirtyEnd', true);
    }

    // 실제 사용자 제스처 계열에서만 dirty
    if (sw.startHours) sw.startHours.on('touchEnd', markStart);
    if (sw.startMinutes) sw.startMinutes.on('touchEnd', markStart);
    if (sw.endHours) sw.endHours.on('touchEnd', markEnd);
    if (sw.endMinutes) sw.endMinutes.on('touchEnd', markEnd);

    // 클릭/휠 등 다른 입력까지 커버하고 싶으면 pointerup도 같이
    if (sw.startHours) sw.startHours.on('sliderMove', markStart);
    if (sw.startMinutes) sw.startMinutes.on('sliderMove', markStart);
    if (sw.endHours) sw.endHours.on('sliderMove', markEnd);
    if (sw.endMinutes) sw.endMinutes.on('sliderMove', markEnd);
  }
});
