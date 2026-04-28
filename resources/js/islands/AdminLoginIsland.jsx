import { useEffect } from "react";

export default function AdminLoginIsland() {
    useEffect(() => {
        const togglePassword = document.getElementById("togglePassword");
        const passwordInput = document.getElementById("password");

        const toggleHandler = () => {
            if (!passwordInput || !togglePassword) {
                return;
            }
            const type =
                passwordInput.getAttribute("type") === "password"
                    ? "text"
                    : "password";
            passwordInput.setAttribute("type", type);
            togglePassword.innerHTML =
                type === "password"
                    ? '<i class="ph ph-eye"></i>'
                    : '<i class="ph ph-eye-slash"></i>';
        };

        if (togglePassword && passwordInput) {
            togglePassword.addEventListener("click", toggleHandler);
        }

        const captchaError = document.getElementById("captcha-error-msg");
        const sessionCaptchaError = document.getElementById(
            "session-captcha-error",
        );
        const errorTarget = sessionCaptchaError || captchaError;

        if (errorTarget && typeof window.Swal !== "undefined") {
            window.Swal.fire({
                icon: "error",
                title: "Gagal",
                text: errorTarget.innerText,
                confirmButtonColor: "var(--primary)",
                timer: 3000,
                timerProgressBar: true,
            });
        }

        return () => {
            if (togglePassword) {
                togglePassword.removeEventListener("click", toggleHandler);
            }
        };
    }, []);

    return null;
}
