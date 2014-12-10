/*
jquery scrollspy plugin
url: https://github.com/kruemelo/jquery-scrollspy
requires: jQuery
Copyright (c) 2014 kruemelo https://github.com/kruemelo
license: MIT (http://opensource.org/licenses/mit-license.php)
*/
;(function ($) {

  'use strict';

  var $window = $(window),
    $elements = [],
    lastElementsInView = [],
    isSpying = false,
    ticks = 0,
    lastTime = 0,
    interval = 100,
    timeout;

  function getElementRect ($el) {
    var elOffset = $el.offset(),
      elScrollOffset = $el.data('scrollspy-offset') || {};
    return {
      top: elOffset.top + (elScrollOffset.top || 0),
      left: elOffset.left + (elScrollOffset.left || 0),
      bottom: elOffset.top + $el.outerHeight() + (elScrollOffset.bottom || 0),
      right: elOffset.left + $el.outerWidth() + (elScrollOffset.right || 0)
    };
  }

  function getElementsInView (viewRect) {

    var $hits = $();

    $.each($elements, function (i, $el) {
      var elRect = getElementRect($el);
      if (!(elRect.left > viewRect.right || elRect.right < viewRect.left || elRect.top > viewRect.bottom || elRect.bottom < viewRect.top)) {
        $hits.push($el);
      }
    });

    return $hits;
  }

  function fnOnScroll () {
    var now = Date.now(),
      viewRect,
      windowScrollTop,
      windowScrollLeft,
      newElementsInView,
      lastTick;

    if ('number' === typeof timeout) {
      window.clearTimeout(timeout);
      timeout = undefined;
    }

    if (now < lastTime + interval) {
      timeout = window.setTimeout(fnOnScroll, interval);
      return;
    }

    // scroll container rect
    windowScrollTop = $window.scrollTop();
    windowScrollLeft = $window.scrollLeft();
    viewRect = {
      top: windowScrollTop,
      left: windowScrollLeft
    };

    viewRect.bottom = windowScrollTop + $window.height();
    viewRect.right = windowScrollLeft + $window.width();

    // determine which elements are in view
    newElementsInView = getElementsInView(viewRect);

    // unique tick id
    ticks = Number.MAX_VALUE === ticks ? 0 : ticks + 1;

    $.each(newElementsInView, function (i, $el) {
      lastTick = $el.data('scrollspy-ticks');
      if ('number' !== typeof lastTick) {
        // entered into view
        var enterEvent = $.Event('scrollspy:enter');
        enterEvent.viewRect = viewRect;
        enterEvent.elementRect = getElementRect($el);
        $el.trigger(enterEvent);
      }
      // update tick id
      $el.data('scrollspy-ticks', ticks);
    });

    // determine which elements are no longer in view
    $.each(lastElementsInView, function (i, $el) {
      lastTick = $el.data('scrollspy-ticks');
      if ('number' === typeof lastTick && lastTick !== ticks) {
        // view leave
        var leaveEvent = $.Event('scrollspy:leave');
        leaveEvent.viewRect = viewRect;
        leaveEvent.elementRect = getElementRect($el);
        $el
          .data('scrollspy-ticks', null)
          .trigger(leaveEvent);
      }
    });

    // remember elements in view for next tick
    lastElementsInView = newElementsInView;

    lastTime = now;
  }

  $.scrollspy = function (selector, options) {

    var $selector = $(selector),
      offset = {
        top : 0,
        right : 0,
        bottom : 0,
        left : 0,
      };

    options = options || {};

    // update interval
    if (options.interval) {
      interval = options.interval;
    }

    offset.top = options.offsetTop || 0;
    offset.right = options.offsetRight || 0;
    offset.bottom = options.offsetBottom || 0;
    offset.left = options.offsetLeft || 0;

    $selector.each(function () {
      var $el = $(this);
      $el.data('scrollspy-offset', offset);
      $elements.push($el);
    });

    if (isSpying) {

      $window.on('scroll resize', fnOnScroll);

      if ('complete' === window.document.readyState || 'interactive' === window.document.readyState) {
        fnOnScroll();
      }

    }
    else {
      $(window.document).ready(fnOnScroll);
      isSpying = true;
    }

    return $selector;
  };

  $.fn.scrollspy = function (options) {
    return $.scrollspy($(this), options);
  };

})(jQuery);