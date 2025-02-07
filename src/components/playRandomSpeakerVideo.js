export default function playRandomVideo() {
  const speakers = document.querySelectorAll('.speaker');
  const videos = document.querySelectorAll('.js-speaker-video');
  let randomPlayTimeout;
  let isHovering = false;
  let lastPlayedIndex = -1;
  let isPlaying = false;

  function playRandomVideo() {
    if (isHovering || isPlaying) return;

    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * videos.length);
    } while (randomIndex === lastPlayedIndex);

    lastPlayedIndex = randomIndex;
    const videoElement = videos[randomIndex];

    isPlaying = true;
    videoElement.style.display = 'block';
    videoElement.currentTime = 0;
    videoElement.play();

    videoElement.onended = () => {
      videoElement.style.display = 'none';
      isPlaying = false;
      randomPlayTimeout = setTimeout(playRandomVideo, 2000);
    };
  }

  speakers.forEach((speaker) => {
    const video = speaker.querySelector('.js-speaker-video');

    speaker.addEventListener('mouseenter', () => {
      isHovering = true;
      clearTimeout(randomPlayTimeout);
      if (video) {
        if (isPlaying) {
          videos.forEach((vid) => {
            vid.pause();
            vid.style.display = 'none';
          });
          isPlaying = false;
        }
        video.style.display = 'block';
        video.currentTime = 0;
        video.play();
      }
    });

    speaker.addEventListener('mouseleave', () => {
      isHovering = false;
      if (video) {
        video.pause();
        video.style.display = 'none';
      }
      randomPlayTimeout = setTimeout(playRandomVideo, 2000);
    });
  });

  randomPlayTimeout = setTimeout(playRandomVideo, 2000);
}
