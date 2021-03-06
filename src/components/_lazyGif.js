export default function lazyGif() {
  const isLazyGifNeed = Boolean(document.getElementsByClassName('js-lazy-gif'));

  if (isLazyGifNeed) {
    $('.js-lazy-gif').hover(function() {
      var elem = $(this);
     
      // get our img url
      var src = elem.attr('data-original');
     
      // change span to img using the value from data-original
      elem.replaceWith('<img class="screens__img" src="' + src + '"/>');
    });
  }
}
