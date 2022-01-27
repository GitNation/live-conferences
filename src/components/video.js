/* eslint-disable jquery/no-data */
import { CLASSES } from './_classes';

export default class Video {
  constructor(options) {
    this.btns = $(options.btn);
    this.data = [];

    this._initScript();
  }

  _initScript() {
    const script = document.createElement('script');
    script.src = '//www.youtube.com/iframe_api';
    script.type = 'text/javascript';
    document.body.prepend(script);

    script.onload = () => {
      const interval = window.setInterval(() => {
        if (YT.loaded) {
          clearInterval(interval);
          this._onYouTubeIframeAPIReady();
          return;
        }
      }, 100);
    };
  }

  _onYouTubeIframeAPIReady() {
    this.btns.each((i, el) => {
      const $el = $(el);
      const conf = {
        id: $el.data('video-id'),
        wrapper: $el.data('content-id'),
        btn: $el,
        i,
      };

      this.data.push(conf);
      this._onClick(conf);
    });
  }

  _onPlayerReady(conf) {
    const { btn, player } = conf;

    btn.addClass(CLASSES.loaded);
    this.play(player, btn);
  }

  _initPlayer(conf) {
    const player = new YT.Player(conf.wrapper, {
      height: '100%',
      width: '100%',
      videoId: conf.id,
      playerVars: {
        rel: 0,
        showinfo: 0,
      },
      events: {
        onReady: this._onPlayerReady.bind(this, conf),
      },
    });

    this.data[conf.i].player = player;
  }

  play(player, btn) {
    player.playVideo();
    btn.removeClass(CLASSES.active).fadeOut(0);
  }

  _onClick(conf) {
    const { btn } = conf;
    btn.on('click', () => {
      if (!btn.hasClass(CLASSES.loaded)) {
        this._initPlayer(conf);
      }
    });
  }
}
