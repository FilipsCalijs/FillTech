import { useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Typography } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";

const zoom = 2;
const lensSize = 30;
const zoomWindowSize = 150;

const MagnifierImage = ({ src }) => {
  const containerRef = useRef(null);
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [show, setShow] = useState(false);

  const handleMouseMove = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    let x = Math.max(lensSize / 2, Math.min(e.clientX - rect.left, imgSize.width - lensSize / 2));
    let y = Math.max(lensSize / 2, Math.min(e.clientY - rect.top, imgSize.height - lensSize / 2));
    setPosition({ x, y });
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[250px] overflow-hidden rounded-xl"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onMouseMove={handleMouseMove}
    >
      <img
        src={src}
        alt="preview"
        onLoad={(e) => setImgSize({ width: e.target.offsetWidth, height: e.target.offsetHeight })}
        className="w-full h-full object-cover"
      />
      {show && (
        <>
          <div style={{
            position: "absolute",
            width: lensSize, height: lensSize,
            top: position.y - lensSize / 2, left: position.x - lensSize / 2,
            border: "2px solid lightgray",
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute",
            top: 20, right: 20,
            width: zoomWindowSize, height: zoomWindowSize,
            border: "1px solid lightgray",
            backgroundImage: `url(${src})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: `${imgSize.width * zoom}px ${imgSize.height * zoom}px`,
            backgroundPosition: `-${position.x * zoom - zoomWindowSize / 2}px -${position.y * zoom - zoomWindowSize / 2}px`,
            pointerEvents: "none",
            zIndex: 999,
          }} />
        </>
      )}
    </div>
  );
};

const Result = ({ isVisible, originalImage, removedImage }) => {
  if (!isVisible) return null;

  return (
    <div className="w-full max-w-[1280px] px-4 mt-8">
      <Card className="rounded-xl overflow-hidden">
        <CardContent className="p-6 flex flex-col gap-8">
          <div>
            <Typography variant="h2" weight="semibold">Result</Typography>
            <Typography variant="body1" className="mt-2">
              Compare the original image with the watermark removed version.
            </Typography>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 flex flex-col items-center">
              <Typography variant="h3" weight="semibold" className="mb-2">Original</Typography>
              <MagnifierImage src={originalImage} />
            </div>
            <div className="flex-1 flex flex-col items-center">
              <Typography variant="h3" weight="semibold" className="mb-2">Watermark Removed</Typography>
              <MagnifierImage src={removedImage} />
            </div>
          </div>

          <div className="pt-4">
            <Button
              size="md"
              className="w-full md:w-auto"
              onClick={() => window.open(removedImage, '_blank')}
            >
              Download
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Result;
