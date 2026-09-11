/* Magnet Inđija — interakcije i animacije. Vanilla JS, bez biblioteka. */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var TEL = "tel:+381695486010";
  var TRENERI = window.MAGNET_TRENERI || [];
  var UTISCI = window.MAGNET_UTISCI || [];
  var GALERIJA = window.MAGNET_GALERIJA || [];
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ---------- 1. Intro (jednom po sesiji, max 0.95s) ---------- */
  var intro = $("[data-intro-screen]");
  var skip = true;
  try {
    if (!sessionStorage.getItem("mg-intro")) { sessionStorage.setItem("mg-intro", "1"); skip = false; }
  } catch (e) { skip = false; }
  if (reduce) skip = true;
  document.documentElement.setAttribute("data-intro", skip ? "skip" : "play");
  if (intro) {
    if (skip) { intro.parentNode.removeChild(intro); }
    else {
      var navLogo = $("[data-nav] img"), introLogo = $("[data-intrologo]");
      if (navLogo && introLogo) {
        requestAnimationFrame(function () {
          var a = introLogo.getBoundingClientRect(), b = navLogo.getBoundingClientRect();
          if (a.width && b.width) {
            var st = document.documentElement.style;
            st.setProperty("--mg-tx", ((b.left + b.width / 2) - (a.left + a.width / 2)) + "px");
            st.setProperty("--mg-ty", ((b.top + b.height / 2) - (a.top + a.height / 2)) + "px");
            st.setProperty("--mg-ts", (b.width / a.width).toFixed(3));
          }
        });
      }
      setTimeout(function () { if (intro.parentNode) intro.parentNode.removeChild(intro); }, 950);
    }
  }

  /* ---------- 2. Reveal pri skrolu ---------- */
  var revealEls = $$("[data-reveal]");
  if (!revealEls.length) { /* nothing */ }
  else if (reduce || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.setAttribute("data-inview", "1"); });
  } else {
    var rio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.setAttribute("data-inview", "1");
        rio.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.9) el.setAttribute("data-inview", "1");
      else rio.observe(el);
    });
  }

  /* ---------- 3. Skrol: progres, nav, linije koraka ---------- */
  var progress = $("[data-progress]"), nav = $("[data-nav]"), steps = $("[data-steps-wrap]");
  var sTick = 0;
  function readScroll() {
    var d = document.documentElement;
    var max = d.scrollHeight - window.innerHeight;
    var y = window.scrollY || 0;
    if (progress) progress.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
    if (nav) nav.setAttribute("data-scrolled", y > 40 ? "1" : "0");
    if (steps) {
      $$("[data-stepline]", steps).forEach(function (wrap) {
        var span = wrap.firstElementChild;
        if (!span) return;
        var r = wrap.getBoundingClientRect();
        var p = (window.innerHeight * 0.82 - r.top) / 200;
        span.style.width = (Math.min(1, Math.max(0, p)) * 100) + "%";
      });
    }
  }
  window.addEventListener("scroll", function () {
    if (sTick) return;
    sTick = requestAnimationFrame(function () { sTick = 0; readScroll(); });
  }, { passive: true });
  readScroll();

  /* ---------- 4. Mobilni meni ---------- */
  var menu = $("[data-menu]"), burger = $("[data-menutoggle]");
  function setMenu(open) {
    if (!menu) return;
    menu.setAttribute("data-open", open ? "1" : "0");
    if (burger) burger.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.style.overflow = open ? "hidden" : "";
  }
  if (burger) burger.addEventListener("click", function () { setMenu(menu.getAttribute("data-open") !== "1"); });
  $$("[data-menuclose], [data-menu] nav a, [data-menu] > a").forEach(function (el) {
    el.addEventListener("click", function () { setMenu(false); });
  });

  /* ---------- 5. Traka: pauza na hover ---------- */
  var marquee = $("[data-marquee]");
  if (marquee) {
    marquee.parentNode.addEventListener("mouseenter", function () { marquee.style.animationPlayState = "paused"; });
    marquee.parentNode.addEventListener("mouseleave", function () { marquee.style.animationPlayState = "running"; });
  }

  /* ---------- 6. Magnetni kursor, magnetna dugmad, 3D tilt ---------- */
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var cursor = $("[data-cursor]");
  if (fine && !reduce) {
    var magnets = [], mTick = 0, mx = 0, my = 0, mt = null, lastCard = null;
    var refreshMagnets = function () { magnets = $$("[data-magnet]"); };
    refreshMagnets();
    window.__mgRefreshMagnets = refreshMagnets;
    function moveFrame() {
      if (cursor) {
        cursor.style.transform = "translate(" + mx + "px," + my + "px)";
        cursor.style.opacity = "1";
        var over = mt && mt.closest && mt.closest("[data-magnet], button, a");
        cursor.style.width = over ? "44px" : "14px";
        cursor.style.height = over ? "44px" : "14px";
        cursor.style.margin = over ? "-22px 0 0 -22px" : "-7px 0 0 -7px";
        cursor.style.background = over ? "transparent" : "#D8202A";
        cursor.style.border = over ? "1.5px solid #D8202A" : "0";
      }
      magnets.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < -120 || r.top > window.innerHeight + 120) { if (el.style.transform) el.style.transform = ""; return; }
        var dx = mx - (r.left + r.width / 2), dy = my - (r.top + r.height / 2);
        var d = Math.hypot(dx, dy);
        var reach = Math.max(r.width, r.height) / 2 + 80;
        if (d < reach) {
          var k = (1 - d / reach) * 8;
          el.style.transform = "translate(" + (dx / d || 0) * k + "px," + ((dy / d || 0) * k) + "px)";
          el.style.transition = "transform 0.12s linear";
        } else if (el.style.transform) {
          el.style.transform = "";
          el.style.transition = "transform 0.5s cubic-bezier(0.3,1.5,0.4,1)";
        }
      });
      var card = mt && mt.closest && mt.closest("[data-tcard]");
      if (card !== lastCard && lastCard) lastCard.style.transform = "";
      lastCard = card;
      if (card) {
        var cr = card.getBoundingClientRect();
        var px = (mx - cr.left) / cr.width - 0.5, py = (my - cr.top) / cr.height - 0.5;
        card.style.transform = "perspective(900px) rotateY(" + (px * 6).toFixed(2) + "deg) rotateX(" + (-py * 6).toFixed(2) + "deg)";
      }
    }
    window.addEventListener("mousemove", function (ev) {
      mx = ev.clientX; my = ev.clientY; mt = ev.target;
      if (mTick) return;
      mTick = requestAnimationFrame(function () { mTick = 0; moveFrame(); });
    }, { passive: true });
  } else if (cursor) {
    cursor.parentNode.removeChild(cursor);
  }

  /* ---------- 7. Filter trenera + FLIP ---------- */
  var grid = $("[data-tgrid]");
  var filtriran = "svi";
  function applyFilter(key) {
    if (!grid || key === filtriran) return;
    var cards = $$("[data-tcard]", grid);
    var first = {};
    cards.forEach(function (el) { first[el.getAttribute("data-tcard")] = el.getBoundingClientRect(); });
    filtriran = key;
    cards.forEach(function (el) {
      var id = parseInt(el.getAttribute("data-tcard"), 10);
      var t = TRENERI.filter(function (x) { return x.id === id; })[0];
      var vis = key === "svi" || (t && t.kategorije.indexOf(key) > -1);
      el.style.display = vis ? "" : "none";
    });
    $$("[data-filter]").forEach(function (b) {
      var on = b.getAttribute("data-filter") === key;
      b.setAttribute("data-pill", on ? "1" : "0");
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    if (reduce) return;
    var visible = cards.filter(function (el) { return el.style.display !== "none"; });
    visible.forEach(function (el, i) {
      var before = first[el.getAttribute("data-tcard")];
      var after = el.getBoundingClientRect();
      if (before && before.width) {
        var dx = before.left - after.left, dy = before.top - after.top;
        el.style.transition = "none";
        el.style.transform = (dx || dy) ? "translate(" + dx + "px," + dy + "px)" : "";
        el.style.opacity = "1";
      } else {
        el.style.transition = "none";
        el.style.opacity = "0";
        el.style.transform = "scale(0.94)";
      }
      requestAnimationFrame(function () {
        var d = (i * 0.022).toFixed(3);
        el.style.transition = "transform 0.35s cubic-bezier(0.2,0,0,1) " + d + "s, opacity 0.35s ease " + d + "s";
        el.style.transform = "";
        el.style.opacity = "1";
      });
    });
    if (window.__mgRefreshMagnets) window.__mgRefreshMagnets();
  }
  $$("[data-filter]").forEach(function (b) {
    b.addEventListener("click", function () { applyFilter(b.getAttribute("data-filter")); });
  });

  /* ---------- 8. Panel trenera ---------- */
  var panel = $("[data-panel]"), scrim = $("[data-scrim]"), panelBody = $("[data-panel-body]");
  var lastFocus = null;
  function openTrainer(id) {
    var t = TRENERI.filter(function (x) { return x.id === id; })[0];
    if (!t || !panel || !panelBody) return;
    lastFocus = document.activeElement;
    panelBody.innerHTML =
      '<div style="height: clamp(260px, 44vw, 380px); position: relative; margin: -60px 0 0;">' +
        '<img src="' + t.slika + '" alt="' + t.ime + '" style="width:100%;height:100%;object-fit:cover;display:block;">' +
      '</div>' +
      '<div style="padding: clamp(24px, 4vw, 40px); display: grid; gap: 22px;">' +
        '<div>' +
          '<h3 style="font-family: Archivo, sans-serif; font-variation-settings: \'wdth\' 116; font-weight: 900; font-size: clamp(1.7rem, 4vw, 2.5rem); line-height: 0.95; letter-spacing: -0.03em; margin: 0 0 8px; text-transform: uppercase;">' + t.ime + '</h3>' +
          '<p style="margin: 0; font-size: 14px; letter-spacing: 0.1em; text-transform: uppercase; color: #D8202A; font-weight: 600;">' + t.specijalnost + '</p>' +
        '</div>' +
        '<p style="margin: 0; font-size: 16px; line-height: 1.65; color: #1A1A1A;">' + t.bio + '</p>' +
        '<div style="border-top: 1px solid #C9C9C9; padding-top: 18px;">' +
          '<p style="margin: 0 0 10px; font-size: 11.5px; letter-spacing: 0.16em; text-transform: uppercase; color: #8A8A8A;">Sertifikati</p>' +
          t.sertifikati.map(function (c) { return '<p style="margin: 0 0 6px; font-size: 15px; line-height: 1.5;">' + c + '</p>'; }).join('') +
        '</div>' +
        '<div style="border-top: 1px solid #C9C9C9; padding-top: 18px;">' +
          '<p style="margin: 0 0 10px; font-size: 11.5px; letter-spacing: 0.16em; text-transform: uppercase; color: #8A8A8A;">Dostupni termini</p>' +
          '<div style="display: flex; flex-wrap: wrap; gap: 8px;">' +
            t.termini.map(function (x) { return '<span style="border: 1px solid #000; padding: 9px 13px; font-size: 13px; font-weight: 600;">' + x + '</span>'; }).join('') +
          '</div>' +
        '</div>' +
        '<div style="display: grid; gap: 10px;">' +
          '<a class="mg-panel-cta" href="' + TEL + '" style="background: #D8202A; color: #fff; text-align: center; padding: 19px; font-size: 13.5px; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase;">Pozovi i zakaži</a>' +
          '<a class="mg-panel-ig" href="' + t.instagram + '" target="_blank" rel="noopener" style="border: 1px solid #000; color: #000; text-align: center; padding: 19px; font-size: 13.5px; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase;">Instagram</a>' +
        '</div>' +
      '</div>';
    panel.setAttribute("data-open", "1");
    if (scrim) scrim.setAttribute("data-open", "1");
    document.body.style.overflow = "hidden";
    var close = $("[data-panelclose]", panel);
    if (close) close.focus();
  }
  function closeTrainer() {
    if (!panel) return;
    panel.setAttribute("data-open", "0");
    if (scrim) scrim.setAttribute("data-open", "0");
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  $$("[data-open-trainer]").forEach(function (b) {
    b.addEventListener("click", function () {
      var card = b.closest("[data-tcard]");
      if (card) openTrainer(parseInt(card.getAttribute("data-tcard"), 10));
    });
  });
  $$("[data-panelclose]").forEach(function (b) { b.addEventListener("click", closeTrainer); });

  /* ---------- 9. Raspored: strelice + današnji dan ---------- */
  var sched = $("[data-sched]");
  function syncSched() {
    if (!sched) return;
    var prev = $('[data-dir="-1"]'), next = $('[data-dir="1"]');
    if (prev) prev.setAttribute("data-schedbtn", sched.scrollLeft > 4 ? "1" : "0");
    if (next) next.setAttribute("data-schedbtn", sched.scrollLeft < sched.scrollWidth - sched.clientWidth - 4 ? "1" : "0");
  }
  $$("[data-dir]").forEach(function (b) {
    b.addEventListener("click", function () {
      if (!sched) return;
      var card = $("[data-day]", sched);
      var step = card ? card.getBoundingClientRect().width + 12 : sched.clientWidth * 0.8;
      sched.scrollBy({ left: parseInt(b.getAttribute("data-dir"), 10) * step, behavior: reduce ? "auto" : "smooth" });
    });
  });
  if (sched) {
    sched.addEventListener("scroll", syncSched, { passive: true });
    window.addEventListener("resize", syncSched, { passive: true });
    syncSched();
    var dayIdx = (new Date().getDay() + 6) % 7; /* 0 = ponedeljak */
    var days = $$("[data-day]", sched);
    if (days[dayIdx]) days[dayIdx].setAttribute("data-today", "1");
  }

  /* ---------- 10. Karusel utisaka ---------- */
  var qText = $("[data-utisak-tekst]"), qName = $("[data-utisak-ime]"), qLen = $("[data-utisak-duzina]");
  var qi = 0, qTimer = null;
  function showUtisak(i) {
    if (!UTISCI.length || !qText) return;
    qi = (i + UTISCI.length) % UTISCI.length;
    var u = UTISCI[qi];
    qText.textContent = u.tekst;
    if (qName) qName.textContent = u.ime;
    if (qLen) qLen.textContent = u.duzina;
    $$("[data-utisak]").forEach(function (b, n) {
      var on = n === qi;
      b.setAttribute("data-dot", on ? "1" : "0");
      b.setAttribute("aria-current", on ? "1" : "0");
      var dot = b.firstElementChild;
      if (dot) dot.setAttribute("data-dotin", on ? "1" : "0");
    });
  }
  $$("[data-utisak]").forEach(function (b) {
    b.addEventListener("click", function () {
      showUtisak(parseInt(b.getAttribute("data-utisak"), 10));
      if (qTimer) { clearInterval(qTimer); qTimer = setInterval(function () { showUtisak(qi + 1); }, 7000); }
    });
  });
  if (UTISCI.length > 1 && !reduce) qTimer = setInterval(function () { showUtisak(qi + 1); }, 7000);

  /* ---------- 11. Akordeon ---------- */
  $$("[data-faqbtn]").forEach(function (b) {
    b.addEventListener("click", function () {
      var item = b.closest("[data-faq]");
      var open = item.getAttribute("data-open") === "1";
      $$("[data-faq]").forEach(function (x) { x.setAttribute("data-open", "0"); });
      $$("[data-faqbtn]").forEach(function (x) { x.setAttribute("aria-expanded", "false"); });
      if (!open) { item.setAttribute("data-open", "1"); b.setAttribute("aria-expanded", "true"); }
    });
  });

  /* ---------- 12. Lightbox galerije ---------- */
  var lb = null;
  function openLightbox(n) {
    var src = "images/galerija-0" + n + ".jpg";
    closeLightbox();
    lb = document.createElement("div");
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-modal", "true");
    lb.setAttribute("aria-label", "Galerija");
    lb.style.cssText = "position:fixed;inset:0;z-index:150;background:rgba(0,0,0,0.94);display:grid;place-items:center;padding:clamp(16px,5vw,60px);cursor:zoom-out;";
    lb.innerHTML = '<img src="' + src + '" alt="' + (GALERIJA[n - 1] || "Fotografija " + n) + '" style="max-width:100%;max-height:100%;object-fit:contain;">' +
      '<button type="button" aria-label="Zatvori" style="position:fixed;top:20px;right:20px;background:none;border:1px solid #444;color:#fff;padding:12px 18px;font-family:Chivo,sans-serif;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;">Zatvori</button>';
    lb.addEventListener("click", closeLightbox);
    document.body.appendChild(lb);
    document.body.style.overflow = "hidden";
  }
  function closeLightbox() {
    if (lb && lb.parentNode) lb.parentNode.removeChild(lb);
    lb = null;
    if (!panel || panel.getAttribute("data-open") !== "1") document.body.style.overflow = "";
  }
  $$("[data-gal]").forEach(function (b) {
    b.addEventListener("click", function () { openLightbox(parseInt(b.getAttribute("data-gal"), 10)); });
  });

  /* ---------- 13. Esc ---------- */
  window.addEventListener("keydown", function (ev) {
    if (ev.key !== "Escape") return;
    closeLightbox();
    closeTrainer();
    setMenu(false);
  });
})();
