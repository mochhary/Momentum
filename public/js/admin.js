/**
 * Admin Dashboard Logic
 */

function setGroupBy(type) {
    const input = document.getElementById('groupByInput');
    const form = document.getElementById('filterForm');
    if (input && form) {
        input.value = type;
        form.submit();
    }
}

function initAdminDashboard() {
    if (typeof flatpickr !== 'undefined') {
        flatpickr("#monthPicker", {
            altInput: true,
            altFormat: "F Y",
            altInputClass: "form-input",
            plugins: [
                new monthSelectPlugin({
                    shorthand: true,
                    dateFormat: "Y-m",
                    theme: "light"
                })
            ],
            onChange: function(selectedDates, dateStr, instance) {
                const form = document.getElementById('filterForm');
                if (form) form.submit();
            }
        });
    }

    if (typeof setupAdminAutoRefresh === 'function') {
        setupAdminAutoRefresh(15000);
    }
}
