(function ($) {
  'use strict';

  $(function () {
    $(document).on('click', '.tabs .tab', function (e) {
      e.preventDefault();
      e.stopPropagation();

      const $clickedElement = $(this);
      const $tab = $clickedElement.closest('.tab');
      const $tabs = $tab.closest('.tabs');

      if (!$tabs.length || !$tab.length) return;

      const $tabContainer = $tab.closest('.tab-container');
      
      if (!$tabContainer.length) return;

      let $contentBox = $tabContainer.children('.tab-content-box').first();
      
      if (!$contentBox.length) {
        const $allContentBoxes = $tabContainer.find('.tab-content-box');
        
        $allContentBoxes.each(function() {
          const $box = $(this);
          let $boxParent = $box.parent();
          let foundNestedContainer = false;
          
          while ($boxParent.length && !$boxParent.is($tabContainer)) {
            if ($boxParent.hasClass('tab-container')) {
              foundNestedContainer = true;
              break;
            }
            $boxParent = $boxParent.parent();
          }
          
          if (!foundNestedContainer) {
            if (!$contentBox.length) {
              $contentBox = $box;
              return false;
            }
          }
        });
      }

      if (!$contentBox.length) return;

      const $panels = $contentBox.children('.tab-pannel');

      if (!$panels.length) return;

      const $containerTabs = $tabs.children('.tab');

      const idx = $containerTabs.index($tab);

      if (idx < 0 || idx >= $panels.length) {
        return;
      }

      $containerTabs.find('a').removeClass('on');
      $tab.find('a').addClass('on');

      $panels.removeClass('active');
      $panels.eq(idx).addClass('active');
    });
  });
})(jQuery);
