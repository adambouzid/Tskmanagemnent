import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import authService from "../services/auth";
import { Box, Card, CardContent, Typography, Button, TextField, Container, Alert, Link, Avatar } from '@mui/material';
import { styled } from '@mui/system';
import PersonIcon from '@mui/icons-material/Person';

const FlipCard = styled(Box)({
  perspective: '1000px',
  width: '100%',
  maxWidth: '450px',
  height: '480px',
});

const FlipCardInner = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isFlipped',
})(({ isFlipped }) => ({
  position: 'relative',
  width: '100%',
  height: '100%',
  textAlign: 'center',
  transition: 'transform 0.8s',
  transformStyle: 'preserve-3d',
  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
}));

const CardSide = styled(Card)({
  position: 'absolute',
  width: '100%',
  height: '100%',
  backfaceVisibility: 'hidden',
  borderRadius: '8px',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
  padding: '20px',
  overflow: 'visible'
});

const CardFront = styled(CardSide)({});

const CardBack = styled(CardSide)({
  transform: 'rotateY(180deg)',
});

const StyledAvatar = styled(Avatar)({
  width: '80px',
  height: '80px',
  backgroundColor: '#4e7bef',
  position: 'absolute',
  top: '-40px',
  left: '50%',
  transform: 'translateX(-50%)',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
});

const StyledTextField = styled(TextField)({
  marginBottom: '16px',
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    '& fieldset': {
      borderColor: '#e0e0e0',
    },
    '&:hover fieldset': {
      borderColor: '#b0b0b0',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#4e7bef',
    }
  }
});

const SubmitButton = styled(Button)({
  borderRadius: '8px',
  padding: '12px',
  marginTop: '8px',
  backgroundColor: '#4e7bef',
  '&:hover': {
    backgroundColor: '#3a67d9',
  }
});

const AuthPage = () => {
  // Default to showing login form with flipped=true so logout redirects to login
  const [isFlipped, setIsFlipped] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    setError("");
    // We're not clearing inputs so users don't lose their data when flipping
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      // Sign Up flow
      await authService.signup({ email, password, name });
      // Flip to login after successful signup
      setIsFlipped(true);
      setError("");
    } catch (err) {
      setError(err.message || "Signup failed");
    }
  };
  
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      // Login flow
      const data = await authService.login(email, password);
      // Redirect based on role
      if (data.userRole === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/user");
      }
    } catch (err) {
      setError(err.message || "Login failed");
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #5e72e4 0%, #825ee4 100%)',
        padding: 3,
      }}
    >
      <Container maxWidth="sm" sx={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
        <FlipCard>
          <FlipCardInner isFlipped={isFlipped}>
            {/* Sign Up Card (Front) */}
            <CardFront>
              <StyledAvatar>
                <PersonIcon fontSize="large" />
              </StyledAvatar>
              
              <Box sx={{ mt: 5, textAlign: 'center' }}>
                <Typography variant="h5" component="h1" sx={{ fontWeight: 600, mb: 4 }}>
                  Create Account
                </Typography>
                
                <Box component="form" onSubmit={handleSignupSubmit}>
                  <StyledTextField
                    fullWidth
                    id="name"
                    label="Full Name"
                    name="name"
                    autoComplete="name"
                    autoFocus={!isFlipped}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  
                  <StyledTextField
                    fullWidth
                    id="signup-email"
                    label="Email"
                    name="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  
                  <StyledTextField
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="signup-password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  
                  {error && !isFlipped && <Alert severity="error" sx={{ mt: 2, mb: 2 }}>{error}</Alert>}
                  
                  <SubmitButton
                    type="submit"
                    fullWidth
                    variant="contained"
                    disableElevation
                  >
                    Sign Up
                  </SubmitButton>
                  
                  <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="textSecondary">
                      Already have an account? {' '}
                      <Link
                        component="button"
                        variant="body2"
                        onClick={handleFlip}
                        sx={{ textDecoration: 'none', fontWeight: 500 }}
                      >
                        Login
                      </Link>
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardFront>
            
            {/* Login Card (Back) */}
            <CardBack>
              <StyledAvatar>
                <PersonIcon fontSize="large" />
              </StyledAvatar>
              
              <Box sx={{ mt: 5, textAlign: 'center' }}>
                <Typography variant="h5" component="h1" sx={{ fontWeight: 600, mb: 4 }}>
                  Login
                </Typography>
                
                <Box component="form" onSubmit={handleLoginSubmit}>
                  <StyledTextField
                    fullWidth
                    id="login-email"
                    label="Email"
                    name="email"
                    autoComplete="email"
                    autoFocus={isFlipped}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  
                  <StyledTextField
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="login-password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  
                  {error && isFlipped && <Alert severity="error" sx={{ mt: 2, mb: 2 }}>{error}</Alert>}
                  
                  <SubmitButton
                    type="submit"
                    fullWidth
                    variant="contained"
                    disableElevation
                  >
                    Login
                  </SubmitButton>
                  
                  <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="textSecondary">
                      Don't have an account? {' '}
                      <Link
                        component="button"
                        variant="body2"
                        onClick={handleFlip}
                        sx={{ textDecoration: 'none', fontWeight: 500 }}
                      >
                        Sign Up
                      </Link>
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardBack>
          </FlipCardInner>
        </FlipCard>
      </Container>
    </Box>
  );
};

export default AuthPage;