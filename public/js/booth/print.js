/**
 * Print Page Logic
 */

function initPrintProcess(orderCode, boothIndexUrl, printedUrl) {
    const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

    // Trigger print dialog after images are loaded
    window.addEventListener('load', function() {
        setTimeout(function() { 
            // Mark as printed immediately when dialog opens
            fetch(printedUrl, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'X-CSRF-TOKEN': csrfToken 
                },
            });
            window.print(); 
        }, 500);
    });

    // After printing, redirect automatically after 60 seconds (idle timeout)
    window.addEventListener('afterprint', function() {
        console.log('Printing initiated, redirecting in 1 minute if idle...');
        setTimeout(function() {
            window.location.href = boothIndexUrl;
        }, 60000);
    });
    
    // Failsafe: auto-exit after 60 seconds even if dialog was never closed
    setTimeout(function() { 
        window.location.href = boothIndexUrl; 
    }, 60000);
}
