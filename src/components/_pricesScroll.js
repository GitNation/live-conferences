export default function pricesScroll() {
  var elem = document.getElementById('js-prices-scroll');
  var glow = document.getElementById('js-prices-glow');
  
  if (elem) {
    var elemChildren = elem.children;

    var elemChildrenWidth = elemChildren[1].offsetWidth;
    var elemWidth = elem.offsetWidth;
    var elemChildElementCount = elem.childElementCount - 1;
    var elemTotalWidth = elemChildElementCount * elemChildrenWidth;
    var hasScrollbars = elem.scrollHeight !== elem.offsetHeight;

    function update() {
      var elemScrollValue = elem.scrollLeft;
      var glowPosRight = elemScrollValue;
      glow.style.right = -glowPosRight + 'px';

      if (glowPosRight + elemWidth >= elemTotalWidth) {
        glow.style.opacity = '0';
      } else {
        glow.style.opacity = '1';
      }
    }

    elem.addEventListener('scroll', () => {
      update();
    });
  }

  window.addEventListener('resize', () => {
    if (elem.scrollHeight === elem.offsetHeight) {
      glow.style.visibility = 'hidden';
    } else {
      glow.style.visibility = 'visible';
    }

    // console.log(elem.scrollHeight !== elem.offsetHeight);
  });
}
