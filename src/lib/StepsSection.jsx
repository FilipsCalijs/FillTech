import React, { useState, useEffect } from "react";
import { Typography } from "@/components/ui/Typography";
import { Card, CardContent } from "@/components/ui/Card";

const StepsSection = ({ steps = [], images = [], autoInterval = 3000, title }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!images.length) return;
    const interval = setInterval(() => {
      setActiveIndex(i => (i === images.length - 1 ? 0 : i + 1));
    }, autoInterval);
    return () => clearInterval(interval);
  }, [images.length, autoInterval]);

  return (
    <div className="w-full max-w-[1440px] px-4">
      <Typography variant="h1" weight="semibold">{title || "How it's work?"}</Typography>
      <div className="flex flex-col md:flex-row gap-12 items-start md:items-center">
        

        {/* LEFT - Steps */}
        <div className="flex-1 flex flex-col gap-5 w-full">
          {steps.map((step, index) => (
            <Card
              bordered="disable"
              key={index}
              className={`rounded-2xl transition-all duration-300 ${
                activeIndex === index
                  ? "border-primary shadow-md"
                  : "opacity-60"
              }`}
            >
              <CardContent className="p-0 flex flex-col gap-1.5">
                <Typography variant="h4" weight="semibold">
                  {step.title}
                </Typography>
                <Typography variant="body1">
                  {step.description}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* RIGHT - Image */}
        <div className="flex-1 w-full max-w-[520px]">
          <div className="relative w-full overflow-hidden rounded-xl" style={{ aspectRatio: "4 / 3" }}>
            {images.map((src, i) => (
              <img
                key={src}
                src={src}
                alt={`step ${i + 1}`}
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
                style={{ opacity: i === activeIndex ? 1 : 0 }}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default StepsSection;