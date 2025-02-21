export default function playRandomVideo() {
  const speakers = document.querySelectorAll('.speaker');
  const videos = document.querySelectorAll('.js-speaker-video');
  let randomPlayTimeout;
  let lastPlayedIndex = -1;
  let isHoverVideoPlaying = false;

  function playRandomVideo() {
    if (!videos || videos.length === 0) {
      console.warn('No videos available to play.');
      return;
    }
    if (isHoverVideoPlaying) {
      randomPlayTimeout = setTimeout(playRandomVideo, 2000);
      return;
    }

    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * videos.length);
    } while (randomIndex === lastPlayedIndex);

    lastPlayedIndex = randomIndex;
    const videoElement = videos[randomIndex];

    videoElement.style.display = 'block';
    videoElement.currentTime = 0;
    videoElement.play();

    videoElement.onended = () => {
      videoElement.style.display = 'none';
      randomPlayTimeout = setTimeout(playRandomVideo, 2000);
    };
  }

  speakers.forEach((speaker) => {
    const video = speaker.querySelector('.js-speaker-video');

    speaker.addEventListener('mouseenter', () => {
      if (video && video.paused) {
        isHoverVideoPlaying = true;
        video.style.display = 'block';
        video.currentTime = 0;
        video.play();

        video.onended = () => {
          video.style.display = 'none';
          isHoverVideoPlaying = false;
        };
      }
    });

    speaker.addEventListener('mouseleave', () => {});
  });

  randomPlayTimeout = setTimeout(playRandomVideo, 2000);
}
