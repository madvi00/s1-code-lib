(function ($) {
  'use strict';

  const DEFAULTS = {
    /** @param {(value:string, text:string, $dropdown:jQuery)=>void|null} onSelect */
    onSelect: null,
    /** @param {($dropdown:jQuery)=>void|null} onOpen */
    onOpen: null,
    /** @param {($dropdown:jQuery)=>void|null} onClose */
    onClose: null,
    /** @param {boolean} autoPosition */
    autoPosition: true,
    /** @param {boolean} closeOnOutsideClick */
    closeOnOutsideClick: true,
  };

  const SELECTORS = {
    dropdown: '.field-dropdown',
    select: '.dropdown-select',
    button: '.btn-dropdown',
    optionButton: '.btn-dropdown-list',
    innerLabel: '.inner-label',
    text: '.text',
    placeholder: '.placeholder',
    selectedLabel: '.selected-label',
    list: '.dropdown-list',
    activeList: '.dropdown-list.active',
    listBox: '.dropdown-list-box',
  };

  const CLASSES = {
    show: 'show',
    reverse: 'reverse',
    active: 'active',
    disabled: 'disabled',
    readonly: 'readonly',
  };

  const SIZE_CLASSES = ['field-small', 'field-medium', 'field-x-small', 'field-large'];

  const POSITION_THRESHOLD = 200;
  const DEBOUNCE_DELAY = 100;
  const PORTAL_OFFSET = 8;

  const Utils = {
    /**
     * @param {jQuery} $dropdown
     * @param {jQuery} $listBox
     * @param {boolean} isInitial
     */
    positionPortalDropdown: function ($dropdown, $listBox, isInitial) {
      if (!$dropdown.length || !$listBox.length) return;

      const $button = $dropdown.find(SELECTORS.button);
      if (!$button.length) return;

      const buttonRect = $button[0].getBoundingClientRect();
      const buttonWidth = $button[0].offsetWidth || buttonRect.width;
      const fieldRect = $dropdown[0].getBoundingClientRect();
      const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      if (isInitial) {
        $listBox.css({
          display: 'block',
          visibility: 'hidden',
          position: 'absolute',
          top: '-9999px',
          left: '-9999px',
          width: buttonWidth + 'px',
        });
      }

      const listBoxHeight = $listBox[0].getBoundingClientRect().height;
      const listBoxWidth = buttonWidth;

      let top = fieldRect.bottom + scrollY + PORTAL_OFFSET;
      let left = fieldRect.left + scrollX;

      const spaceBelow = viewportHeight - fieldRect.bottom;
      const spaceAbove = fieldRect.top;
      const useReverse = spaceBelow < POSITION_THRESHOLD && spaceAbove > listBoxHeight + PORTAL_OFFSET;

      if (useReverse) {
        top = fieldRect.top + scrollY - listBoxHeight - PORTAL_OFFSET;
        $dropdown.addClass(CLASSES.reverse);
      } else {
        $dropdown.removeClass(CLASSES.reverse);
      }

      if (left < scrollX) {
        left = scrollX + PORTAL_OFFSET;
      } else if (left + listBoxWidth > scrollX + viewportWidth) {
        left = scrollX + viewportWidth - listBoxWidth - PORTAL_OFFSET;
      }

      $listBox.css({
        position: 'absolute',
        top: top + 'px',
        left: left + 'px',
        width: buttonWidth + 'px',
        visibility: 'visible',
        display: 'block',
      });
    },

    /** @param {jQuery} $dropdown */
    checkPosition: function ($dropdown) {
      const instance = $dropdown.data('dropdown-instance');
      if (instance && instance.isOpen && instance.$listBox && instance.$listBox.length) {
        Utils.positionPortalDropdown($dropdown, instance.$listBox, false);
        return;
      }

      const dropdown = $dropdown[0];
      if (!dropdown) return;

      const rect = dropdown.getBoundingClientRect();
      const distanceFromBottom = window.innerHeight - rect.bottom;

      if (distanceFromBottom < POSITION_THRESHOLD) {
        $dropdown.addClass(CLASSES.reverse);
      } else {
        $dropdown.removeClass(CLASSES.reverse);
      }
    },

    /** @param {jQuery=} except */
    closeAll: function (except) {
      $(SELECTORS.dropdown).each(function () {
        const $dropdown = $(this);
        if (except && $dropdown[0] === except[0]) return;
        const instance = $dropdown.data('dropdown-instance');
        if (instance) instance.close();
      });
    },

    /** @param {jQuery} $option */
    getValueFromOption: function ($option) {
      const dataValue = $option.attr('data-value');
      if (this.isValidValue(dataValue)) return dataValue;

      const btnValue = $option.attr('value');
      if (this.isValidValue(btnValue)) return btnValue;

      return $option.find('span').text().trim() || '';
    },

    /** @param {*} value */
    isValidValue: function (value) {
      return value !== undefined && value !== null && value !== '' && value !== 'undefined';
    },
  };

  const GlobalEvents = {
    /** @param {Event} e */
    handleClick: function (e) {
      const $target = $(e.target);
      const $dropdown = $target.closest(SELECTORS.dropdown);
      const $optionButton = $target.closest(SELECTORS.optionButton);
      const $listBox = $target.closest(SELECTORS.listBox);
      const $rangeTimePickerInput = $target.closest('.range-timepicker-box .time-input');

      if ($rangeTimePickerInput.length) {
        $(SELECTORS.dropdown).each(function () {
          const inst = $(this).data('dropdown-instance');
          if (inst && inst.isOpen && inst.options && inst.options.closeOnOutsideClick) {
            inst.close();
          }
        });
      }

      if ($listBox.length && $listBox.parent()[0] === document.body) {
        const $originalDropdown = $listBox.data('dropdown-instance-ref');

        if ($originalDropdown && $originalDropdown.length) {
          const instance = $originalDropdown.data('dropdown-instance');
          if (!instance || instance.isDisabled()) return;

          if ($optionButton.length && !$optionButton.prop('disabled')) {
            GlobalEvents.handleOptionClick(instance, $optionButton);
          }
          return;
        }
      }

      if (!$dropdown.length) {
        const $rangeTimePickerDropdown = $target.closest('.range-timepicker-dropdown');
        if (!$rangeTimePickerDropdown.length) {
          $(SELECTORS.dropdown).each(function () {
            const inst = $(this).data('dropdown-instance');
            if (inst && inst.isOpen && inst.options && inst.options.closeOnOutsideClick) {
              inst.close();
            }
          });
        }
        return;
      }

      const instance = $dropdown.data('dropdown-instance');
      if (!instance || instance.isDisabled()) return;

      if ($target.closest(SELECTORS.button).length) {
        instance.toggle();
        return;
      }

      if ($optionButton.length && !$optionButton.prop('disabled')) {
        GlobalEvents.handleOptionClick(instance, $optionButton);
      }
    },

    /**
     * @param {Dropdown} instance
     * @param {jQuery} $optionButton
     */
    handleOptionClick: function (instance, $optionButton) {
      const text = $optionButton.find('span').text().trim();
      const value = Utils.getValueFromOption($optionButton);
      instance.selectOption($optionButton, value, text);
    },

    bindClick: function () {
      if (window._dropdownGlobalClickBound) return;
      $(document).on('click.dropdown', GlobalEvents.handleClick);
      $(document).on('click.dropdown', '.range-timepicker-box .time-input', function (e) {
        $(SELECTORS.dropdown).each(function () {
          const inst = $(this).data('dropdown-instance');
          if (inst && inst.isOpen && inst.options && inst.options.closeOnOutsideClick) {
            inst.close();
          }
        });
      });
      window._dropdownGlobalClickBound = true;
    },

    handleResize: function () {
      Utils.closeAll();
    },

    handleScroll: function () {
      $(SELECTORS.dropdown).each(function () {
        const instance = $(this).data('dropdown-instance');
        if (instance && instance.isOpen && instance.options.autoPosition) {
          Utils.checkPosition($(this));
        }
      });
    },

    bindResizeScroll: function () {
      if (window._dropdownResizeBound) return;

      let scrollTimer;

      $(window)
        .on('resize.dropdown', function () {
          GlobalEvents.handleResize();
        })
        .on('scroll.dropdown', function () {
          clearTimeout(scrollTimer);
          scrollTimer = setTimeout(GlobalEvents.handleScroll, DEBOUNCE_DELAY);
        });

      window._dropdownResizeBound = true;
    },
  };

  /** @param {jQuery} $element @param {object} options */
  const Dropdown = function ($element, options) {
    this.$element = $element;
    this.options = $.extend({}, DEFAULTS, options);
    this.isOpen = false;
    this.$select = null;
    this.$listBox = null;
    this._originalParent = null;
    this.init();
  };

  Dropdown.prototype = {
    init: function () {
      this.initListBox();
      this.initSelect();
      this.initPosition();
      this.initActiveState();
      this.bindSelectChange();
      this.bindGlobalEvents();
    },

    initListBox: function () {
      this.$listBox = this.$element.find(SELECTORS.listBox);
      if (this.$listBox.length) {
        this._originalParent = this.$listBox.parent();
        this.resetListBoxStyles();
      }
    },

    resetListBoxStyles: function () {
      if (!this.$listBox || !this.$listBox.length) return;
      this.$listBox.css({
        position: '',
        top: '',
        bottom: '',
        left: '',
        width: '',
        transform: '',
        zIndex: '',
        visibility: '',
        display: '',
      });
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

    initPosition: function () {},

    initActiveState: function () {
      this.$element.find(SELECTORS.list).removeClass(CLASSES.active);
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
      GlobalEvents.bindResizeScroll();
    },

    isDisabled: function () {
      return this.$element.hasClass(CLASSES.disabled) || this.$element.hasClass(CLASSES.readonly);
    },

    getSizeClass: function () {
      return SIZE_CLASSES.find((cls) => this.$element.hasClass(cls)) || '';
    },

    moveToPortal: function () {
      if (!this.$listBox || !this.$listBox.length) return;

      const $listBox = this.$listBox;
      const sizeClass = this.getSizeClass();

      $listBox.css({
        display: 'block',
        visibility: 'hidden',
        position: 'absolute',
        top: '-9999px',
        left: '-9999px',
      });

      if ($listBox.parent()[0] !== document.body) {
        $(document.body).append($listBox);
      }

      $listBox.data('dropdown-instance-ref', this.$element);

      if (sizeClass) $listBox.addClass(sizeClass);
      $listBox.addClass(CLASSES.show);

      if (this.options.autoPosition) {
        requestAnimationFrame(() => {
          Utils.positionPortalDropdown(this.$element, $listBox, true);
        });
      } else {
        $listBox.css({ visibility: 'visible', display: 'block' });
      }
    },

    restoreFromPortal: function () {
      if (!this.$listBox || !this.$listBox.length || !this._originalParent) return;

      this.$listBox.removeClass(CLASSES.show);
      SIZE_CLASSES.forEach((cls) => this.$listBox.removeClass(cls));

      if (this.$listBox.parent()[0] === document.body) {
        this._originalParent.append(this.$listBox);
      }

      this.$listBox.css({
        position: '',
        top: '',
        left: '',
        visibility: '',
        display: '',
      });
    },

    open: function () {
      if (this.isDisabled() || this.isOpen) return this;

      Utils.closeAll(this.$element);
      this.moveToPortal();

      this.$element.addClass(CLASSES.show);
      this.isOpen = true;
      this.triggerCallback('onOpen', this.$element);

      return this;
    },

    close: function () {
      if (!this.isOpen) return this;

      this.restoreFromPortal();

      this.$element.removeClass(CLASSES.show);
      this.isOpen = false;
      this.triggerCallback('onClose', this.$element);

      return this;
    },

    toggle: function () {
      return this.isOpen ? this.close() : this.open();
    },

    /**
     * @param {string} callbackName
     * @param {...any} args
     */
    triggerCallback: function (callbackName, ...args) {
      if (typeof this.options[callbackName] === 'function') {
        this.options[callbackName].apply(this, args);
      }
    },

    /**
     * @param {jQuery} $option
     * @param {string} value
     * @param {string} text
     */
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

    /** @param {string} text */
    updateUI: function (text) {
      const $button = this.$element.find(SELECTORS.button);
      const $text = this.$element.find(SELECTORS.text);
      const $placeholder = this.$element.find(SELECTORS.placeholder);
      const $selectedLabel = this.$element.find(SELECTORS.selectedLabel);
      const $selectedInnerLabel = this.$element.find(SELECTORS.innerLabel);
      const $label = $selectedInnerLabel.children().eq(0);

      if ($text.length) $text.text(text).show();
      if ($placeholder.length) $placeholder.hide();
      if ($selectedLabel.length) {
        $placeholder.hide();
        $label.hide();
        $selectedLabel.show();
        $selectedLabel.text(text);
        $button.addClass('selected');
      }

      // has-label 타입의 dropdown이 swiper 안에 있는 경우 swiper 업데이트
      if ($selectedLabel.length && (this.$element.hasClass('has-label') || this.$element.hasClass('has-label-solid'))) {
        const $swiper = this.$element.closest('.swiper');
        if ($swiper.length && $swiper[0].swiper) {
          // 다음 프레임에서 업데이트하여 DOM 변경이 완료된 후 실행
          requestAnimationFrame(() => {
            if ($swiper[0].swiper && typeof $swiper[0].swiper.update === 'function') {
              $swiper[0].swiper.update();
            }
          });
        }
      }
    },

    /** @param {jQuery} $option */
    updateActiveState: function ($option) {
      this.$element.find(SELECTORS.list).removeClass(CLASSES.active);
      if (this.$listBox && this.$listBox.length) {
        this.$listBox.find(SELECTORS.list).removeClass(CLASSES.active);
      }

      const $targetList = $option.closest(SELECTORS.list);
      if ($targetList.length) $targetList.addClass(CLASSES.active);
    },

    /**
     * @param {string} value
     * @param {string} text
     */
    updateSelectValue: function (value, text) {
      if (!this.$select || !this.$select.length) {
        this.$select = this.$element.find(SELECTORS.select);
        if (!this.$select || !this.$select.length) return;
      }

      const $select = this.$select;
      let targetValue = null;
      let $targetOption = null;

      if (Utils.isValidValue(value) && value !== '' && value !== 'undefined') {
        $targetOption = $select.find('option').filter(function () {
          const optionValue = $(this).attr('value');
          if (!Utils.isValidValue(optionValue)) return false;
          return String(optionValue) === String(value);
        });

        if ($targetOption.length > 0) targetValue = value;
      }

      if (!targetValue && text) {
        $targetOption = $select.find('option').filter(function () {
          return $(this).text().trim() === text;
        });

        if ($targetOption.length > 0) {
          const optionValue = $targetOption.attr('value');
          if (Utils.isValidValue(optionValue)) targetValue = optionValue;
          else if (Utils.isValidValue(value) && value !== '' && value !== 'undefined') targetValue = value;
        }
      }

      if (targetValue && $targetOption && $targetOption.length > 0) {
        $select.find('option').prop('selected', false);
        $targetOption.prop('selected', true);
        $select.val(targetValue).trigger('change');
      } else if (targetValue) {
        $select.find('option').prop('selected', false);
        $select.val(targetValue).trigger('change');
      }
    },

    syncFromSelect: function () {
      if (!this.$select || !this.$select.length) return this;

      const selectedValue = this.$select.val();
      if (!Utils.isValidValue(selectedValue)) {
        this.$element.find(SELECTORS.list).removeClass(CLASSES.active);
        return this;
      }

      const $selectedOption = this.$select.find('option:selected');
      if (!$selectedOption.length || $selectedOption.prop('disabled')) {
        this.$element.find(SELECTORS.list).removeClass(CLASSES.active);
        return this;
      }

      const text = $selectedOption.text().trim();
      const value = String(selectedValue);

      this.updateUI(text);
      this.syncActiveState(value, text);

      return this;
    },

    /**
     * @param {string} value
     * @param {string} text
     */
    syncActiveState: function (value, text) {
      this.$element.find(SELECTORS.list).removeClass(CLASSES.active);

      const $matchingOption = this.$element.find(SELECTORS.optionButton).filter(function () {
        const optionValue = $(this).attr('data-value');
        return optionValue !== undefined && String(optionValue) === value;
      });

      if ($matchingOption.length === 1) {
        $matchingOption.closest(SELECTORS.list).addClass(CLASSES.active);
      } else if ($matchingOption.length === 0) {
        const $textMatch = this.$element.find(SELECTORS.optionButton).filter(function () {
          return $(this).find('span').text().trim() === text;
        });
        if ($textMatch.length === 1) {
          $textMatch.closest(SELECTORS.list).addClass(CLASSES.active);
        }
      }
    },

    getValue: function () {
      if (this.$select && this.$select.length) {
        const selectValue = this.$select.val();
        if (selectValue && selectValue !== '') return selectValue;
      }

      const $active = this.$element.find(SELECTORS.activeList);
      if ($active.length) {
        const $option = $active.find(SELECTORS.optionButton);
        return Utils.getValueFromOption($option);
      }

      const $text = this.$element.find(SELECTORS.text);
      if ($text.length && $text.is(':visible')) return $text.text().trim();

      return null;
    },

    getText: function () {
      const $active = this.$element.find(SELECTORS.activeList);
      if ($active.length) {
        return $active
          .find(SELECTORS.optionButton + ' span')
          .text()
          .trim();
      }

      const $text = this.$element.find(SELECTORS.text);
      if ($text.length && $text.is(':visible')) return $text.text().trim();

      return null;
    },

    /** @param {string} value */
    setValue: function (value) {
      const self = this;
      let found = false;

      if (this.$select && this.$select.length) {
        this.$select.val(value);
      }

      this.$element.find(SELECTORS.optionButton).each(function () {
        const $option = $(this);
        const optionValue = Utils.getValueFromOption($option);

        if (String(optionValue) === String(value)) {
          const text = $option.find('span').text().trim();
          self.selectOption($option, value, text);
          found = true;
          return false;
        }
      });

      return found;
    },

    destroy: function () {
      this.close();

      if (this.$listBox && this.$listBox.length && this._originalParent) {
        if (this.$listBox.parent()[0] === document.body) {
          this._originalParent.append(this.$listBox);
        }
      }

      if (this.$select && this.$select.length) {
        this.$select.off('change.dropdown');
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
        if (!instance) {
          throw new Error('Dropdown plugin not initialized. Call .dropdown() first.');
        }

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
