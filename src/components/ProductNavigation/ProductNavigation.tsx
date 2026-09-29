import { Grid } from '@mui/material'
import Headphones from '../../assets/images/headphones.png'
import Speakers from '../../assets/images/speakers.png'
import Earphones from '../../assets/images/earphones.png'
import NavItem from './navItems/NavItem'

export default function ProductNavigation() {
  return (
    <Grid container spacing={ 10 } wrap="wrap" marginBottom='40px'>
        <Grid xl={4} lg={4} md={12} sm={12} xs={12} item>
          <NavItem
            path='/headphones'
            title='HEADPHONES'
            icon={ Headphones }
            info='Explore our collection of high-quality headphones that deliver exceptional sound, offering you an immersive listening experience like never before.'
            />
        </Grid>
        <Grid xl={4} lg={4} md={12} sm={12} xs={12} item>
          <NavItem
            path='/speakers'
            title='SPEAKERS'
            icon={ Speakers }
            info="Experience crystal-clear sound with our speakers. From home theaters to parties, our speakers deliver rich, immersive audio."
            />
        </Grid>
        <Grid xl={4} lg={4} md={12} sm={12} xs={12} item>
          <NavItem
            path='/earphones'
            title='EARPHONES'
            icon={ Earphones }
            info="Dive into music on the go with our premium earphones. Designed for comfort and exceptional sound, they're perfect for music lovers and daily use."
            />
        </Grid>
    </Grid>
  )
}
