import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { enqueueSnackbar } from 'notistack';
import { login, clearError } from '../../../features/auth/authSlice';
import './SignIn.css';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, error, user } = useSelector((state) => state.auth);

  const from = location.state?.from || '/';

  const isFormValid = email.trim() && password.trim();

  useEffect(() => {
    if (isLoggedIn) {
      const firstName = user?.name?.split(' ')[0] || 'there';
      enqueueSnackbar(`Welcome back, ${firstName}!`, {
        variant: 'success',
        style: { backgroundColor: '#d87d4a', color: 'white' },
        anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
      });
      navigate(from, { replace: true });
    }
  }, [isLoggedIn, user?.name, navigate, from]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login({ email, password }));
  };

  return (
    <Box className="SignIn">
      <Box className="SignIn-Card">
        <Typography variant="h5" className="SignIn-Title">
          Sign In
        </Typography>
        <Typography variant="body2" className="SignIn-Subtitle">
          Welcome back! Enter your credentials to continue.
        </Typography>

        <form onSubmit={handleSubmit} className="SignIn-Form">
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            size="small"
            required
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            size="small"
            required
          />

          {error && (
            <Typography variant="body2" className="SignIn-Error">
              {error}
            </Typography>
          )}

          <Box className="SignIn-Options">
            <FormControlLabel
              control={
                <Checkbox
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  size="small"
                  className="SignIn-Checkbox"
                />
              }
              label={<Typography variant="body2">Remember me</Typography>}
            />
            <Typography variant="body2" className="SignIn-ForgotLink">
              Forgot password?
            </Typography>
          </Box>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={!isFormValid}
            className="SignIn-SubmitBtn"
          >
            Sign In
          </Button>
        </form>

        <Typography variant="body2" className="SignIn-Footer">
          Don't have an account?{' '}
          <Link to="/sign-up" className="SignIn-SignUpLink">
            Sign Up
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}
