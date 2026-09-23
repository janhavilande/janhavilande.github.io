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

/* ===================================================================
   Bookshelf: a little dust puffs off a book when you touch it
   =================================================================== */
(function () {
    try {
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }
        var books = document.querySelectorAll('.book');
        if (!books.length) return;

        function spawnDust(book) {
            var flash = document.createElement('span');
            flash.className = 'dust-puff-flash';
            flash.setAttribute('aria-hidden', 'true');
            book.appendChild(flash);
            setTimeout(function () {
                if (flash.parentNode) flash.parentNode.removeChild(flash);
            }, 500);

            var count = 8;
            for (var i = 0; i < count; i++) {
                var mote = document.createElement('span');
                mote.className = 'dust-mote';
                mote.setAttribute('aria-hidden', 'true');
                var dx = (Math.random() * 64 - 32).toFixed(1) + 'px';
                var dy = (-(30 + Math.random() * 26)).toFixed(1) + 'px';
                mote.style.setProperty('--dx', dx);
                mote.style.setProperty('--dy', dy);
                mote.style.left = (38 + Math.random() * 24) + '%';
                mote.style.animationDelay = Math.round(Math.random() * 90) + 'ms';
                book.appendChild(mote);
                (function (m) {
                    setTimeout(function () {
                        if (m.parentNode) m.parentNode.removeChild(m);
                    }, 1200);
                })(mote);
            }
        }

        books.forEach(function (book) {
            var lastTrigger = 0;
            function trigger() {
                var now = Date.now();
                if (now - lastTrigger < 500) return;
                lastTrigger = now;
                spawnDust(book);
            }
            book.addEventListener('mouseenter', trigger);
            book.addEventListener('touchstart', trigger, { passive: true });
            book.addEventListener('focus', trigger);
        });
    } catch (e) {
        // If anything goes wrong, the bookshelf just stays a plain bookshelf.
    }
})();

/* ===================================================================
   Journey icons & research note numbers: a small gold sparkle on touch
   =================================================================== */
(function () {
    try {
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }
        var targets = document.querySelectorAll('.timeline-icon, .entry-num');
        if (!targets.length) return;

        function spawnSparkle(el) {
            var count = 5;
            for (var i = 0; i < count; i++) {
                var s = document.createElement('span');
                s.className = 'sparkle-mote';
                s.setAttribute('aria-hidden', 'true');
                var angle = Math.random() * Math.PI * 2;
                var dist = 14 + Math.random() * 14;
                var dx = (Math.cos(angle) * dist).toFixed(1) + 'px';
                var dy = (Math.sin(angle) * dist).toFixed(1) + 'px';
                s.style.setProperty('--dx', dx);
                s.style.setProperty('--dy', dy);
                s.style.animationDelay = Math.round(Math.random() * 70) + 'ms';
                el.appendChild(s);
                (function (m) {
                    setTimeout(function () {
                        if (m.parentNode) m.parentNode.removeChild(m);
                    }, 850);
                })(s);
            }
        }

        targets.forEach(function (el) {
            var lastTrigger = 0;
            function trigger() {
                var now = Date.now();
                if (now - lastTrigger < 500) return;
                lastTrigger = now;
                spawnSparkle(el);
            }
            el.addEventListener('mouseenter', trigger);
            el.addEventListener('touchstart', trigger, { passive: true });
        });
    } catch (e) {
        // If anything goes wrong, these just stay quiet, undecorated icons.
    }
})();

/* ===================================================================
   Writing page: a small ivy leaf drifts down when you touch the plate
   =================================================================== */
(function () {
    try {
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }
        var plate = document.querySelector('.book-plate');
        if (!plate) return;

        var leafSvg = '<svg viewBox="0 0 16 16" aria-hidden="true">' +
            '<path d="M8 1 C3.5 1 1.2 5 1.2 9 C1.2 13 4.3 15 8 15 C11.7 15 14.8 13 14.8 9 C14.8 5 12.5 1 8 1 Z" fill="#9cb589" />' +
            '<path d="M8 2 L8 14" stroke="#5f7a52" stroke-width="0.7" stroke-linecap="round" />' +
            '</svg>';

        function spawnLeaf() {
            var count = 2;
            for (var i = 0; i < count; i++) {
                var leaf = document.createElement('span');
                leaf.className = 'ivy-leaf';
                leaf.setAttribute('aria-hidden', 'true');
                leaf.innerHTML = leafSvg;
                var dx = (Math.random() * 70 - 35).toFixed(1) + 'px';
                var dy = (140 + Math.random() * 60).toFixed(1) + 'px';
                var rot = (120 + Math.random() * 160).toFixed(0) + 'deg';
                leaf.style.setProperty('--dx', dx);
                leaf.style.setProperty('--dy', dy);
                leaf.style.setProperty('--rot', rot);
                leaf.style.left = (30 + Math.random() * 40) + '%';
                leaf.style.animationDelay = (i * 180) + 'ms';
                plate.appendChild(leaf);
                (function (m) {
                    setTimeout(function () {
                        if (m.parentNode) m.parentNode.removeChild(m);
                    }, 2200);
                })(leaf);
            }
        }

        var lastTrigger = 0;
        function trigger() {
            var now = Date.now();
            if (now - lastTrigger < 900) return;
            lastTrigger = now;
            spawnLeaf();
        }
        plate.addEventListener('mouseenter', trigger);
        plate.addEventListener('touchstart', trigger, { passive: true });
    } catch (e) {
        // If anything goes wrong, the book plate just stays put.
    }
})();
