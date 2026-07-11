document.addEventListener('DOMContentLoaded', function() {
    // === CONFIG: Google Apps Script Endpoint ===
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwCCiPtXAxN1wlMyqiToe_9uTKTvcCteRFAER8CwsIO_j_TqqrdnLTIXkaDqZKeP6UbpQ/exec";

    // --- DOM Element Selections ---
    const coverPage = document.getElementById('cover-page');
    const openButton = document.getElementById('open-invitation-btn');
    const mainContent = document.querySelector('.card');
    const audio = document.getElementById('background-music');
    const musicControl = document.getElementById('music-control');
    
    // --- Fall Leaves Animation Core System ---
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

    // --- URL Personalization Processing ---
    const guestNameDisplay = document.getElementById('guest-name-display');
    const urlParams = new URLSearchParams(window.location.search);
    const guestName = urlParams.get('to');
    if (guestName) {
        guestNameDisplay.textContent = guestName.replace(/[+]/g, ' ');
    }

    // --- Access & Audio Architecture ---
    openButton.addEventListener('click', function() {
        coverPage.classList.add('hidden');
        mainContent.classList.add('visible');
        document.body.style.overflowY = 'auto';

        audio.play().then(() => {
            musicControl.classList.add('playing');
            musicControl.innerHTML = '<i class="fa-solid fa-music"></i>';
        }).catch(error => {
            console.error("Audio engine context tracking block:", error);
            musicControl.classList.remove('playing');
            musicControl.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
        });
    });

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

    // --- Real-time Target Countdown Timer ---
    const countdownDate = new Date("Aug 08, 2026 11:00:00").getTime();
    const countdownFunction = setInterval(function() {
        const now = new Date().getTime();
        const distance = countdownDate - now;

        if (distance < 0) {
            clearInterval(countdownFunction);
            document.getElementById("countdown").innerHTML = "<h4>Acara Sedang Berlangsung / Telah Selesai</h4>";
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

    // --- Progressive Scroll Intersection Animation System ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.dataset.delay || '0';
                entry.target.style.animation = `fadeInUp 0.8s ${delay}s ease forwards`;
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.05 });

    document.querySelectorAll('.animated-section').forEach((section, index) => {
        section.dataset.delay = '0.1';
        observer.observe(section);
    });

    // --- Google Spreadsheet Connected RSVP Engine ---
    const rsvpForm = document.getElementById('rsvp-form');
    const wishesList = document.getElementById('wishes-list');
    const wishesLoading = document.getElementById('wishes-loading');
    const submitRsvpBtn = document.getElementById('submit-rsvp-btn');

    // Mengambil Data Ucapan Dari Google Spreadsheet (GET)
    async function fetchWishes() {
        wishesLoading.style.display = 'block';
        wishesList.innerHTML = '';
        
        try {
            const response = await fetch(SCRIPT_URL);
            if (!response.ok) throw new Error("Jaringan bermasalah saat mengambil data.");
            
            const data = await response.json();
            wishesLoading.style.display = 'none';

            if (!data || data.length === 0) {
                wishesList.innerHTML = '<div class="no-wishes-message">Belum ada ucapan masuk. Jadilah yang pertama memberikan doa restu!</div>';
                return;
            }

            // Memproses format JSON terstruktur dari spreadsheet
            data.forEach(item => {
                const wish = {
                    name: item.name,
                    status: item.status,
                    message: item.message
                };
                renderWishCard(wish);
            });
        } catch (error) {
            console.error("Gagal memuat ucapan:", error);
            wishesLoading.style.display = 'none';
            wishesList.innerHTML = '<div class="no-wishes-message" style="color: red;">Gagal memuat daftar ucapan. Silakan muat ulang halaman.</div>';
        }
    }

    // Merender Element Wish Card ke DOM
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

    // Mengirim Data Form RSVP ke Google Apps Script (POST)
    rsvpForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        const nameInput = document.getElementById('rsvp-name').value.trim();
        const statusSelect = document.getElementById('rsvp-status').value;
        const messageInput = document.getElementById('rsvp-message').value.trim();

        if (!nameInput || !statusSelect || !messageInput) {
            showToast('Mohon lengkapi seluruh kolom.', 'error');
            return;
        }

        // Kunci tombol kirim dan beri indikator pengiriman data
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

            if (!response.ok) throw new Error("Gagal mengirim data ke server.");
            
            showToast('Konfirmasi RSVP & ucapan Anda berhasil dikirim!');
            rsvpForm.reset();
            
            // Perbarui daftar ucapan secara otomatis pasca berhasil input
            await fetchWishes();
        } catch (error) {
            console.error("Proses kirim rsvp gagal:", error);
            showToast('Koneksi bermasalah. Gagal mengirim rsvp.', 'error');
        } finally {
            submitRsvpBtn.disabled = false;
            submitRsvpBtn.textContent = 'Kirim RSVP';
        }
    });

    // Inisialisasi pengambilan data otomatis saat halaman terbuka
    fetchWishes();

    // --- Toast Notification & Clipboard Infrastructure ---
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
    
    // --- Modern Immersive Photo Lightbox System ---
    const modal = document.getElementById('gallery-modal');
    const modalImg = document.getElementById('modal-image');
    const closeModal = document.querySelector('.modal-close');
    
    document.querySelectorAll('.gallery-item').forEach(img => {
        img.addEventListener('click', function() {
            modal.style.display = "flex";
            modalImg.src = this.src;
        });
    });
    
    closeModal.onclick = () => modal.style.display = "none";
    window.onclick = (event) => { 
        if (event.target == modal) modal.style.display = "none"; 
    }
});
