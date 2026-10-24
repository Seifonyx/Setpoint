  // Camera barcode reading. Uses the browser's own reader where there is one, otherwise ZXing (barcode.js).
  // Resolves to a stop function, or null if the camera can't start (the typed number still works).
  // A short beep when a barcode is read (the sound context is started on the tap that opened the scanner).
  let beepCtx = null;
  function primeBeep() { try { const C = window.AudioContext || window.webkitAudioContext; if (!C) return; beepCtx = beepCtx || new C(); if (beepCtx.state === 'suspended') beepCtx.resume(); } catch (e) {} }
  function beep() { try { if (!beepCtx) return; const o = beepCtx.createOscillator(), g = beepCtx.createGain(), t = beepCtx.currentTime; o.frequency.value = 1320; g.gain.setValueAtTime(0.07, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12); o.connect(g); g.connect(beepCtx.destination); o.start(t); o.stop(t + 0.13); } catch (e) {} }
  // A barcode from a photo (gallery or camera roll): the phone's own reader if it has one, otherwise ZXing, upright then turned.
  function decodeBarcodeFile(file) {
    if (!window.createImageBitmap) return Promise.resolve(null);
    return createImageBitmap(file).then(function (bmp) {
      let native = Promise.resolve(null);
      try { if ('BarcodeDetector' in window) native = new window.BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e'] }).detect(bmp).then(function (b) { return b[0] ? b[0].rawValue : null; }, function () { return null; }); } catch (e) {}
      return native.then(function (c) {
        if (c) return c;
        return import('./barcode.js').then(function (m) {
          const k = Math.min(1, 1600 / Math.max(bmp.width, bmp.height)), w = Math.round(bmp.width * k), h = Math.round(bmp.height * k);
          const cv = document.createElement('canvas'), ctx = cv.getContext('2d', { willReadFrequently: true });
          const attempt = function (turn) {
            cv.width = turn ? h : w; cv.height = turn ? w : h; ctx.setTransform(1, 0, 0, 1, 0, 0);
            if (turn) { ctx.translate(h, 0); ctx.rotate(Math.PI / 2); }
            ctx.drawImage(bmp, 0, 0, w, h);
            return m.decode(ctx.getImageData(0, 0, cv.width, cv.height));
          };
          return attempt(false) || attempt(true) || null;
        });
      });
    }).catch(function () { return null; });
  }
  function startCamera(video, onCode, msg, keep) {
    const onCode0 = onCode; onCode = function (c) { beep(); onCode0(c); };
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { msg('No camera here. Type the number instead.'); return Promise.resolve(null); }
    let stream = null, timer = null, stopped = false, last = '', seen = 0;
    const stop = function () { stopped = true; clearTimeout(timer); if (stream) stream.getTracks().forEach(function (t) { t.stop(); }); };
    const native = 'BarcodeDetector' in window ? window.BarcodeDetector.getSupportedFormats().then(function (f) { return f.indexOf('ean_13') >= 0 ? new window.BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e'] }) : null; }).catch(function () { return null; }) : Promise.resolve(null);
    return Promise.all([navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false }), native])
      .then(function (r) {
        stream = r[0]; const det = r[1];
        if (stopped) { stop(); return null; }
        // The phone's flashlight, where the camera allows it (most Android phones; not iPhone in the browser).
        try { const tr = stream.getVideoTracks()[0], caps = tr.getCapabilities ? tr.getCapabilities() : {}; if (caps.torch) stop.torch = function (on) { return tr.applyConstraints({ advanced: [{ torch: on }] }); }; } catch (e) {}
        video.srcObject = stream; video.play().catch(function () {});
        const zx = det ? Promise.resolve(null) : import('./barcode.js');
        const canvas = document.createElement('canvas'), ctx = canvas.getContext('2d', { willReadFrequently: true });
        // The same number twice in a row counts, so one blurry frame can't give a wrong code.
        // keep = scanning several: stay on, and ignore the same code for a moment after it's read.
        const recent = {};
        const got = function (c) { if (!c || stopped) return false; if (c === last) seen++; else { last = c; seen = 1; } if (seen >= 2 && validBarcode(c)) { if (keep) { const t = Date.now(); last = ''; seen = 0; if (recent[c] && t - recent[c] < 3000) return false; recent[c] = t; onCode(c); return false; } stop(); onCode(c); return true; } return false; };
        const tick = function () {
          if (stopped) return;
          if (video.readyState < 2) { timer = setTimeout(tick, 150); return; }
          if (det) { det.detect(video).then(function (b) { if (!got(b[0] && b[0].rawValue)) timer = setTimeout(tick, 120); }, function () { timer = setTimeout(tick, 250); }); return; }
          zx.then(function (m) {
            if (stopped) return;
            const w = video.videoWidth, h = video.videoHeight, ch = Math.round(h * 0.5);
            canvas.width = w; canvas.height = ch; ctx.drawImage(video, 0, (h - ch) / 2, w, ch, 0, 0, w, ch);
            if (!got(m.decode(ctx.getImageData(0, 0, w, ch)))) timer = setTimeout(tick, 120);
          }, function () { msg('Couldn\'t load the barcode reader. Type the number instead.'); });
        };
        tick();
        return stop;
      }, function () { msg('Camera not available. Allow camera access, or type the number.'); return null; });
  }

