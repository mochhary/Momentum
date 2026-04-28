import { mountIsland } from "./mountIsland";
import GlobalAppIsland from "./GlobalAppIsland";
import BoothSettingsIsland from "./BoothSettingsIsland";
import BoothIndexIsland from "./BoothIndexIsland";
import BoothPaymentIsland from "./BoothPaymentIsland";
import BoothPrintIsland from "./BoothPrintIsland";
import AdminLoginIsland from "./AdminLoginIsland";
import AdminDashboardIsland from "./AdminDashboardIsland";
import AdminFramesIsland from "./AdminFramesIsland";
import UploadEditorIsland from "./UploadEditorIsland";

const registry = {
    GlobalApp: GlobalAppIsland,
    BoothSettings: BoothSettingsIsland,
    BoothIndex: BoothIndexIsland,
    BoothPayment: BoothPaymentIsland,
    BoothPrint: BoothPrintIsland,
    AdminLogin: AdminLoginIsland,
    AdminDashboard: AdminDashboardIsland,
    AdminFrames: AdminFramesIsland,
    UploadEditor: UploadEditorIsland,
};

export function mountIslands() {
    document.querySelectorAll("[data-island]").forEach((element) => {
        const islandName = element.getAttribute("data-island");
        const Component = registry[islandName];

        if (!Component) {
            return;
        }

        mountIsland(element, Component);
    });
}
