(function () {
  function init() {
    const lazyVideos = document.querySelectorAll("video[data-lazy-src]");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        if (entry.isIntersecting) {
          if (!video.dataset.loaded) {
            const source = document.createElement("source");
            source.src = video.dataset.lazySrc;
            source.type = "video/mp4";
            video.appendChild(source);
            video.load();
            video.dataset.loaded = "true";
          }
          video.play().catch(() => {});
        } else {
          if (video.dataset.loaded) {
            video.pause();
          }
        }
      });
    }, {
      rootMargin: "200px 0px",
      threshold: 0.25
    });
    lazyVideos.forEach((video) => observer.observe(video));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
