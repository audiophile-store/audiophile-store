import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
} from '@mui/material';
import { Link } from 'react-router-dom';
import './SignUp.css';

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const passwordsMatch = password === confirmPassword;
  const isFormValid =
    name.trim() && email.trim() && password.trim() && confirmPassword.trim() && passwordsMatch;

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <Box className="SignUp">
      <Box className="SignUp-Card">
        <Typography variant="h5" className="SignUp-Title">
          Create Account
        </Typography>
        <Typography variant="body2" className="SignUp-Subtitle">
          Join us and start shopping today.
        </Typography>

        <form onSubmit={handleSubmit} className="SignUp-Form">
          <TextField
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            size="small"
            required
          />
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
          <TextField
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            fullWidth
            size="small"
            required
            error={confirmPassword.length > 0 && !passwordsMatch}
            helperText={
              confirmPassword.length > 0 && !passwordsMatch
                ? 'Passwords do not match'
                : ''
            }
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={!isFormValid}
            className="SignUp-SubmitBtn"
          >
            Sign Up
          </Button>
        </form>

        <Typography variant="body2" className="SignUp-Footer">
          Already have an account?{' '}
          <Link to="/sign-in" className="SignUp-SignInLink">
            Sign In
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}
