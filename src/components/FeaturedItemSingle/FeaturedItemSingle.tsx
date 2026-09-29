import { Box, Button, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import './FeaturedItemSingle.css'
import { getImage } from '../../utils/images'

interface FeaturedItemSingleProps {
  src: string;
  name: string;
}

export default function FeaturedItemSingle({ src, name }: FeaturedItemSingleProps) {
  const image = getImage(`/${src}`);
  return (
    <Box className='FeaturedItemTwo' style={ { backgroundImage: `url(${image})` } }>
      <Box>
        <Typography variant='h4'>
          { name }
        </Typography>
        <Link to={ `/article/s-02` }>
          <Button variant="outlined">See Product</Button>
        </Link>
      </Box>
    </Box>
  )
}
