;(function ($) {

  'use strict';

  var $window = $(window),
    $elements = [],
    lastElementsInView = [],
    isSpying = false,
    ticks = 0,
    nextTime = Date.now(),
    offset = {
      top : 0,
      right : 0,
      bottom : 0,
      left : 0,
    };


  function getElementsInView (top, right, bottom, left) {
    var $hits = $();
    $.each($elements, function (i, $el) {
      var elOffset = $el.offset(),
        elTop = elOffset.top,
        elLeft = elOffset.left;
      if (!(elLeft > right || elLeft + $el.outerWidth() < left || elTop > bottom || elTop + $el.outerHeight() < top)) {
        $hits.push($el);
      }
    });

    return $hits;
  }


  $.scrollspy = function (selector, options) {

    var $selector = $(selector),
      fnOnScroll = function () {
        var now = Date.now(),
          top,
          left,
          newElementsInView,
          i,
          length,
          $el,
          lastTick;

        if (now < nextTime) {
          return;
        }

        // scroll container rect
        top = $window.scrollTop();
        left = $window.scrollLeft();

        // determine which elements are in view
        newElementsInView = getElementsInView(
          top + offset.top,
          left + $window.width() + offset.right + offset.left,
          top + $window.height() + offset.bottom + offset.top,
          left + offset.left
        );

        // unique tick id
        ticks = Number.MAX_VALUE === ticks ? 0 : ticks + 1;

        for (i = 0, length = newElementsInView.length; i < length; ++i) {
          $el = newElementsInView[i];
          lastTick = $el.data('scrollspy:ticks');
          if ('number' !== typeof lastTick) {
            // entered into view
            $el.triggerHandler('scrollspy:enter');
          }
          // update tick id
          $el.data('scrollspy:ticks', ticks);
        }

        // determine which elements are no longer in view
        for (i = 0, length = lastElementsInView.length; i < length; ++i) {
          $el = lastElementsInView[i];
          lastTick = $el.data('scrollspy:ticks');
          if ('number' === typeof lastTick && lastTick !== ticks) {
            // view left
            $el
              .data('scrollspy:ticks', null)
              .triggerHandler('scrollspy:leave');
          }
        }

        // remember elements in view for next tick
        lastElementsInView = newElementsInView;

        window.setTimeout(function () {
          fnOnScroll();
        }, options.interval || 100);

        nextTime = now + (options.interval || 100);
      };

    options = options || {
      interval: 100
    };

    offset.top = options.offsetTop || 0;
    offset.right = options.offsetRight || 0;
    offset.bottom = options.offsetBottom || 0;
    offset.left = options.offsetLeft || 0;

    $selector.each(function () {
      $elements.push($(this));
    });

    if (!isSpying) {
      $window.on('scroll resize', fnOnScroll);
      isSpying = true;
    }

    if ('complete' === window.document.readyState || 'interactive' === window.document.readyState) {
      fnOnScroll();
    }
    else {
      $(window.document).ready(fnOnScroll);
    }

    return $selector;
  };

  $.fn.scrollspy = function (options) {
    return $.scrollspy($(this), options);
  };

})(jQuery);