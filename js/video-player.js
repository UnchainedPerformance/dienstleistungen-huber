/* ============================================
   CUSTOM VIDEO PLAYER – Play/Pause Toggle
   ============================================ */
(function () {
  'use strict';

  function initVideoPlayer(wrapper) {
    var video = wrapper.querySelector('video');
    var btn = wrapper.querySelector('.video-play-btn');
    if (!video || !btn) return;

    function toggle() {
      if (video.paused || video.ended) {
        video.play();
        if (!video.hasAttribute('controls')) {
          video.setAttribute('controls', 'controls');
        }
      } else {
        video.pause();
      }
    }

    wrapper.addEventListener('click', function (e) {
      if (e.target.tagName === 'VIDEO' && video.controls) {
        return;
      }
      toggle();
    });

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      toggle();
    });

    video.addEventListener('play', function () {
      wrapper.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
      wrapper.classList.remove('is-playing');
    });

    video.addEventListener('ended', function () {
      wrapper.classList.remove('is-playing');
    });
  }

  function init() {
    document.querySelectorAll('.video-wrapper').forEach(initVideoPlayer);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
