/* ==========================================================================
   Episode player for /series/<slug>/ pages.
   Plain JavaScript, served as a static file (no bundler involved).

   What it does
   - Click a free episode number  -> that episode loads in the player.
   - Prev / Next buttons          -> move through the episodes.
   - Locked episode               -> shows an "Unlock" screen (+ optional smart link).
   - Not-uploaded episode         -> highlights the "full video" banner (+ optional smart link).
   - Understands many link types, so you can paste whatever you have:
       * YouTube (watch / shorts / youtu.be / embed)
       * Vimeo, Dailymotion, Google Drive share links
       * direct .mp4 / .webm / .mov files
       * .m3u8 (HLS) streams
       * any other "embed" URL (used as an iframe as-is)
   - Placeholder links (example.com etc.) are detected and show a clear message
     instead of a blank/broken player.
   ========================================================================== */
(function () {
  'use strict';

  var root = document.getElementById('drama-player');
  var grid = document.getElementById('episode-grid');
  var stage = document.getElementById('player-stage');
  if (!root || !grid || !stage) return;

  var wrap = document.getElementById('player-wrap');
  var nowPlaying = document.getElementById('now-playing');
  var prevBtn = document.getElementById('prev-ep');
  var nextBtn = document.getElementById('next-ep');
  var help = document.getElementById('player-help');
  var helpLink = document.getElementById('player-open');
  var hint = document.getElementById('ep-hint');
  var banner = document.getElementById('full-video-banner');
  var dramaTitle = root.getAttribute('data-title') || 'Drama';
  var fullUrl = root.getAttribute('data-full-video') || '';

  /* ---------- ads config (same JSON the old code used) ---------- */
  var ads = { adsEnabled: false, episodeSmartLink: { enabled: false, mode: 'off', openInNewTab: true, code: '' } };
  try {
    var rawCfg = document.getElementById('ads-config');
    if (rawCfg) ads = JSON.parse(rawCfg.textContent || '{}') || ads;
  } catch (e) { /* keep defaults */ }
  var smartCfg = (ads && ads.episodeSmartLink) || { enabled: false, mode: 'off', openInNewTab: true, code: '' };

  var buttons = Array.prototype.slice.call(grid.querySelectorAll('.dr-ep[data-ep]:not(.dr-ep--soon)'));
  var soonButtons = Array.prototype.slice.call(grid.querySelectorAll('.dr-ep--soon'));
  var current = null;
  var hlsInstance = null;

  /* ---------- helpers ---------- */
  function isPlaceholder(url) {
    if (!url) return true;
    var u;
    try { u = new URL(url, location.href); } catch (e) { return true; }
    var host = u.hostname.toLowerCase();
    return /(^|\.)example\.(com|org|net)$/.test(host);
  }

  function firstValidLink(list) {
    for (var i = 0; i < list.length; i++) {
      if (list[i] && !isPlaceholder(list[i])) return list[i];
    }
    return '';
  }

  function openSmartLink(url) {
    if (!url || isPlaceholder(url)) return;
    if (!ads.adsEnabled || !smartCfg || !smartCfg.enabled) return;
    if (smartCfg.openInNewTab === false) { window.location.href = url; }
    else { window.open(url, '_blank', 'noopener'); }
  }

  /* Turn whatever URL was pasted into something a player can show. */
  function parseVideo(raw, autoplay) {
    var url = (raw || '').trim();
    if (!url) return { kind: 'none' };
    if (isPlaceholder(url)) return { kind: 'placeholder' };

    var u;
    try { u = new URL(url, location.href); } catch (e) { return { kind: 'placeholder' }; }
    var host = u.hostname.replace(/^www\./, '').toLowerCase();
    var path = u.pathname;
    var m, id;
    var ap = autoplay ? '1' : '0';

    // YouTube (already-embed URLs are left untouched so custom params survive)
    if (host === 'youtu.be') {
      id = path.slice(1).split('/')[0];
      if (id) return { kind: 'iframe', src: 'https://www.youtube-nocookie.com/embed/' + id + '?rel=0&playsinline=1&autoplay=' + ap, open: 'https://www.youtube.com/watch?v=' + id };
    }
    if (/(^|\.)youtube\.com$/.test(host)) {
      if (path === '/watch') id = u.searchParams.get('v');
      else if ((m = path.match(/^\/(shorts|live|v)\/([\w-]{6,})/))) id = m[2];
      if (id) return { kind: 'iframe', src: 'https://www.youtube-nocookie.com/embed/' + id + '?rel=0&playsinline=1&autoplay=' + ap, open: 'https://www.youtube.com/watch?v=' + id };
    }

    // Vimeo
    if (host === 'vimeo.com' && (m = path.match(/^\/(\d+)(?:\/([a-z0-9]+))?/i))) {
      var h = m[2] ? '&h=' + m[2] : '';
      return { kind: 'iframe', src: 'https://player.vimeo.com/video/' + m[1] + '?playsinline=1&autoplay=' + ap + h, open: url };
    }

    // Dailymotion
    if ((host === 'dailymotion.com' && (m = path.match(/^\/video\/([\w]+)/))) || (host === 'dai.ly' && (m = path.match(/^\/([\w]+)/)))) {
      return { kind: 'iframe', src: 'https://www.dailymotion.com/embed/video/' + m[1] + '?autoplay=' + ap, open: url };
    }

    // Google Drive share links -> preview player
    if (host === 'drive.google.com') {
      if ((m = path.match(/^\/file\/d\/([\w-]+)/))) id = m[1];
      else id = u.searchParams.get('id');
      if (id) return { kind: 'iframe', src: 'https://drive.google.com/file/d/' + id + '/preview', open: 'https://drive.google.com/file/d/' + id + '/view' };
    }

    // Direct video files / HLS streams
    if (/\.m3u8(\?|$)/i.test(url)) return { kind: 'hls', src: url, open: url };
    if (/\.(mp4|webm|ogv|ogg|mov|m4v)(\?|$)/i.test(url)) return { kind: 'video', src: url, open: url };

    // Everything else: treat it as an embeddable page
    return { kind: 'iframe', src: url, open: url };
  }

  function destroyHls() {
    if (hlsInstance && typeof hlsInstance.destroy === 'function') { try { hlsInstance.destroy(); } catch (e) { /* ignore */ } }
    hlsInstance = null;
  }

  /* Wipe the stage completely — removes the old <iframe>/<video> so audio stops. */
  function clearStage() {
    destroyHls();
    while (stage.firstChild) stage.removeChild(stage.firstChild);
  }

  function setHelp(url) {
    if (!help || !helpLink) return;
    if (url) { helpLink.href = url; help.classList.remove('dr-hidden'); }
    else { help.classList.add('dr-hidden'); }
  }

  function showMessage(icon, text, linkUrl, linkText) {
    clearStage();
    var box = document.createElement('div');
    box.className = 'dr-player__msg';
    var ic = document.createElement('span');
    ic.className = 'dr-player__icon';
    ic.textContent = icon;
    var p = document.createElement('p');
    p.style.margin = '0';
    p.textContent = text;
    box.appendChild(ic);
    box.appendChild(p);
    if (linkUrl) {
      var a = document.createElement('a');
      a.className = 'dr-cta';
      a.href = linkUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer sponsored';
      a.textContent = linkText || 'Continue';
      box.appendChild(a);
    }
    stage.appendChild(box);
    setHelp('');
  }

  function showIframe(src, title) {
    clearStage();
    var f = document.createElement('iframe');
    f.title = title;
    f.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture; encrypted-media');
    f.setAttribute('allowfullscreen', '');
    f.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    f.src = src;
    stage.appendChild(f);
  }

  function showVideo(src, kind, autoplay, title) {
    clearStage();
    var v = document.createElement('video');
    v.controls = true;
    v.setAttribute('playsinline', '');
    v.setAttribute('preload', 'metadata');
    v.setAttribute('aria-label', title);
    v.addEventListener('error', function () {
      showMessage('⚠️', 'This video could not be loaded. Please try another episode.', '', '');
      setHelp('');
    }, { once: true });
    stage.appendChild(v);

    function start() {
      if (!autoplay) return;
      var p = v.play();
      if (p && typeof p.catch === 'function') p.catch(function () { /* autoplay blocked — user can press play */ });
    }

    if (kind === 'hls' && !v.canPlayType('application/vnd.apple.mpegurl')) {
      // Browsers other than Safari need hls.js for .m3u8
      var s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
      s.onload = function () {
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls();
          hlsInstance.loadSource(src);
          hlsInstance.attachMedia(v);
          start();
        } else {
          showMessage('⚠️', 'Your browser can not play this video format.', '', '');
        }
      };
      s.onerror = function () { showMessage('⚠️', 'The video player could not be loaded. Check your connection and try again.', '', ''); };
      document.head.appendChild(s);
    } else {
      v.src = src;
      start();
    }
  }

  function scrollPlayerIntoView() {
    // Scroll to the "Now Playing" bar so the title, Prev/Next AND the video are all visible.
    var bar = nowPlaying && nowPlaying.parentElement;
    if (!bar || !wrap) return;
    var top = bar.getBoundingClientRect().top;
    var bottom = wrap.getBoundingClientRect().bottom;
    var vh = window.innerHeight || document.documentElement.clientHeight;
    // Only scroll if the player is (partly) off-screen — avoids jumpy pages on desktop.
    if (top < 60 || bottom > vh) {
      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      bar.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    }
  }

  function updateNav() {
    var idx = current ? buttons.indexOf(current) : -1;
    if (prevBtn) prevBtn.disabled = idx <= 0;
    if (nextBtn) nextBtn.disabled = idx === -1 || idx >= buttons.length - 1;
  }

  /* ---------- main action ---------- */
  function activate(btn, opts) {
    opts = opts || {};
    current = btn;

    buttons.forEach(function (b) { b.classList.remove('is-active'); b.removeAttribute('aria-current'); });
    btn.classList.add('is-active');
    btn.setAttribute('aria-current', 'true');
    if (hint) hint.textContent = '';

    var locked = btn.getAttribute('data-locked') === '1';
    var videoUrl = btn.getAttribute('data-video') || '';
    var epNum = btn.getAttribute('data-ep');
    var epTitle = btn.getAttribute('data-title') || ('Episode ' + epNum);
    var smart = btn.getAttribute('data-smart') || '';
    var mode = smartCfg.mode || 'off';
    var fromUser = !!opts.fromUser;      // real click on an episode number -> smart link allowed
    var autoplay = !!opts.autoplay;      // start playing right away (click / prev / next)
    var playerTitle = dramaTitle + ' — ' + epTitle;

    if (nowPlaying) nowPlaying.textContent = (locked || !videoUrl ? 'Locked — ' : 'Now Playing — ') + epTitle;

    if (locked || !videoUrl) {
      var unlock = firstValidLink([smart, smartCfg.code, fullUrl]);
      showMessage(
        '🔒',
        unlock ? 'This episode is locked. Continue via our partner link to keep watching.' : 'This episode is not available yet. Please check back soon.',
        unlock,
        'Unlock Now'
      );
      if (fromUser && (mode === 'lockedOnly' || mode === 'everyClick')) openSmartLink(firstValidLink([smart, smartCfg.code, fullUrl]));
    } else {
      var info = parseVideo(videoUrl, autoplay);
      if (info.kind === 'placeholder' || info.kind === 'none') {
        // The JSON still contains a dummy link — tell the truth instead of showing a blank box.
        console.warn('[player] Episode ' + epNum + ' has a placeholder videoUrl. Replace it with a real embed/video link in the drama JSON:', videoUrl);
        showMessage('🎬', 'This episode is being uploaded. Please check back soon.', firstValidLink([fullUrl]), 'Watch full video');
      } else if (info.kind === 'video' || info.kind === 'hls') {
        showVideo(info.src, info.kind, autoplay, playerTitle);
        setHelp(info.open);
      } else {
        showIframe(info.src, playerTitle);
        setHelp(info.open);
      }
      if (fromUser && mode === 'everyClick') openSmartLink(firstValidLink([smart, smartCfg.code]));
    }

    updateNav();

    if (opts.scroll) scrollPlayerIntoView();
    if (opts.updateHash && window.history && history.replaceState) {
      try { history.replaceState(null, '', '#ep-' + epNum); } catch (e) { /* ignore */ }
    }
  }

  /* ---------- wiring ---------- */
  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      activate(btn, { fromUser: true, autoplay: true, scroll: true, updateHash: true });
    });
  });

  soonButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var n = btn.getAttribute('data-ep');
      if (hint) hint.textContent = 'Episode ' + n + ' is not uploaded yet.';
      if (banner) {
        banner.scrollIntoView({ behavior: 'smooth', block: 'center' });
        banner.classList.add('is-flash');
        setTimeout(function () { banner.classList.remove('is-flash'); }, 1600);
      }
      if (smartCfg.mode === 'lockedOnly' || smartCfg.mode === 'everyClick') {
        openSmartLink(firstValidLink([smartCfg.code, fullUrl]));
      }
    });
  });

  if (prevBtn) prevBtn.addEventListener('click', function () {
    var i = buttons.indexOf(current);
    if (i > 0) activate(buttons[i - 1], { fromUser: false, autoplay: true, scroll: true, updateHash: true });
  });
  if (nextBtn) nextBtn.addEventListener('click', function () {
    var i = buttons.indexOf(current);
    if (i >= 0 && i < buttons.length - 1) activate(buttons[i + 1], { fromUser: false, autoplay: true, scroll: true, updateHash: true });
  });

  /* ---------- first paint ---------- */
  if (!buttons.length) return;

  var start = null;
  var m = (location.hash || '').match(/^#ep-(\d+)$/);
  if (m) {
    start = buttons.filter(function (b) { return b.getAttribute('data-ep') === m[1]; })[0] || null;
  }
  if (!start) {
    // First episode that can really be played; fall back to the first button.
    start = buttons.filter(function (b) {
      return b.getAttribute('data-locked') !== '1' && b.getAttribute('data-video');
    })[0] || buttons[0];
  }
  // First load never autoplays and never opens ads.
  activate(start, { fromUser: false, autoplay: false, scroll: false, updateHash: false });
})();
