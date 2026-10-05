import { useState } from 'react';
import type { Swiper as SwiperInstance } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import './Gallery.css';

import { getProductImage } from '../../utils/images';

interface GalleryProps {
  images: string[];
  title?: string;
}

const Gallery = ({ images, title = 'Product' }: GalleryProps) => {
  const [swiper, setSwiper] = useState<SwiperInstance | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="product-gallery">
      <Swiper
        onSwiper={setSwiper}
        onSlideChange={(instance) => setActiveIndex(instance.activeIndex)}
        spaceBetween={10}
        navigation={images.length > 1}
        modules={[Navigation]}
        className="main-slider"
      >
        {images.map((image: string, index: number) => (
          <SwiperSlide key={index}>
            <img src={getProductImage(image)} alt={`${title}, view ${index + 1}`} />
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="Gallery-Thumbnails" aria-label="Product images">
        {images.map((image, index) => (
          <button key={index} type="button" className="Gallery-Thumbnail" aria-label={`Show image ${index + 1}`} aria-pressed={activeIndex === index} onClick={() => swiper?.slideTo(index)}>
            <img src={getProductImage(image)} alt="" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default Gallery;
