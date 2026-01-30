"use client";

import ReactSlider from "react-slick";
import { useRef, useState } from "react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  images: string[];
  title?: string;
  subtitle?: string;
}

export function Slider({ images, title, subtitle }: Props) {
  let sliderRef: any = useRef(null);
  const [current, setCurrent] = useState(0);
  const next = (p: any) => {
    sliderRef.slickNext();
  };
  const previous = (p: any) => {
    sliderRef.slickPrev();
  };
  const sliderSettings = {
    dots: false,
    arrows: false,
    infinite: true,
    focusOnSelect: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    beforeChange: (prev: number, current: number) => setCurrent(current),
  };

  return (
    <div className="w-full h-full flex overflow-hidden rounded-[8px] relative">
      <div className={` w-full h-full relative slider`}>
        <ReactSlider
          {...sliderSettings}
          ref={(slider: any) => {
            sliderRef = slider;
          }}
        >
          {images.map((image, index) => (
            <div key={index} className="h-full outline-none">
              <img src={image} className="block h-full w-full object-cover" />
            </div>
          ))}
        </ReactSlider>
      </div>

      <div
        className={` absolute flex justify-center items-center w-full h-full px-[48px] flex-col`}
      >
        {title && (
          <p className="font-primary font-medium text-[32px] lg:text-[40px] xl:text-[48px] text-white-100 uppercase  text-center">
            {title}
          </p>
        )}

        {/* <p className="font-primary font-extralight text-[8px] lg:text-[10px] xl:text-[12px] text-white-50 uppercase  text-center pt-3">
					{subtitle}
				</p> */}
      </div>

      <div className="w-full flex absolute text-white-60 uppercase px-[48px] justify-between bottom-[50px]">
        <div
          className={` group hover:text-accent cursor-pointer flex items-center`}
          onClick={previous}
        >
          <ChevronLeft size={16} />
          <span className="pl-3 text-[12px]">Previous</span>
        </div>

        <div className="bg-white/10 rounded-[80pc] flex p-[4px] justify-center items-center">
          {images.map((image, index) => (
            <div
              key={index}
              className={`${
                current === index
                  ? "w-[26px] rounded-[17px] bg-accent"
                  : "w-[6px] rounded-full bg-white/30"
              } h-[6px] mx-[3px] transition-all duration-500`}
            ></div>
          ))}
        </div>

        <div
          className={` group hover:text-accent cursor-pointer flex items-center`}
          onClick={next}
        >
          <span className="pr-3 text-[12px]">next</span>
          <ChevronRight size={16} />
        </div>
      </div>
    </div>
  );
}
