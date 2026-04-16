/* ============================================
   RECRUITING PAGE – Embedded Quiz Logic
   ============================================ */
(function () {
  'use strict';

  let currentStep = 0;
  const answers = {};

  // DOM refs
  const stepsContainer = document.getElementById('applySteps');
  if (!stepsContainer) return;

  const steps = stepsContainer.querySelectorAll('.rec-apply__step');
  const TOTAL_STEPS = steps.length;
  const progressBar = document.getElementById('applyProgress');

  // --- Navigation ---
  function goToStep(n) {
    if (n < 0 || n >= TOTAL_STEPS) return;

    steps[currentStep].classList.remove('active');
    currentStep = n;
    steps[currentStep].classList.add('active');

    // Update progress (each step = 20%)
    var pct = Math.round(((n + 1) / TOTAL_STEPS) * 100);
    if (progressBar) progressBar.style.width = pct + '%';

    // Scroll quiz into view
    var funnel = document.querySelector('.rec-apply__funnel');
    if (funnel) {
      funnel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  // --- Option handling ---
  function initOptions() {
    stepsContainer.querySelectorAll('.rec-apply__options').forEach(function (group) {
      var mode = group.dataset.mode;
      var name = group.dataset.name;

      group.querySelectorAll('.rec-apply__option').forEach(function (btn) {
        btn.addEventListener('click', function () {
          if (mode === 'single') {
            group.querySelectorAll('.rec-apply__option').forEach(function (b) {
              b.classList.remove('rec-apply__option--selected');
            });
            btn.classList.add('rec-apply__option--selected');
            answers[name] = btn.dataset.value;

            // Auto-advance after 350ms
            setTimeout(function () {
              goToStep(currentStep + 1);
            }, 350);

          } else {
            btn.classList.toggle('rec-apply__option--selected');
            var selected = [];
            group.querySelectorAll('.rec-apply__option--selected').forEach(function (b) {
              selected.push(b.dataset.value);
            });
            answers[name] = selected;
          }
        });
      });
    });
  }

  // --- Next buttons (multi-select) ---
  function initNextButtons() {
    stepsContainer.querySelectorAll('[data-next]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        goToStep(currentStep + 1);
      });
    });
  }

  // --- Form ---
  function initForm() {
    var form = document.getElementById('applyForm');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

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

      var formData = {
        name: form.querySelector('#applyName').value,
        email: form.querySelector('#applyEmail').value,
        telefon: form.querySelector('#applyTelefon').value,
        position: form.dataset.position || '',
        erfahrung: answers.erfahrung || '',
        wechselgrund: Array.isArray(answers.wechselgrund) ? answers.wechselgrund.join(', ') : (answers.wechselgrund || ''),
        erreichbarkeit: answers.erreichbarkeit || '',
        fuehrerschein: answers.fuehrerschein || '',
        maschinenfuehrer: answers.maschinenfuehrer || '',
        starttermin: answers.starttermin || ''
      };

      // Disable submit button to prevent double-sends
      var submitBtn = form.querySelector('.rec-apply__submit');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Wird gesendet...';
      }

      // Send to GoHighLevel webhook (read from form data attribute)
      var webhookUrl = form.dataset.webhook || '';

      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      .then(function () {
        goToStep(TOTAL_STEPS - 1);
      })
      .catch(function () {
        // Even if webhook fails, show thank you (data might still arrive)
        goToStep(TOTAL_STEPS - 1);
      });
    });

    form.querySelectorAll('input').forEach(function (input) {
      input.addEventListener('input', function () {
        input.classList.remove('invalid');
      });
    });
  }

  // --- Share ---
  function initShare() {
    var shareBtn = document.getElementById('shareBtn');
    if (!shareBtn) return;

    shareBtn.addEventListener('click', function () {
      var url = window.location.href.split('#')[0];
      var shareData = {
        title: 'Karriere bei Dienstleistungen Huber',
        text: 'Schau dir diese Stelle bei Dienstleistungen Huber an!',
        url: url
      };

      if (navigator.share) {
        navigator.share(shareData).catch(function () {});
      } else {
        navigator.clipboard.writeText(url).then(function () {
          showToast('Link kopiert!');
        }).catch(function () {
          showToast('Link kopiert!');
        });
      }
    });
  }

  function showToast(msg) {
    var toast = document.getElementById('recToast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(function () {
      toast.classList.remove('show');
    }, 2500);
  }

  // --- Smooth scroll for anchor links ---
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var target = document.querySelector(link.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  // --- Header scroll effect ---
  function initHeaderScroll() {
    var header = document.getElementById('recHeader');
    if (!header) return;

    window.addEventListener('scroll', function () {
      if (window.scrollY > 50) {
        header.style.borderBottomColor = 'rgba(255,255,255,0.1)';
      } else {
        header.style.borderBottomColor = 'rgba(255,255,255,0.06)';
      }
    });
  }

  // --- Init ---
  function init() {
    initOptions();
    initNextButtons();
    initForm();
    initShare();
    initSmoothScroll();
    initHeaderScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
