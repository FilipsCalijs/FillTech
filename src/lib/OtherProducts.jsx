import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Typography } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import { products } from "@/config/products.config";

const AUTO_INTERVAL = 5000;

const OtherProducts = () => {
  const [index, setIndex] = useState(0);
  const maxIndex = Math.max(products.length - 3, 0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, AUTO_INTERVAL);

    return () => clearInterval(interval);
  }, [maxIndex]);

  return (
    <div className="w-full max-w-[1280px] px-4">
      <div className="flex flex-col items-center gap-4">

        <Typography variant="h1" weight="semibold" className="text-center">
          Try Our Other Products
        </Typography>

        {/* Carousel */}
        <div className="relative w-full overflow-hidden">
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{
              transform: `translateX(-${index * (100 / 3)}%)`,
            }}
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="w-full md:w-1/3 flex-shrink-0 px-4"
              >
                <div
                  className={`p-[2px] rounded-xl bg-gradient-to-r ${product.gradient}`}
                >
                  <Card
                    bordered="disable"
                    className="rounded-xl bg-card text-card-foreground h-[400px]"
                  >
                    <CardContent className="p-8 flex flex-col items-center text-center gap-6 h-full">

                      <Typography variant="h3" weight="semibold">
                        {product.title}
                      </Typography>

                      <Typography
                        variant="body1"
                        className="opacity-80 flex-grow"
                      >
                        {product.description}
                      </Typography>

                      <Button
                        className={`bg-gradient-to-r ${product.gradient} text-white border-0 w-full`}
                        onClick={() => console.log(product.id)}
                      >
                        {product.buttonText}
                      </Button>

                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ultra small gold dots */}
        <div className="flex gap-2 mt-3 items-center justify-center">
          {Array.from({ length: maxIndex + 1 }).map((_, dotIndex) => (
            <button
              key={dotIndex}
              onClick={() => setIndex(dotIndex)}
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: "#facc15",
                opacity: index === dotIndex ? 1 : 0.25,
                padding: 0,
                border: "none",
              }}
            />
          ))}
        </div>

      </div>
    </div>
  );
};

export default OtherProducts;