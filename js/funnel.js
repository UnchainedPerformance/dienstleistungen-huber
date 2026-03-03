/* ============================================
   KARRIERE-FUNNEL – State Machine & Navigation
   ============================================ */
(function () {
  'use strict';

  const TOTAL_STEPS = 9; // 0-8
  let currentStep = 0;
  const answers = {};

  // DOM refs
  const steps = document.querySelectorAll('.funnel-step');
  const progressBar = document.querySelector('.funnel-header__progress-bar');

  // --- Navigation ---
  function goToStep(n) {
    if (n < 0 || n >= TOTAL_STEPS) return;

    const current = steps[currentStep];
    const next = steps[n];

    // Exit current
    current.classList.remove('active');

    // Enter next
    currentStep = n;
    next.classList.add('active');

    // Scroll to top of step
    next.scrollTop = 0;

    // Progress bar (steps 0-7 map to 0-100%, step 8 = 100%)
    const pct = n === 0 ? 0 : Math.min(100, Math.round((n / (TOTAL_STEPS - 1)) * 100));
    progressBar.style.width = pct + '%';

    // Browser history
    history.pushState({ step: n }, '', '');
  }

  // --- Option handling ---
  function initOptions() {
    document.querySelectorAll('.funnel__options').forEach(function (group) {
      const mode = group.dataset.mode; // "single" or "multi"
      const name = group.dataset.name; // answer key

      group.querySelectorAll('.funnel__option').forEach(function (btn) {
        btn.addEventListener('click', function () {
          if (mode === 'single') {
            // Deselect all, select this one
            group.querySelectorAll('.funnel__option').forEach(function (b) {
              b.classList.remove('funnel__option--selected');
            });
            btn.classList.add('funnel__option--selected');
            answers[name] = btn.dataset.value;

            // Auto-advance after 350ms
            setTimeout(function () {
              goToStep(currentStep + 1);
            }, 350);

          } else {
            // Toggle
            btn.classList.toggle('funnel__option--selected');

            // Collect selected
            var selected = [];
            group.querySelectorAll('.funnel__option--selected').forEach(function (b) {
              selected.push(b.dataset.value);
            });
            answers[name] = selected;
          }
        });
      });
    });
  }

  // --- Button navigation ---
  function initButtons() {
    document.querySelectorAll('[data-next]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        goToStep(currentStep + 1);
      });
    });

    document.querySelectorAll('[data-prev]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        goToStep(currentStep - 1);
      });
    });
  }

  // --- Form ---
  function initForm() {
    var form = document.getElementById('funnelForm');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Basic validation
      var valid = true;
      form.querySelectorAll('input[required]').forEach(function (input) {
        if (!input.value.trim()) {
          input.classList.add('invalid');
          valid = false;
        } else {
          input.classList.remove('invalid');
        }
      });

      if (!valid) return;

      // Collect form data + qualification answers
      var formData = {
        name: form.querySelector('#funnelName').value,
        email: form.querySelector('#funnelEmail').value,
        telefon: form.querySelector('#funnelTelefon').value,
        position: form.dataset.position || '',
        erfahrung: answers.erfahrung || '',
        wechselgrund: Array.isArray(answers.wechselgrund) ? answers.wechselgrund.join(', ') : (answers.wechselgrund || ''),
        lieblingsvorteile: Array.isArray(answers.lieblingsvorteile) ? answers.lieblingsvorteile.join(', ') : (answers.lieblingsvorteile || ''),
        erreichbarkeit: answers.erreichbarkeit || ''
      };

      // Log to console (backend integration comes later)
      console.log('Bewerbung:', formData);

      // Go to thank you step
      goToStep(TOTAL_STEPS - 1);
    });

    // Remove invalid state on input
    form.querySelectorAll('input').forEach(function (input) {
      input.addEventListener('input', function () {
        input.classList.remove('invalid');
      });
    });
  }

  // --- Share ---
  function initShare() {
    var shareBtn = document.querySelector('.funnel__share-btn');
    if (!shareBtn) return;

    shareBtn.addEventListener('click', function () {
      var url = window.location.href.split('?')[0]; // Clean URL
      var shareData = {
        title: 'Karriere bei Dienstleistungen Huber',
        text: 'Schau dir diese Stelle bei Dienstleistungen Huber an!',
        url: url
      };

      if (navigator.share) {
        navigator.share(shareData).catch(function () {});
      } else {
        // Clipboard fallback
        navigator.clipboard.writeText(url).then(function () {
          showToast('Link kopiert!');
        }).catch(function () {
          // Final fallback
          var input = document.createElement('input');
          input.value = url;
          document.body.appendChild(input);
          input.select();
          document.execCommand('copy');
          document.body.removeChild(input);
          showToast('Link kopiert!');
        });
      }
    });
  }

  function showToast(msg) {
    var existing = document.querySelector('.funnel-toast');
    if (existing) existing.remove();

    var toast = document.createElement('div');
    toast.className = 'funnel-toast';
    toast.textContent = msg;
    document.body.appendChild(toast);

    requestAnimationFrame(function () {
      toast.classList.add('show');
    });

    setTimeout(function () {
      toast.classList.remove('show');
      setTimeout(function () { toast.remove(); }, 400);
    }, 2500);
  }

  // --- Browser back ---
  window.addEventListener('popstate', function () {
    if (currentStep > 0) {
      goToStep(currentStep - 1);
    }
  });

  // --- Init ---
  function init() {
    // Show first step
    if (steps.length > 0) {
      steps[0].classList.add('active');
    }

    initOptions();
    initButtons();
    initForm();
    initShare();

    // Initial history state
    history.replaceState({ step: 0 }, '', '');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
