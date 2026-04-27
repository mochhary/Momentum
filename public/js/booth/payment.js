/**
 * Booth Payment Page Logic
 */

function initPaymentTimer(expiredAtIso) {
    if (!expiredAtIso) return;
    
    const expiredAt = new Date(expiredAtIso);
    const timerEl = document.getElementById('timer');
    const countdownEl = document.getElementById('countdown');
    
    function updateTimer() {
        const diff = expiredAt - new Date();
        if (diff <= 0) {
            if (timerEl) timerEl.textContent = 'Expired';
            if (countdownEl) countdownEl.classList.add('expired');
            return;
        }
        const m = Math.floor(diff / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        if (timerEl) {
            timerEl.textContent = m.toString().padStart(2, '0') + ':' + s.toString().padStart(2, '0');
        }
    }
    
    updateTimer();
    setInterval(updateTimer, 1000);
}

function startPaymentStatusCheck(statusUrl) {
    setInterval(() => {
        fetch(statusUrl)
            .then(r => r.json())
            .then(d => {
                if (d.redirect) {
                    window.location.href = d.redirect;
                    return;
                }
                
                if (d.status === 'expired') {
                    const statusEl = document.querySelector('.status-checking');
                    if (statusEl) {
                        statusEl.innerHTML = '<i class="ph ph-x-circle"></i> Expired';
                        statusEl.style.color = 'var(--error)';
                    }
                }
            })
            .catch(() => {});
    }, 3000);
}

function copyQRUrl(url) {
    if (!url) return;
    
    // Modern clipboard API
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(url).then(() => {
            showCopyFeedback();
        }).catch(err => {
            fallbackCopyTextToClipboard(url);
        });
    } else {
        fallbackCopyTextToClipboard(url);
    }
}

function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        document.execCommand('copy');
        showCopyFeedback();
    } catch (err) {
        console.error('Fallback copy failed', err);
    }
    document.body.removeChild(textArea);
}

function showCopyFeedback() {
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: 'Tersalin!',
            text: 'URL QRIS telah disalin ke clipboard.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
        });
    }
}
