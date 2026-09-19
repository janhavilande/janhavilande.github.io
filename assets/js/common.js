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
                // remove background-image style
                element.css('background-image', 'none');
                element.css('min-height', '0');
            } else if (element.is('div')) {
                // set the style to background-size: cover;
                element.css('background-size', 'cover');
                element.css('background-position', 'center');
            }
        }
    }

    $('img.lazy, div.lazy:not(.always-load)').Lazy({visibleOnly: true, ...lazyLoadOptions});
    $('div.lazy.always-load').Lazy({visibleOnly: false, ...lazyLoadOptions});

    $('[data-toggle="tooltip"]').tooltip()

    // Research entries: expand/collapse the "more on this" detail
    $('.entry-more-toggle').on('click', function () {
        var $btn = $(this);
        var $detail = $btn.next('.entry-detail');
        var open = $detail.hasClass('is-open');
        $detail.toggleClass('is-open', !open);
        $btn.attr('aria-expanded', String(!open));
        $btn.html(open ? 'More on this &rarr;' : 'Show less &uarr;');
    });

    // Reveal-on-scroll: fade/slide elements in as they enter the viewport
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var $reveals = $('.reveal');
    if ($reveals.length) {
        if (reduceMotion || !('IntersectionObserver' in window)) {
            $reveals.addClass('is-visible');
        } else {
            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, {threshold: 0.12, rootMargin: '0px 0px -40px 0px'});
            $reveals.each(function () { observer.observe(this); });
        }
    }
})

// A very quiet constellation: a handful of slow-drifting points behind the hero text.
(function () {
    var canvas = document.getElementById('constellation');
    if (!canvas || !canvas.getContext) { return; }
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var width, height, points;
    var POINT_COUNT = 26;
    var LINK_DIST = 120;

    function resize() {
        width = canvas.clientWidth;
        height = canvas.clientHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function makePoints() {
        points = [];
        for (var i = 0; i < POINT_COUNT; i++) {
            points.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.12,
                vy: (Math.random() - 0.5) * 0.12,
                r: Math.random() * 1.1 + 0.6
            });
        }
    }

    function draw() {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = 'rgba(176, 141, 87, 0.75)';
        ctx.strokeStyle = 'rgba(176, 141, 87, 0.16)';
        for (var i = 0; i < points.length; i++) {
            var p = points[i];
            for (var j = i + 1; j < points.length; j++) {
                var q = points[j];
                var dx = p.x - q.x, dy = p.y - q.y;
                var dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < LINK_DIST) {
                    ctx.globalAlpha = 1 - dist / LINK_DIST;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(q.x, q.y);
                    ctx.stroke();
                }
            }
        }
        ctx.globalAlpha = 1;
        for (var k = 0; k < points.length; k++) {
            var pt = points[k];
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function step() {
        for (var i = 0; i < points.length; i++) {
            var p = points[i];
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > width) { p.vx *= -1; }
            if (p.y < 0 || p.y > height) { p.vy *= -1; }
        }
        draw();
        if (!reduceMotion) { requestAnimationFrame(step); }
    }

    resize();
    makePoints();
    draw();
    if (!reduceMotion) { requestAnimationFrame(step); }

    var resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            resize();
            makePoints();
            draw();
        }, 200);
    });
})
