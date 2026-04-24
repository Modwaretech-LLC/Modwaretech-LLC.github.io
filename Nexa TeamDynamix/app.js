/* ===== Nexa ServicePortal V2 — Application Logic ===== */

(function () {
  'use strict';

  /* ---- State ---- */
  var currentPath = [];
  var modalPath = [];
  var currentView = 'home';

  /* ---- DOM refs ---- */
  var app = document.getElementById('app');
  var modalOverlay = document.getElementById('modal-overlay');

  /* ---- Navigation data ---- */
  var NAV_TREE = window.LCEC_NAV_TREE || [];

  /* ---- Quick Actions ---- */
  var QUICK_ACTIONS = [
    { label: 'Report an Issue',       icon: 'alert-triangle', cls: 'quick-btn-icon--report' },
    { label: 'Track My Requests',     icon: 'clipboard-list', cls: 'quick-btn-icon--track' },
    { label: 'Browse Knowledge Base', icon: 'book-open',      cls: 'quick-btn-icon--kb' }
  ];

  /* ===== SVG Icons ===== */

  function svgIcon(name) {
    var icons = {
      'arrow-left': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>',
      'x': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
      'chevron-down': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',
      'alert-triangle': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
      'clipboard-list': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="15" y2="16"/></svg>',
      'book-open': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>',
      'upload': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>'
    };
    return icons[name] || '';
  }

  /* ===== Card Builders ===== */

  function createCard(item, isModal) {
    var accent = item.accent || '#0072CE';
    var card = document.createElement('div');
    card.className = 'card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.style.setProperty('--card-accent', accent);
    card.innerHTML =
      '<div class="card-icon-wrap"><img src="' + item.icon + '" alt="" loading="lazy"></div>' +
      '<div class="card-label">' + item.friendly_name + '</div>';

    function handleClick() {
      card.classList.add('card--clicked');
      setTimeout(function () {
        if (isModal) {
          onModalCardSelect(item);
        } else {
          onCardSelect(item);
        }
      }, 220);
    }

    card.addEventListener('click', handleClick);
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); }
    });
    return card;
  }

  /* ===== Page Views ===== */

  function renderHome() {
    currentView = 'home';
    currentPath = [];
    var frag = document.createDocumentFragment();

    // Card grid
    var grid = document.createElement('div');
    grid.className = 'card-grid card-grid--home';
    NAV_TREE.forEach(function (dept) { grid.appendChild(createCard(dept, false)); });
    frag.appendChild(grid);

    // Quick actions
    var qa = document.createElement('section');
    qa.className = 'quick-actions';
    qa.innerHTML = '<h2 class="section-title">Quick Actions</h2>';
    var qGrid = document.createElement('div');
    qGrid.className = 'quick-grid';
    QUICK_ACTIONS.forEach(function (a) {
      var btn = document.createElement('button');
      btn.className = 'quick-btn';
      btn.innerHTML = '<span class="quick-btn-icon ' + a.cls + '">' + svgIcon(a.icon) + '</span>' + a.label;
      qGrid.appendChild(btn);
    });
    qa.appendChild(qGrid);
    frag.appendChild(qa);

    setPageContent(frag);

    // Show the hero section
    document.getElementById('hero').style.display = '';
  }

  function renderDepartment(node) {
    currentView = 'department';
    var frag = document.createDocumentFragment();

    // Hide hero
    document.getElementById('hero').style.display = 'none';

    // Breadcrumb
    var bc = document.createElement('nav');
    bc.className = 'breadcrumb';
    bc.setAttribute('aria-label', 'Breadcrumb');
    var homeLink = document.createElement('span');
    homeLink.className = 'breadcrumb-link';
    homeLink.textContent = 'Home';
    homeLink.addEventListener('click', renderHome);
    bc.appendChild(homeLink);
    bc.insertAdjacentHTML('beforeend', '<span class="breadcrumb-sep">\u203A</span>');
    var cur = document.createElement('span');
    cur.className = 'breadcrumb-current';
    cur.textContent = node.friendly_name;
    bc.appendChild(cur);
    frag.appendChild(bc);

    // Back
    var backBtn = document.createElement('button');
    backBtn.className = 'back-btn';
    backBtn.innerHTML = '<span style="width:16px;height:16px;display:inline-flex">' + svgIcon('arrow-left') + '</span> Back';
    backBtn.addEventListener('click', renderHome);
    frag.appendChild(backBtn);

    // Heading
    var heading = document.createElement('h1');
    heading.className = 'dept-heading';
    heading.textContent = node.friendly_name + ' \u2014 How can we help?';
    frag.appendChild(heading);

    // Cards
    var grid = document.createElement('div');
    grid.className = 'card-grid';
    if (node.children && node.children.length) {
      node.children.forEach(function (child) { grid.appendChild(createCard(child, false)); });
    } else {
      grid.innerHTML = '<p style="color:var(--gray-500);grid-column:1/-1;">No options available yet.</p>';
    }
    frag.appendChild(grid);

    setPageContent(frag);
  }

  function setPageContent(fragment) {
    app.innerHTML = '';
    var wrapper = document.createElement('div');
    wrapper.className = 'page-view';
    wrapper.appendChild(fragment);
    app.appendChild(wrapper);
  }

  /* ===== Card Selection ===== */

  function onCardSelect(item) {
    if (item.target_url && item.target_url.indexOf('lcec.net') !== -1) {
      window.open('https://' + item.target_url, '_blank');
      return;
    }
    if (item.children && item.children.length) {
      if (item.level === 1) {
        currentPath = [item];
        renderDepartment(item);
      } else {
        modalPath = [item];
        openModal(item);
      }
      return;
    }
    if (item.target_url === 'sample-form.com') {
      modalPath = [item];
      openFormModal(item);
      return;
    }
    if (item.target_url) {
      window.open('https://' + item.target_url, '_blank');
    }
  }

  /* ===== Modal ===== */

  function openModal(node) {
    var modal = modalOverlay.querySelector('.modal');
    modal.innerHTML = '';

    var header = document.createElement('div');
    header.className = 'modal-header';
    var title = document.createElement('h2');
    title.className = 'modal-title';
    title.textContent = node.friendly_name;
    var closeBtn = document.createElement('button');
    closeBtn.className = 'modal-close';
    closeBtn.innerHTML = svgIcon('x');
    closeBtn.addEventListener('click', closeModal);
    header.appendChild(title);
    header.appendChild(closeBtn);
    modal.appendChild(header);

    var body = document.createElement('div');
    body.className = 'modal-body';
    var grid = document.createElement('div');
    grid.className = 'modal-card-grid';
    node.children.forEach(function (child) { grid.appendChild(createCard(child, true)); });
    body.appendChild(grid);
    modal.appendChild(body);

    modalOverlay.classList.add('active');
  }

  function onModalCardSelect(item) {
    if (item.children && item.children.length) {
      modalPath.push(item);
      openModal(item);
      return;
    }
    if (item.target_url === 'sample-form.com') {
      modalPath.push(item);
      openFormModal(item);
      return;
    }
    if (item.target_url && item.target_url.indexOf('lcec.net') !== -1) {
      window.open('https://' + item.target_url, '_blank');
      closeModal();
      return;
    }
    if (item.target_url) {
      window.open('https://' + item.target_url, '_blank');
      closeModal();
    }
  }

  function openFormModal(item) {
    var modal = modalOverlay.querySelector('.modal');
    modal.innerHTML = '';

    var header = document.createElement('div');
    header.className = 'modal-header';
    var trail = currentPath.concat(modalPath).map(function (n) { return n.friendly_name; });
    var titleWrap = document.createElement('div');
    titleWrap.innerHTML =
      '<div class="form-breadcrumb">' + ['Home'].concat(trail).join(' \u203A ') + '</div>' +
      '<h2 class="modal-title">Tell us about your ' + item.friendly_name.toLowerCase() + ' issue</h2>';
    var closeBtn = document.createElement('button');
    closeBtn.className = 'modal-close';
    closeBtn.innerHTML = svgIcon('x');
    closeBtn.addEventListener('click', closeModal);
    header.appendChild(titleWrap);
    header.appendChild(closeBtn);
    modal.appendChild(header);

    var body = document.createElement('div');
    body.className = 'dynamic-form';
    body.innerHTML =
      '<div class="form-stepper">' +
        '<div class="step"><span class="step-circle active">1</span></div>' +
        '<div class="step-line"></div>' +
        '<div class="step"><span class="step-circle">2</span></div>' +
        '<div class="step-line"></div>' +
        '<div class="step"><span class="step-circle">3</span></div>' +
      '</div>' +
      '<div class="form-grid">' +
        '<div class="form-group">' +
          '<label>What type of device / area?</label>' +
          '<select><option value="">Select an option...</option><option>Laptop</option><option>Desktop</option><option>Monitor</option><option>Printer</option><option>Other</option></select>' +
        '</div>' +
        '<div class="form-group">' +
          '<label>What\'s happening?</label>' +
          '<select><option value="">Select an option...</option><option>Not turning on</option><option>Slow performance</option><option>Needs replacement</option><option>Error message</option><option>Other</option></select>' +
        '</div>' +
        '<div class="form-group">' +
          '<label>Attach a screenshot or photo (optional)</label>' +
          '<div class="form-upload"><span style="display:inline-flex;width:24px;height:24px;margin-bottom:4px">' + svgIcon('upload') + '</span><br>Click to upload or drag &amp; drop</div>' +
        '</div>' +
        '<div class="form-group">' +
          '<label>Priority</label>' +
          '<select><option>Low</option><option selected>Medium</option><option>High</option><option>Critical</option></select>' +
        '</div>' +
        '<div class="form-group form-group--full">' +
          '<label>Describe the problem (optional)</label>' +
          '<textarea placeholder="Give us a brief description of what\'s going on..."></textarea>' +
        '</div>' +
      '</div>' +
      '<div class="self-help">' +
        '<button class="self-help-toggle" id="sh-toggle">Self-help tips <span class="chevron" style="width:16px;height:16px;display:inline-flex">' + svgIcon('chevron-down') + '</span></button>' +
        '<div class="self-help-content" id="sh-content"><ul class="self-help-list"><li>Try restarting your device before submitting a ticket.</li><li>Check if the issue persists on a different network.</li><li>Clear your browser cache and cookies.</li></ul></div>' +
      '</div>' +
      '<div class="form-actions" style="margin-top:24px">' +
        '<button class="btn btn-secondary" id="form-cancel">Cancel</button>' +
        '<button class="btn btn-primary" id="form-submit">Submit Request</button>' +
      '</div>';
    modal.appendChild(body);
    modalOverlay.classList.add('active');

    document.getElementById('sh-toggle').addEventListener('click', function () {
      this.classList.toggle('open');
      document.getElementById('sh-content').classList.toggle('open');
    });
    document.getElementById('form-cancel').addEventListener('click', closeModal);
    document.getElementById('form-submit').addEventListener('click', function () {
      alert('This is a placeholder. In production, this form will submit to TeamDynamix.');
      closeModal();
    });
  }

  function closeModal() {
    modalOverlay.classList.remove('active');
    modalPath = [];
  }

  modalOverlay.addEventListener('click', function (e) {
    if (e.target === modalOverlay) closeModal();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });

  /* ===== Search ===== */

  function flattenTree(nodes, trail) {
    var results = [];
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      var path = trail.concat(node.friendly_name);
      results.push({ node: node, path: path });
      if (node.children && node.children.length) {
        results = results.concat(flattenTree(node.children, path));
      }
    }
    return results;
  }

  var searchIndex = flattenTree(NAV_TREE, []);

  function scoreMatch(query, item) {
    var target = (item.node.friendly_name + ' ' + item.node.name).toLowerCase();
    var pathStr = item.path.join(' ').toLowerCase();
    var q = query.toLowerCase().trim();
    if (!q) return -1;

    var words = q.split(/\s+/);
    var score = 0;
    var allFound = true;

    for (var w = 0; w < words.length; w++) {
      var word = words[w];
      var idx = target.indexOf(word);
      if (idx !== -1) {
        score += 10;
        if (idx === 0 || target[idx - 1] === ' ') score += 5;
      } else if (pathStr.indexOf(word) !== -1) {
        score += 3;
      } else {
        allFound = false;
      }
    }

    if (!allFound) {
      var anyPartial = false;
      for (var w2 = 0; w2 < words.length; w2++) {
        if (words[w2].length >= 2 && target.indexOf(words[w2]) !== -1) anyPartial = true;
      }
      if (!anyPartial) return -1;
    }

    if (item.node.target_url && item.node.target_url !== null) score += 2;
    return score;
  }

  function highlightMatch(text, query) {
    if (!query.trim()) return text;
    var words = query.trim().split(/\s+/);
    var result = text;
    for (var i = 0; i < words.length; i++) {
      if (words[i].length < 2) continue;
      var regex = new RegExp('(' + words[i].replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
      result = result.replace(regex, '<mark>$1</mark>');
    }
    return result;
  }

  var searchInput = document.getElementById('search-input');
  var searchDropdown = document.getElementById('search-dropdown');
  var activeResultIdx = -1;

  function runSearch() {
    var query = searchInput.value;
    searchDropdown.innerHTML = '';
    activeResultIdx = -1;

    if (query.trim().length < 2) {
      searchDropdown.classList.remove('open');
      return;
    }

    var scored = [];
    for (var i = 0; i < searchIndex.length; i++) {
      var s = scoreMatch(query, searchIndex[i]);
      if (s > 0) scored.push({ item: searchIndex[i], score: s });
    }
    scored.sort(function (a, b) { return b.score - a.score; });
    var top = scored.slice(0, 8);

    if (top.length === 0) {
      searchDropdown.innerHTML = '<div class="search-no-results">No matching services found</div>';
      searchDropdown.classList.add('open');
      return;
    }

    for (var j = 0; j < top.length; j++) {
      var item = top[j].item;
      var row = document.createElement('div');
      row.className = 'search-result';
      row.setAttribute('data-index', j);
      row.innerHTML =
        '<div class="search-result-icon"><img src="' + item.node.icon + '" alt="" loading="lazy"></div>' +
        '<div class="search-result-info">' +
        '  <div class="search-result-name">' + highlightMatch(item.node.friendly_name, query) + '</div>' +
        '  <div class="search-result-path">' + item.path.join(' \u203A ') + '</div>' +
        '</div>';

      (function (node) {
        row.addEventListener('click', function () {
          searchDropdown.classList.remove('open');
          searchInput.value = '';
          navigateToNode(node);
        });
      })(item.node);

      searchDropdown.appendChild(row);
    }
    searchDropdown.classList.add('open');
  }

  function navigateToNode(node) {
    var ancestors = findAncestors(NAV_TREE, node.id, []);
    if (!ancestors || ancestors.length === 0) {
      onCardSelect(node);
      return;
    }
    var dept = ancestors[0];
    currentPath = [dept];
    renderDepartment(dept);

    if (node.level >= 2 && node.children && node.children.length) {
      modalPath = [node];
      openModal(node);
    } else if (node.target_url === 'sample-form.com') {
      modalPath = ancestors.slice(1).concat(node);
      openFormModal(node);
    } else if (node.target_url && node.target_url.indexOf('lcec.net') !== -1) {
      window.open('https://' + node.target_url, '_blank');
    } else if (node.children && node.children.length) {
      modalPath = [node];
      openModal(node);
    }
  }

  function findAncestors(nodes, targetId, trail) {
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].id === targetId) return trail;
      if (nodes[i].children && nodes[i].children.length) {
        var result = findAncestors(nodes[i].children, targetId, trail.concat(nodes[i]));
        if (result) return result;
      }
    }
    return null;
  }

  searchInput.addEventListener('input', runSearch);

  searchInput.addEventListener('keydown', function (e) {
    var items = searchDropdown.querySelectorAll('.search-result');
    if (!items.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeResultIdx = Math.min(activeResultIdx + 1, items.length - 1);
      updateActiveResult(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeResultIdx = Math.max(activeResultIdx - 1, 0);
      updateActiveResult(items);
    } else if (e.key === 'Enter' && activeResultIdx >= 0) {
      e.preventDefault();
      items[activeResultIdx].click();
    } else if (e.key === 'Escape') {
      searchDropdown.classList.remove('open');
      searchInput.blur();
    }
  });

  function updateActiveResult(items) {
    for (var i = 0; i < items.length; i++) {
      items[i].classList.toggle('active', i === activeResultIdx);
    }
    if (items[activeResultIdx]) items[activeResultIdx].scrollIntoView({ block: 'nearest' });
  }

  document.addEventListener('click', function (e) {
    if (!e.target.closest('.nav-search')) searchDropdown.classList.remove('open');
  });

  searchInput.addEventListener('focus', function () {
    if (searchInput.value.trim().length >= 2) runSearch();
  });

  /* ===== Init ===== */
  renderHome();

})();
