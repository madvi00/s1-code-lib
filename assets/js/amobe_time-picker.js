$(function () {
  // -------------------------
  // iframe 감지 및 포털 설정
  // -------------------------
  var _inFrame = (function () { try { return window.self !== window.top; } catch (e) { return true; } })();
  var _pwin = _inFrame ? window.parent : window;
  var _pdoc = _pwin.document;

  var $portal;
  var PORTAL_ID;
  if (_inFrame) {
    PORTAL_ID = '__tp_portal__';
    var _pe = _pdoc.getElementById(PORTAL_ID);
    if (!_pe) { _pe = _pdoc.createElement('div'); _pe.id = PORTAL_ID; _pdoc.body.appendChild(_pe); }
    $portal = $(_pe);
  } else {
    PORTAL_ID = 'timepicker-portal';
    $portal = $('#' + PORTAL_ID);
  }
  var PORTAL_SEL = '#' + PORTAL_ID;

  var openedBox = null;
  var $movedDropdown = null;
  var draft = null;

  // ----------------------------
  // Positioning
  // ----------------------------
  function placeDropdown($input, $dropdown) {
    if (!$input || !$input.length || !$dropdown || !$dropdown.length) return;

    var rect = $input.get(0).getBoundingClientRect();
    var dropdownH = $dropdown.outerHeight(true);
    var dropdownW = $dropdown.outerWidth(true);
    var gap = 6;

    // iframe 오프셋 보정
    var fRect = (_inFrame && window.frameElement) ? window.frameElement.getBoundingClientRect() : { top: 0, left: 0 };
    var top = rect.bottom + fRect.top + gap;
    var left = rect.left + fRect.left;
    var winH = _pwin.innerHeight;
    var winW = _pwin.innerWidth;

    if (top + dropdownH > winH) {
      top = rect.top + fRect.top - dropdownH - gap;
      $dropdown.addClass('bottom');
    } else {
      $dropdown.removeClass('bottom');
    }

    var willOverflowRight = left + dropdownW > winW;
    if (willOverflowRight) {
      var right = winW - (rect.right + fRect.left);
      $dropdown.css({ top: top, right: right, left: 'auto' });
      $dropdown.addClass('align-right');
    } else {
      $dropdown.css({ top: top, left: left, right: 'auto' });
      $dropdown.removeClass('align-right');
    }
  }

  // ----------------------------
  // Utils
  // ----------------------------
  function pad2(n) {
    n = String(n);
    return n.length === 1 ? '0' + n : n;
  }

  function parseInputToDraft(value) {
    if (!value) return null;
    var m = String(value).match(/^(\d{1,2}):(\d{2})$/);
    if (!m) return null;
    var hh = parseInt(m[1], 10);
    var mm = parseInt(m[2], 10);
    if (isNaN(hh) || isNaN(mm)) return null;
    var ampm = hh >= 12 ? '오후' : '오전';
    var hour12 = hh % 12;
    return { ampm: ampm, hour: pad2(hour12), minute: pad2(mm) };
  }

  function getActiveOrFirstText($root, selector, fallback) {
    var $active = $root.find(selector + '.active').first();
    if ($active.length) return $.trim($active.text());
    var $first = $root.find(selector).first();
    if ($first.length) return $.trim($first.text());
    return fallback;
  }

  function setActiveByText($root, selector, text) {
    var $items = $root.find(selector);
    $items.removeClass('active');
    var $target = $items.filter(function () {
      return $.trim($(this).text()) === String(text);
    }).first();
    if ($target.length) $target.addClass('active');
  }

  function readDraftFromDropdown($dropdown) {
    var ampm = getActiveOrFirstText($dropdown, '.ampm', '오전');
    var hour = getActiveOrFirstText($dropdown, '.hour', '00');
    var minute = getActiveOrFirstText($dropdown, '.minute', '00');
    return { ampm: ampm, hour: hour, minute: minute };
  }

  function applyDraftToDropdown($dropdown, d) {
    if (!d) return;
    setActiveByText($dropdown, '.ampm', d.ampm || '오전');
    setActiveByText($dropdown, '.hour', d.hour || '00');
    setActiveByText($dropdown, '.minute', d.minute || '00');
  }

  function isDraftComplete(d) {
    return d && d.ampm && d.hour != null && d.minute != null;
  }

  function updateConfirmState($dropdown, d) {
    var $btn = $dropdown.find('.btn-confirm');
    if (!$btn.length) return;
    $btn.prop('disabled', !isDraftComplete(d));
  }

  function to24hString(d) {
    var hourNum = parseInt(d.hour, 10);
    var minNum = parseInt(d.minute, 10);
    if (isNaN(hourNum)) hourNum = 0;
    if (isNaN(minNum)) minNum = 0;
    if (d.ampm === '오후') {
      if (hourNum < 12) hourNum += 12;
    }
    return pad2(hourNum) + ':' + pad2(minNum);
  }

  // ----------------------------
  // Open/Close
  // ----------------------------
  function openPicker($box) {
    var $input = $box.find('.time-input');
    var $dropdown = $box.find('.timepicker-dropdown');

    if (openedBox && openedBox !== $box.get(0)) {
      closePicker($(openedBox));
    }

    openedBox = $box.get(0);

    $movedDropdown = $dropdown;
    $portal.append($movedDropdown);

    var fromInput = parseInputToDraft($input.val());
    draft = fromInput || readDraftFromDropdown($movedDropdown);

    applyDraftToDropdown($movedDropdown, draft);
    updateConfirmState($movedDropdown, draft);

    $movedDropdown.addClass('active');
    $input.addClass('active');
    placeDropdown($input, $movedDropdown);
  }

  function closePicker($box) {
    if (!$box || !$box.length) return;

    var $dropdown = $movedDropdown || $box.find('.timepicker-dropdown');
    if (!$dropdown || !$dropdown.length) return;

    var $input = $box.find('.time-input');
    $input.removeClass('active');

    $dropdown.removeClass('active').removeAttr('style');
    $box.append($dropdown);

    openedBox = null;
    $movedDropdown = null;
    draft = null;
  }

  // ----------------------------
  // Events
  // ----------------------------

  // input 클릭 → open
  $(document).on('click', '.timepicker-box .time-input', function (e) {
    e.stopPropagation();
    var $box = $(this).closest('.timepicker-box');
    var isOpen = openedBox === $box.get(0);
    if (!isOpen) openPicker($box);
  });

  // 포털 내부 클릭 → 닫힘 방지
  $(_pdoc).on('click', PORTAL_SEL + ' .timepicker-dropdown', function (e) {
    e.stopPropagation();
  });

  // 바깥 클릭 → 닫기 (iframe document)
  $(document).on('click', function () {
    if (openedBox) closePicker($(openedBox));
  });

  // 바깥 클릭 → 닫기 (parent document, iframe인 경우)
  if (_inFrame) {
    $(_pdoc).on('click', function () {
      if (openedBox) closePicker($(openedBox));
    });
  }

  // draft 선택 (오전/오후, 시, 분)
  $(_pdoc).on('click', PORTAL_SEL + ' .ampm, ' + PORTAL_SEL + ' .hour, ' + PORTAL_SEL + ' .minute', function (e) {
    e.stopPropagation();
    if (!openedBox || !$movedDropdown) return;

    var $btn = $(this);
    var $dropdown = $btn.closest('.timepicker-dropdown');

    if ($btn.hasClass('ampm')) {
      $dropdown.find('.ampm').removeClass('active');
      $btn.addClass('active');
    } else if ($btn.hasClass('hour')) {
      $dropdown.find('.hour').removeClass('active');
      $btn.addClass('active');
    } else if ($btn.hasClass('minute')) {
      $dropdown.find('.minute').removeClass('active');
      $btn.addClass('active');
    }

    draft = readDraftFromDropdown($dropdown);
    updateConfirmState($dropdown, draft);
    placeDropdown($(openedBox).find('.time-input'), $movedDropdown);
  });

  // 확인 버튼 → 최종 input 반영 + 닫기
  $(_pdoc).on('click', PORTAL_SEL + ' .btn-confirm', function (e) {
    e.stopPropagation();
    if (!openedBox || !$movedDropdown) return;
    if ($(this).prop('disabled')) return;

    var $box = $(openedBox);
    var $input = $box.find('.time-input');
    var $dropdown = $movedDropdown;

    var finalDraft = readDraftFromDropdown($dropdown);
    var timeString = to24hString(finalDraft);

    if ($box.hasClass('has-label')) {
      var $dataSpan = $input.find('.data');
      var $placeholder = $input.find('.placeholder');
      if ($dataSpan.length) {
        $input.addClass('selected');
        $placeholder.hide();
        $dataSpan.show();
        $dataSpan.text(timeString);
      }
      $input.attr('data-value', timeString);
    } else {
      $input.val(timeString).trigger('change');
    }

    closePicker($box);
  });

  // resize/scroll 시 위치 재계산
  $(_pwin).on('resize scroll', function () {
    if (!openedBox || !$movedDropdown) return;
    var $box = $(openedBox);
    placeDropdown($box.find('.time-input'), $movedDropdown);
  });
});
