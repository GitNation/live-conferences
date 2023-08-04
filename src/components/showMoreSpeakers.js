
/* eslint-disable jquery/no-class */
/* eslint-disable jquery/no-closest */
/* eslint-disable jquery/no-find */
/* eslint-disable jquery/no-data */
/* eslint-disable jquery/no-hide */
import { CLASSES } from './_classes';

$('[data-show-btn]').on('click', function(e) {
  e.preventDefault();
  const dataId = $(this).data('show-btn');
  $('[data-show-btn-parent]').hide();
  $('[data-show-list=' + dataId + ']').addClass(CLASSES.active);
  $('[data-show-list=' + dataId + ']').find('.hide').removeClass('hide');
});

