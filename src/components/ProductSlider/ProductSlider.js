import React from 'react';
import { Box, Typography } from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css/pagination';
import 'swiper/css';
import './ProductSlider.css';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/utils';

export default function ProductSlider({ products }) {
  return (
    <div className='Product-Slider-Container'>
      <Swiper
        // loop={ true}
        pagination={ {
          type: 'progressbar',
        } }
        modules={ [Pagination] }
        spaceBetween={ 30 }
        slidesPerView={ 3 }
        breakpoints={ {
          1600: {
            slidesPerView: 5,
          },
          1200: {
            slidesPerView: 4,
          },
          900: {
            slidesPerView: 3,
          },
          650: {
            slidesPerView: 2,
          },
          0: {
            slidesPerView: 1,
          },
        } }
        className="Product-Slider-Swiper"
      >
        { products.map(item => {
          const image = require(`../../assets/images/products${item.images.main}`);
          return (
            <SwiperSlide key={ item.id } className='Product-Slider-Slide'>
              <Link to={ `/article/${item.id}` } className="Product-Slider-Link">
                <Box className="Product-Slider-Image" style={ { backgroundImage: `url(${image})` } }>
                </Box>
                <Box className='Product-Slider-Info-Container'>
                  <Typography variant='p' className="Product-Slider-Info">{ item.title }</Typography>
                  <Typography variant='p' className="Product-Slider-Info">{ formatCurrency(item.price) }</Typography>
                </Box>
              </Link>
            </SwiperSlide>
          )
        })}
      </Swiper>
    </div>
  );
}

// Link to={ `/article/${item.id}` }