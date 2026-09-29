import { Box, Snackbar, IconButton, Grid } from '@mui/material'
import './Layout.css'
import CloseIcon from '@mui/icons-material/Close';
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { closeSnackbar } from '../../features/snackbar/snackbarSlice';
import Cart from '../Cart/Cart';
import ResponsiveAppBar from '../navbar/Navbar';
import PageRoutes from '../routes/Routes';
import Footer from '../Footer/Footer';

export default function Layout() {
  const isSnackbarOpened = useAppSelector(state => state.snackbar.isOpen);
  const snackbarMessage = useAppSelector(state => state.snackbar.message);
  const dispatch = useAppDispatch();
  const handleCloseSnackbar = () => {
    dispatch(closeSnackbar())
  }

  const action = (
    <Box>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={ handleCloseSnackbar }
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </Box>
  );

  return (
    <Box width='100%'>
      <Cart />
      <Snackbar
        anchorOrigin={ { vertical: 'bottom', horizontal: 'right' } }
        open={ isSnackbarOpened }
        autoHideDuration={ 2000 }
        onClose={ handleCloseSnackbar }
        message={ snackbarMessage }
        action={ action }
      />
      <Grid container width='100%'>
        <Grid item xl={ 12 } width='100%'>
          <ResponsiveAppBar />
        </Grid>
        <Grid item xl={ 12 } width='100%'>
          <PageRoutes />
        </Grid>
      </Grid>
      <Footer />
    </Box>
  )
}
