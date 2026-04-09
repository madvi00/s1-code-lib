(function ($) {
  'use strict';

  const DEFAULTS = {
    onSelect: null,
    onOpen: null,
    onClose: null,
    portal: true,
    portalZIndex: 9999,
    closeOnOutsideClick: true,
  };

  const SELECTORS = {
    dropdown: '.field-dropdown',
    select: '.dropdown-select',
    button: '.btn-dropdown',
    optionButton: '.btn-dropdown-list',
    text: '.text',
    placeholder: '.placeholder',
    selectedLabel: '.selected-label',
    list: '.dropdown-list',
    activeList: '.dropdown-list.active',
    listBox: '.dropdown-list-box',
    dim: '.dim',
    closeBtn: '.btn-close',
  };

  const CLASSES = {
    show: 'show',
    reverse: 'reverse',
    active: 'active',
    disabled: 'disabled',
    readonly: 'readonly',
    portalOpen: 'show',
  };

  const Utils = {
    closeAll: function (except) {
      $(SELECTORS.dropdown).each(function () {
        const $dropdown = $(this);
        if (except && $dropdown[0] === except[0]) return;

        const instance = $dropdown.data('dropdown-instance');
        if (instance) instance.close();
      });
    },

    getValueFromOption: function ($option) {
      const dataValue = $option.attr('data-value');
      if (this.isValidValue(dataValue)) return dataValue;

      const btnValue = $option.attr('value');
      if (this.isValidValue(btnValue)) return btnValue;

      return $option.find('span').text().trim() || '';
    },

    isValidValue: function (value) {
      return value !== undefined && value !== null && value !== '' && value !== 'undefined';
    },
  };

  const GlobalEvents = {
    handleClick: function (e) {
      const $target = $(e.target);

      const $dim = $target.closest(SELECTORS.dim);
      if ($dim.length) {
        const $portalBox = $dim.closest(SELECTORS.listBox);
        const ownerId = $portalBox.attr('data-portal-owner');
        const $dropdown = ownerId ? $('#' + ownerId) : $dim.closest(SELECTORS.dropdown);

        const instance = $dropdown.data('dropdown-instance');
        if (instance) instance.close();
        return;
      }

      const $close = $target.closest(SELECTORS.closeBtn);
      if ($close.length) {
        const $portalBox = $close.closest(SELECTORS.listBox);
        const ownerId = $portalBox.attr('data-portal-owner');
        const $dropdown = ownerId ? $('#' + ownerId) : $close.closest(SELECTORS.dropdown);

        const instance = $dropdown.data('dropdown-instance');
        if (instance) instance.close();
        return;
      }

      const $portalBoxHit = $target.closest(SELECTORS.listBox);
      if ($portalBoxHit.length) {
        const ownerId = $portalBoxHit.attr('data-portal-owner');
        const $dropdown = ownerId ? $('#' + ownerId) : $target.closest(SELECTORS.dropdown);
        const instance = $dropdown.data('dropdown-instance');
        if (!instance || instance.isDisabled()) return;

        const $optionButton = $target.closest(SELECTORS.optionButton);
        if ($optionButton.length && !$optionButton.prop('disabled')) {
          const text = $optionButton.find('span').text().trim();
          const value = Utils.getValueFromOption($optionButton);
          instance.selectOption($optionButton, value, text);
        }
        return;
      }

      const $dropdown = $target.closest(SELECTORS.dropdown);

      if (!$dropdown.length) {
        $(SELECTORS.dropdown).each(function () {
          const inst = $(this).data('dropdown-instance');
          if (inst && inst.isOpen && inst.options.closeOnOutsideClick !== false) {
            inst.close();
          }
        });
        return;
      }

      const instance = $dropdown.data('dropdown-instance');
      if (!instance || instance.isDisabled()) return;

      if ($target.closest(SELECTORS.button).length) {
        instance.toggle();
        return;
      }
    },

    bindClick: function () {
      if (window._dropdownGlobalClickBound) return;
      $(document).on('click.dropdown', GlobalEvents.handleClick);
      window._dropdownGlobalClickBound = true;
    },
  };

  const Dropdown = function ($element, options) {
    this.$element = $element;
    this.options = $.extend({}, DEFAULTS, options);
    this.isOpen = false;

    this.$select = null;

    this.$listBox = null;
    this.$portalBox = null;
    this.$home = null;
    this.ownerId = null;

    this.init();
  };

  Dropdown.prototype = {
    init: function () {
      this.initOwnerId();
      this.initSelect();
      this.initListBox();
      this.initActiveState();
      this.bindSelectChange();
      this.bindGlobalEvents();
    },

    initOwnerId: function () {
      const id = this.$element.attr('id');
      if (id && id.trim()) {
        this.ownerId = id;
        return;
      }
      const newId = 'dropdown_' + Math.random().toString(36).slice(2, 10);
      this.$element.attr('id', newId);
      this.ownerId = newId;
    },

    initSelect: function () {
      this.$select = this.$element.find(SELECTORS.select);
      if (!this.$select.length) return;

      const $select = this.$select;
      const currentId = $select.attr('id');
      const currentName = $select.attr('name');

      if (!currentId || currentId.trim() === '') {
        const buttonId = this.$element.find(SELECTORS.button).attr('id');
        if (buttonId && buttonId.trim() !== '') {
          $select.attr('id', buttonId + '_select');
        } else {
          const randomId = 'dropdown_select_' + Math.random().toString(36).substr(2, 9);
          $select.attr('id', randomId);
          this.$element.find(SELECTORS.button).attr('id', randomId.replace('_select', ''));
        }
      }

      if (!currentName || currentName.trim() === '') {
        const selectId = $select.attr('id');
        if (selectId && selectId.trim() !== '') {
          $select.attr('name', selectId.replace('_select', ''));
        }
      }
    },

    initListBox: function () {
      this.$listBox = this.$element.find(SELECTORS.listBox).first();
      if (!this.$listBox.length) return;

      this.$home = $('<span class="dropdown-portal-home" aria-hidden="true"></span>');
      this.$listBox.before(this.$home);
    },

    getListRoot: function () {
      if (this.options.portal && this.$portalBox && this.$portalBox.length) return this.$portalBox;
      return this.$listBox && this.$listBox.length ? this.$listBox : this.$element;
    },

    initActiveState: function () {
      this.getListRoot().find(SELECTORS.list).removeClass(CLASSES.active);
      this.syncFromSelect();
    },

    bindSelectChange: function () {
      if (!this.$select || !this.$select.length) return;
      this.$select.on('change.dropdown', () => {
        this.syncFromSelect();
      });
    },

    bindGlobalEvents: function () {
      GlobalEvents.bindClick();
    },

    isDisabled: function () {
      return this.$element.hasClass(CLASSES.disabled) || this.$element.hasClass(CLASSES.readonly);
    },

    open: function () {
      if (this.isDisabled() || this.isOpen) return this;

      Utils.closeAll(this.$element);

      if (this.options.portal && this.$listBox && this.$listBox.length) {
        this.$portalBox = this.$listBox;

        this.$portalBox.attr('data-portal-owner', this.ownerId);
        this.$portalBox.appendTo('body');

        var btn = this.$element.find(SELECTORS.button)[0];
        if (btn) {
          var rect = btn.getBoundingClientRect();
          this.$portalBox.css({
            position: 'fixed',
            top: rect.bottom + 8,
            left: rect.left,
            width: rect.width,
          });
        }

        this.$portalBox.css({ zIndex: this.options.portalZIndex });
        this.$portalBox.addClass(CLASSES.portalOpen);
      }

      this.$element.addClass(CLASSES.show);
      this.isOpen = true;
      this.triggerCallback('onOpen', this.$element);

      return this;
    },

    close: function () {
      if (!this.isOpen) return this;

      this.$element.removeClass(CLASSES.show);
      this.isOpen = false;

      if (this.options.portal && this.$portalBox && this.$portalBox.length) {
        this.$portalBox.removeClass(CLASSES.portalOpen);

        if (this.$home && this.$home.length) {
          this.$portalBox.insertAfter(this.$home);
        }

        this.$portalBox.css({ zIndex: '' });
        this.$portalBox.removeAttr('data-portal-owner');

        this.$portalBox = null;
      }

      this.$element.removeClass(CLASSES.reverse);

      this.triggerCallback('onClose', this.$element);

      this.getListRoot().find(SELECTORS.list).removeClass(CLASSES.active);
      this.syncFromSelect();
      return this;
    },

    toggle: function () {
      return this.isOpen ? this.close() : this.open();
    },

    triggerCallback: function (callbackName, ...args) {
      if (typeof this.options[callbackName] === 'function') {
        this.options[callbackName].apply(this, args);
      }
    },

    selectOption: function ($option, value, text) {
      if (!Utils.isValidValue(value)) return this;

      this.updateUI(text);
      this.updateActiveState($option);
      this.updateSelectValue(value, text);

      this.close();

      this.triggerCallback('onSelect', value, text, this.$element);

      this.$element.trigger('dropdown:change', { value: value, text: text, dropdown: this.$element[0] });
      if (this.$select && this.$select.length) {
        this.$select.trigger('dropdown:change', { value: value, text: text, dropdown: this.$element[0] });
      }

      return this;
    },

    updateUI: function (text) {
      const $text = this.$element.find(SELECTORS.text);
      const $placeholder = this.$element.find(SELECTORS.placeholder);
      const $selectedLabel = this.$element.find(SELECTORS.selectedLabel);

      if ($text.length) $text.text(text).show();
      if ($placeholder.length) $placeholder.hide();
      if ($selectedLabel.length) $selectedLabel.text(text);
    },

    updateActiveState: function ($option) {
      const $root = this.getListRoot();
      $root.find(SELECTORS.list).removeClass(CLASSES.active);

      const $targetList = $option.closest(SELECTORS.list);
      if ($targetList.length) $targetList.addClass(CLASSES.active);
    },

    updateSelectValue: function (value, text) {
      if (!this.$select || !this.$select.length) {
        this.$select = this.$element.find(SELECTORS.select);
        if (!this.$select.length) return;
      }

      const $select = this.$select;
      let targetValue = null;
      let $targetOption = null;

      if (Utils.isValidValue(value)) {
        $targetOption = $select.find('option').filter(function () {
          const optionValue = $(this).attr('value');
          if (!Utils.isValidValue(optionValue)) return false;
          return String(optionValue) === String(value);
        });
        if ($targetOption.length) targetValue = value;
      }

      if (!targetValue && text) {
        $targetOption = $select.find('option').filter(function () {
          return $(this).text().trim() === text;
        });
        if ($targetOption.length) {
          const optionValue = $targetOption.attr('value');
          targetValue = Utils.isValidValue(optionValue) ? optionValue : value;
        }
      }

      if (Utils.isValidValue(targetValue)) {
        $select.find('option').prop('selected', false);

        if ($targetOption && $targetOption.length) {
          $targetOption.prop('selected', true);
        }

        $select.val(targetValue).trigger('change');
      }
    },

    syncFromSelect: function () {
      if (!this.$select || !this.$select.length) return this;

      const selectedValue = this.$select.val();
      const $root = this.getListRoot();

      if (!Utils.isValidValue(selectedValue)) {
        $root.find(SELECTORS.list).removeClass(CLASSES.active);
        return this;
      }

      const $selectedOption = this.$select.find('option:selected');
      if (!$selectedOption.length || $selectedOption.prop('disabled')) {
        $root.find(SELECTORS.list).removeClass(CLASSES.active);
        return this;
      }

      const text = $selectedOption.text().trim();
      const value = String(selectedValue);

      this.updateUI(text);
      this.syncActiveState(value, text);

      return this;
    },

    syncActiveState: function (value, text) {
      const $root = this.getListRoot();
      $root.find(SELECTORS.list).removeClass(CLASSES.active);

      const $matchingOption = $root.find(SELECTORS.optionButton).filter(function () {
        const optionValue = $(this).attr('data-value');
        return optionValue !== undefined && String(optionValue) === String(value);
      });

      if ($matchingOption.length === 1) {
        $matchingOption.closest(SELECTORS.list).addClass(CLASSES.active);
        return;
      }

      const $textMatch = $root.find(SELECTORS.optionButton).filter(function () {
        return $(this).find('span').text().trim() === text;
      });

      if ($textMatch.length === 1) {
        $textMatch.closest(SELECTORS.list).addClass(CLASSES.active);
      }
    },

    destroy: function () {
      this.close();

      if (this.$select && this.$select.length) {
        this.$select.off('change.dropdown');
      }

      if (this.$home && this.$home.length) {
        this.$home.remove();
      }

      this.$element.removeData('dropdown-instance');
    },
  };

  $.fn.dropdown = function (option) {
    const args = Array.prototype.slice.call(arguments, 1);

    return this.each(function () {
      const $this = $(this);

      if (typeof option !== 'string' && $this.data('dropdown-instance')) return;

      if (typeof option === 'string') {
        const instance = $this.data('dropdown-instance');
        if (!instance) throw new Error('Dropdown plugin not initialized. Call .dropdown() first.');

        const method = instance[option];
        if (typeof method === 'function') {
          const result = method.apply(instance, args);
          return result === instance ? $this : result;
        }
        throw new Error('Method "' + option + '" does not exist.');
      }

      const options = typeof option === 'object' && option ? option : {};
      const instance = new Dropdown($this, options);
      $this.data('dropdown-instance', instance);
    });
  };

  const autoInitDropdowns = function () {
    $(SELECTORS.dropdown).each(function () {
      const $dropdown = $(this);
      if (!$dropdown.data('dropdown-instance')) {
        $dropdown.dropdown();
      }
    });
  };

  if (document.readyState === 'loading') {
    $(document).ready(autoInitDropdowns);
  } else {
    autoInitDropdowns();
  }
})(jQuery);
