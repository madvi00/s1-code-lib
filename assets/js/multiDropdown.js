(function ($) {
  'use strict';

  // =========================
  // Defaults / Selectors
  // =========================
  const DEFAULTS = {
    separator: ', ',
    closeOnOutsideClick: true,
    onOpen: null, // function($root)
    onClose: null, // function($root)
    onChange: null, // function(values, labels, $root)
    onConfirm: null, // function(values, labels, $root)
    onCancel: null, // function($root)
    portal: true,
    portalZIndex: 9999,
    gutter: 4,
    autoPosition: true,
  };

  const SELECTORS = {
    root: '.field-multi-dropdown',
    trigger: '.btn-dropdown',
    listBox: '.dropdown-list-box',
    dim: '.dim',
    close: '.btn-close',
    checkbox: 'input[type="checkbox"]',
    select: '.dropdown-select',
    cancelBtn: '.dropdown-list-footer .btn.btn-white',
    confirmBtn: '.dropdown-list-footer .btn.btn-blue',
  };

  const CLASSES = {
    show: 'show',
    disabled: 'disabled',
    readonly: 'readonly',
    reverse: 'reverse',
  };

  const DEBOUNCE_DELAY = 100;

  function getInstance($root) {
    return $root && $root.length ? $root.data('multi-dropdown-instance') : null;
  }

  function getScope($root) {
    const inst = getInstance($root);
    if (inst && inst.$portalBox && inst.$portalBox.length) return inst.$portalBox;
    return $root;
  }

  function setShow($root, isShow) {
    const inst = getInstance($root);
    const $inRoot = $root.find(SELECTORS.listBox);
    const $portal = inst && inst.$portalBox ? inst.$portalBox : $();
    const $boxes = $inRoot.add($portal);

    if (isShow) {
      $root.addClass(CLASSES.show);
      $boxes.addClass(CLASSES.show);
    } else {
      $root.removeClass(CLASSES.show);
      $boxes.removeClass(CLASSES.show);
    }
  }

  function getChecked($root) {
    const values = [];
    const labels = [];

    getScope($root)
      .find(SELECTORS.checkbox)
      .each(function () {
        const $cb = $(this);
        if (!$cb.prop('checked')) return;

        const v = $cb.val() || $cb.attr('id') || '';
        values.push(String(v));

        const label = $cb.closest('label').find('span').first().text().trim();
        labels.push(label || String(v));
      });

    return { values, labels };
  }

  function getSelectValues($root) {
    const $select = $root.find(SELECTORS.select);
    if (!$select.length) return [];
    const v = $select.val();
    return Array.isArray(v) ? v.map(String) : v ? [String(v)] : [];
  }

  function syncSelectFromChecks($root, values) {
    const $select = $root.find(SELECTORS.select);
    if (!$select.length) return;

    $select.find('option[value=""]').prop('selected', false);
    $select.val(values);
    $select.trigger('change');
  }

  function syncChecksFromSelect($root) {
    const values = getSelectValues($root);
    const set = new Set(values);

    getScope($root)
      .find(SELECTORS.checkbox)
      .each(function () {
        const v = String($(this).val() || $(this).attr('id') || '');
        $(this).prop('checked', set.has(v));
      });
  }

  function syncInputFromChecks($root) {
    const inst = getInstance($root);
    if (!inst) return;

    const { values, labels } = getChecked($root);
    syncSelectFromChecks($root, values);
    $root.find(SELECTORS.trigger).val(labels.join(inst.options.separator));

    if (typeof inst.options.onChange === 'function') {
      inst.options.onChange(values, labels, $root);
    }
  }

  function snapshotChecks($root) {
    const snap = {};
    getScope($root)
      .find(SELECTORS.checkbox)
      .each(function () {
        const id = $(this).attr('id');
        if (id) snap[id] = $(this).prop('checked');
      });
    return snap;
  }

  function restoreChecks($root, snap) {
    if (!snap) return;
    getScope($root)
      .find(SELECTORS.checkbox)
      .each(function () {
        const id = $(this).attr('id');
        if (id in snap) $(this).prop('checked', snap[id]);
      });
  }

  const Global = {
    bound: false,
    bind: function () {
      if (this.bound) return;
      this.bound = true;

      function resolveRoot($node) {
        const $box = $node.closest(SELECTORS.listBox);
        const ownerId = $box.attr('data-portal-owner');
        return ownerId ? $('#' + ownerId) : $node.closest(SELECTORS.root);
      }

      $(document).on('change.multiDropdown', SELECTORS.checkbox, function () {
        syncInputFromChecks(resolveRoot($(this)));
      });

      $(document).on('click.multiDropdown', function (e) {
        const $t = $(e.target);

        if ($t.closest([SELECTORS.dim, SELECTORS.close, SELECTORS.cancelBtn].join(',')).length) {
          const inst = getInstance(resolveRoot($t));
          if (inst) inst.cancel();
          return;
        }

        if ($t.closest(SELECTORS.confirmBtn).length) {
          const inst = getInstance(resolveRoot($t));
          if (inst) inst.confirm();
          return;
        }

        if ($t.closest(SELECTORS.trigger).length) {
          const $root = $t.closest(SELECTORS.root);
          const inst = getInstance($root);
          if (inst && !inst.isDisabled()) inst.toggle();
          return;
        }

        if (!$t.closest(SELECTORS.root).length && !$t.closest(SELECTORS.listBox).length) {
          $(SELECTORS.root).each(function () {
            const inst = getInstance($(this));
            if (inst && inst.isOpen && inst.options.closeOnOutsideClick) inst.cancel();
          });
        }
      });

      let timer;
      $(window).on('scroll.multiDropdown resize.multiDropdown', function () {
        clearTimeout(timer);
        timer = setTimeout(() => {}, DEBOUNCE_DELAY);
      });
    },
  };

  function MultiDropdown($root, options) {
    this.$root = $root;
    this.options = $.extend({}, DEFAULTS, options);
    this.isOpen = false;
    this._snapshot = null;
    this.ownerId = null;
    this.$listBox = null;
    this.$portalBox = null;
    this.$home = null;
    this.init();
  }

  MultiDropdown.prototype = {
    init: function () {
      const id = this.$root.attr('id') || 'multi_' + Math.random().toString(36).slice(2, 10);
      this.$root.attr('id', id);
      this.ownerId = id;

      this.$listBox = this.$root.find(SELECTORS.listBox).first();
      if (this.$listBox.length) {
        this.$home = $('<span aria-hidden="true"></span>');
        this.$listBox.before(this.$home);
      }

      syncChecksFromSelect(this.$root);
      setTimeout(() => syncInputFromChecks(this.$root), 0);

      Global.bind();
    },

    isDisabled: function () {
      return this.$root.hasClass(CLASSES.disabled) || this.$root.hasClass(CLASSES.readonly);
    },

    open: function () {
      if (this.isDisabled() || this.isOpen) return;

      $(SELECTORS.root).each((_, el) => {
        const inst = getInstance($(el));
        if (inst && inst !== this) inst.close();
      });

      this._snapshot = snapshotChecks(this.$root);

      if (this.options.portal && this.$listBox.length) {
        this.$portalBox = this.$listBox;
        this.$portalBox.attr('data-portal-owner', this.ownerId).appendTo('body').css({
          position: 'fixed',
          zIndex: this.options.portalZIndex,
        });
      }

      setShow(this.$root, true);
      this.isOpen = true;

      if (typeof this.options.onOpen === 'function') this.options.onOpen(this.$root);
    },

    close: function () {
      if (!this.isOpen) return;

      setShow(this.$root, false);
      this.isOpen = false;

      if (this.$portalBox && this.$home) {
        this.$portalBox.insertAfter(this.$home).css({ position: '', zIndex: '' });
        this.$portalBox.removeAttr('data-portal-owner');
        this.$portalBox = null;
      }

      if (typeof this.options.onClose === 'function') this.options.onClose(this.$root);
    },

    toggle: function () {
      this.isOpen ? this.close() : this.open();
    },

    cancel: function () {
      restoreChecks(this.$root, this._snapshot);
      syncInputFromChecks(this.$root);
      if (typeof this.options.onCancel === 'function') this.options.onCancel(this.$root);
      this.close();
    },

    confirm: function () {
      const { values, labels } = getChecked(this.$root);
      syncSelectFromChecks(this.$root, values);
      this._snapshot = snapshotChecks(this.$root);

      if (typeof this.options.onConfirm === 'function') {
        this.options.onConfirm(values, labels, this.$root);
      }

      this.$root.trigger('dropdown:change', { values, labels });
      const $select = this.$root.find(SELECTORS.select);
      if ($select.length) {
        $select.trigger('dropdown:change', { values, labels });
      }

      this.close();
    },
  };

  $.fn.multiDropdown = function (option) {
    return this.each(function () {
      const $root = $(this);
      if (typeof option === 'string') {
        const inst = getInstance($root);
        if (inst && inst[option]) inst[option]();
        return;
      }
      if (!getInstance($root)) {
        $root.data('multi-dropdown-instance', new MultiDropdown($root, option));
      }
    });
  };

  function autoInit() {
    $(SELECTORS.root).each(function () {
      if (!getInstance($(this))) $(this).multiDropdown();
    });
  }

  document.readyState === 'loading' ? $(document).ready(autoInit) : autoInit();
})(jQuery);
