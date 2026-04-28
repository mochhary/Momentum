import { useEffect } from "react";

export default function BoothPaymentIsland({
    expiredAtIso = "",
    statusUrl = "",
}) {
    useEffect(() => {
        const timerElement = document.getElementById("timer");
        const countdownElement = document.getElementById("countdown");

        let timerInterval = null;
        if (expiredAtIso) {
            const expiredAt = new Date(expiredAtIso);
            const updateTimer = () => {
                const diff = expiredAt - new Date();
                if (diff <= 0) {
                    if (timerElement) {
                        timerElement.textContent = "Expired";
                    }
                    if (countdownElement) {
                        countdownElement.classList.add("expired");
                    }
                    return;
                }

                const minutes = Math.floor(diff / 60000);
                const seconds = Math.floor((diff % 60000) / 1000);
                if (timerElement) {
                    timerElement.textContent = `${minutes.toString().padStart(2, "0")}:${seconds
                        .toString()
                        .padStart(2, "0")}`;
                }
            };

            updateTimer();
            timerInterval = window.setInterval(updateTimer, 1000);
        }

        const statusInterval = window.setInterval(() => {
            if (!statusUrl) {
                return;
            }

            fetch(statusUrl)
                .then((response) => response.json())
                .then((data) => {
                    if (data.redirect) {
                        window.location.href = data.redirect;
                        return;
                    }

                    if (data.status === "expired") {
                        const statusElement =
                            document.querySelector(".status-checking");
                        if (statusElement) {
                            statusElement.innerHTML =
                                '<i class="ph ph-x-circle"></i> Expired';
                            statusElement.style.color = "var(--error)";
                        }
                    }
                })
                .catch(() => {});
        }, 3000);

        window.copyQRUrl = (url) => {
            if (!url) {
                return;
            }

            const showCopyFeedback = () => {
                if (typeof window.Swal !== "undefined") {
                    window.Swal.fire({
                        title: "Tersalin!",
                        text: "URL QRIS telah disalin ke clipboard.",
                        icon: "success",
                        timer: 1500,
                        showConfirmButton: false,
                        toast: true,
                        position: "top-end",
                    });
                }
            };

            const fallbackCopyTextToClipboard = (text) => {
                const textArea = document.createElement("textarea");
                textArea.value = text;
                textArea.style.position = "fixed";
                textArea.style.left = "-9999px";
                textArea.style.top = "0";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                try {
                    document.execCommand("copy");
                    showCopyFeedback();
                } catch (error) {
                    console.error("Fallback copy failed", error);
                }
                document.body.removeChild(textArea);
            };

            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard
                    .writeText(url)
                    .then(showCopyFeedback)
                    .catch(() => fallbackCopyTextToClipboard(url));
            } else {
                fallbackCopyTextToClipboard(url);
            }
        };

        return () => {
            if (timerInterval) {
                window.clearInterval(timerInterval);
            }
            window.clearInterval(statusInterval);
            delete window.copyQRUrl;
        };
    }, [expiredAtIso, statusUrl]);

    return null;
}
