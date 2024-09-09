$(document).ready(function() {
  const items = $('.foundation-status__item');
  setTimeout(function() {
    items.each(function(index) {
      let $this = $(this);
      setTimeout(function() {
        $this.addClass('status-loading');
        setTimeout(function() {
          $this.removeClass('loading').addClass('status-loaded');
          let result = $this.data('result');
          if (result === 'success') {
            $this.addClass('status-good-result');
          } else if (result === 'failed') {
            $this.addClass('status-bad-result');
          }
        }, 2000);
      }, 3000 * index);
    });
  }, 1000);
});
