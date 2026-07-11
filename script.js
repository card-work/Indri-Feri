document.addEventListener('DOMContentLoaded', function() {
    // === CONFIG: Google Apps Script Endpoint ===
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz-gKTeJvL7-Lb07K9YsI77PFV-LTR5l6mUmkVvohyZdUKGiZYo5MQRqHY8RMoTGloKhw/exec";

    // --- DOM Element Selections ---
    const coverPage = document.getElementById('cover-page');
    const openButton = document.getElementById('open-invitation-btn');
    const mainContentContainer = document.getElementById('main-content');
    const innerCard = document.querySelector('.card');
    const audio = document.getElementById('background-music');
    const musicControl = document.getElementById('music-control');
    
    // --- Multilayer Semarak Premium Particle Engine ---
    const leafContainer = document.getElementById('leaf-container');
    const structures = [
        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23795538" opacity="0.4"><path d="M17,8C15,10 13,16 18,21C13,20 9,15 11,10C12,7.5 15,5 17,8Z"/></svg>', 
        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23d4af37" opacity="0.3"><circle cx="12" cy="12" r="6" fill="none" stroke="%23d4af37" stroke-width="1.5"/><circle cx="12" cy="12" r="2"/></svg>', 
        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23b76e79" opacity="0.25"><path d="M12,2C14,6 20,8 16,12C20,16 14,18 12,22C10,18 4,16 8,12C4,8 10,6 12,2Z"/></svg>' 
    ];

    if (leafContainer) {
        for (let i = 0; i < 24; i++) {
            const element = document.createElement('div');
            element.className = 'particle-flower';
            const size = 12 + Math.random() * 16;
            element.style.width = `${size}px`;
            element.style.height = `${size}px`;
            element.style.backgroundImage = `url('${structures[i % structures.length]}')`;
            element.style.left = `${Math.random() * 100}vw`;
            element.style.animationDelay = `${Math.random() * 14}s`;
            element.style.animationDuration = `${10 + Math.random() * 12}s`;
            leafContainer.appendChild(element);
        }
    }

    // --- URL Query Parameter Name Parsing ---
    const guestNameDisplay = document.getElementById('guest-name-display');
    const urlParams = new URLSearchParams(window.location.search);
    const guestName = urlParams.get('to');
    if (guestName) {
        guestNameDisplay.textContent = guestName.replace(/[+]/g, ' ');
    }

    // --- Buka Undangan & Pemicu Audio ---
    if (openButton) {
        openButton.addEventListener('click', function() {
            coverPage.style.opacity = '0';
            coverPage.style.visibility = 'hidden';
            mainContentContainer.style.display = 'flex';
            
            setTimeout(() => { innerCard.classList.add('visible'); }, 50);
            document.body.style.overflowY = 'auto';

            audio.play().then(() => {
                musicControl.classList.add('playing');
                musicControl.innerHTML = '<i class="fa-solid fa-music"></i>';
            }).catch(error => {
                console.warn("Autoplay ditangguhkan kebijakan privasi browser:", error);
                musicControl.classList.remove('playing');
                musicControl.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
            });
        });
    }

    if (musicControl) {
        musicControl.addEventListener('click', function() {
            if (audio.paused) {
                audio.play();
                musicControl.classList.add('playing');
                musicControl.innerHTML = '<i class="fa-solid fa-music"></i>';
            } else {
                audio.pause();
                musicControl.classList.remove('playing');
                musicControl.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
            }
        });
    }

    // --- Countdown Timer System (Target 8 Agustus 2026) ---
    const countdownDate = new Date("Aug 08, 2026 11:00:00").getTime();
    const countdownFunction = setInterval(function() {
        const now = new Date().getTime();
        const distance = countdownDate - now;

        if (distance < 0) {
            clearInterval(countdownFunction);
            document.getElementById("countdown").innerHTML = "<h4 style='font-family:var(--font-subheading); color:var(--color-theme-brown); font-size:1.1rem; width:100%; text-align:center;'>Acara Pernikahan Telah Berlangsung</h4>";
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById("days").innerText = String(days).padStart(2, '0');
        document.getElementById("hours").innerText = String(hours).padStart(2, '0');
        document.getElementById("minutes").innerText = String(minutes).padStart(2, '0');
        document.getElementById("seconds").innerText = String(seconds).padStart(2, '0');
    }, 1000);

    // --- Scroll Intersection Auto Animation trigger ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.dataset.delay || '0.1';
                entry.target.style.animation = `fadeInUp 1s ${delay}s cubic-bezier(0.16, 1, 0.3, 1) forwards`;
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.05 });

    document.querySelectorAll('.animated-section').forEach((section) => {
        observer.observe(section);
    });

    // --- RSVP Forms & Google Spreadsheet Interactivity ---
    const rsvpForm = document.getElementById('rsvp-form');
    const wishesList = document.getElementById('wishes-list');
    const wishesLoading = document.getElementById('wishes-loading');
    const submitRsvpBtn = document.getElementById('submit-rsvp-btn');

    async function fetchWishes() {
        if (!wishesList) return;
        wishesList.innerHTML = '<div class="loading-spinner">Memuat ucapan...</div>';
        
        try {
            const response = await fetch(SCRIPT_URL);
            if (!response.ok) throw new Error("API Offline.");
            
            const data = await response.json();
            wishesList.innerHTML = '';

            if (!data || data.length === 0) {
                wishesList.innerHTML = '<div class="no-wishes-message">Belum ada ucapan masuk.</div>';
                return;
            }

            data.forEach(item => {
                const wish = { name: item.name, status: item.status, message: item.message };
                renderWishCard(wish);
            });
        } catch (error) {
            console.error("Sinkronisasi daftar ucapan gagal:", error);
            wishesList.innerHTML = '<div class="no-wishes-message" style="color: #c5221f;">Gagal memuat daftar ucapan.</div>';
        }
    }

    function renderWishCard(wish) {
        const wishCard = document.createElement('div');
        wishCard.className = 'wish-card';
        const statusClass = wish.status === 'Hadir' ? 'hadir' : 'tidak-hadir';
        
        wishCard.innerHTML = `
            <div class="sender-info">
                <p class="sender-name">${escapeHTML(wish.name)}</p>
                <span class="status-badge ${statusClass}">${wish.status}</span>
            </div>
            <p class="message-text">${escapeHTML(wish.message)}</p>
        `;
        wishesList.appendChild(wishCard);
    }

    function escapeHTML(str) {
        if (!str) return '';
        const p = document.createElement("p");
        p.textContent = str;
        return p.innerHTML;
    }

    if (rsvpForm) {
        rsvpForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            
            const nameInput = document.getElementById('rsvp-name').value.trim();
            const statusSelect = document.getElementById('rsvp-status').value;
            const messageInput = document.getElementById('rsvp-message').value.trim();

            if (!nameInput || !statusSelect || !messageInput) {
                showToast('Mohon lengkapi seluruh kolom.', 'error');
                return;
            }

            submitRsvpBtn.disabled = true;
            if(wishesLoading) wishesLoading.style.display = 'block';

            const payload = new URLSearchParams();
            payload.append('name', nameInput);
            payload.append('status', statusSelect);
            payload.append('message', messageInput);

            try {
                await fetch(SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors', 
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: payload.toString()
                });

                showToast('Ucapan berhasil dikirim!');
                rsvpForm.reset();
                setTimeout(async () => { await fetchWishes(); }, 1000);

            } catch (error) {
                console.error("Gagal mengunggah data:", error);
                showToast('Koneksi bermasalah. Gagal mengirim ucapan.', 'error');
            } finally {
                submitRsvpBtn.disabled = false;
                if(wishesLoading) wishesLoading.style.none;
            }
        });
    }

    fetchWishes();

    // --- Toast & Clipboard Mechanism ---
    const toast = document.getElementById('toast-notification');
    let toastTimer;
    
    function showToast(message, type = 'success') {
        clearTimeout(toastTimer);
        toast.textContent = message;
        toast.style.borderColor = type === 'error' ? '#c5221f' : 'rgba(121,85,56,0.3)';
        toast.classList.add('show');
        toastTimer = setTimeout(() => { toast.classList.remove('show'); }, 3000);
    }

    document.querySelectorAll('.copy-button').forEach(button => {
        button.addEventListener('click', () => {
            const targetSelector = button.dataset.clipboardTarget;
            const textToCopy = document.querySelector(targetSelector).innerText;
            navigator.clipboard.writeText(textToCopy).then(() => {
                showToast('Nomor rekening berhasil disalin!');
            }).catch(err => showToast('Gagal menyalin teks.', 'error'));
        });
    });
    
    // --- Gallery Lightbox Modal ---
    const modal = document.getElementById('gallery-modal');
    const modalImg = document.getElementById('modal-image');
    const closeModal = document.querySelector('.modal-close');
    
    document.querySelectorAll('.gallery-item').forEach(img => {
        img.addEventListener('click', function() {
            modal.style.display = "flex";
            modalImg.src = this.src;
        });
    });
    
    if (closeModal) { closeModal.onclick = () => modal.style.display = "none"; }
    window.onclick = (event) => { if (event.target == modal) modal.style.display = "none"; }
});
