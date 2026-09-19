// aHR0cHM6Ly9naXRodWIuY29tL2x1b3N0MjYvYWNhZGVtaWMtaG9tZXBhZ2U=
$(function () {
    lazyLoadOptions = {
        scrollDirection: 'vertical',
        effect: 'fadeIn',
        effectTime: 300,
        placeholder: "",
        onError: function(element) {
            console.log('[lazyload] Error loading ' + element.data('src'));
        },
        afterLoad: function(element) {
            if (element.is('img')) {
                element.css('background-image', 'none');
                element.css('min-height', '0');
            } else if (element.is('div')) {
                element.css('background-size', 'cover');
                element.css('background-position', 'center');
            }
        }
    }

    $('img.lazy, div.lazy:not(.always-load)').Lazy({visibleOnly: true, ...lazyLoadOptions});
    $('div.lazy.always-load').Lazy({visibleOnly: false, ...lazyLoadOptions});

    $('[data-toggle="tooltip"]').tooltip()

    // Research entries: expand/collapse the inline "more on this" detail
    $('.entry-more-toggle').on('click', function () {
        var $btn = $(this);
        var $detail = $btn.next('.entry-detail');
        var open = $detail.hasClass('is-open');
        $detail.toggleClass('is-open', !open);
        $btn.attr('aria-expanded', String(!open));
        $btn.html(open ? 'More on this &rarr;' : 'Show less &uarr;');
    });
})

/* ===================================================================
   Scroll storytelling — a gentle fade/rise as sections enter view.

   Safety rule: every .reveal element is fully visible by default in
   CSS. This script only ever ADDS a temporary hidden state, and
   every element it hides gets both an IntersectionObserver watcher
   AND a timeout fallback that forces it visible regardless. So a
   missed intersection, a zero-height element, or an unsupported
   browser can never leave content permanently invisible.
   =================================================================== */
(function () {
    try {
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }
        var els = document.querySelectorAll('.reveal');
        if (!els.length) return;

        if (!('IntersectionObserver' in window)) {
            return; // elements stay visible — no observer, no armed class
        }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -8% 0px' });

        els.forEach(function (el) {
            el.classList.add('reveal-armed');
            observer.observe(el);
            // Belt-and-suspenders: never let an element stay hidden for long.
            setTimeout(function () {
                el.classList.add('is-visible');
            }, 2200);
        });
    } catch (e) {
        // If anything goes wrong, content simply stays visible.
    }
})();

/* ===================================================================
   "Follow My Curiosity" constellation
   =================================================================== */
