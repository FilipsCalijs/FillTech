import { useState, useRef, useEffect } from "react";

export default function BeforeAfterSlider({
  beforeImage,
  afterImage,
  width = 640,
  height = 360,
  autoAnimate = true,
  autoSpeed = 0.3,    // авто движение % за кадр
  smoothFactor = 0.08 // lerp для плавности
}) {
  const [position, setPosition] = useState(50);
  const targetPos = useRef(50);
  const containerRef = useRef(null);
  const isHovering = useRef(false);
  const direction = useRef(1);
  const animationRef = useRef(null);

  // Авто-анимация target
  useEffect(() => {
    if (!autoAnimate) return;

    const animate = () => {
      if (!isHovering.current) {
        targetPos.current += direction.current * autoSpeed;
        if (targetPos.current >= 100) {
          targetPos.current = 100;
          direction.current = -1;
        } else if (targetPos.current <= 0) {
          targetPos.current = 0;
          direction.current = 1;
        }
      }

      // Лерп к targetPos
      setPosition((pos) => pos + (targetPos.current - pos) * smoothFactor);

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationRef.current);
  }, [autoAnimate, autoSpeed, smoothFactor]);

  // Hover → плавно к мышке
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const percent = ((e.clientX - rect.left) / rect.width) * 100;
    targetPos.current = Math.min(100, Math.max(0, percent));
  };

  const handleTouchMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const percent = ((e.touches[0].clientX - rect.left) / rect.width) * 100;
    targetPos.current = Math.min(100, Math.max(0, percent));
  };

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-lg border border-border cursor-ew-resize select-none bg-card"
      style={{ width, height }}
      onMouseEnter={() => (isHovering.current = true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => (isHovering.current = false)}
      onTouchStart={() => (isHovering.current = true)}
      onTouchMove={handleTouchMove}
      onTouchEnd={() => (isHovering.current = false)}
    >
      {/* AFTER */}
      <img src={afterImage} alt="after" className="w-full h-full object-cover" />

      {/* BEFORE overlay */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <img src={beforeImage} alt="before" className="w-full h-full object-cover" />
      </div>

      {/* Divider */}
      <div
        className="absolute top-0 h-full w-[2px] bg-primary"
        style={{ left: `${position}%` }}
      />
    </div>
  );
}