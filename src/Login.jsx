import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import AppTheme from './shared-theme/AppTheme';
import ColorModeSelect from './shared-theme/ColorModeSelect';
import { GoogleIcon, FacebookIcon } from './components/CustomIcons';
import axios from 'axios';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  [theme.breakpoints.up('sm')]: {
    width: '450px',
  },
}));

const LoginContainer = styled(Stack)(({ theme }) => ({
  height: '100dvh',
  minHeight: '100%',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
  '&::before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    zIndex: -1,
    inset: 0,
    backgroundImage:
      'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
    backgroundRepeat: 'no-repeat',
  },
}));

export default function Login(props) {
  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState('');
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [loginStatus, setLoginStatus] = React.useState('');

  const validateInputs = () => {
    const email = document.getElementById('email');
    const password = document.getElementById('password');

    let isValid = true;

    if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
      setEmailError(true);
      setEmailErrorMessage('Please enter a valid email');
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage('');
    }

    if (!password.value || password.value.length < 4) {
      setPasswordError(true);
      setPasswordErrorMessage('Password must be at least 4 characters');
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }

    return isValid;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateInputs()) return;

    setLoading(true);
    setLoginStatus('Validating credentials...');

    const data = new FormData(event.currentTarget);
    const email = data.get('email').trim();
    const password = data.get('password').trim();

    try {
      console.log('Sending login request with:', { email, password });
      
      //test localStorage
      localStorage.setItem('test', 'working');
      console.log('localStorage test:', localStorage.getItem('test'));
      localStorage.removeItem('test');
      
      setLoginStatus('Connecting to server...');
      
      const response = await axios.post('http://localhost:8000/login', {
        name: email,
        email,
        password
      });

      console.log('Login API response received:', response);
      console.log('Response data:', response.data);
      
      setLoginStatus('Processing response...');

      if (response.data && response.data.success) {
        const user = {
          user_id: response.data.userId,
          username: response.data.userName,
          identity: response.data.role
        };

        console.log('Saving user data:', user);
        
        // check localStorage
        console.log('Before storage:', localStorage.getItem('user'));
        localStorage.setItem('user', JSON.stringify(user));
        console.log('After storage:', localStorage.getItem('user'));
        
        setLoginStatus('Login successful! Redirecting...');
        
        // use setTimeout to delay redirection
        // for better user experience
        setTimeout(() => {
          const role = (response.data.role || '').toLowerCase();
          if (role === 'student') {
            window.location.href = '/main';
          } else if (role === 'instructor') {
            window.location.href = '/instructor';
          } else {
            window.location.href = '/';
          }
        }, 500);
      } else {
        console.log('Login failed:', response.data);
        setLoginStatus('Login failed: ' + (response.data.message || 'Invalid credentials'));
        alert('Login failed: ' + (response.data.message || 'Invalid credentials'));
      }
    } catch (error) {
      console.error('Login error details:', error);
      
      
      if (error.response) {
        
        console.error('Server error response:', error.response.data);
        console.error('Status code:', error.response.status);
        setLoginStatus(`Server error: ${error.response.status} - ${error.response.data.message || 'Unknown error'}`);
        alert(`Login failed: ${error.response.data.message || 'Server error (' + error.response.status + ')'}`);
      } else if (error.request) {
       
        console.error('No response received:', error.request);
        setLoginStatus('Server not responding. Check if the server is running.');
        alert('Login failed: Server not responding. Please check if the server is running.');
      } else {
       
        console.error('Request error:', error.message);
        setLoginStatus(`Request error: ${error.message}`);
        alert(`Login failed: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <ColorModeSelect sx={{ position: 'fixed', top: '1rem', right: '1rem' }} />
      <LoginContainer direction="row" justifyContent="center">
        <Card>
          <Typography
            component="h1"
            variant="h4"
            sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
          >
            Login
          </Typography>
          {loginStatus && (
            <Box sx={{ 
              padding: 2, 
              bgcolor: 'info.light', 
              color: 'info.contrastText',
              borderRadius: 1
            }}>
              {loginStatus}
            </Box>
          )}
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <FormControl>
              <FormLabel htmlFor="email">Email</FormLabel>
              <TextField
                required
                fullWidth
                id="email"
                name="email"
                autoComplete="email"
                placeholder="your@email.com"
                error={emailError}
                helperText={emailErrorMessage}
                disabled={loading}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="password">Password</FormLabel>
              <TextField
                required
                fullWidth
                name="password"
                type="password"
                id="password"
                autoComplete="current-password"
                placeholder="••••••"
                error={passwordError}
                helperText={passwordErrorMessage}
                disabled={loading}
              />
            </FormControl>
            <Button 
              type="submit" 
              fullWidth 
              variant="contained"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </Box>

          <Divider>
            <Typography sx={{ color: 'text.secondary' }}>or</Typography>
          </Divider>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button 
              fullWidth 
              variant="outlined" 
              startIcon={<GoogleIcon />}
              disabled={loading}
            >
              Login with Google
            </Button>
            <Button 
              fullWidth 
              variant="outlined" 
              startIcon={<FacebookIcon />}
              disabled={loading}
            >
              Login with Facebook
            </Button>
            <Typography sx={{ textAlign: 'center' }}>
              Don't have an account?{' '}
              <Link href="/" variant="body2">
                Sign up
              </Link>
            </Typography>
          </Box>
          
         
          <Box sx={{ 
            marginTop: 2, 
            padding: 2, 
            bgcolor: 'grey.100', 
            borderRadius: 1,
            fontSize: '0.75rem'
          }}>
            
          </Box>
        </Card>
      </LoginContainer>
    </AppTheme>
  );
}
