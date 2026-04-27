/**
 * Booth Settings Page Logic
 */

let currentMode = 'color';
let currentQty = 1;
let priceColor = 0;
let priceBw = 0;

function initSettings(pColor, pBw) {
    priceColor = pColor;
    priceBw = pBw;
    updateTotal();
}

function selectMode(mode) {
    currentMode = mode;
    const modeInput = document.getElementById('printMode');
    if (modeInput) modeInput.value = mode;

    document.querySelectorAll('.mode-card').forEach(c => c.classList.remove('selected'));
    const selectedCard = document.querySelector(`.mode-card[data-mode="${mode}"]`);
    if (selectedCard) selectedCard.classList.add('selected');

    updateTotal();
}

function changeQty(delta) {
    currentQty = Math.min(10, Math.max(1, currentQty + delta));
    const qtyInput = document.getElementById('printQty');
    const qtyDisplay = document.getElementById('qtyDisplay');
    
    if (qtyInput) qtyInput.value = currentQty;
    if (qtyDisplay) qtyDisplay.textContent = currentQty;
    
    updateTotal();
}

function updateTotal() {
    const price = currentMode === 'color' ? priceColor : priceBw;
    const total = price * currentQty;
    const totalDisplay = document.getElementById('totalDisplay');
    if (totalDisplay) {
        totalDisplay.textContent = 'Rp ' + total.toLocaleString('id-ID');
    }
}
