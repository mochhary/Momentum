/**
 * Admin Login Styling & Logic
 */

document.addEventListener('DOMContentLoaded', function() {
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.innerHTML = type === 'password' ? '<i class="ph ph-eye"></i>' : '<i class="ph ph-eye-slash"></i>';
        });
    }

    // Handle Captcha Error Notification
    const captchaError = document.getElementById('captcha-error-msg');
    const sessionCaptchaError = document.getElementById('session-captcha-error');
    
    const errorTarget = sessionCaptchaError || captchaError;
    
    if (errorTarget) {
        Swal.fire({
            icon: 'error',
            title: 'Gagal',
            text: errorTarget.innerText,
            confirmButtonColor: 'var(--primary)',
            timer: 3000,
            timerProgressBar: true
        });
    }
});
