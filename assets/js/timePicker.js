$(function () {
  var datetime = new Date();
  var nowHour = datetime.getHours(); // 0~23
  var nowMinute = datetime.getMinutes(); // 0~59

  var defaults = {
    pagination: '.swiper-pagination',
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

  var $timepickerBoxes = $('.timepicker-box');
  var uid = 0;

  // --------------------
  // init: box별 uid / committed / swipers 생성
  // --------------------
  $timepickerBoxes.each(function () {
    var $box = $(this);

    if (!$box.attr('data-tp-id')) {
      uid += 1;
      $box.attr('data-tp-id', 'tp-' + uid);
    }

    var $input = $box.find('.time-input').first();
    var init = normalizeTime($input.val() || $input.attr('placeholder') || '00:00');
    $box.data('tpCommitted', init);

    createSwipersForBox($box);
  });

  // OPEN
  $timepickerBoxes.on('click', '.time-input', function () {
    var $box = $(this).closest('.timepicker-box');

    closeAllTimepickers();

    openTimepickerPortal($box);

    var $picker = getPickerByBox($box);
    syncPickerToCommitted($box, $picker);
  });

  // CONFIRM / APPLY
  $(document).on('click', '.timepicker .btn-confirm, .timepicker .btn-apply', function () {
    var $picker = $(this).closest('.timepicker');

    commitFromPicker($picker);

    closeByPicker($picker);
  });

  // CLOSE - dim / close
  $(document).on('click', '.timepicker .dim, .timepicker .btn-timepicker-close', function () {
    var $picker = $(this).closest('.timepicker');

    restoreCommittedByPicker($picker);

    closeByPicker($picker);
  });

  // --------------------
  // commit / restore
  // --------------------
  function commitFromPicker($picker) {
    if (!$picker.length) return;

    var $box = getBoxByPicker($picker);
    if (!$box.length) return;

    var $input = $box.find('.time-input').first();

    var h = $.trim($picker.find('.swiper-container.hours .swiper-slide-active').text()) || '00';
    var m = $.trim($picker.find('.swiper-container.minutes .swiper-slide-active').text()) || '00';
    var committed = normalizeTime(h + ':' + m);

    $box.data('tpCommitted', committed);
    $input.val(committed);
  }

  function restoreCommittedByPicker($picker) {
    if (!$picker.length) return;

    var $box = getBoxByPicker($picker);
    if (!$box.length) return;

    syncPickerToCommitted($box, $picker);
  }

  function syncPickerToCommitted($box, $picker) {
    if (!$box.length || !$picker.length) return;

    var committed = normalizeTime($box.data('tpCommitted') || '00:00');
    var parts = committed.split(':');
    var h = parseInt(parts[0], 10) || 0;
    var m = parseInt(parts[1], 10) || 0;

    var swipers = $box.data('tpSwipers');
    if (!swipers || !swipers.hours || !swipers.minutes) return;

    // loop면 slideToLoop 사용
    if (typeof swipers.hours.slideToLoop === 'function') swipers.hours.slideToLoop(h, 0);
    else swipers.hours.slideTo(h, 0);

    if (typeof swipers.minutes.slideToLoop === 'function') swipers.minutes.slideToLoop(m, 0);
    else swipers.minutes.slideTo(m, 0);

    // 강제 반영
    if (typeof swipers.hours.update === 'function') swipers.hours.update();
    if (typeof swipers.minutes.update === 'function') swipers.minutes.update();
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

  // --------------------
  // Swiper (box별)
  // --------------------
  function createSwipersForBox($box) {
    var $hoursEl = $box.find('.swiper-container.hours').get(0);
    var $minutesEl = $box.find('.swiper-container.minutes').get(0);
    if (!$hoursEl || !$minutesEl) return;

    var old = $box.data('tpSwipers');
    if (old && old.hours && typeof old.hours.destroy === 'function') old.hours.destroy(true, true);
    if (old && old.minutes && typeof old.minutes.destroy === 'function') old.minutes.destroy(true, true);

    var $picker = $box.find('.timepicker').first();

    var wasHidden = $picker.length && $picker.css('display') === 'none';
    var prevStyle = null;

    if ($picker.length && wasHidden) {
      prevStyle = {
        display: $picker[0].style.display,
        visibility: $picker[0].style.visibility,
        position: $picker[0].style.position,
        left: $picker[0].style.left,
        top: $picker[0].style.top,
      };

      // 화면에 안 보이지만 "측정 가능" 상태로 잠깐 변경
      $picker.css({
        display: 'block',
        visibility: 'hidden',
        position: 'absolute',
        left: '-9999px',
        top: '0',
      });
    }

    var hours = new Swiper(
      $hoursEl,
      $.extend(true, {}, defaults, {
        initialSlide: nowHour,
        observer: true,
        observeParents: true,
      }),
    );

    var minutes = new Swiper(
      $minutesEl,
      $.extend(true, {}, defaults, {
        initialSlide: nowMinute,
        observer: true,
        observeParents: true,
      }),
    );

    $box.data('tpSwipers', { hours: hours, minutes: minutes });

    // 원복
    if ($picker.length && wasHidden) {
      $picker[0].style.display = prevStyle.display;
      $picker[0].style.visibility = prevStyle.visibility;
      $picker[0].style.position = prevStyle.position;
      $picker[0].style.left = prevStyle.left;
      $picker[0].style.top = prevStyle.top;
    }
  }

  // --------------------
  // Portal open/close
  // --------------------
  function openTimepickerPortal($box) {
    var $picker = $box.find('.timepicker');
    if (!$picker.length || $picker.hasClass('active')) return;

    var ownerId = $box.attr('data-tp-id');

    $picker.addClass('is-portal').attr('data-owner', ownerId).detach().appendTo('body');

    $picker.addClass('active');
    $('body').css('overflow', 'hidden');

    var swipers = $box.data('tpSwipers');
    if (swipers) {
      if (swipers.hours && typeof swipers.hours.update === 'function') swipers.hours.update();
      if (swipers.minutes && typeof swipers.minutes.update === 'function') swipers.minutes.update();
    }

    requestAnimationFrame(function () {
      if (!swipers) return;

      if (swipers.hours) {
        swipers.hours.update();
        if (typeof swipers.hours.loopFix === 'function') swipers.hours.loopFix();
        if (typeof swipers.hours.updateSlidesClasses === 'function') swipers.hours.updateSlidesClasses();
      }

      if (swipers.minutes) {
        swipers.minutes.update();
        if (typeof swipers.minutes.loopFix === 'function') swipers.minutes.loopFix();
        if (typeof swipers.minutes.updateSlidesClasses === 'function') swipers.minutes.updateSlidesClasses();
      }
    });
  }

  function closeTimepickerPortal($box) {
    var $picker = getPickerByBox($box);
    if (!$picker.length) return;

    $picker.removeClass('active');

    if ($picker.hasClass('is-portal')) {
      $picker.removeClass('is-portal').removeAttr('data-owner').detach().appendTo($box);
    }

    $('body').removeAttr('style');

    var swipers = $box.data('tpSwipers');
    if (swipers) {
      if (swipers.hours && typeof swipers.hours.update === 'function') swipers.hours.update();
      if (swipers.minutes && typeof swipers.minutes.update === 'function') swipers.minutes.update();
    }
  }

  function closeByPicker($picker) {
    if (!$picker.length) return;

    var $box = getBoxByPicker($picker);

    if ($box.length) {
      closeTimepickerPortal($box);
    } else {
      $picker.removeClass('active is-portal').removeAttr('data-owner');
      $('body').removeAttr('style');
    }
  }

  function closeAllTimepickers() {
    $('.timepicker.active').each(function () {
      restoreCommittedByPicker($(this));
      closeByPicker($(this));
    });
  }

  function getPickerByBox($box) {
    var $picker = $box.find('.timepicker');
    if ($picker.length) return $picker;

    var ownerId = $box.attr('data-tp-id');
    return $('.timepicker.is-portal[data-owner="' + ownerId + '"]');
  }

  function getBoxByPicker($picker) {
    var ownerId = $picker.attr('data-owner');
    return ownerId ? $('.timepicker-box[data-tp-id="' + ownerId + '"]') : $picker.closest('.timepicker-box');
  }
});
