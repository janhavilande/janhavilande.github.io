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
            var count = 5;
            for (var i = 0; i < count; i++) {
                var mote = document.createElement('span');
                mote.className = 'dust-mote';
                mote.setAttribute('aria-hidden', 'true');
                var dx = (Math.random() * 46 - 23).toFixed(1) + 'px';
                var dy = (-(16 + Math.random() * 20)).toFixed(1) + 'px';
                mote.style.setProperty('--dx', dx);
                mote.style.setProperty('--dy', dy);
                mote.style.left = (42 + Math.random() * 16) + '%';
                mote.style.animationDelay = Math.round(Math.random() * 90) + 'ms';
                book.appendChild(mote);
                (function (m) {
                    setTimeout(function () {
                        if (m.parentNode) m.parentNode.removeChild(m);
                    }, 900);
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
