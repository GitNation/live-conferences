export default function playRandomVideo() {
  const videos = Array.from(document.querySelectorAll('.js-speaker-video'));
  if (!videos.length) return;
  const randomIndex = Math.floor(Math.random() * videos.length);
  const videoElement = videos[randomIndex];
  videoElement.play();

  videoElement.onended = () => {
    videoElement.currentTime = 0;
    setTimeout(playRandomVideo, 5000);
  };
}
