import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Thumbs } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import "./Gallery.css";

import { Pagination } from 'swiper/modules';
import { getProductImage } from '../../utils/images';

interface GalleryProps {
  images: string[];
}

const Gallery = ({ images }: GalleryProps) => {
  const [thumbsSwiper] = React.useState(null);

  return (
    <div className="product-gallery">
      <Swiper
        pagination={ {
          type: 'bullets',
        } }
        spaceBetween={ 10 }
        navigation={ true }
        thumbs={ { swiper: thumbsSwiper } }
        modules={ [Navigation, Thumbs, Pagination] }
        className="main-slider"
      >
        { images.map((image: string, index: number) => (
          <SwiperSlide key={ index }>
            <img
              src={ getProductImage(image) }
              alt='Test alt'
            />
          </SwiperSlide>
        )) }
      </Swiper>

      {/* <Swiper
        onSwiper={ setThumbsSwiper }
        spaceBetween={ 10 }
        slidesPerView={ 6 }
        navigation={ true }
        freeMode={ true }
        watchSlidesProgress={ true }
        modules={ [Thumbs, Navigation] }
        className="thumbs-slider"
      >
        { images.map((image, index) => (
          <SwiperSlide key={ index }>
            <img
              src={ require(`../../assets/images/products${image}`) }
              alt={ `Thumbnail ${index}` }
            />
          </SwiperSlide>
        )) }
      </Swiper> */}
    </div>
  );
};

export default Gallery;
