/* Update feed: fills every element with data-updates="<game>" (or "all") from updates.json at the site root.
   data-root: path from the page to the site root ("" or "../"); data-limit: how many to show (default all). */
(function () {
  var css = '.uf-list{list-style:none;margin:0;padding:0}.uf-item{display:flex;gap:14px;align-items:flex-start;padding:12px 0;border-top:1px solid rgba(196,164,106,.25)}' +
    '.uf-item:first-child{border-top:0}.uf-thumb{flex:0 0 132px;width:132px;height:auto;border-radius:8px;border:1px solid rgba(196,164,106,.35)}' +
    '.uf-when{margin:0;font-size:.85em;opacity:.75}.uf-name{margin:.1em 0 .2em;font-weight:600}.uf-game{font-size:.8em;opacity:.8;border:1px solid rgba(196,164,106,.5);border-radius:8px;padding:0 6px;margin-left:6px}' +
    '.uf-note{margin:0}.uf-empty{margin:0;opacity:.85}@media(max-width:520px){.uf-thumb{flex-basis:96px;width:96px}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]; }); }
  function when(stamp) {
    var m = /^(\d{4})-(\d{2})-(\d{2})(?: (\d{2}):(\d{2}))?/.exec(stamp || '');
    if (!m) return esc(stamp);
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var d = (+m[3]) + ' ' + months[+m[2] - 1] + ' ' + m[1];
    if (m[4]) { var h = +m[4], ap = h < 12 ? 'AM' : 'PM'; h = h % 12 || 12; d += ', ' + h + ':' + m[5] + ' ' + ap + ' MT'; }
    return d;
  }
  var boxes = document.querySelectorAll('[data-updates]');
  if (!boxes.length) return;
  var root = boxes[0].getAttribute('data-root') || '';
  fetch(root + 'updates.json', {cache: 'no-cache'}).then(function (r) { return r.json(); }).then(function (data) {
    var all = (data.updates || []).slice().sort(function (a, b) { return a.stamp < b.stamp ? 1 : a.stamp > b.stamp ? -1 : 0; });
    boxes.forEach(function (box) {
      var game = box.getAttribute('data-updates'), r = box.getAttribute('data-root') || '';
      var lim = parseInt(box.getAttribute('data-limit') || '0', 10);
      var list = all.filter(function (u) { return game === 'all' || u.game === game; });
      if (lim > 0) list = list.slice(0, lim);
      var out = box.querySelector('.uf-body') || box;
      if (!list.length) { out.innerHTML = '<p class="uf-empty">Updates start here. New patches will show up in this list as they land.</p>'; return; }
      out.innerHTML = '<ul class="uf-list">' + list.map(function (u) {
        var g = data.games && data.games[u.game];
        var tag = game === 'all' && g ? '<a class="uf-game" href="' + esc(r + g.page) + '">' + esc(g.title) + '</a>' : '';
        var img = u.image ? '<img class="uf-thumb" loading="lazy" src="' + esc(r + u.image) + '" alt="' + esc(u.name) + '">' : '';
        return '<li class="uf-item">' + img + '<div><p class="uf-when">' + when(u.stamp) + '</p><p class="uf-name">' + esc(u.name) + tag + '</p><p class="uf-note">' + esc(u.note) + '</p></div></li>';
      }).join('') + '</ul>';
    });
  }).catch(function () {
    boxes.forEach(function (box) { (box.querySelector('.uf-body') || box).innerHTML = '<p class="uf-empty">Updates start here.</p>'; });
  });
})();
