// Reckonry. The page is a reckoning of its own, and nothing about it is
// stored or sent.
//
// Pick how long you reckon reading the page will take and start: the
// estimate locks, the clock runs in real time, and once the card is off
// screen a slip at the top keeps it, like a Live Activity. End, from the
// slip or the bottom of the page, shows how it landed on the app's five
// stages, set by how far the actual ran from the estimate.
//
// Until then, How it landed cycles through records from the app's own
// sample set.

(function () {
  var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  var STAGES = [
    { id: 'teal',    name: 'Teal',    band: 'Within 10%',  under: 0.10 },
    { id: 'petrol',  name: 'Petrol',  band: '10 to 25%',   under: 0.25 },
    { id: 'indigo',  name: 'Indigo',  band: '25 to 50%',   under: 0.50 },
    { id: 'violet',  name: 'Violet',  band: '50 to 100%',  under: 1.00 },
    { id: 'magenta', name: 'Magenta', band: 'Beyond 100%', under: Infinity }
  ];

  function stageFor(divergence) {
    for (var i = 0; i < STAGES.length; i++) if (divergence < STAGES[i].under) return STAGES[i];
    return STAGES[4];
  }

  var $ = function (id) { return document.getElementById(id); };

  var card = $('reckon');
  if (!card) return;

  var chips = Array.prototype.slice.call(card.querySelectorAll('.chip'));
  var startBtn = $('start');
  var locked = $('locked');
  var live = $('live');
  var ends = Array.prototype.slice.call(document.querySelectorAll('[data-end]'));
  var endHere = $('end-here');
  var again = $('again');
  var result = $('result');
  var note = $('landed-note');
  var arcItems = document.querySelectorAll('#arc li');

  var estMin = 0, t0 = 0, tick = 0, running = false, cardVisible = true, rotate = 0;

  // ---------- Before: choose and start ----------

  chips.forEach(function (c) {
    c.setAttribute('aria-pressed', 'false');
    c.addEventListener('click', function () {
      chips.forEach(function (o) { o.setAttribute('aria-pressed', o === c ? 'true' : 'false'); });
      estMin = +c.dataset.min;
      startBtn.disabled = false;
    });
  });

  function clockText(sec) {
    var m = Math.floor(sec / 60), s = Math.floor(sec % 60);
    return m + ':' + String(s).padStart(2, '0');
  }

  function span(sec) {
    sec = Math.round(sec);
    var m = Math.floor(sec / 60), s = sec % 60;
    if (!m) return s + ' sec';
    return m + ' min' + (s ? ' ' + s + ' sec' : '');
  }

  function showLive() { live.hidden = !(running && !cardVisible); }

  startBtn.addEventListener('click', function () {
    if (!estMin) return;
    running = true;
    t0 = Date.now();
    var est = estMin + ' min';
    $('locked-est').textContent = est;
    $('live-est').textContent = est;
    card.classList.add('is-running');
    locked.hidden = false;
    endHere.hidden = false;
    again.hidden = true;
    note.textContent = 'Your reckoning is running. End it when you have read as much as you meant to.';
    clearInterval(rotate);
    tick = setInterval(function () {
      var t = clockText((Date.now() - t0) / 1000);
      $('locked-clock').textContent = t;
      $('live-clock').textContent = t;
    }, 250);
    showLive();
  });

  // The slip appears only when the card has scrolled away.
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      cardVisible = entries[0].isIntersecting;
      showLive();
    }, { threshold: 0.15 }).observe(card);
  }

  // ---------- After: how it landed ----------

  function show(r) {
    var apply = function () {
      result.dataset.stage = r.stage.id;
      $('r-task').textContent = r.task;
      $('r-verdict').textContent = r.verdict;
      $('r-figures').textContent = r.figures;
      $('r-stage').textContent = r.stage.name;
      $('r-band').textContent = r.stage.band;
      result.classList.remove('is-swapping');
    };
    if (still) { apply(); return; }
    result.classList.add('is-swapping');
    setTimeout(apply, 350);
  }

  ends.forEach(function (b) {
    b.addEventListener('click', function () {
      if (!running) return;
      running = false;
      clearInterval(tick);
      var actual = (Date.now() - t0) / 1000;
      var estSec = estMin * 60;
      var diff = actual - estSec;
      var stage = stageFor(Math.abs(diff) / estSec);
      var verdict = Math.abs(diff) < 10 ? 'Within seconds of the estimate'
        : diff > 0 ? 'Ran ' + span(diff) + ' over'
        : 'Finished ' + span(-diff) + ' early';

      show({
        task: 'Read this page',
        verdict: verdict,
        figures: 'Reckoned ' + estMin + ' min · Actual ' + span(actual),
        stage: stage
      });
      arcItems.forEach(function (li) { li.classList.toggle('is-yours', li.dataset.stage === stage.id); });

      note.textContent = 'Yours, kept here only until you leave the page. No score, no grade. If you stopped early, that is the record.';
      endHere.hidden = true;
      locked.querySelector('.end').hidden = true;
      $('locked-est').textContent = estMin + ' min, ended';
      again.hidden = false;
      showLive();
      $('landed').scrollIntoView({ behavior: still ? 'auto' : 'smooth', block: 'center' });
    });
  });

  again.addEventListener('click', function () {
    card.classList.remove('is-running');
    locked.hidden = true;
    locked.querySelector('.end').hidden = false;
    startBtn.disabled = true;
    estMin = 0;
    chips.forEach(function (c) { c.setAttribute('aria-pressed', 'false'); });
    $('locked-clock').textContent = '0:00';
    card.scrollIntoView({ behavior: still ? 'auto' : 'smooth', block: 'center' });
  });

  // ---------- Until then: records from the app's sample set ----------

  var samples = [
    { task: 'Clear the inbox',            verdict: 'Ran 2 min over',       figures: 'Reckoned 15 min · Actual 17 min',      stage: STAGES[1] },
    { task: 'Prep for the design review', verdict: 'Finished 12 min early', figures: 'Reckoned 1 hr · Actual 48 min',        stage: STAGES[1] },
    { task: 'Sort the garage shelf',      verdict: 'Finished 21 min early', figures: 'Reckoned 2 hr · Actual 1 hr 39 min',   stage: STAGES[1] },
    { task: 'Draft the quarterly report', verdict: 'Finished 22 min early', figures: 'Reckoned 45 min · Actual 23 min',      stage: STAGES[2] },
    { task: 'Write the status summary',   verdict: 'Ran 8 min over',        figures: 'Reckoned 1 hr 30 min · Actual 1 hr 38 min', stage: STAGES[0] },
    { task: 'Review the test procedure',  verdict: 'Ran 44 min over',       figures: 'Reckoned 45 min · Actual 1 hr 29 min', stage: STAGES[3] },
    { task: 'Rework the cost estimate',   verdict: 'Ran 4 hr 20 min over',  figures: 'Reckoned 3 hr · Actual 7 hr 20 min',   stage: STAGES[4] },
    { task: 'Fix the deck margins',       verdict: 'Ran 3 min over',        figures: 'Reckoned 20 min · Actual 23 min',      stage: STAGES[1] }
  ];
  var k = 4;
  if (!still) {
    rotate = setInterval(function () {
      k = (k + 1) % samples.length;
      show(samples[k]);
    }, 4500);
  }
})();
