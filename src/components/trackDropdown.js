/* eslint-disable jquery/no-attr */
/* eslint-disable jquery/no-class */
/* eslint-disable jquery/no-parents */
/* eslint-disable jquery/no-data */

const trackMenuContainer = $('.js-track-menu-container');
const trackMenu = $('.js-track-menu');
const trackSubMenu = $('.js-track-submenu');
const wind = $(window);

calcSubMenuPos();

if (trackMenu) {
  trackMenu.on('click', function(e) {
    $(this).toggleClass('is-active');
    var data = this.dataset.id;
    submenuToggle();
  });

  wind.resize(() => {
    calcSubMenuPos();
  });

  $(trackMenuContainer).on( 'scroll', function() {
    calcSubMenuPos();
  });
}

function submenuToggle() {
  var subMenu = $(trackSubMenu[0]);
  subMenu.toggleClass('is-active');
};

function calcSubMenuPos() {
  for (var i = trackMenu.length - 1; i >= 0; i--) {
    var menuItem = $(trackMenu[i]);
    var menuItemHeight = menuItem.height();
    var subMenuItem = $(trackSubMenu[i]);
    var subMenuXY = menuItem.position();
    subMenuItem.css({ 'left': subMenuXY.left + 5, 'top': subMenuXY.top + menuItemHeight });
  }
};
