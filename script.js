document.addEventListener('DOMContentLoaded', function() {
    // === CONFIG: Google Apps Script Endpoint ===
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwCCiPtXAxN1wlMyqiToe_9uTKTvcCteRFAER8CwsIO_j_TqqrdnLTIXkaDqZKeP6UbpQ/exec";

    // --- DOM Element Selections ---
    const coverPage = document.getElementById('cover-page');
    const openButton = document.getElementById('open-invitation-btn');
    const mainContentContainer = document.getElementById('main-content');
    const innerCard = document.querySelector('.card');
    const audio = document.getElementById('background-music');
    const musicControl = document.getElementById('music-control');
    
    // --- Fall Leaves Particle Animation ---
    const leafContainer = document.getElementById('leaf-container');
    if (leafContainer) {
        for (let i = 0; i < 15; i++) {
            const leaf = document.createElement('div');
            leaf.className = 'leaf';
            leaf.style.left = `${Math.random() * 100}vw`;
            leaf.style.animationDelay = `${Math.random() * 10}s`;
            leaf.style.animationDuration = `${6 + Math.random() * 8}s`;
            leaf.style.opacity = Math.random();
            leafContainer.appendChild(leaf);
        }
    }

    // --- URL Query Parameter Name Parsing ---
    const guestNameDisplay = document.getElementById('guest-name-display');
    const urlParams = new URLSearchParams(window.location.search);
    const guestName = urlParams.get('to');
    if (guestName) {
        guestNameDisplay.textContent = guestName.replace(/[+]/g, ' ');
    }

    // --- Logika Pasti Terbuka & Pemicu Audio ---
    if (openButton) {
        openButton.addEventListener('click', function() {
            // Hilangkan cover screen secara visual
            coverPage.style.opacity = '0';
            coverPage.style.visibility = 'hidden';
            
            // Aktifkan display flex pada layout utama
            mainContentContainer.style.display = 'flex';
            
            // Trigger rendering transisi card agar membesar mulus
            setTimeout(() => {
                innerCard.classList.add('visible');
            }, 50);

            // Buka akses scroll vertikal browser
            document.body.style.overflowY = 'auto';

            // Eksekusi sistem musik latar
            audio.play().then(() => {
                musicControl.classList.add('playing');
                musicControl.innerHTML = '<i class="fa-solid fa-music"></i>';
            }).catch(error => {
                console.error("Audio playback terhambat setelan privasi:", error);
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
            document.getElementById("countdown").innerHTML = "<h4>Acara Telah Berlangsung</h4>";
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
                entry.target.style.animation = `fadeInUp 0.8s ${delay}s ease forwards`;
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
        if (!wishesLoading) return;
        wishesLoading.style.display = 'block';
        wishesList.innerHTML = '';
        
        try {
            const response = await fetch(SCRIPT_URL);
            if (!response.ok) throw new Error("API Offline.");
            
            const data = await response.json();
            wishesLoading.style.display = 'none';

            if (!data || data.length === 0) {
                wishesList.innerHTML = '<div class="no-wishes-message">Belum ada ucapan masuk.</div>';
                return;
            }

            data.forEach(item => {
                const wish = {
                    name: item.name,
                    status: item.status,
                    message: item.message
                };
                renderWishCard(wish);
            });
        } catch (error) {
            console.error("Sinkronisasi database ucapan gagal:", error);
            wishesLoading.style.display = 'none';
            wishesList.innerHTML = '<div class="no-wishes-message" style="color: red;">Gagal memuat ucapan.</div>';
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
            submitRsvpBtn.textContent = 'Mengirim data...';

            const formData = new FormData();
            formData.append('name', nameInput);
            formData.append('status', statusSelect);
            formData.append('message', messageInput);

            try {
                const response = await fetch(SCRIPT_URL, {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) throw new Error("POST request rejected.");
                
                showToast('Konfirmasi RSVP berhasil dikirim!');
                rsvpForm.reset();
                await fetchWishes();
            } catch (error) {
                console.error("Gagal mengunggah data:", error);
                showToast('Koneksi bermasalah. Gagal mengirim rsvp.', 'error');
            } finally {
                submitRsvpBtn.disabled = false;
                submitRsvpBtn.textContent = 'Kirim RSVP';
            }
        });
    }

    fetchWishes();

    // --- Toast Notification & Clipboard Copy Mechanism ---
    const toast = document.getElementById('toast-notification');
    let toastTimer;
    
    function showToast(message, type = 'success') {
        clearTimeout(toastTimer);
        toast.textContent = message;
        toast.style.backgroundColor = type === 'error' ? '#c5221f' : '#2c2c2c';
        toast.classList.add('show');
        toastTimer = setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    document.querySelectorAll('.copy-button').forEach(button => {
        button.addEventListener('click', () => {
            const targetSelector = button.dataset.clipboardTarget;
            const textToCopy = document.querySelector(targetSelector).innerText;
            navigator.clipboard.writeText(textToCopy).then(() => {
                showToast('Nomor rekening berhasil disalin!');
            }).catch(err => showToast('Gagal menyalin text.', 'error'));
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
    
    if (closeModal) {
        closeModal.onclick = () => modal.style.display = "none";
    }
    window.onclick = (event) => { 
        if (event.target == modal) modal.style.display = "none"; 
    }
});
