/* Crisalex720 — entrances, the marquee's measured speed, nothing else.
   Runs on the `js` class set in <head>; if this file never loads, the 3s
   reveal-off timer in <head> shows all content anyway. */

(function () {
  "use strict";

  var root = document.documentElement;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- entrances ------------------------------------------------------- */

  var revealables = document.querySelectorAll(".reveal, .drift");

  if (!("IntersectionObserver" in window) || reduced) {
    revealables.forEach(function (el) { el.classList.add("in"); });
    root.classList.remove("js");
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

    revealables.forEach(function (el) { io.observe(el); });

    /* anything already on screen at load shows immediately */
    requestAnimationFrame(function () {
      revealables.forEach(function (el) {
        var box = el.getBoundingClientRect();
        if (box.top < window.innerHeight) el.classList.add("in");
      });
    });
  }

  /* ---- the marquee also pauses for a keyboard user ------------------- */
  /* CSS pauses it on hover; focus inside the hero gives keyboard users the
     same control over a line that moves for ever (WCAG pause/stop/hide). */

  var hero = document.querySelector(".hero");
  if (hero) {
    hero.addEventListener("focusin", function () { hero.classList.add("is-paused"); });
    hero.addEventListener("focusout", function () { hero.classList.remove("is-paused"); });
  }

  /* ---- the marquee runs at a constant speed --------------------------- */
  /* duration = track width (one full cycle) / px per second. 40px/s keeps
     the line readable; CSS falls back to 42s before this runs. */

  function setSpeed() {
    document.querySelectorAll(".mq-track").forEach(function (track) {
      var cycle = track.scrollWidth / 2; /* two identical halves */
      if (cycle > 0) {
        track.style.animationDuration = (cycle / 40).toFixed(2) + "s";
      }
    });
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(setSpeed);
  } else {
    window.addEventListener("load", setSpeed);
  }
  setSpeed();

  var resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(setSpeed, 200);
  });
})();
