(function ($) {
  'use strict';

  // =========================================================
  // CONFIG
  // =========================================================
  var SELECTORS = {
    tableBox: '.table-box.type-list-table',
    btable: '.btable',
    tbody: 'tbody',

    btnMinus: '.btn-minus',
    btnPlus: '.btn-plus',
    btnUp: '.btn-up',
    btnDown: '.btn-down',

    checkbox: 'input[type="checkbox"]',
    textInput: 'input[type="text"]',
    dropdown: '.field-dropdown',
    dropdownItem: '.dropdown-list',
    dropdownText: '.text',
    dropdownPlaceholder: '.placeholder',

    datepicker: '.datepicker',
  };

  var CLASSES = {
    inited: 'is-inited',
  };

  // 프로젝트 datepicker 옵션(필요 시 수정)
  var DATEPICKER_OPTIONS = {
    autoclose: true,
    format: 'yyyy-mm-dd',
    todayHighlight: true,
    language: 'ko',
  };

  // =========================================================
  // UTILS
  // =========================================================
  var raf = function (fn) {
    if (window.requestAnimationFrame) return window.requestAnimationFrame(fn);
    return setTimeout(fn, 0);
  };

  var debounce = function (fn, wait) {
    var t;
    return function () {
      var ctx = this;
      var args = arguments;
      clearTimeout(t);
      t = setTimeout(function () {
        fn.apply(ctx, args);
      }, wait);
    };
  };

  var getNewIdBySequence = function (id, newSequence) {
    if (!id) return null;

    // ex) foo12 -> foo{n}
    var m1 = id.match(/^(.+?)(\d+)$/);
    if (m1) return m1[1] + newSequence;

    // ex) foo_12 / foo-12 -> foo_{n} / foo-{n}
    var m2 = id.match(/^(.+?)([_-])(\d+)$/);
    if (m2) return m2[1] + m2[2] + newSequence;

    return null;
  };

  // =========================================================
  // WIDTH SYNC (type-list-table)
  // =========================================================
  var syncBtableWidth = function ($tableBox) {
    var $btable = $tableBox.find(SELECTORS.btable).first();
    if (!$btable.length) return;

    raf(function () {
      var el = $btable[0];
      var hasScroll = el.scrollHeight > el.clientHeight;
      $btable.css('width', hasScroll ? 'calc(100% + 12px)' : '100%');
    });
  };

  var syncAllTypeListTables = function () {
    // .table-box.type-list-table (기존)
    $(SELECTORS.tableBox).each(function () {
      syncBtableWidth($(this));
    });
    // .type-list-table (table2.js 호환성)
    $('.type-list-table')
      .not(SELECTORS.tableBox)
      .each(function () {
        var $btable = $(this).find(SELECTORS.btable).first();
        if (!$btable.length) return;
        raf(function () {
          var el = $btable[0];
          var hasScroll = el.scrollHeight > el.clientHeight;
          $btable.css('width', hasScroll ? 'calc(100% + 12px)' : '100%');
        });
      });
  };

  // =========================================================
  // DATEPICKER (bootstrap-datepicker)
  // - row clone 후 "추가된 row 내부"만 안전하게 재초기화
  // =========================================================
  var hasBootstrapDatepicker = function () {
    return typeof $.fn !== 'undefined' && typeof $.fn.datepicker === 'function';
  };

  var reinitDatepickersIn = function (rootEl) {
    if (!($.fn && $.fn.datepicker)) return;

    var $inputs = $(rootEl).find('input.datepicker, .datepicker input[type="text"], input[data-provide="datepicker"]');

    if (!$inputs.length) return;

    $inputs.each(function () {
      var $el = $(this);

      if ($el.data('datepicker')) {
        $el.datepicker('destroy');
      }
      $el.removeData('datepicker').removeData('date');

      // (선택) 값 초기화
      // $el.val('');

      $el.datepicker({
        autoclose: true,
        format: 'yy-mm-dd',
        todayHighlight: true,
        language: 'ko',
      });
    });
  };

  // =========================================================
  // DROPDOWN RESET (row clone 후 초기상태로)
  // - row 안에 dropdown 여러 개여도 전부 리셋
  // =========================================================
  var resetDropdownsIn = function ($root) {
    $root.find(SELECTORS.dropdown).each(function () {
      var $dd = $(this);

      var $text = $dd.find(SELECTORS.dropdownText).first();
      var $ph = $dd.find(SELECTORS.dropdownPlaceholder).first();

      if ($text.length) $text.text('').css('display', 'none');
      if ($ph.length) $ph.text('선택').css('display', 'block');

      $dd.find(SELECTORS.dropdownItem).removeClass('active');

      // "선택" 항목이 있으면 active 부여
      var $selectOpt = $dd
        .find(SELECTORS.dropdownItem)
        .filter(function () {
          return $.trim($(this).text()) === '선택';
        })
        .first();
      if ($selectOpt.length) $selectOpt.addClass('active');

      // hidden select가 있다면 기본값으로 돌리고 싶으면(선택)
      // var $select = $dd.find('select').first();
      // if ($select.length) $select.prop('selectedIndex', 0).trigger('change');
    });
  };

  // =========================================================
  // TABLE ROW HELPERS
  // =========================================================
  var updateSequenceNumbers = function ($tbody) {
    $tbody.find('tr').each(function (idx) {
      var $seq = $(this).find('td.align-center').first();
      if ($seq.length) $seq.text(idx + 1);
    });
  };

  // 빈 행 확인(원본 로직 유지)
  var isEmptyRow = function ($row) {
    var empty = true;

    $row.find('td').each(function () {
      var $cell = $(this);

      if ($cell.hasClass('align-center')) return;

      var $input = $cell.find(SELECTORS.textInput).first();
      if ($input.length && $.trim($input.val()) !== '') {
        empty = false;
        return false;
      }

      var $dropdown = $cell.find(SELECTORS.dropdown).first();
      if ($dropdown.length) {
        var $text = $dropdown.find(SELECTORS.dropdownText).first();
        if ($text.length && $.trim($text.text()) !== '' && $text.css('display') !== 'none') {
          empty = false;
          return false;
        }
      }

      var textContent = $.trim($cell.text());
      var hasInputs = $cell.find('input, select, button, .field-dropdown').length > 0;
      if (!hasInputs && textContent !== '') {
        empty = false;
        return false;
      }
    });

    return empty;
  };

  // cloneRow: lastRow를 기반으로 새 row 생성
  // - checkbox id/name 갱신
  // - align-center 순번 갱신
  // - text input id/name 갱신 + value 초기화
  // - datepicker input도 동일하게 id/name 갱신(가능한 경우) + value 초기화(원하면)
  // - dropdown 리셋
  var createNewRow = function ($tbody) {
    var $rows = $tbody.find('tr');
    var $lastRow = $rows.last();
    if (!$lastRow.length) return null;

    var newSeq = $rows.length + 1;
    var $newRow = $lastRow.clone(false, false);

    // 체크박스 갱신
    var $cb = $newRow.find(SELECTORS.checkbox).first();
    if ($cb.length) {
      var newId = 'checkbox_' + String(newSeq).padStart(2, '0');
      $cb.attr({ id: newId, name: newId }).prop('checked', false);
    }

    // 순번 갱신
    var $seqCell = $newRow.find('td.align-center').first();
    if ($seqCell.length) $seqCell.text(newSeq);

    // input 갱신(텍스트 인풋 전부)
    $newRow.find(SELECTORS.textInput).each(function () {
      var $input = $(this);
      var id = $input.attr('id');
      var name = $input.attr('name');

      var nextId = getNewIdBySequence(id, newSeq);
      var nextName = getNewIdBySequence(name, newSeq);

      if (nextId) $input.attr('id', nextId);
      if (nextName) $input.attr('name', nextName);

      // 값 초기화(원하면 주석 해제)
      $input.val('');
    });

    // dropdown 리셋(여러 개 대응)
    resetDropdownsIn($newRow);

    return $newRow;
  };

  // =========================================================
  // TABLE INIT (중복 바인딩 방지)
  // =========================================================
  var initTableControl = function ($tableBox) {
    if ($tableBox.data('tableInited')) return;
    $tableBox.data('tableInited', true).addClass(CLASSES.inited);

    var $tbody = $tableBox.find(SELECTORS.tbody).first();
    if (!$tbody.length) return;

    // 버튼 이벤트(테이블 박스 단위로 바인딩)
    $tableBox.on('click', SELECTORS.btnMinus, function () {
      var $rows = $tbody.find('tr');
      if ($rows.length <= 1) {
        alert('최소 1개 행은 유지해야 합니다.');
        return;
      }

      $rows.last().remove();
      updateSequenceNumbers($tbody);
      syncBtableWidth($tableBox);
    });

    $tableBox.on('click', SELECTORS.btnPlus, function () {
      var $newRow = createNewRow($tbody);
      if (!$newRow) return;

      $tbody.append($newRow);
      updateSequenceNumbers($tbody);

      reinitDatepickersIn($newRow[0]);

      syncBtableWidth($tableBox);
    });

    $tableBox.on('click', SELECTORS.btnUp, function () {
      var $checked = $tbody.find(SELECTORS.checkbox + ':checked').first();
      if (!$checked.length) {
        alert('이동할 행을 선택해주세요.');
        return;
      }

      var $current = $checked.closest('tr');
      var $prev = $current.prev('tr');

      if (!$prev.length) {
        alert('이미 맨 위 행입니다.');
        return;
      }

      $current.insertBefore($prev);
      updateSequenceNumbers($tbody);
      $checked.prop('checked', true);
      syncBtableWidth($tableBox);
    });

    $tableBox.on('click', SELECTORS.btnDown, function () {
      var $checked = $tbody.find(SELECTORS.checkbox + ':checked').first();
      if (!$checked.length) {
        alert('이동할 행을 선택해주세요.');
        return;
      }

      var $current = $checked.closest('tr');
      var $next = $current.next('tr');

      if (!$next.length) {
        alert('이미 맨 아래 행입니다.');
        return;
      }

      if (isEmptyRow($next)) {
        alert('이미 맨 아래 행입니다.');
        return;
      }

      var $nextNext = $next.next('tr');
      if ($nextNext.length) $current.insertBefore($nextNext);
      else $tbody.append($current);

      updateSequenceNumbers($tbody);
      $checked.prop('checked', true);
      syncBtableWidth($tableBox);
    });

    // 최초 width sync
    syncBtableWidth($tableBox);
  };

  var initAllTableControls = function () {
    $(SELECTORS.tableBox).each(function () {
      initTableControl($(this));
    });
  };

  // =========================================================
  // JQGRID WIDTH SYNC (기존 유지, jQuery 형태로 안정화)
  // =========================================================
  window.adjustBdivWidth = function (grid) {
    if (typeof $ === 'undefined') {
      console.warn('jQuery is required for adjustBdivWidth function');
      return;
    }

    var $grid = typeof grid === 'string' ? $(grid) : $(grid);
    if (!$grid.length) {
      console.warn('Grid element not found');
      return;
    }

    var $bdiv = $grid.closest('.ui-jqgrid-bdiv');
    if ($bdiv.length && $bdiv[0]) {
      var hasScroll = $bdiv[0].scrollHeight > $bdiv[0].clientHeight;
      $bdiv.css('width', hasScroll ? 'calc(100% + 12px)' : '');
    }
  };

  var adjustAllBdivWidths = function () {
    if (typeof $ === 'undefined') return;

    $('.ui-jqgrid-btable').each(function () {
      var $grid = $(this);
      var gridId = $grid.attr('id');

      if (gridId) {
        window.adjustBdivWidth($('#' + gridId));
        return;
      }

      var $bdiv = $grid.closest('.ui-jqgrid-bdiv');
      if ($bdiv.length && $bdiv[0]) {
        var hasScroll = $bdiv[0].scrollHeight > $bdiv[0].clientHeight;
        $bdiv.css('width', hasScroll ? 'calc(100% + 12px)' : '');
      }
    });
  };

  // =========================================================
  // ROWSPAN HOVER (중복 바인딩 방지 + 위임 방식)
  // - 기존처럼 "rowspan 셀 그룹" hover + "일반 셀은 rowspan 셀만" hover
  // =========================================================
  var ROWSPAN_HOVER_BG = 'linear-gradient(0deg, rgba(0, 0, 0, 0.05) 0%, rgba(0, 0, 0, 0.05) 100%), var(--semantic-surface-neutral-container-base-alt)';

  var clearHoverRows = function (rows) {
    if (!rows || !rows.length) return;
    rows.forEach(function (tr) {
      if (tr) tr.style.background = '';
    });
  };

  var collectRowspanGroupRows = function ($rowspanCell) {
    var rows = [];
    var rowspanValue = parseInt($rowspanCell.attr('rowspan'), 10);
    if (isNaN(rowspanValue) || rowspanValue <= 1) return rows;

    var $row = $rowspanCell.closest('tr');
    if (!$row.length) return rows;

    rows.push($row[0]);

    var $t = $row;
    for (var i = 1; i < rowspanValue; i++) {
      $t = $t.next('tr');
      if ($t.length) rows.push($t[0]);
      else break;
    }

    return rows;
  };

  var findRowspanCellInGroup = function ($currentRow) {
    // 현재 row에 rowspan 셀이 있으면 그게 그룹의 시작
    var $direct = $currentRow.find('td[rowspan]').first();
    if ($direct.length) return $direct;

    // 위로 올라가며 현재 row가 포함되는 rowspan 그룹을 찾음
    var $checkRow = $currentRow.prev('tr');

    while ($checkRow.length) {
      var found = null;

      $checkRow.find('td[rowspan]').each(function () {
        var $cell = $(this);
        var rowspanValue = parseInt($cell.attr('rowspan'), 10);
        if (isNaN(rowspanValue) || rowspanValue <= 1) return;

        var $start = $cell.closest('tr');
        var $t = $start;

        for (var i = 0; i < rowspanValue; i++) {
          if ($t[0] === $currentRow[0]) {
            found = $cell;
            return false;
          }
          $t = $t.next('tr');
          if (!$t.length) break;
        }
      });

      if (found) return found;
      $checkRow = $checkRow.prev('tr');
    }

    return null;
  };

  var initRowspanHover = function ($tableBox) {
    if ($tableBox.data('rowspanHoverInited')) return;
    $tableBox.data('rowspanHoverInited', true);

    var $tbody = $tableBox.find('tbody').first();
    if (!$tbody.length) return;

    // tbody 단위로 위임 바인딩(성능 + 중복방지)
    $tbody.on('mouseenter', 'td[rowspan]', function () {
      var $cell = $(this);
      var rows = collectRowspanGroupRows($cell);
      rows.forEach(function (tr) {
        tr.style.background = ROWSPAN_HOVER_BG;
      });
      $cell.data('hoverRows', rows);
    });

    $tbody.on('mouseleave', 'td[rowspan]', function () {
      var $cell = $(this);
      clearHoverRows($cell.data('hoverRows'));
      $cell.removeData('hoverRows');
    });

    // rowspan 없는 td: 그룹의 rowspan td만 하이라이트
    $tbody.on('mouseenter', 'td:not([rowspan])', function () {
      var $cell = $(this);
      var $row = $cell.closest('tr');
      if (!$row.length) return;

      var $rowspanCell = findRowspanCellInGroup($row);
      if ($rowspanCell && $rowspanCell.length) {
        $rowspanCell[0].style.background = ROWSPAN_HOVER_BG;
        $cell.data('hoverRowspanCell', $rowspanCell[0]);
      }
    });

    $tbody.on('mouseleave', 'td:not([rowspan])', function () {
      var el = $(this).data('hoverRowspanCell');
      if (el) el.style.background = '';
      $(this).removeData('hoverRowspanCell');
    });
  };

  var initAllRowspanHover = function () {
    $(SELECTORS.tableBox).each(function () {
      initRowspanHover($(this));
    });
  };

  // =========================================================
  // MUTATION OBSERVER (동적 테이블 추가 대응)
  // - table control + rowspan hover 모두 자동 init
  // =========================================================
  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (m) {
      m.addedNodes.forEach(function (node) {
        if (!node || node.nodeType !== 1) return;

        var $node = $(node);

        // node 자체
        if ($node.is(SELECTORS.tableBox)) {
          initTableControl($node);
          initRowspanHover($node);
          syncBtableWidth($node);
        }

        // 자식들
        $node.find(SELECTORS.tableBox).each(function () {
          var $tb = $(this);
          initTableControl($tb);
          initRowspanHover($tb);
          syncBtableWidth($tb);
        });
      });
    });
  });

  // =========================================================
  // BOOTSTRAP
  // =========================================================
  $(function () {
    initAllTableControls();
    initAllRowspanHover();

    // 최초 전체 width sync
    syncAllTypeListTables();
    adjustAllBdivWidths();

    // resize (type-list + jqGrid)
    $(window).on(
      'resize',
      debounce(function () {
        syncAllTypeListTables();
        adjustAllBdivWidths();
      }, 150),
    );

    // observe
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    }
  });
})(jQuery);
