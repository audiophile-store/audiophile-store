import { Box, Grid, IconButton, Typography } from '@mui/material'
import Logo from '../../assets/icons/logo.svg'
import FacebookIcon from '@mui/icons-material/Facebook';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';
import './Footer.css'
import NavigationItems from '../navbar/NavigationItems/NavigationItems';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <Box className='Footer'>
      <Grid container spacing={2} alignItems='center'>
        <Grid xl={ 6 } sm={ 3 } xs={ 12 } item textAlign={{ xs: 'center', sm: 'left' }}>
          <IconButton size="small">
            <img src={ Logo } alt='Audiophile' />
          </IconButton>
        </Grid>
        <Grid xl={ 6 } sm={9} xs={12} item>
          <NavigationItems calledInFooter={true} />
        </Grid>
      </Grid>
      <Grid container spacing={ 2 } className='Footer-Bottom'>
        <Grid className='Footer-Description-Container' xl={ 6 } sm={12} xs={12} item>
          <Typography variant='body1' color='secondary' className='Footer-Description'>
            This e-commerce application was developed by Stefan Rakonjac as a demonstration
            of modern web development capabilities. Built with React, Redux, and Material-UI,
            it showcases a complete shopping experience with real-world features including
            cart management, checkout flow, and responsive design.
            <br />
            <br />
            This is a portfolio project demonstrating technical skills and can be extended
            into a full-featured production-ready platform.
          </Typography>
        </Grid>
        <Grid xl={12} sm={6} xs={12} item>
          <Typography variant='body1' color='secondary' className='Footer-Copyright'>
            © 2025 Stefan Rakonjac. All Rights Reserved.
          </Typography>
        </Grid>
        <Grid xl={ 12 } sm={6} xs={12} item>
          <Box display='flex' justifyContent={{ xs: 'center', sm: 'right'}} gap={2} className='Social-Icons'>
            <Link to='https://www.facebook.com/rakoniac' target='_blank'>
              <FacebookIcon className='Footer-Social-Icon' color='secondary' />
            </Link>
            <Link to='https://www.linkedin.com/in/stefan-rakonjac-566304184/' target='_blank'>
              <LinkedInIcon className='Footer-Social-Icon' color='secondary' />
            </Link>
           <Link to='https://www.instagram.com/cika_rale/' target='_blank'>
              <InstagramIcon className='Footer-Social-Icon' color='secondary' />           
           </Link>
          </Box>
        </Grid>
       </Grid>
     </Box>
  )
}
