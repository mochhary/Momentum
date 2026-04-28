import { useEffect, useState } from "react";

export default function BoothSettingsIsland({ priceColor = 0, priceBw = 0 }) {
    const [mode, setMode] = useState("color");
    const [qty, setQty] = useState(1);

    useEffect(() => {
        const syncDom = () => {
            const modeInput = document.getElementById("printMode");
            const qtyInput = document.getElementById("printQty");
            const qtyDisplay = document.getElementById("qtyDisplay");
            const totalDisplay = document.getElementById("totalDisplay");

            if (modeInput) {
                modeInput.value = mode;
            }

            if (qtyInput) {
                qtyInput.value = String(qty);
            }

            if (qtyDisplay) {
                qtyDisplay.textContent = String(qty);
            }

            const price =
                mode === "color" ? Number(priceColor) : Number(priceBw);
            const total = price * qty;
            if (totalDisplay) {
                totalDisplay.textContent = `Rp ${total.toLocaleString("id-ID")}`;
            }

            document.querySelectorAll(".mode-card").forEach((card) => {
                card.classList.remove("selected");
            });

            const selectedCard = document.querySelector(
                `.mode-card[data-mode="${mode}"]`,
            );
            if (selectedCard) {
                selectedCard.classList.add("selected");
            }
        };

        syncDom();

        window.selectMode = (nextMode) => {
            setMode(nextMode === "bw" ? "bw" : "color");
        };

        window.changeQty = (delta) => {
            const nextQty = Math.min(10, Math.max(1, qty + Number(delta || 0)));
            setQty(nextQty);
        };

        return () => {
            delete window.selectMode;
            delete window.changeQty;
        };
    }, [mode, qty, priceColor, priceBw]);

    return null;
}
