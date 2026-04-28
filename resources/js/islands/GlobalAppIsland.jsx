import { useEffect } from "react";

export default function GlobalAppIsland() {
    useEffect(() => {
        const cursor = document.querySelector(".custom-cursor");
        const isBooth = document.body.classList.contains("booth-body");
        const isPaymentPage = document.body.classList.contains("payment-page");
        const useCustomCursor = isBooth && !isPaymentPage;

        let updateCursor = null;
        let checkKioskMode = null;

        if (cursor && useCustomCursor && typeof window.gsap !== "undefined") {
            updateCursor = (event) => {
                window.gsap.to(cursor, {
                    x: event.clientX,
                    y: event.clientY,
                    duration: 0.1,
                    ease: "power2.out",
                });
            };

            checkKioskMode = () => {
                const isFullscreen =
                    window.innerHeight === screen.height ||
                    window.fullScreen ||
                    (window.innerWidth === screen.width &&
                        window.innerHeight === screen.height);
                const isTouch =
                    "ontouchstart" in window || navigator.maxTouchPoints > 0;

                if (isFullscreen || isTouch) {
                    document.body.classList.add("kiosk-mode");
                } else {
                    document.body.classList.remove("kiosk-mode");
                }
            };

            window.addEventListener("mousemove", updateCursor);
            window.addEventListener("resize", checkKioskMode);
            checkKioskMode();
        }

        if (typeof window.gsap !== "undefined") {
            const elements = document.querySelectorAll(".animate-in");
            elements.forEach((element, index) => {
                const delay = element.classList.contains("animate-delay-1")
                    ? 0.1
                    : element.classList.contains("animate-delay-2")
                      ? 0.2
                      : element.classList.contains("animate-delay-3")
                        ? 0.3
                        : index * 0.1;

                window.gsap.from(element, {
                    opacity: 0,
                    y: 20,
                    duration: 0.8,
                    delay,
                    ease: "power3.out",
                    clearProps: "all",
                });
            });
        }

        if (typeof window.Swal !== "undefined") {
            window.alert = (message) => {
                window.Swal.fire({
                    title: "Informasi",
                    text: message,
                    icon: "info",
                    background: "#ffffff",
                    color: "#0f172a",
                    confirmButtonColor: "#427AB5",
                    customClass: {
                        popup: "premium-swal-popup",
                        confirmButton: "premium-swal-btn",
                    },
                });
            };
        }

        window.setupAdminAutoRefresh = (intervalMs = 15000) => {
            return window.setInterval(() => {
                const activeElement = document.activeElement;
                const isInputFocused =
                    !!activeElement &&
                    ["INPUT", "SELECT", "TEXTAREA"].includes(
                        activeElement.tagName,
                    );
                const isCalendarOpen =
                    document.querySelector(".flatpickr-calendar.open") !== null;

                if (!isInputFocused && !isCalendarOpen) {
                    window.location.reload();
                }
            }, intervalMs);
        };

        return () => {
            if (updateCursor) {
                window.removeEventListener("mousemove", updateCursor);
            }
            if (checkKioskMode) {
                window.removeEventListener("resize", checkKioskMode);
            }
            delete window.setupAdminAutoRefresh;
        };
    }, []);

    return null;
}
