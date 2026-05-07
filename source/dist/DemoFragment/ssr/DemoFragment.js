import { jsxs, jsx } from "react/jsx-runtime";
import { createElement, useState } from "react";
import { createRoot } from "react-dom/client";
const roots = /* @__PURE__ */ new Map();
const withHydration = (Component, mountId2) => {
  if (typeof document === "undefined") return Component;
  requestAnimationFrame(() => {
    const container = document.getElementById(mountId2);
    if (!container) return;
    const existing = roots.get(mountId2);
    if (existing) {
      existing.unmount();
      roots.delete(mountId2);
    }
    const dataScript = document.querySelector(
      `script[data-fragment-data][data-mount-id="${mountId2}"]`
    );
    const props = dataScript ? JSON.parse(dataScript.textContent || "null") : null;
    const root = createRoot(container);
    root.render(createElement(Component, props ?? {}));
    roots.set(mountId2, root);
  });
  return Component;
};
const rating = "rating_WrZ0i";
const title = "title_8Bmit";
const stars = "stars_SdMYl";
const star = "star_YkWW4";
const active = "active_aXtkZ";
const submit = "submit_2cy8h";
const styles = {
  rating,
  title,
  stars,
  star,
  active,
  submit
};
const getServerData = async () => {
  return null;
};
const TOTAL_STARS = 5;
const DemoFragment = () => {
  const [rating2, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const handleSubmit = () => {
    if (rating2 === 0) {
      alert("Please select a rating before submitting.");
      return;
    }
    alert("Rating submitted successfully");
  };
  return /* @__PURE__ */ jsxs("div", { className: styles.rating, children: [
    /* @__PURE__ */ jsx("h2", { className: styles.title, children: "Rate your experience" }),
    /* @__PURE__ */ jsx(
      "div",
      {
        className: styles.stars,
        onMouseLeave: () => setHovered(0),
        role: "radiogroup",
        "aria-label": "Rating",
        children: Array.from({ length: TOTAL_STARS }, (_, i) => {
          const value = i + 1;
          const active2 = value <= (hovered || rating2);
          return /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: `${styles.star} ${active2 ? styles.active : ""}`,
              onClick: () => setRating(value),
              onMouseEnter: () => setHovered(value),
              "aria-label": `${value} star${value > 1 ? "s" : ""}`,
              "aria-checked": rating2 === value,
              role: "radio",
              children: "★"
            },
            value
          );
        })
      }
    ),
    /* @__PURE__ */ jsx("button", { type: "button", className: styles.submit, onClick: handleSubmit, children: "Submit" })
  ] });
};
const mountId = "DemoFragment";
const DemoFragment_default = withHydration(DemoFragment, mountId);
export {
  DemoFragment_default as default,
  getServerData,
  mountId
};
