import { Box, Button, Grid, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import './Promoted.css'


export default function Promoted() {
  return (
    <Box width='100%'>
        <Grid
          className='Promoted'
          container
          >
          <Grid xl={ 6 } lg={ 6 } md={ 12 } item  className='Promoted-Info'>
          <Typography className='New-Product' variant='inherit' color='secondary' fontSize='14px'>
            AUDIOPHILE
          </Typography>
          <Box className='Promoted-Info-Text'>
              <Typography variant='h4' color='secondary' fontSize='15px'>
                Hear Every Detail.<br /> Feel Every Moment.
              </Typography>
              <Typography className='Promoted-Info-Paragraph' variant='body1' color='secondary'>
                Crafted for audiophiles who demand purity, depth, and uncompromising sound performance.<br />
                Experience every nuance with precision-tuned drivers, premium materials, and engineering built to deliver a truly immersive listening environment.
              </Typography>
          </Box>
          <Link to='/products'>
            <Button variant="contained">
              BROWSE PRODUCTS
            </Button>
          </Link>
        </Grid>
          <Grid xl={ 6 } lg={ 6 } md={ 12 } item className='Home-Header-Image-Container'></Grid>
      </Grid>
    </Box>
  )
}
