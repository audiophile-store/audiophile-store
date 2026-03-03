import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Logo from '../../assets/icons/logo.svg'
import LogoIcon from '../../assets/icons/logo-icon3.png'
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import PersonIcon from '@mui/icons-material/Person';
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux';
import { Grid, Menu, MenuItem, ListItemIcon, ListItemText, Typography } from '@mui/material';
import './Navbar.css';
import MenuNavBar from './MenuNavBar/MenuNavBar';
import NavigationItems from './NavigationItems/NavigationItems';
import Promoted from '../Promoted/Promoted';
import { openCart } from '../../features/cart/cartSlice';
import { logout } from '../../features/auth/authSlice';
import { enqueueSnackbar } from 'notistack';

function ResponsiveAppBar() {
  const [anchorElNav, setAnchorElNav] = React.useState(null)
  const [anchorElAccount, setAnchorElAccount] = React.useState(null);
  const [cartAnimate, setCartAnimate] = React.useState(false);
  const cartItems = useSelector((state) => state.cart.items);
  const { isLoggedIn, user } = useSelector((state) => state.auth);
  const cartLength = cartItems.length;
  const location = useLocation();
  const navigate = useNavigate();
  const borderPathNames = ['/', '/headphones', '/speakers', '/earphones'];
  const dispatch = useDispatch();

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleOpenAccountMenu = (event) => {
    setAnchorElAccount(event.currentTarget);
  };

  const handleCloseAccountMenu = () => {
    setAnchorElAccount(null);
  };

  const handleOpenCart = () => {
    if (cartLength > 0) {
      dispatch(openCart());
    } else {
      enqueueSnackbar('Your cart is empty. Add some products first!', {
        variant: 'info',
        style: { backgroundColor: '#d87d4a', color: 'white' },
        anchorOrigin: { vertical: "bottom", horizontal: "center" },
      });
    }
  }

  React.useEffect(() => {
    if (cartItems.length > 0) {
      setCartAnimate(true);
      const timer = setTimeout(() => {
        setCartAnimate(false);
      }, 800); // Match animation duration
      return () => clearTimeout(timer);
    }
  }, [cartItems]);

  const renderLogo = () => {
    return (
      <Link to='/'>
        <IconButton style={{ padding: '0'}}>
          <img className='Logo-Image' src={ Logo } alt='Audiophile' />
          <img className='Logo-Icon' src={ LogoIcon } alt="Audiophile" />
        </IconButton>
      </Link>
    )
  }

  const renderPromotedProduct = () => {
    if (location.pathname === '/') {
      return <Promoted />
    }
    return null
  }

  const toolbarStyle = () => {
    if (borderPathNames.includes(location.pathname)) {
      return { borderBottom: '1px solid rgba(255, 255, 255, 0.2)', padding: '0' }
    }
    return { padding: '0'}
  }

  return (
    <Grid
      container
      width='100%'
      style={{ zIndex: 3 }}>
      <Grid item xl={ 12 } lg={ 12 } md={ 12 } sm={ 12 } className='Nav-Item-Top'>
        <AppBar color='primary' position="static">
          <Box
            className='NavBar-Wrapper'
            >
            <Toolbar style={ toolbarStyle() }>
              <Grid container width='100%' justifyContent='space-between' alignItems='center'>
                <Grid xl={ 1 } md={ 3 } item className='Toolbar-Item-1'>
                  <Box display='flex' alignItems='center'>
                    <MenuNavBar openMenuBar={ handleOpenNavMenu } closeMenuBar={ handleCloseNavMenu } anchor={ anchorElNav } />
                    { renderLogo() }
                  </Box>
                </Grid>
                <Grid xl={ 10 } md={ 6 } item className='Toolbar-Item-2'>
                  <NavigationItems />
                </Grid>
                <Grid style={ location.pathname === '/checkout' ? { visibility: 'hidden' } : { visibility: 'visible' } } xl={ 1 } md={ 3 } item className='Toolbar-Item-3'>
                    {isLoggedIn ? (
                      <>
                        <Box
                          display='flex'
                          alignItems='center'
                          gap={ 0.5 }
                          className="Nav-ProfileGroup"
                          onClick={ handleOpenAccountMenu }
                          sx={ { cursor: 'pointer' } }
                        >
                          <Box className="Nav-AccountTrigger" sx={ { display: 'flex', alignItems: 'center' } }>
                            <PersonIcon />
                          </Box>
                          <Typography variant="caption" className="Nav-Greeting">
                            Hi, { user?.name?.split(' ')[0] || 'there' }
                          </Typography>
                        </Box>
                        <Menu
                          anchorEl={anchorElAccount}
                          open={Boolean(anchorElAccount)}
                          onClose={handleCloseAccountMenu}
                          disableScrollLock
                          PaperProps={{ className: 'Nav-AccountMenu' }}
                          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        >
                          <MenuItem onClick={() => { handleCloseAccountMenu(); }} className="Nav-AccountMenu-Item">
                            <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                            <ListItemText>My Profile</ListItemText>
                          </MenuItem>
                          <MenuItem onClick={() => { handleCloseAccountMenu(); dispatch(logout()); }} className="Nav-AccountMenu-Item">
                            <ListItemIcon><LogoutOutlinedIcon fontSize="small" /></ListItemIcon>
                            <ListItemText>Log out</ListItemText>
                          </MenuItem>
                        </Menu>
                      </>
                    ) : (
                      <>
                        <IconButton onClick={handleOpenAccountMenu} className="Nav-IconBtn">
                          <PersonOutlineIcon />
                        </IconButton>
                        <Menu
                          anchorEl={anchorElAccount}
                          open={Boolean(anchorElAccount)}
                          onClose={handleCloseAccountMenu}
                          disableScrollLock
                          PaperProps={{ className: 'Nav-AccountMenu' }}
                          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        >
                          <MenuItem onClick={() => { handleCloseAccountMenu(); navigate('/sign-in'); }} className="Nav-AccountMenu-Item">
                            <ListItemIcon><LoginIcon fontSize="small" /></ListItemIcon>
                            <ListItemText>Sign in</ListItemText>
                          </MenuItem>
                          <MenuItem onClick={() => { handleCloseAccountMenu(); navigate('/sign-up'); }} className="Nav-AccountMenu-Item">
                            <ListItemIcon><PersonAddOutlinedIcon fontSize="small" /></ListItemIcon>
                            <ListItemText>Create Account</ListItemText>
                          </MenuItem>
                        </Menu>
                      </>
                    )}
                    <Box
                      display='flex'
                      alignItems='center'
                      gap={ 0 }
                      className="Nav-CartGroup"
                      onClick={ handleOpenCart }
                      sx={ { cursor: 'pointer' } }
                    >
                      <IconButton className={ `Nav-IconBtn Nav-CartBtn ${cartAnimate ? 'cart-bounce' : ''}` } disableRipple>
                        { cartLength > 0 && <Box className='Nav-Cart-Quantity'>{ cartLength }</Box> }
                        <ShoppingCartOutlinedIcon />
                      </IconButton>
                      <Typography variant="caption" className="Nav-Greeting">
                        Cart
                      </Typography>
                    </Box>
                  </Grid>
              </Grid>
            </Toolbar>
          </Box>
        </AppBar>
      </Grid>
      <Grid item xl={ 12 } lg={ 12 } md={ 12 } sm={ 12 } className='Nav-Item-Middle'>{ renderPromotedProduct() }</Grid>
      {/* <Grid item xl={ 12 } lg={ 12 } md={ 12 } sm={ 12 } className='Nav-Item-Bottom'>{ renderProductTitle() }</Grid> */}
    </Grid>
  );
}
export default ResponsiveAppBar;
