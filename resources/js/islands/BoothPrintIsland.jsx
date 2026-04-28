import { useEffect } from "react";

export default function BoothPrintIsland({
    boothIndexUrl = "",
    printedUrl = "",
}) {
    useEffect(() => {
        const csrfToken = document.querySelector(
            'meta[name="csrf-token"]',
        )?.content;

        const loadHandler = () => {
            window.setTimeout(() => {
                if (printedUrl) {
                    fetch(printedUrl, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "X-CSRF-TOKEN": csrfToken || "",
                        },
                    }).catch(() => {});
                }

                window.print();
            }, 500);
        };

        const afterPrintHandler = () => {
            window.setTimeout(() => {
                if (boothIndexUrl) {
                    window.location.href = boothIndexUrl;
                }
            }, 60000);
        };

        window.addEventListener("load", loadHandler);
        window.addEventListener("afterprint", afterPrintHandler);

        const fallbackTimeout = window.setTimeout(() => {
            if (boothIndexUrl) {
                window.location.href = boothIndexUrl;
            }
        }, 60000);

        return () => {
            window.removeEventListener("load", loadHandler);
            window.removeEventListener("afterprint", afterPrintHandler);
            window.clearTimeout(fallbackTimeout);
        };
    }, [boothIndexUrl, printedUrl]);

    return null;
}
