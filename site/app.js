const motionAllowed = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (motionAllowed) {
  const layers = document.querySelectorAll("[data-depth]");

  window.addEventListener("pointermove", (event) => {
    const x = (event.clientX / window.innerWidth - 0.5) * 2;
    const y = (event.clientY / window.innerHeight - 0.5) * 2;

    layers.forEach((layer) => {
      const depth = Number(layer.getAttribute("data-depth")) || 0;
      layer.style.transform = `translate3d(${x * depth * 24}px, ${y * depth * 24}px, 0)`;
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.animate(
            [
              { opacity: 0, transform: "translateY(18px)" },
              { opacity: 1, transform: "translateY(0)" }
            ],
            { duration: 650, easing: "cubic-bezier(.2,.8,.2,1)", fill: "forwards" }
          );
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  document
    .querySelectorAll(".feature-card, .manifesto-card, .code-card, .launch-card, .metric, .stat")
    .forEach((node) => {
      node.style.opacity = "0";
      observer.observe(node);
    });
}
