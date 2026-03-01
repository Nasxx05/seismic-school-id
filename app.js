/* ===== SEISMIC SCHOOL ID — Application Logic ===== */

(function () {
  'use strict';

  // --- Supabase Client ---
  const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // --- Database Utilities ---
  async function getUsers() {
    try {
      const { data, error } = await db
        .from('users')
        .select('*')
        .order('magnitude', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Failed to fetch users:', err);
      return [];
    }
  }

  async function addUser(user) {
    const { data, error } = await db
      .from('users')
      .insert([user])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // --- Image Compression ---
  function compressImage(dataUrl, maxSize, quality) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = dataUrl;
    });
  }

  // --- Background Audio ---
  function initAudio() {
    const toggle = document.getElementById('sound-toggle');
    if (!toggle) return;

    const audio = new Audio('745373__audiocoffee__ambient-future-tech-loop-ver.wav');
    audio.loop = true;
    audio.volume = 0.3;

    let playing = false;
    const wasMuted = localStorage.getItem('seismic_muted') === 'true';

    function play() {
      audio.play().then(() => {
        playing = true;
        toggle.textContent = '🔊';
        toggle.classList.add('playing');
        localStorage.setItem('seismic_muted', 'false');
      }).catch(() => {});
    }

    function pause() {
      audio.pause();
      playing = false;
      toggle.textContent = '🔇';
      toggle.classList.remove('playing');
      localStorage.setItem('seismic_muted', 'true');
    }

    toggle.addEventListener('click', () => {
      if (playing) {
        pause();
      } else {
        play();
      }
    });

    // Sound on by default — auto-play on first user interaction
    function autoPlay() {
      play();
      document.removeEventListener('click', autoPlay);
      document.removeEventListener('touchstart', autoPlay);
    }
    document.addEventListener('click', autoPlay, { once: false });
    document.addEventListener('touchstart', autoPlay, { once: false });
  }

  // --- Inject Particles into body ---
  function injectParticles() {
    const container = document.createElement('div');
    container.className = 'particles';
    for (let i = 0; i < 12; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      container.appendChild(p);
    }
    document.body.prepend(container);
  }

  // =============================================
  //  REGISTER PAGE
  // =============================================
  function initRegisterPage() {
    const form = document.getElementById('register-form');
    if (!form) return;

    // --- Prevent multiple registrations ---
    if (localStorage.getItem('has_registered')) {
      window.location.href = 'directory.html';
      return;
    }

    const photoInput = document.getElementById('photo-input');
    const photoCircle = document.getElementById('photo-circle');
    const photoPreviewImg = document.getElementById('photo-preview-img');
    const nameInput = document.getElementById('name-input');
    const magSelect = document.getElementById('mag-select');
    const sigCanvas = document.getElementById('sig-canvas');
    const clearSigBtn = document.getElementById('clear-sig-btn');

    // ID Card preview elements
    const cardPhoto = document.getElementById('card-photo');
    const cardPhotoImg = document.getElementById('card-photo-img');
    const cardName = document.getElementById('card-name');
    const cardMag = document.getElementById('card-mag');
    const cardBadge = document.getElementById('card-badge');
    const cardSigImg = document.getElementById('card-sig-img');
    const cardSigWrap = document.getElementById('card-sig-wrap');

    let photoData = null;

    // --- Photo Upload ---
    photoCircle.addEventListener('click', () => photoInput.click());
    document.getElementById('photo-label')?.addEventListener('click', () => photoInput.click());

    photoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (ev) => {
        photoData = await compressImage(ev.target.result, 400, 0.7);
        // Update form preview
        photoPreviewImg.src = photoData;
        photoCircle.classList.add('has-photo');
        // Update card preview
        cardPhotoImg.src = photoData;
        cardPhoto.classList.add('has-photo');
      };
      reader.readAsDataURL(file);
    });

    // --- Name Input → Live Preview ---
    nameInput.addEventListener('input', () => {
      const val = nameInput.value.trim();
      if (val) {
        cardName.textContent = val;
        cardName.classList.remove('empty');
      } else {
        cardName.textContent = 'Your Name';
        cardName.classList.add('empty');
      }
    });

    // --- Magnitude Select → Live Preview ---
    magSelect.addEventListener('change', () => {
      const val = magSelect.value;
      if (val) {
        cardMag.textContent = `MAG ${val}`;
        cardBadge.textContent = `Magnitude ${val}`;
      } else {
        cardMag.textContent = 'MAG —';
        cardBadge.textContent = 'Select Level';
      }
    });

    // --- Signature Pad ---
    const ctx = sigCanvas.getContext('2d');
    let drawing = false;
    let lastX = 0, lastY = 0;

    function resizeCanvas() {
      const rect = sigCanvas.parentElement.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      // Match CSS responsive heights
      const vw = window.innerWidth;
      const canvasHeight = vw <= 360 ? 140 : vw <= 480 ? 160 : vw <= 768 ? 200 : 260;
      sigCanvas.width = rect.width * ratio;
      sigCanvas.height = canvasHeight * ratio;
      sigCanvas.style.width = rect.width + 'px';
      sigCanvas.style.height = canvasHeight + 'px';
      ctx.scale(ratio, ratio);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = vw <= 480 ? 3 : 5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    function getPos(e) {
      const rect = sigCanvas.getBoundingClientRect();
      const touch = e.touches ? e.touches[0] : e;
      return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    }

    function startDraw(e) {
      drawing = true;
      const pos = getPos(e);
      lastX = pos.x;
      lastY = pos.y;
    }

    function draw(e) {
      if (!drawing) return;
      e.preventDefault();
      const pos = getPos(e);
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      lastX = pos.x;
      lastY = pos.y;
      updateSigPreview();
    }

    function endDraw() {
      drawing = false;
    }

    sigCanvas.addEventListener('mousedown', startDraw);
    sigCanvas.addEventListener('mousemove', draw);
    sigCanvas.addEventListener('mouseup', endDraw);
    sigCanvas.addEventListener('mouseleave', endDraw);

    sigCanvas.addEventListener('touchstart', (e) => { e.preventDefault(); startDraw(e); }, { passive: false });
    sigCanvas.addEventListener('touchmove', (e) => { draw(e); }, { passive: false });
    sigCanvas.addEventListener('touchend', endDraw);

    function updateSigPreview() {
      const dataUrl = sigCanvas.toDataURL('image/png');
      cardSigImg.src = dataUrl;
      cardSigWrap.classList.add('has-sig');
    }

    clearSigBtn.addEventListener('click', () => {
      const ratio = window.devicePixelRatio || 1;
      ctx.clearRect(0, 0, sigCanvas.width / ratio, sigCanvas.height / ratio);
      cardSigWrap.classList.remove('has-sig');
      cardSigImg.src = '';
    });

    // --- Form Submission ---
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Clear previous errors
      document.querySelectorAll('.form-error').forEach(el => el.classList.remove('form-error'));
      document.querySelectorAll('.error-text').forEach(el => el.remove());

      let hasError = false;

      function showError(el, msg) {
        el.classList.add('form-error');
        const span = document.createElement('span');
        span.className = 'error-text';
        span.textContent = msg;
        el.parentElement.appendChild(span);
        hasError = true;
      }

      if (!photoData) {
        showError(photoCircle, 'Please upload a photo');
      }

      const name = nameInput.value.trim();
      if (!name) {
        showError(nameInput, 'Please enter your name');
      } else if (name.length > 100) {
        showError(nameInput, 'Name must be 100 characters or less');
      }

      const mag = parseInt(magSelect.value);
      if (!mag) {
        showError(magSelect, 'Please select a magnitude level');
      }

      // Check if signature canvas has something drawn
      const sigData = sigCanvas.toDataURL('image/png');
      const blankCanvas = document.createElement('canvas');
      blankCanvas.width = sigCanvas.width;
      blankCanvas.height = sigCanvas.height;
      const isBlank = sigData === blankCanvas.toDataURL('image/png');

      if (isBlank) {
        const wrap = document.querySelector('.signature-canvas-wrap');
        showError(wrap, 'Please draw your signature');
      } else if (sigData.length > 200000) {
        const wrap = document.querySelector('.signature-canvas-wrap');
        showError(wrap, 'Signature is too complex. Please clear and try a simpler one.');
      }

      if (hasError) return;

      // Disable submit button while saving
      const submitBtn = form.querySelector('.btn-mint');
      submitBtn.disabled = true;
      submitBtn.textContent = '⏳ Minting...';

      try {
        const newUser = await addUser({
          name,
          magnitude: mag,
          photo: photoData,
          signature: sigData
        });

        // Set flags
        sessionStorage.setItem('just_minted', newUser.id.toString());
        localStorage.setItem('has_registered', 'true');

        // Redirect
        window.location.href = 'directory.html';
      } catch (err) {
        console.error('Registration failed:', err);
        submitBtn.disabled = false;
        submitBtn.textContent = '⚡ Mint My ID';
        alert('Registration failed. Please try again.');
      }
    });
  }

  // =============================================
  //  DIRECTORY PAGE
  // =============================================
  async function initDirectoryPage() {
    const listEl = document.getElementById('directory-list');
    if (!listEl) return;

    const scrollWrapper = document.getElementById('scroll-wrapper');
    const scrollPrompt = document.getElementById('scroll-prompt');
    const justMintedId = sessionStorage.getItem('just_minted');

    // Show loading state
    listEl.innerHTML = `
      <div class="empty-state">
        <p>Loading seismic records...</p>
      </div>
    `;

    const users = await getUsers();

    if (users.length === 0) {
      listEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📡</div>
          <p>No seismic activity yet — be the first.</p>
          <a href="register.html" class="btn-register-cta">Register Now</a>
        </div>
      `;
      return;
    }

    // Clear loading state and render entries
    listEl.innerHTML = '';

    // Already sorted by magnitude desc from the query
    users.forEach((user, index) => {
      const rank = index + 1;
      const row = document.createElement('div');
      row.className = 'directory-row';
      row.setAttribute('data-user-id', user.id);
      row.innerHTML = `
        <div class="row-rank">${getRankLabel(rank)}</div>
        <div class="row-photo">
          <img src="${user.photo}" alt="${escapeHtml(user.name)}">
        </div>
        <div class="row-name">${escapeHtml(user.name)}</div>
        <div class="row-sig">
          <img src="${user.signature}" alt="signature">
        </div>
        <span class="row-was-here">was here</span>
        <span class="row-mag-badge">MAG ${user.magnitude}</span>
      `;
      listEl.appendChild(row);
    });

    // --- Scroll Open Animation (if redirected from registration) ---
    if (justMintedId && scrollWrapper && scrollPrompt) {
      sessionStorage.removeItem('just_minted');

      // Start with scroll closed
      scrollWrapper.classList.add('scroll-closed');
      scrollPrompt.classList.remove('hidden');

      // Click on prompt or scroll to open
      function openScroll() {
        scrollPrompt.classList.add('hidden');
        scrollWrapper.classList.remove('scroll-closed');
        scrollWrapper.classList.add('scroll-opening');

        // After animation completes, mark as open and scroll to user's entry
        setTimeout(() => {
          scrollWrapper.classList.remove('scroll-opening');
          scrollWrapper.classList.add('scroll-open');

          // Find the user's row and scroll to it
          const userRow = listEl.querySelector(`[data-user-id="${justMintedId}"]`);
          if (userRow) {
            setTimeout(() => {
              userRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
              // Add highlight glow effect
              userRow.style.transition = 'all 0.5s ease';
              userRow.style.background = 'rgba(201, 164, 76, 0.1)';
              userRow.style.borderLeftColor = '#e8b84b';
              userRow.style.boxShadow = 'inset 0 0 40px rgba(201, 164, 76, 0.08), 0 0 20px rgba(201, 164, 76, 0.1)';
              // Fade the highlight after a few seconds
              setTimeout(() => {
                userRow.style.background = '';
                userRow.style.borderLeftColor = '';
                userRow.style.boxShadow = '';
              }, 3000);
            }, 300);
          }
        }, 1500);
      }

      scrollPrompt.addEventListener('click', openScroll);
      scrollWrapper.addEventListener('click', () => {
        if (scrollWrapper.classList.contains('scroll-closed')) {
          openScroll();
        }
      });
    } else if (scrollWrapper) {
      // Normal visit — scroll is already open
      scrollWrapper.classList.add('scroll-open');
    }
  }

  function getRankLabel(rank) {
    const suffixes = { 1: 'st', 2: 'nd', 3: 'rd' };
    const suffix = (rank > 3 && rank < 21) ? 'th' : (suffixes[rank % 10] || 'th');
    return `${rank}${suffix}`;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // --- Initialize ---
  document.addEventListener('DOMContentLoaded', () => {
    injectParticles();
    initAudio();
    initRegisterPage();
    initDirectoryPage();
  });
})();
