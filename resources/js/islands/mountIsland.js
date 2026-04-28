import React from "react";
import { createRoot } from "react-dom/client";

export function mountIsland(element, Component) {
    const rawProps = element.getAttribute("data-props");
    let props = {};

    if (rawProps) {
        try {
            props = JSON.parse(rawProps);
        } catch (error) {
            console.error("Invalid island props JSON:", error);
        }
    }

    const root = createRoot(element);
    root.render(React.createElement(Component, props));

    return root;
}
