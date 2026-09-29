import { Box, Button, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import './FeaturedItemDouble.css'

export default function FeaturedItemDouble() {
  return (
    <Box className='Featured-Item-Three'>
      <Box className='Featured-Item-Three-Image-Container'></Box>
      <Box className='Featured-Item-Three-Info'>
        <Typography variant='h4'>
          YX1 EARPHONES
        </Typography>
        <Link to={ `/article/e-01` }>
          <Button variant="outlined">See Product</Button>
        </Link>
      </Box>
    </Box>
  )
}
