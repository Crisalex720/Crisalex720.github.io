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

  var hero = document.querySelector(".hero");
  if (hero) {
    hero.addEventListener("focusin", function () { hero.classList.add("is-paused"); });
    hero.addEventListener("focusout", function () { hero.classList.remove("is-paused"); });
  }

  /* ---- the marquee runs at a constant speed --------------------------- */
  /* Keep the oversized name visibly moving without making it hard to read. */

  function setSpeed() {
    document.querySelectorAll(".mq-track").forEach(function (track) {
      var cycle = track.scrollWidth / 2; /* two identical halves */
      if (cycle > 0) {
        track.style.animationDuration = (cycle / 100).toFixed(2) + "s";
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

  document.querySelectorAll(".nav-menu-panel a[href^='#']").forEach(function (link) {
    link.addEventListener("click", function () {
      var menu = link.closest(".nav-menu");
      if (menu) menu.open = false;
    });
  });

  /* ---- the reading line at the top of the window ---------------------- */

  var progress = document.querySelector(".progress");
  var queued = false;

  function drawProgress() {
    queued = false;
    if (!progress) return;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    progress.style.transform = "scaleX(" + ratio.toFixed(4) + ")";
  }

  window.addEventListener("scroll", function () {
    if (queued) return;
    queued = true;
    requestAnimationFrame(drawProgress);
  }, { passive: true });
  drawProgress();

  /* ---- the rail: it arrives after the monument and leaves at the footer,
         and it always knows which chapter you are reading ---------------- */

  var rail = document.querySelector(".rail");
  var heroEl = document.querySelector(".hero");
  var footerEl = document.querySelector(".footer");

  if (rail && "IntersectionObserver" in window) {
    var covered = { hero: true, footer: false };

    var syncRail = function () {
      rail.classList.toggle("is-shown", !covered.hero && !covered.footer);
    };

    var presence = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.target === heroEl) covered.hero = entry.isIntersecting;
        if (entry.target === footerEl) covered.footer = entry.isIntersecting;
      });
      syncRail();
    }, { threshold: 0 });

    if (heroEl) presence.observe(heroEl);
    if (footerEl) presence.observe(footerEl);
    syncRail();

    var links = {};
    var active = null;
    document.querySelectorAll(".rail a").forEach(function (a) {
      links[a.getAttribute("href").slice(1)] = a;
    });

    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = entry.isIntersecting ? links[entry.target.id] : null;
        if (!link || link === active) return;
        if (active) active.classList.remove("is-active");
        link.classList.add("is-active");
        active = link;
      });
    }, { rootMargin: "-45% 0px -45% 0px", threshold: 0 });

    Object.keys(links).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) spy.observe(section);
    });
  }
})();
