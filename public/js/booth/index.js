/**
 * Booth Index Page - Premium Animations & Interactions
 */
(function() {
    let idleTimer;
    const idleTime = 120000; // 2 minutes in ms

    function resetTimer() {
        clearTimeout(idleTimer);
        idleTimer = setTimeout(() => {
            if (window.location.pathname === '/booth' || window.location.pathname.endsWith('/booth')) {
                window.location.reload();
            }
        }, idleTime);
    }

    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    activityEvents.forEach(event => {
        document.addEventListener(event, resetTimer, true);
    });

    resetTimer();

    // Initializing idle timer...

    // GSAP Flying Photos (More Prominent)
    const floatingBg = document.querySelector('.floating-bg');
    if (floatingBg) {
        for (let i = 0; i < 7; i++) {
            const photo = document.createElement('div');
            photo.className = 'flying-photo';
            floatingBg.appendChild(photo);

            gsap.set(photo, {
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                rotation: Math.random() * 60 - 30,
                scale: 0.8 + Math.random() * 0.5,
                opacity: 0.5 // More visible
            });

            animatePhoto(photo);

            // "Pental" (Bounce) effect on click
            photo.addEventListener('mousedown', (e) => {
                e.stopPropagation(); 
                gsap.killTweensOf(photo); 
                
                const randomX = Math.random() * (window.innerWidth - 160);
                const randomY = Math.random() * (window.innerHeight - 200);
                const currentRot = gsap.getProperty(photo, "rotation");
                const targetRot = currentRot + (Math.random() * 360 - 180);

                gsap.to(photo, {
                    x: randomX,
                    y: randomY,
                    rotation: targetRot,
                    duration: 0.6,
                    ease: "power2.out",
                    onComplete: () => animatePhoto(photo)
                });
                
                // Visual pop feedback
                gsap.fromTo(photo, { scale: 1.3 }, { scale: 1, duration: 0.4, ease: "back.out(2)" });
            });
        }
    }

    function animatePhoto(photo) {
        gsap.to(photo, {
            x: Math.random() * (window.innerWidth - 160),
            y: Math.random() * (window.innerHeight - 200),
            rotation: Math.random() * 180,
            duration: 20 + Math.random() * 10,
            ease: "sine.inOut",
            onComplete: () => animatePhoto(photo)
        });
    }

    // Virtual Keyboard Logic
    if (typeof SimpleKeyboard !== 'undefined') {
        const Keyboard = window.SimpleKeyboard.default;
        const inputEl = document.querySelector('.kiosk-input');
        const keyboardWrapper = document.querySelector('.keyboard-wrapper-kiosk');

        const myKeyboard = new Keyboard({
            onChange: input => {
                if (inputEl) {
                    inputEl.value = input.toUpperCase();
                    inputEl.dispatchEvent(new Event('input'));
                }
            },
            onKeyPress: button => {
                resetTimer();
            },
            // CRITICAL: Prevent focus loss from input when clicking keys
            preventMouseDownDefault: true,
            layout: {
                'default': [
                    '1 2 3 4 5 6 7 8 9 0 -',
                    'Q W E R T Y U I O P',
                    'A S D F G H J K L',
                    'Z X C V B N M {backspace}',
                ]
            },
            display: {
                '{backspace}': '⌫'
            }
        });

        function showKeyboard() {
            if (keyboardWrapper) {
                keyboardWrapper.classList.add('show');
                myKeyboard.setInput(inputEl.value);
            }
        }

        function hideKeyboard() {
            if (keyboardWrapper) {
                keyboardWrapper.classList.remove('show');
            }
        }

        if (inputEl) {
            let isUserInteracting = false;

            // Mark interaction on mousedown
            inputEl.addEventListener('mousedown', () => {
                isUserInteracting = true;
                showKeyboard();
            });

            // Only show keyboard on focus if it was triggered by a user interaction
            inputEl.addEventListener('focus', () => {
                if (isUserInteracting) {
                    showKeyboard();
                }
                isUserInteracting = false; // Reset
            });
            
            // Sync typing from physical keyboard
            inputEl.addEventListener('input', event => {
                myKeyboard.setInput(event.target.value);
            });

            // Custom Form Validation
            const form = inputEl.closest('form');
            const errorDiv = document.getElementById('js-error-message');

            if (form) {
                form.noValidate = true;
                form.addEventListener('submit', function(e) {
                    if (!inputEl.value.trim()) {
                        e.preventDefault();
                        if (errorDiv) {
                            errorDiv.textContent = 'Masukkan kode terlebih dahulu';
                            errorDiv.classList.remove('d-none');
                            errorDiv.classList.add('d-inline-block');
                            errorDiv.style.opacity = '1';
                            
                            // Visual shake effect
                            gsap.fromTo(errorDiv, { x: -10 }, { x: 0, duration: 0.1, repeat: 5, yoyo: true });

                            // Auto-hide after 5 seconds
                            setTimeout(() => {
                                gsap.to(errorDiv, { opacity: 0, duration: 0.5, onComplete: () => {
                                    errorDiv.classList.add('d-none');
                                    errorDiv.classList.remove('d-inline-block');
                                }});
                            }, 5000);
                        }
                    }
                });
            }

            // Hide all existing error badges after 5 seconds (for Laravel errors)
            const existingErrors = document.querySelectorAll('.badge-error');
            existingErrors.forEach(err => {
                setTimeout(() => {
                    gsap.to(err, { opacity: 0, duration: 0.5, onComplete: () => {
                        err.classList.add('d-none');
                    }});
                }, 5000);
            });

            // Hide error message immediately when typing
            inputEl.addEventListener('input', () => {
                if (errorDiv) {
                    errorDiv.classList.add('d-none');
                    errorDiv.classList.remove('d-inline-block');
                }
                myKeyboard.setInput(inputEl.value);
            });
        }

        // Handle hiding when clicking completely outside
        document.addEventListener('mousedown', event => {
            if (inputEl && keyboardWrapper) {
                // Ensure we don't hide if clicking input, keyboard, or the SweetAlert modal
                const isClickInside = inputEl.contains(event.target) || 
                                    keyboardWrapper.contains(event.target) ||
                                    event.target.closest('.swal2-container');
                
                if (!isClickInside) {
                    hideKeyboard();
                }
            }
        });
    }
})();
