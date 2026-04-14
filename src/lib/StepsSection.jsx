import React, { useState, useEffect } from "react";
import { Typography } from "@/components/ui/Typography";
import { Card, CardContent } from "@/components/ui/Card";

const StepsSection = ({ steps = [], images = [], autoInterval = 3000 }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [animatingIndex, setAnimatingIndex] = useState(null);

  useEffect(() => {
    if (!images.length) return;

    const interval = setInterval(() => {
      const next =
        activeIndex === images.length - 1 ? 0 : activeIndex + 1;

      setAnimatingIndex(next);

      setTimeout(() => {
        setActiveIndex(next);
        setAnimatingIndex(null);
      }, 700);
    }, autoInterval);

    return () => clearInterval(interval);
  }, [activeIndex, images.length, autoInterval]);

  return (
    <div className="w-full max-w-[1280px] px-4">
      <Typography variant="h1" weight="semibold">How it's work?</Typography>
      <div className="flex flex-col md:flex-row gap-12 items-start md:items-center">
        

        {/* LEFT — Steps */}
        <div className="flex-1 flex flex-col gap-6 w-full">
          {steps.map((step, index) => (
            <Card
              bordered="disable"
              key={index}
              className={`transition-all duration-300 ${
                activeIndex === index
                  ? "border-primary shadow-md"
                  : "opacity-60"
              }`}
            >
              <CardContent className="p-6">
                <Typography variant="h4" weight="semibold">
                  {step.title}
                </Typography>
                <br/>
                <Typography variant="body1" className="mt-2">
                  {step.description}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* RIGHT — Image */}
        <div className="flex-1 w-full max-w-[520px]">
          <div
            className="relative w-full overflow-hidden rounded-xl "
            style={{ aspectRatio: "4 / 3" }}
          >

            {/* Current image */}
            <img
              src={images[activeIndex]}
              alt="current"
              className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-in-out ${
                animatingIndex !== null ? "-translate-y-full" : "translate-y-0"
              }`}
            />

            {/* Incoming image */}
            {animatingIndex !== null && (
              <img
                src={images[animatingIndex]}
                alt="next"
                className="absolute inset-0 w-full h-full object-cover translate-y-full transition-transform duration-700 ease-in-out"
                style={{
                  transform:
                    animatingIndex !== null
                      ? "translateY(0)"
                      : "translateY(100%)",
                }}
              />
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default StepsSection;