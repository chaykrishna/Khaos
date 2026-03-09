(function () {
    'use strict';

    var STORAGE_KEY = 'khaos_click_events';

    function loadEvents() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        } catch (e) {
            return [];
        }
    }

    function saveEvents(events) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
        } catch (e) {}
    }

    function getElementDescription(el) {
        var tag = el.tagName.toLowerCase();
        var text = '';

        if (tag === 'img') {
            text = el.alt ? '"' + el.alt + '"' : '(image)';
        } else if (tag === 'input') {
            text = '"' + (el.placeholder || el.type || 'input') + '"';
        } else if (el.textContent) {
            text = '"' + el.textContent.trim().substring(0, 40) + '"';
        }

        var selector = tag;
        if (el.id) {
            selector += '#' + el.id;
        } else if (el.className && typeof el.className === 'string') {
            selector += '.' + el.className.trim().split(/\s+/)[0];
        }

        return text ? selector + ' ' + text : selector;
    }

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    // ── Dashboard elements ──────────────────────────────────────────────────────
    var panel, listEl, countBadge;

    function refreshDashboard() {
        var events = loadEvents();

        if (countBadge) {
            countBadge.textContent = events.length;
        }

        if (!listEl) return;

        if (events.length === 0) {
            listEl.innerHTML =
                '<p style="color:#888;text-align:center;padding:16px 8px">No clicks recorded yet.</p>';
            return;
        }

        // Aggregate by element description
        var counts = {};
        events.forEach(function (ev) {
            counts[ev.element] = (counts[ev.element] || 0) + 1;
        });

        var sorted = Object.keys(counts).sort(function (a, b) {
            return counts[b] - counts[a];
        });

        var html =
            '<table style="width:100%;border-collapse:collapse;font-size:11px">' +
            '<tr style="color:#aaa">' +
            '<th style="text-align:left;padding:4px 6px">Element</th>' +
            '<th style="text-align:right;padding:4px 6px">Clicks</th>' +
            '</tr>';

        sorted.forEach(function (key) {
            html +=
                '<tr style="border-top:1px solid #2a2a2a">' +
                '<td style="padding:4px 6px;word-break:break-all">' +
                escapeHtml(key) +
                '</td>' +
                '<td style="padding:4px 6px;text-align:right;color:#4caf50">' +
                '<strong>' + counts[key] + '</strong>' +
                '</td>' +
                '</tr>';
        });

        html += '</table>';
        html +=
            '<p style="color:#888;text-align:center;padding:8px;border-top:1px solid #2a2a2a">' +
            'Total: <strong style="color:#fff">' + events.length + '</strong> click(s)' +
            '</p>';

        listEl.innerHTML = html;
    }

    function buildDashboard() {
        // Toggle button
        var toggleBtn = document.createElement('button');
        toggleBtn.id = 'ct-toggle';
        toggleBtn.title = 'Click Event Tracker';
        toggleBtn.innerHTML =
            '\uD83D\uDCCA <span id="ct-count">0</span>';
        toggleBtn.style.cssText = [
            'position:fixed',
            'bottom:20px',
            'right:20px',
            'z-index:2147483647',
            'background:#1a1a1a',
            'color:#fff',
            'border:2px solid #4caf50',
            'border-radius:24px',
            'padding:8px 14px',
            'font-size:14px',
            'cursor:pointer',
            'box-shadow:0 2px 10px rgba(0,0,0,.5)',
            'font-family:monospace',
            'line-height:1.4'
        ].join(';');

        // Panel
        panel = document.createElement('div');
        panel.id = 'ct-panel';
        panel.style.cssText = [
            'display:none',
            'position:fixed',
            'bottom:66px',
            'right:20px',
            'z-index:2147483646',
            'background:#1a1a1a',
            'color:#eee',
            'border-radius:8px',
            'width:340px',
            'max-height:420px',
            'overflow-y:auto',
            'box-shadow:0 4px 20px rgba(0,0,0,.6)',
            'font-family:monospace'
        ].join(';');

        // Panel header
        var header = document.createElement('div');
        header.style.cssText =
            'padding:10px 14px;border-bottom:1px solid #333;' +
            'display:flex;justify-content:space-between;align-items:center;' +
            'position:sticky;top:0;background:#1a1a1a';
        header.innerHTML = '<strong style="font-size:13px">\uD83D\uDCCA Click Event Tracker</strong>';

        var clearBtn = document.createElement('button');
        clearBtn.textContent = 'Clear';
        clearBtn.title = 'Clear all recorded clicks';
        clearBtn.style.cssText =
            'background:#c0392b;color:#fff;border:none;border-radius:4px;' +
            'padding:3px 10px;cursor:pointer;font-size:11px;font-family:monospace';
        clearBtn.onclick = function (e) {
            e.stopPropagation();
            localStorage.removeItem(STORAGE_KEY);
            refreshDashboard();
        };
        header.appendChild(clearBtn);
        panel.appendChild(header);

        // List area
        listEl = document.createElement('div');
        listEl.style.cssText = 'padding:8px';
        panel.appendChild(listEl);

        // Toggle logic
        toggleBtn.onclick = function () {
            if (panel.style.display === 'none') {
                panel.style.display = 'block';
                refreshDashboard();
            } else {
                panel.style.display = 'none';
            }
        };

        document.body.appendChild(panel);
        document.body.appendChild(toggleBtn);

        countBadge = document.getElementById('ct-count');
        refreshDashboard();
    }

    // ── Click tracking ──────────────────────────────────────────────────────────
    function trackClick(event) {
        // Ignore clicks inside the tracker UI itself
        var target = event.target;
        if (target.closest) {
            if (target.closest('#ct-panel') || target.closest('#ct-toggle')) return;
        } else {
            // Fallback for older browsers
            var node = target;
            while (node) {
                if (node.id === 'ct-panel' || node.id === 'ct-toggle') return;
                node = node.parentNode;
            }
        }

        var events = loadEvents();
        events.push({
            time: new Date().toISOString(), // UTC timestamp
            page: (function () {
                var p = window.location.pathname.split('/').pop();
                return p || window.location.pathname || 'index.html';
            }()),
            element: getElementDescription(target),
            tag: target.tagName.toLowerCase(),
            x: Math.round(event.clientX),
            y: Math.round(event.clientY)
        });
        saveEvents(events);
        refreshDashboard();
    }

    document.addEventListener('click', trackClick, true);

    // Build dashboard after DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', buildDashboard);
    } else {
        buildDashboard();
    }
}());
