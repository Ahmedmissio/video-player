document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("[data-reel]").forEach((wrap) => {
    const video = wrap.querySelector("video");
    const toggleBtn = wrap.querySelector("[data-reel-toggle]");
    const progress = wrap.querySelector("[data-reel-progress]");
    const fill = wrap.querySelector("[data-reel-fill]");
    const muteBtn = wrap.querySelector("[data-reel-mute]");
    const fsBtn = wrap.querySelector("[data-reel-fullscreen]");
    const timeEl = wrap.querySelector("[data-reel-time]");
    const iconPlay = wrap.querySelector("[data-icon-play]");
    const iconPause = wrap.querySelector("[data-icon-pause]");
    const iconMuted = wrap.querySelector("[data-icon-muted]");
    const iconUnmuted = wrap.querySelector("[data-icon-unmuted]");

    let userPaused = false;

    const fmt = (s) => {
      if (!isFinite(s)) return "0:00";
      const m = Math.floor(s / 60);
      const sec = Math.floor(s % 60).toString().padStart(2, "0");
      return `${m}:${sec}`;
    };

    const loadSrc = () => {
      if (video.dataset.loaded) return;
      const src = document.createElement("source");
      src.src = video.dataset.lazySrc;
      src.type = "video/mp4";
      video.appendChild(src);
      video.load();
      video.dataset.loaded = "true";
    };

    const togglePlay = () => {
      loadSrc();
      if (video.paused) {
        userPaused = false;
        video.play().catch(() => {});
      } else {
        userPaused = true;
        video.pause();
      }
    };

    video.addEventListener("play", () => {
      wrap.classList.remove("is-paused");
      iconPlay.style.display = "none";
      iconPause.style.display = "block";
    });
    video.addEventListener("pause", () => {
      wrap.classList.add("is-paused");
      iconPlay.style.display = "block";
      iconPause.style.display = "none";
    });

    video.addEventListener("timeupdate", () => {
      if (video.duration) {
        fill.style.width = (video.currentTime / video.duration) * 100 + "%";
        timeEl.textContent = `${fmt(video.currentTime)} / ${fmt(video.duration)}`;
      }
    });
    video.addEventListener("loadedmetadata", () => {
      timeEl.textContent = `0:00 / ${fmt(video.duration)}`;
    });

    toggleBtn.addEventListener("click", (e) => { e.stopPropagation(); togglePlay(); });
    video.addEventListener("click", togglePlay);

    progress.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!video.duration) return;
      const rect = progress.getBoundingClientRect();
      video.currentTime = ((e.clientX - rect.left) / rect.width) * video.duration;
    });

    muteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      video.muted = !video.muted;
      iconMuted.style.display = video.muted ? "block" : "none";
      iconUnmuted.style.display = video.muted ? "none" : "block";
    });

    fsBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const inFs = document.fullscreenElement || document.webkitFullscreenElement;
      if (inFs) {
        (document.exitFullscreen || document.webkitExitFullscreen).call(document);
      } else if (wrap.requestFullscreen) {
        wrap.requestFullscreen();
      } else if (wrap.webkitRequestFullscreen) {
        wrap.webkitRequestFullscreen();
      } else if (video.webkitEnterFullscreen) {
        video.webkitEnterFullscreen();
      }
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          loadSrc();
          if (!userPaused) video.play().catch(() => {});
        } else if (video.dataset.loaded && !video.paused) {
          video.pause();
        }
      });
    }, { rootMargin: "200px 0px", threshold: 0.25 });

    observer.observe(wrap);
  });
});
