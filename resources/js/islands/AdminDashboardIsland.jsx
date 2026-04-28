import { useEffect } from "react";

export default function AdminDashboardIsland() {
    useEffect(() => {
        window.setGroupBy = (type) => {
            const input = document.getElementById("groupByInput");
            const form = document.getElementById("filterForm");
            if (input && form) {
                input.value = type;
                form.submit();
            }
        };

        if (typeof window.flatpickr !== "undefined") {
            window.flatpickr("#monthPicker", {
                altInput: true,
                altFormat: "F Y",
                altInputClass: "form-input",
                plugins: [
                    new window.monthSelectPlugin({
                        shorthand: true,
                        dateFormat: "Y-m",
                        theme: "light",
                    }),
                ],
                onChange: () => {
                    const form = document.getElementById("filterForm");
                    if (form) {
                        form.submit();
                    }
                },
            });
        }

        let refreshInterval = null;
        if (typeof window.setupAdminAutoRefresh === "function") {
            refreshInterval = window.setupAdminAutoRefresh(15000);
        }

        return () => {
            if (refreshInterval) {
                window.clearInterval(refreshInterval);
            }
            delete window.setGroupBy;
        };
    }, []);

    return null;
}
