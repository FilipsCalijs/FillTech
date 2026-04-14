import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { Upload } from "@/components/ui/upload";
import OtherProducts from "@/lib/OtherProducts";
import BeforeAfterSlider from "@/lib/BeforeAfterSlider";
import CardLeftImage from "@/lib/CardLeftImage";
import CardRightImage from "@/lib/CardRightImage";
import StepsSection from "@/lib/StepsSection";
import Result from "@/lib/Result";
import { useToolProcessor } from "@/hooks/useToolProcessor";

const WatermarkRemover = () => {
  const { file, previewUrl, loading, resultUrl, error, handleFileDrop, handleSubmit } = useToolProcessor('watermark-remove');

  return (
    <div className="py-8 md:py-12 flex flex-col items-center gap-12">

      {/* HERO */}
      <div className="w-full max-w-[1280px] px-4">
        <Card className="flex flex-col md:flex-row rounded-xl overflow-hidden">

          {/* Left */}
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div>
              <CardHeader className="p-0 mb-4 text-center md:text-left">
                <CardTitle>
                  <Typography variant="h2" weight="semibold">
                    Hello <span className="gradient-text">World</span>! Watermark Remover
                  </Typography>
                  <br/>
                  <Typography variant="body1" className="mt-2">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  </Typography>
                </CardTitle>
              </CardHeader>

              <CardContent className="p-0">
                <Upload
                  margin="my"
                  onFileDrop={handleFileDrop}
                  className="w-full h-48 md:h-64"
                />
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              </CardContent>
            </div>

            <CardFooter className="p-0 mt-4">
              <Button
                size="md"
                className="w-full"
                onClick={handleSubmit}
                disabled={loading || !file}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Processing...
                  </span>
                ) : 'Try It Now'}
              </Button>
            </CardFooter>
          </div>

          {/* Right Image */}
          <div className=" hidden sm:block">
            <img
              src="/public/watermark-remover/watermark.avif"
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>

        </Card>
      </div>

      {/* RESULT */}
      <Result
        isVisible={!!resultUrl}
        originalImage={previewUrl}
        removedImage={resultUrl}
      />

      
      <StepsSection
        steps={[
          { title: "1. Upload photo with watermarks or logo", description: "Drag & drop the image into the text field at the top of Dewatermark website or choose a file from your device by tapping on “Upload”" },
          { title: "2. Remove watermarks with AI algorithm", description: "Dewatermark' AI Watermark Remover scan your image and then runs watermark detection algorithms. It takes seconds to detects and automatically removes watermarks from your photo without blur." },
          { title: "3. Download cleaned photo in HD", description: "Finally, you just have to download your photo in HD quality after removing watermarks" }
        ]}
        images={[
          "/watermark-remover/before.webp",
          "/watermark-remover/before.webp",
          "/watermark-remover/after.webp"
        ]}
      />

      

      {/* HOW TO USE */}
      <div className="w-full max-w-[1280px] px-4">
        <Card bordered="lg" className="flex flex-col md:flex-row rounded-xl overflow-hidden">

          <CardContent className="flex-1 p-6 flex flex-col gap-6 text-center md:text-left">
            <div>
              <Typography variant="h3" weight="semibold">
                How to use
              </Typography>
              <Typography variant="body1" className="mt-2">
                Пошаговая инструкция слева, справа ползунок.
              </Typography>
            </div>

            <div>
              <Typography variant="h3" weight="semibold">
                Почему нас
              </Typography>
              <Typography variant="body1" className="mt-2">
                3 блока: почему мы, справа, слева и снова справа.
              </Typography>
            </div>

            <div>
              <Typography variant="h3" weight="semibold">
                FAQ & отзывы
              </Typography>
              <Typography variant="body1" className="mt-2">
                Просто по хорошему.
              </Typography>
            </div>
          </CardContent>

          <div className="w-full md:w-1/2 h-64 md:min-h-[441px] p-4 flex justify-center items-center">
            <BeforeAfterSlider
              beforeImage="/watermark-remover/before.webp"
              afterImage="/watermark-remover/after.webp"
              width={620}
              height={441}
              autoAnimate={true}
            />
          </div>

        </Card>
      </div>

      {/* WHY US */}
      <div className="flex flex-col items-center gap-12 w-full px-4">
        
        <OtherProducts />
        <div className="w-full max-w-[1280px] flex flex-col gap-12">
          <CardLeftImage
            title="Преимущество 1"
            text="Сервис быстрый и простой — загрузите фото и получите результат."
            imageUrl="/watermark-remover/watermak_3_before_after.webp"
            alt="Преимущество 1"
          />
          <CardRightImage
            title="Преимущество 2"
            text="Автоматическая обработка изображения без потери качества."
            imageUrl="https://placekitten.com/600/400"
            alt="Преимущество 2"
          />
          <CardLeftImage
            title="Преимущество 3"
            text="Интуитивный интерфейс, выполнение задач без обучения."
            imageUrl="https://placedog.net/600/400"
            alt="Преимущество 3"
          />
          <CardRightImage
            title="Преимущество 4"
            text="Гарантия безопасности и конфиденциальности данных."
            imageUrl="https://tmpimg.net/600x400"
            alt="Преимущество 4"
          />
        </div>
      </div>

    </div>
  );
};

export default WatermarkRemover;