jquery-scrollspy
================

jquery scroll spy plugin

```
$('selector').scrollspy()
.on('scrollspy:enter', function (ev) {
  $(this).addClass('inview');
})
.on('scrollspy:leave', function (ev) {
  $(this).removeClass('inview');
});
```
