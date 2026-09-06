import React, { useEffect, useRef } from 'react';

export const DropletBackground: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    // Clear previous children if any
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }

    // Generate 100 animated circles matching approved JS
    const count = 100;
    const width = window.innerWidth || 1200;
    const height = window.innerHeight || 800;

    for (let i = 0; i < count; i++) {
      const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      c.setAttribute('cx', String(Math.random() * width));
      c.setAttribute('cy', String(Math.random() * height));
      c.setAttribute('r', String(Math.random() * 3 + 1.2));
      c.setAttribute('class', 'drop');
      c.style.animationDuration = `${4 + Math.random() * 6}s`;
      c.style.animationDelay = `${-Math.random() * 8}s`;
      c.style.opacity = String(0.18 + Math.random() * 0.8);

      svg.appendChild(c);
    }
  }, []);

  return (
    <svg
      id="droplets"
      ref={svgRef}
      className="droplets"
      xmlns="http://www.w3.org/2000/svg"
    />
  );
};
