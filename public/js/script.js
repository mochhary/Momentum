/* Momentum Global JavaScript Functions */

document.addEventListener('DOMContentLoaded', () => {
    // --- Custom Cursor Logic (Booth Only) ---
    const cursor = document.querySelector('.custom-cursor');
    const isBooth = document.body.classList.contains('booth-body');
    const isPaymentPage = document.body.classList.contains('payment-page');
    const useCustomCursor = isBooth && !isPaymentPage;

    if (cursor && useCustomCursor && typeof gsap !== 'undefined') {
        const updateCursor = (e) => {
            gsap.to(cursor, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.1,
                ease: 'power2.out'
            });
        };

        window.addEventListener('mousemove', updateCursor);

        const checkKioskMode = () => {
            const isFullscreen = window.innerHeight === screen.height || 
                               window.fullScreen || 
                               (window.innerWidth === screen.width && window.innerHeight === screen.height);
            
            const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

            if (isFullscreen || isTouch) {
                document.body.classList.add('kiosk-mode');
            } else {
                document.body.classList.remove('kiosk-mode');
            }
        };

        window.addEventListener('resize', checkKioskMode);
        checkKioskMode();
    }

    // --- Entrance Animations (Safe 'from' pattern) ---
    const elements = document.querySelectorAll('.animate-in');
    
    if (typeof gsap !== 'undefined') {
        elements.forEach((el, index) => {
            const delay = el.classList.contains('animate-delay-1') ? 0.1 : 
                         el.classList.contains('animate-delay-2') ? 0.2 : 
                         el.classList.contains('animate-delay-3') ? 0.3 : (index * 0.1);

            // Use .from to ensure visibility if JS fails (since CSS is now opacity: 1)
            gsap.from(el, {
                opacity: 0,
                y: 20,
                duration: 0.8,
                delay: delay,
                ease: 'power3.out',
                clearProps: 'all'
            });
        });
    }

    // Custom alerts override
    if (typeof Swal !== 'undefined') {
        window.alert = function(message) {
            Swal.fire({
                title: 'Informasi',
                text: message,
                icon: 'info',
                background: '#ffffff',
                color: '#0f172a',
                confirmButtonColor: '#427AB5',
                customClass: {
                    popup: 'premium-swal-popup',
                    confirmButton: 'premium-swal-btn'
                }
            });
        };
    }
});

// Admin Auto Refresh Logic
function setupAdminAutoRefresh(intervalMs = 15000) {
    setInterval(function() {
        const activeElement = document.activeElement;
        const isInputFocused = activeElement && (
            activeElement.tagName === 'INPUT' || 
            activeElement.tagName === 'SELECT' || 
            activeElement.tagName === 'TEXTAREA'
        );
        
        const isCalendarOpen = document.querySelector('.flatpickr-calendar.open') !== null;
        
        if (!isInputFocused && !isCalendarOpen) {
            window.location.reload();
        }
    }, intervalMs);
}
