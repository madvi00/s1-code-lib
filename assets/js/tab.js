(function ($) {
  'use strict';

  $(function () {
    $(document).on('click', '.tabs .tab', function (e) {
      e.preventDefault();

      const $tab = $(this);

      let $container = $tab.parent();
      while ($container.length && $container.find('.tab-content-box').length === 0) {
        $container = $container.parent();
      }
      if (!$container.length) return;

      const $tabs = $container.find('.tabs .tab');
      const $contentBox = $container.find('.tab-content-box').first();
      const $panels = $contentBox.find('.tab-pannel');

      const idx = $tabs.index($tab);
      if (idx < 0 || !$panels.eq(idx).length) return;

      $tabs.find('a').removeClass('on');
      $tab.find('a').addClass('on');

      $panels.removeClass('active');
      $panels.eq(idx).addClass('active');
    });
  });
})(jQuery);
