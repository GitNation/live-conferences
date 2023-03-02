/* eslint-disable jquery/no-each */
/* eslint-disable jquery/no-data */
/* eslint-disable jquery/no-css */

if ($('.sv-body').length > 0) {
  const sDay = document.querySelectorAll('._s-day');
  const sDayLength = sDay.length;
  const sBodyWidth = sDayLength * 100 + '%';
  document.querySelector('.sv-body').style.width = sBodyWidth;

  document.querySelectorAll('.sv-body__col').forEach((svBodyCol) => {
    svBodyCol.style.width = 100 / sDayLength + '%';
  });

  sDay.forEach((item) => {
    item.addEventListener('click', function() {
      let sDayNav;
      let sDayItems = document.querySelectorAll('._s-day');
      sDayItems.forEach((sDayItemsItem) => {
        sDayItemsItem.classList.remove('_active');
      });

      this.classList.add('_active');

      if (this.dataset.svTabs === '0') {
        sDayNav = 0;
      } else {
        sDayNav = (100 / sDayLength) * this.dataset.svTabs + '%';
      }
      document.querySelector('.sv-body').style.transform = `translate(-${sDayNav}, 0)`;
    });
  });

  function compare_height(id) {
    $(id).each(function() {
      var column = 0;
      var attr = $(this).data('equal-id');
      $('[data-equal-id="' + attr + '"]')
        .each(function() {
          h = $(this).height();
          if (h > column) {
            column = h;
          }
        })
        .height(column);
    });
  }
  compare_height('[data-equal-id]');
  $(window).resize(() => {
    compare_height('[data-equal-id]');
  });
}
