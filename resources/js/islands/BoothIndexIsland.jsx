import { useEffect } from "react";

export default function BoothIndexIsland() {
    useEffect(() => {
        let idleTimer = null;
        const idleTime = 120000;

        const resetTimer = () => {
            if (idleTimer) {
                window.clearTimeout(idleTimer);
            }

            idleTimer = window.setTimeout(() => {
                if (
                    window.location.pathname === "/booth" ||
                    window.location.pathname.endsWith("/booth")
                ) {
                    // Use AJAX loading instead of full reload for faster transition
                    if (window.pageLoaderAvailable && window.PageLoader) {
                        window.PageLoader.loadPage("/booth", {
                            showSpinner: false,
                        }).catch(() => {
                            window.location.reload();
                        });
                    } else {
                        window.location.reload();
                    }
                }
            }, idleTime);
        };

        const activityEvents = [
            "mousedown",
            "mousemove",
            "keypress",
            "scroll",
            "touchstart",
            "click",
        ];
        activityEvents.forEach((eventName) => {
            document.addEventListener(eventName, resetTimer, true);
        });

        resetTimer();

        const floatingBg = document.querySelector(".floating-bg");
        const photos = [];

        const animatePhoto = (photo) => {
            if (typeof window.gsap === "undefined") {
                return;
            }
            window.gsap.to(photo, {
                x: Math.random() * (window.innerWidth - 160),
                y: Math.random() * (window.innerHeight - 200),
                rotation: Math.random() * 180,
                duration: 20 + Math.random() * 10,
                ease: "sine.inOut",
                onComplete: () => animatePhoto(photo),
            });
        };

        if (floatingBg && typeof window.gsap !== "undefined") {
            for (let i = 0; i < 7; i += 1) {
                const photo = document.createElement("div");
                photo.className = "flying-photo";
                floatingBg.appendChild(photo);
                photos.push(photo);

                window.gsap.set(photo, {
                    x: Math.random() * window.innerWidth,
                    y: Math.random() * window.innerHeight,
                    rotation: Math.random() * 60 - 30,
                    scale: 0.8 + Math.random() * 0.5,
                    opacity: 0.5,
                });

                animatePhoto(photo);

                photo.addEventListener("mousedown", (event) => {
                    event.stopPropagation();
                    window.gsap.killTweensOf(photo);

                    const randomX = Math.random() * (window.innerWidth - 160);
                    const randomY = Math.random() * (window.innerHeight - 200);
                    const currentRot = window.gsap.getProperty(
                        photo,
                        "rotation",
                    );
                    const targetRot = currentRot + (Math.random() * 360 - 180);

                    window.gsap.to(photo, {
                        x: randomX,
                        y: randomY,
                        rotation: targetRot,
                        duration: 0.6,
                        ease: "power2.out",
                        onComplete: () => animatePhoto(photo),
                    });

                    window.gsap.fromTo(
                        photo,
                        { scale: 1.3 },
                        { scale: 1, duration: 0.4, ease: "back.out(2)" },
                    );
                });
            }
        }

        let keyboard = null;
        const inputElement = document.querySelector(".kiosk-input");
        const keyboardWrapper = document.querySelector(
            ".keyboard-wrapper-kiosk",
        );
        const errorDiv = document.getElementById("js-error-message");

        const showKeyboard = () => {
            if (keyboardWrapper) {
                keyboardWrapper.classList.add("show");
            }
            if (keyboard && inputElement) {
                keyboard.setInput(inputElement.value);
            }
        };

        const hideKeyboard = () => {
            if (keyboardWrapper) {
                keyboardWrapper.classList.remove("show");
            }
        };

        if (typeof window.SimpleKeyboard !== "undefined" && inputElement) {
            const Keyboard = window.SimpleKeyboard.default;
            keyboard = new Keyboard({
                onChange: (input) => {
                    inputElement.value = input.toUpperCase();
                    inputElement.dispatchEvent(new Event("input"));
                },
                onKeyPress: () => {
                    resetTimer();
                },
                preventMouseDownDefault: true,
                layout: {
                    default: [
                        "1 2 3 4 5 6 7 8 9 0 -",
                        "Q W E R T Y U I O P",
                        "A S D F G H J K L",
                        "Z X C V B N M {backspace}",
                    ],
                },
                display: {
                    "{backspace}": "⌫",
                },
            });

            let isUserInteracting = false;

            inputElement.addEventListener("mousedown", () => {
                isUserInteracting = true;
                showKeyboard();
            });

            inputElement.addEventListener("focus", () => {
                if (isUserInteracting) {
                    showKeyboard();
                }
                isUserInteracting = false;
            });

            inputElement.addEventListener("input", (event) => {
                keyboard.setInput(event.target.value);
                if (errorDiv) {
                    errorDiv.classList.add("d-none");
                    errorDiv.classList.remove("d-inline-block");
                }
            });

            const form = inputElement.closest("form");
            if (form) {
                form.noValidate = true;
                form.addEventListener("submit", (event) => {
                    if (!inputElement.value.trim()) {
                        event.preventDefault();
                        if (!errorDiv) {
                            return;
                        }
                        errorDiv.textContent = "Masukkan kode terlebih dahulu";
                        errorDiv.classList.remove("d-none");
                        errorDiv.classList.add("d-inline-block");
                        errorDiv.style.opacity = "1";

                        if (typeof window.gsap !== "undefined") {
                            window.gsap.fromTo(
                                errorDiv,
                                { x: -10 },
                                { x: 0, duration: 0.1, repeat: 5, yoyo: true },
                            );
                            window.setTimeout(() => {
                                window.gsap.to(errorDiv, {
                                    opacity: 0,
                                    duration: 0.5,
                                    onComplete: () => {
                                        errorDiv.classList.add("d-none");
                                        errorDiv.classList.remove(
                                            "d-inline-block",
                                        );
                                    },
                                });
                            }, 5000);
                        }
                    }
                });
            }

            document.querySelectorAll(".badge-error").forEach((errorBadge) => {
                if (typeof window.gsap !== "undefined") {
                    window.setTimeout(() => {
                        window.gsap.to(errorBadge, {
                            opacity: 0,
                            duration: 0.5,
                            onComplete: () => {
                                errorBadge.classList.add("d-none");
                            },
                        });
                    }, 5000);
                }
            });
        }

        const outsideHandler = (event) => {
            if (!inputElement || !keyboardWrapper) {
                return;
            }

            const isClickInside =
                inputElement.contains(event.target) ||
                keyboardWrapper.contains(event.target) ||
                event.target.closest(".swal2-container");

            if (!isClickInside) {
                hideKeyboard();
            }
        };

        document.addEventListener("mousedown", outsideHandler);

        return () => {
            activityEvents.forEach((eventName) => {
                document.removeEventListener(eventName, resetTimer, true);
            });
            if (idleTimer) {
                window.clearTimeout(idleTimer);
            }
            document.removeEventListener("mousedown", outsideHandler);
            photos.forEach((photo) => {
                photo.remove();
            });
            if (keyboard && keyboard.destroy) {
                keyboard.destroy();
            }
        };
    }, []);

    return null;
}