(function () {
    var root = document.querySelector('[data-constellation]');
    if (!root) return;

    var NODES = {
        physics: { label: 'Physics', blurb: 'Where I learned to ask how something works underneath.' },
        ai: { label: 'AI', blurb: 'Machine intelligence — tools for going looking for the answer in data.' },
        science: { label: 'Science', blurb: 'Questions big enough to need evidence, not just intuition.' },
        research: { label: 'Research', blurb: 'The slower work of checking whether a claim actually holds up.' },
        cognition: { label: 'Cognition', blurb: 'How millions of scattered opinions add up to something you can study.' },
        poetry: { label: 'Poetry', blurb: "Where I put whatever the rest couldn't quite hold." }
    };

    var EDGES = [
        { id: 'physics-ai', a: 'physics', b: 'ai',
          sentence: 'Physics taught me to ask how something works underneath; machine learning gave me tools to go looking for the answer in data.' },
        { id: 'physics-science', a: 'physics', b: 'science',
          sentence: 'Engineering Physics at IIT Guwahati — where the questions started.',
          url: '/about#journey', linkLabel: 'The journey' },
        { id: 'ai-research', a: 'ai', b: 'research',
          sentence: 'Custom loss functions that push a credit-risk model to treat an underserved segment fairly — without quietly making things worse for everyone else.',
          url: '/research', linkLabel: 'Read the research' },
        { id: 'ai-cognition', a: 'ai', b: 'cognition',
          sentence: "Topic modelling and sentiment analysis across India's COVID waves — reading a crisis through how people actually talked about it online.",
          url: '/research', linkLabel: 'Read the research' },
        { id: 'science-poetry', a: 'science', b: 'poetry',
          sentence: 'Different ways of making sense of the world.',
          url: '/writing', linkLabel: 'Enter the archive' },
        { id: 'cognition-poetry', a: 'cognition', b: 'poetry',
          sentence: 'Both are just close attention, pointed in different directions.',
          url: '/about', linkLabel: 'More about me' }
    ];

    var edgesByNode = {};
    EDGES.forEach(function (edge) {
        (edgesByNode[edge.a] = edgesByNode[edge.a] || []).push(edge);
        (edgesByNode[edge.b] = edgesByNode[edge.b] || []).push(edge);
    });

    var nodeButtons = root.querySelectorAll('.constellation-node');
    var eyebrow = document.querySelector('.constellation-caption-eyebrow');
    var captionText = document.querySelector('.constellation-caption-text');
    var idleEyebrow = eyebrow ? eyebrow.textContent : '';
    var idleText = captionText ? captionText.textContent : '';

    function clearActive() {
        root.classList.remove('has-focus');
        root.querySelectorAll('.is-active').forEach(function (el) {
            el.classList.remove('is-active');
        });
    }

    function showNode(nodeId) {
        clearActive();
        root.classList.add('has-focus');

        var btn = root.querySelector('[data-node="' + nodeId + '"]');
        if (btn) btn.classList.add('is-active');

        var connections = edgesByNode[nodeId] || [];
        connections.forEach(function (edge) {
            var line = document.getElementById('edge-' + edge.id);
            if (line) line.classList.add('is-active');
        });

        if (eyebrow) eyebrow.textContent = (NODES[nodeId] && NODES[nodeId].label) || nodeId;

        if (captionText) {
            captionText.innerHTML = '';
            var blurb = document.createElement('p');
            blurb.className = 'constellation-caption-text';
            blurb.style.margin = '0 0 0.6rem';
            blurb.textContent = (NODES[nodeId] && NODES[nodeId].blurb) || '';
            captionText.appendChild(blurb);

            connections.forEach(function (edge) {
                var other = edge.a === nodeId ? edge.b : edge.a;
                var line = document.createElement('p');
                line.className = 'constellation-caption-text';
                line.style.margin = '0 0 0.35rem';
                line.style.fontSize = '0.92rem';
                var otherLabel = (NODES[other] && NODES[other].label) || other;
                line.textContent = otherLabel + ' — ' + edge.sentence + ' ';
                if (edge.url) {
                    var link = document.createElement('a');
                    link.className = 'constellation-caption-link';
                    link.href = edge.url;
                    link.textContent = (edge.linkLabel || 'Read more') + ' →';
                    line.appendChild(link);
                }
                captionText.appendChild(line);
            });
        }
    }

    function reset() {
        clearActive();
        if (eyebrow) eyebrow.textContent = idleEyebrow;
        if (captionText) captionText.textContent = idleText;
    }

    nodeButtons.forEach(function (btn) {
        var id = btn.getAttribute('data-node');
        btn.addEventListener('mouseenter', function () { showNode(id); });
        btn.addEventListener('focus', function () { showNode(id); });
        btn.addEventListener('click', function () { showNode(id); });
    });

    root.addEventListener('mouseleave', reset);
    root.addEventListener('focusout', function (e) {
        if (!root.contains(e.relatedTarget)) reset();
    });
})();

/* ===================================================================
   Research notes: expand into a focused modal
   =================================================================== */
(function () {
    var modal = document.getElementById('note-modal');
    if (!modal) return;

    var titleEl = document.getElementById('note-modal-title');
    var taglineEl = document.getElementById('note-modal-tagline');
    var summaryEl = document.getElementById('note-modal-summary');
    var detailEl = document.getElementById('note-modal-detail');
    var tagsEl = document.getElementById('note-modal-tags');
    var lastFocused = null;

    function openModal(btn) {
        lastFocused = btn;
        if (titleEl) titleEl.textContent = btn.getAttribute('data-note-title') || '';
        if (taglineEl) taglineEl.textContent = btn.getAttribute('data-note-tagline') || '';
        if (summaryEl) summaryEl.textContent = btn.getAttribute('data-note-summary') || '';
        if (detailEl) detailEl.textContent = btn.getAttribute('data-note-detail') || '';
        if (tagsEl) {
            tagsEl.innerHTML = '';
            var tags = (btn.getAttribute('data-note-tags') || '').split(',').map(function (t) { return t.trim(); }).filter(Boolean);
            tags.forEach(function (tag) {
                var span = document.createElement('span');
                span.textContent = tag;
                tagsEl.appendChild(span);
            });
        }
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        var closeBtn = modal.querySelector('.note-modal-close');
        if (closeBtn) closeBtn.focus();
    }

    function closeModal() {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (lastFocused) lastFocused.focus();
    }

    document.querySelectorAll('.entry-expand').forEach(function (btn) {
        btn.addEventListener('click', function () { openModal(btn); });
    });

    modal.querySelectorAll('[data-modal-close]').forEach(function (el) {
        el.addEventListener('click', closeModal);
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
    });
})();

/* ===================================================================
   Journey timeline: click a year to expand its note
   =================================================================== */
(function () {
    document.querySelectorAll('.timeline-toggle').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var entry = btn.closest('.timeline-entry');
            var open = entry.classList.contains('is-open');
            entry.classList.toggle('is-open', !open);
            btn.setAttribute('aria-expanded', String(!open));
        });
    });
})();

/* ===================================================================
   Small, discoverable details
   =================================================================== */
(function () {
    document.querySelectorAll('.easter-egg').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var note = document.getElementById(btn.getAttribute('aria-controls'));
            if (!note) return;
            var open = note.classList.contains('is-open');
            note.classList.toggle('is-open', !open);
            btn.setAttribute('aria-expanded', String(!open));
        });
    });
})();
