export default function sponsorImagesResize() {
  window.onload = function() {
    let imagesXl = document.querySelectorAll('.sponsors-block.Platinum img');
    let imagesLg = document.querySelectorAll('.sponsors-block.Gold img');
    let imagesMd = document.querySelectorAll('.sponsors-block.Silver img');
    let imagesSm = document.querySelectorAll(
      '.sponsors-block.MediaPartner img, .sponsors-block.Partner img, .sponsors-block.TechPartner img, .sponsors-block.EntertainmentPartner img'
    );
    let containerWidth = document.querySelector('.sponsors-block__list').offsetWidth;

    function adjustImageWidth(image, imagesInRow, multiplayer) {
      let widthBase = containerWidth / (imagesInRow * multiplayer);
      let scaleFactor = 0.6; // 0.525;
      let imageRatio = image.naturalWidth / image.naturalHeight;

      image.width = Math.pow(imageRatio, scaleFactor) * widthBase;
    }

    function init() {
      containerWidth = document.querySelector('.sponsors-block__list').offsetWidth;
      let windowWidth = window.innerWidth;

      if (windowWidth <= 599) {
        for (let image of imagesXl) {
          adjustImageWidth(image, 2, 2.8);
        }

        for (let image of imagesLg) {
          adjustImageWidth(image, 2, 4);
        }

        for (let image of imagesMd) {
          adjustImageWidth(image, 3, 2.4);
        }

        for (let image of imagesSm) {
          adjustImageWidth(image, 4, 2);
        }
      } else if (windowWidth >= 600 && windowWidth <= 1023) {
        for (let image of imagesXl) {
          adjustImageWidth(image, 2, 3);
        }

        for (let image of imagesLg) {
          adjustImageWidth(image, 3, 3);
        }

        for (let image of imagesMd) {
          adjustImageWidth(image, 4, 2.8);
        }

        for (let image of imagesSm) {
          adjustImageWidth(image, 5, 2);
        }
      } else {
        for (let image of imagesXl) {
          adjustImageWidth(image, 3, 2.6);
        }

        for (let image of imagesLg) {
          adjustImageWidth(image, 3, 3.4);
        }

        for (let image of imagesMd) {
          adjustImageWidth(image, 4, 2.2);
        }

        for (let image of imagesSm) {
          adjustImageWidth(image, 5, 2);
        }
      }
    }

    init();

    window.addEventListener('resize', init);
  };
}
