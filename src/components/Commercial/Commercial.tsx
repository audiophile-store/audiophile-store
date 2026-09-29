import { Box, Typography } from '@mui/material'
import './Commercial.css'

export default function Commercial() {
  return (
    <Box className='Commercial'>
      <Box className='Commercial-Info'>
        <Typography variant='h4'>
          Bringing you the <Box component="span">best</Box> audio gear
        </Typography>
        <Typography variant='body1'>
          Located at the heart of New York City, Audiophile is the premier store for high end headphones, earphones, speakers, and audio accessories. We have a large showroom and luxury demonstration rooms available for you to browse and experience a wide range of our products. Stop by our store to meet some of the fantastic people who make Audiophile the best place to buy your portable audio equipment.
        </Typography>
      </Box>
      <Box className='Commercial-Image'></Box>
    </Box>
  )
}
