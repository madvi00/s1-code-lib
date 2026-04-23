(function ($) {
  'use strict';

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
      PORTAL_ID = '__rtp_portal__';
      var _pe = _pdoc.getElementById(PORTAL_ID);
      if (!_pe) { _pe = _pdoc.createElement('div'); _pe.id = PORTAL_ID; _pdoc.body.appendChild(_pe); }
      $portal = $(_pe);
    } else {
      PORTAL_ID = 'timepicker-portal';
      $portal = $('#' + PORTAL_ID);
      if (!$portal.length) $portal = $('<div id="' + PORTAL_ID + '"></div>').appendTo('body');
    }
    var PORTAL_SEL = '#' + PORTAL_ID;

    var openedBox = null;
    var $movedDropdown = null;

    var SELECTORS = {
      box: '.range-timepicker-box',
      inputBtn: '.time-input',
      dataText: '.time-input .data',
      dropdown: '.range-timepicker-dropdown',
      panel: '.tab-pannel',
      hourBtn: '.hour.list',
      minBtn: '.minute.list',
      applyBtn: '.btn-confirm',
    };

    var CLASSES = {
      active: 'active',
      bottom: 'bottom',
      alignRight: 'align-right',
      selected: 'active',
    };

    var uid = 0;

    // -------------------------
    // init committed
    // -------------------------
    $(SELECTORS.box).each(function () {
      var $box = $(this);
      if (!$box.attr('data-rtp-id')) {
        uid += 1;
        $box.attr('data-rtp-id', 'rtp-' + uid);
      }
      var range = parseRange($box.find(SELECTORS.dataText).text());
      $box.data('rtpCommitted', range);
      $box.data('rtpDraft', $.extend(true, {}, range));
      $box.data('rtpTouchedEnd', false);
    });

    // -------------------------
    // Position
    // -------------------------
    function placeDropdown($input, $dropdown) {
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
        $dropdown.addClass(CLASSES.bottom);
      } else {
        $dropdown.removeClass(CLASSES.bottom);
      }

      var willOverflowRight = left + dropdownW > winW;
      if (willOverflowRight) {
        var right = winW - (rect.right + fRect.left);
        $dropdown.css({ position: 'fixed', top: top, right: right, left: 'auto', zIndex: 9999 });
        $dropdown.addClass(CLASSES.alignRight);
      } else {
        $dropdown.css({ position: 'fixed', top: top, left: left, right: 'auto', zIndex: 9999 });
        $dropdown.removeClass(CLASSES.alignRight);
      }
    }

    // -------------------------
    // open / close
    // -------------------------
    function openPicker($box) {
      var $input = $box.find(SELECTORS.inputBtn).first();
      var $dropdown = $box.find(SELECTORS.dropdown).first();
      if (!$input.length || !$dropdown.length) return;

      if (openedBox && openedBox !== $box.get(0)) {
        closePicker($(openedBox));
      }

      openedBox = $box.get(0);

      var committed = $box.data('rtpCommitted') || defaultRange();
      $box.data('rtpDraft', $.extend(true, {}, committed));
      $box.data('rtpTouchedEnd', false);

      $dropdown.attr('data-owner', $box.attr('data-rtp-id'));
      $movedDropdown = $dropdown;
      $portal.append($movedDropdown);

      resetToStartTab($movedDropdown);
      $movedDropdown.addClass(CLASSES.active);
      renderDraftToUI($box, $movedDropdown);
      updateApplyState($movedDropdown, true);
      placeDropdown($input, $movedDropdown);
    }

    function closePicker($box) {
      if (!$box || !$box.length) return;

      var $dropdown = $movedDropdown || $box.find(SELECTORS.dropdown).first();
      if (!$dropdown.length) return;

      $dropdown
        .removeClass(CLASSES.active + ' ' + CLASSES.bottom + ' ' + CLASSES.alignRight)
        .removeAttr('style')
        .removeAttr('data-owner');

      $box.append($dropdown);
      openedBox = null;
      $movedDropdown = null;
    }

    // -------------------------
    // events (iframe시 parent document에 바인딩)
    // -------------------------
    $(document).on('click', SELECTORS.box + ' ' + SELECTORS.inputBtn, function (e) {
      e.stopPropagation();
      var $box = $(this).closest(SELECTORS.box);
      if (openedBox !== $box.get(0)) openPicker($box);
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

    // 포털 내부 클릭 → 닫힘 방지
    $(_pdoc).on('click', PORTAL_SEL + ' ' + SELECTORS.dropdown, function (e) {
      e.stopPropagation();
    });

    // hour select
    $(_pdoc).on('click', PORTAL_SEL + ' ' + SELECTORS.hourBtn, function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (!openedBox || !$movedDropdown) return;

      var $btn = $(this);
      var $box = $(openedBox);
      var type = getPanelTypeByButton($btn);
      if (!type) return;

      var hour = clamp(toInt($btn.text(), 0), 0, 23);
      var draft = $box.data('rtpDraft') || defaultRange();

      if (type === 'start') {
        draft.start.h = hour;
        if (!$box.data('rtpTouchedEnd')) {
          var end = addHoursKeepMinute(draft.start.h, draft.start.m, 1);
          draft.end.h = end.h;
          draft.end.m = end.m;
        }
      } else {
        draft.end.h = hour;
        $box.data('rtpTouchedEnd', true);
      }

      $box.data('rtpDraft', draft);
      renderDraftToUI($box, $movedDropdown);
      updateApplyState($movedDropdown, true);
    });

    // minute select
    $(_pdoc).on('click', PORTAL_SEL + ' ' + SELECTORS.minBtn, function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (!openedBox || !$movedDropdown) return;

      var $btn = $(this);
      var $box = $(openedBox);
      var type = getPanelTypeByButton($btn);
      if (!type) return;

      var minute = clamp(toInt($btn.text(), 0), 0, 59);
      var draft = $box.data('rtpDraft') || defaultRange();

      if (type === 'start') {
        draft.start.m = minute;
        if (!$box.data('rtpTouchedEnd')) {
          var end = addHoursKeepMinute(draft.start.h, draft.start.m, 1);
          draft.end.h = end.h;
          draft.end.m = end.m;
        }
      } else {
        draft.end.m = minute;
        $box.data('rtpTouchedEnd', true);
      }

      $box.data('rtpDraft', draft);
      renderDraftToUI($box, $movedDropdown);
      updateApplyState($movedDropdown, true);
    });

    // apply
    $(_pdoc).on('click', PORTAL_SEL + ' ' + SELECTORS.applyBtn, function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (!openedBox || !$movedDropdown) return;

      var $btn = $(this);
      if ($btn.prop('disabled')) return;

      var $box = $(openedBox);
      var draft = $box.data('rtpDraft') || defaultRange();

      if (compareTime(draft.end, draft.start) < 0) {
        window.alert('종료시간이 시작시간보다 작습니다.');
        return;
      }

      $box.data('rtpCommitted', $.extend(true, {}, draft));
      setDataText($box, draft);
      closePicker($box);
    });

    // resize/scroll 시 위치 재계산
    $(_pwin).on('resize scroll', function () {
      if (!openedBox || !$movedDropdown) return;
      var $box = $(openedBox);
      placeDropdown($box.find(SELECTORS.inputBtn).first(), $movedDropdown);
    });

    // -------------------------
    // UI helpers
    // -------------------------
    function renderDraftToUI($box, $dropdown) {
      var draft = $box.data('rtpDraft') || defaultRange();
      var $panels = $dropdown.find(SELECTORS.panel);
      var $startPanel = $panels.eq(0);
      var $endPanel = $panels.eq(1);

      if ($startPanel.length) {
        setSelectedHourUI($startPanel, draft.start.h);
        setSelectedMinuteUI($startPanel, draft.start.m);
      }
      if ($endPanel.length) {
        setSelectedHourUI($endPanel, draft.end.h);
        setSelectedMinuteUI($endPanel, draft.end.m);
      }
    }

    function setSelectedHourUI($panel, hour) {
      $panel.find(SELECTORS.hourBtn).removeClass(CLASSES.selected).each(function () {
        var $b = $(this);
        if (toInt($b.text(), -1) === hour) $b.addClass(CLASSES.selected);
      });
    }

    function setSelectedMinuteUI($panel, minute) {
      $panel.find(SELECTORS.minBtn).removeClass(CLASSES.selected).each(function () {
        var $b = $(this);
        if (toInt($b.text(), -1) === minute) $b.addClass(CLASSES.selected);
      });
    }

    function updateApplyState($dropdown, enabled) {
      $dropdown.find(SELECTORS.applyBtn).prop('disabled', !enabled);
    }

    function getPanelTypeByButton($btn) {
      var $panel = $btn.closest(SELECTORS.panel);
      if (!$panel.length) return null;
      var idx = $panel.index();
      if (idx === 0) return 'start';
      if (idx === 1) return 'end';
      return null;
    }

    // -------------------------
    // Data helpers
    // -------------------------
    function defaultRange() {
      return { start: { h: 0, m: 0 }, end: { h: 0, m: 0 } };
    }

    function parseRange(text) {
      var s = $.trim(text || '');
      if (!s || s.indexOf('~') === -1) return defaultRange();
      var parts = s.split('~');
      var a = normalizeTime(parts[0]);
      var b = normalizeTime(parts[1]);
      return { start: { h: a.h, m: a.m }, end: { h: b.h, m: b.m } };
    }

    function normalizeTime(str) {
      var t = $.trim(str || '');
      if (t.indexOf(':') === -1) return { h: 0, m: 0 };
      var p = t.split(':');
      return { h: clamp(toInt(p[0], 0), 0, 23), m: clamp(toInt(p[1], 0), 0, 59) };
    }

    function setDataText($box, range) {
      var text = formatTime(range.start.h, range.start.m) + '~' + formatTime(range.end.h, range.end.m);
      $box.find(SELECTORS.dataText).text(text);
    }

    function formatTime(h, m) {
      return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
    }

    function toInt(v, fallback) {
      var n = parseInt($.trim(v), 10);
      return isNaN(n) ? fallback : n;
    }

    function clamp(n, min, max) {
      return Math.min(max, Math.max(min, n));
    }

    function addHoursKeepMinute(h, m, addH) {
      var total = h * 60 + m + addH * 60;
      total = ((total % (24 * 60)) + 24 * 60) % (24 * 60);
      return { h: Math.floor(total / 60), m: total % 60 };
    }

    function resetToStartTab($dropdown) {
      if (!$dropdown || !$dropdown.length) return;
      var $tabs = $dropdown.find('.tabs .tab a');
      var $panels = $dropdown.find('.tab-pannel');
      $tabs.removeClass('on');
      $tabs.eq(0).addClass('on');
      $panels.removeClass('active');
      $panels.eq(0).addClass('active');
    }

    function compareTime(a, b) {
      var am = a.h * 60 + a.m;
      var bm = b.h * 60 + b.m;
      return am - bm;
    }
  });
})(jQuery);
