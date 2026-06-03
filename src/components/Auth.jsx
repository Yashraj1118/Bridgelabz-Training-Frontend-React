import React, { useState } from 'react';
import { authApi } from '../api';

export default function Auth({ onLoginSuccess, currentView, setView }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  // Trigger OTP Resend Timer
  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await authApi.login({ email, password });
      setMessage(response.data.message || 'Login successful!');
      setTimeout(() => {
        onLoginSuccess();
      }, 1000);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errMsg);
      // If user is not verified, redirect to verify-otp
      if (errMsg.toLowerCase().includes('verify')) {
        setTimeout(() => {
          setView('verify-otp');
        }, 1500);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await authApi.register({ firstName, lastName, email, password });
      setMessage(response.data.message || 'Registration successful! OTP sent to your email.');
      startResendTimer();
      setTimeout(() => {
        setView('verify-otp');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await authApi.verifyOtp({ email, otp });
      setMessage(response.data.message || 'Email verified successfully! Redirecting to login...');
      setTimeout(() => {
        setView('login');
        setPassword('');
        setOtp('');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      setError('Please provide your email address first.');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await authApi.resendOtp(email);
      setMessage(response.data.message || 'OTP resent successfully!');
      startResendTimer();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await authApi.forgotPasswordOtp(email);
      setMessage(response.data.message || 'Reset OTP sent to your email.');
      setTimeout(() => {
        setView('reset-password-otp');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send password reset request.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await authApi.resetPasswordOtp({ email, otp, newPassword });
      setMessage(response.data.message || 'Password reset successful! You can now log in.');
      setTimeout(() => {
        setView('login');
        setPassword('');
        setNewPassword('');
        setOtp('');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed. Check OTP or Email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container d-flex align-items-center justify-content-center min-vh-100 px-3">
      <div className="card auth-card shadow-lg border-0 rounded-4" style={{ maxWidth: '420px', width: '100%' }}>
        <div className="card-body p-4 p-sm-5">
          {/* Logo & Title */}
          <div className="text-center mb-4">
            <div className="d-inline-flex align-items-center justify-content-center bg-warning bg-opacity-25 text-warning rounded-circle mb-3" style={{ width: '60px', height: '60px' }}>
              <i className="bi bi-journal-bookmark-fill fs-2"></i>
            </div>
            <h3 className="fw-bold text-dark mb-1">Fundoo Notes</h3>
            <p className="text-muted small">Keep your thoughts organized in one place</p>
          </div>

          {/* Feedback messages */}
          {error && <div className="alert alert-danger py-2 small border-0 mb-3" role="alert">{error}</div>}
          {message && <div className="alert alert-success py-2 small border-0 mb-3" role="alert">{message}</div>}

          {/* LOGIN VIEW */}
          {currentView === 'login' && (
            <form onSubmit={handleLogin}>
              <div className="form-floating mb-3">
                <input
                  type="email"
                  className="form-control rounded-3"
                  id="loginEmail"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <label htmlFor="loginEmail">Email address</label>
              </div>
              <div className="form-floating mb-3">
                <input
                  type="password"
                  className="form-control rounded-3"
                  id="loginPassword"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <label htmlFor="loginPassword">Password</label>
              </div>

              <div className="text-end mb-3">
                <button
                  type="button"
                  className="btn btn-link btn-sm text-decoration-none text-muted"
                  onClick={() => setView('forgot-password')}
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                className="btn btn-warning w-100 py-2.5 fw-semibold text-dark rounded-3 mb-3 d-flex align-items-center justify-content-center"
                disabled={loading}
              >
                {loading ? <span className="spinner-border spinner-border-sm me-2" role="status"></span> : null}
                Sign In
              </button>

              <div className="text-center small">
                Don't have an account?{' '}
                <button
                  type="button"
                  className="btn btn-link btn-sm text-warning p-0 text-decoration-none fw-bold"
                  onClick={() => setView('register')}
                >
                  Sign Up
                </button>
              </div>
            </form>
          )}

          {/* REGISTER VIEW */}
          {currentView === 'register' && (
            <form onSubmit={handleRegister}>
              <div className="row g-2 mb-3">
                <div className="col">
                  <div className="form-floating">
                    <input
                      type="text"
                      className="form-control rounded-3"
                      id="firstName"
                      placeholder="First name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                    <label htmlFor="firstName">First Name</label>
                  </div>
                </div>
                <div className="col">
                  <div className="form-floating">
                    <input
                      type="text"
                      className="form-control rounded-3"
                      id="lastName"
                      placeholder="Last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                    <label htmlFor="lastName">Last Name</label>
                  </div>
                </div>
              </div>

              <div className="form-floating mb-3">
                <input
                  type="email"
                  className="form-control rounded-3"
                  id="regEmail"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <label htmlFor="regEmail">Email address</label>
              </div>

              <div className="form-floating mb-3">
                <input
                  type="password"
                  className="form-control rounded-3"
                  id="regPassword"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength="8"
                  required
                />
                <label htmlFor="regPassword">Password (min 8 chars)</label>
              </div>

              <button
                type="submit"
                className="btn btn-warning w-100 py-2.5 fw-semibold text-dark rounded-3 mb-3 d-flex align-items-center justify-content-center"
                disabled={loading}
              >
                {loading ? <span className="spinner-border spinner-border-sm me-2" role="status"></span> : null}
                Register
              </button>

              <div className="text-center small">
                Already have an account?{' '}
                <button
                  type="button"
                  className="btn btn-link btn-sm text-warning p-0 text-decoration-none fw-bold"
                  onClick={() => setView('login')}
                >
                  Sign In
                </button>
              </div>
            </form>
          )}

          {/* VERIFY OTP VIEW */}
          {currentView === 'verify-otp' && (
            <form onSubmit={handleVerifyOtp}>
              <p className="text-muted text-center small mb-3">
                An activation code was sent to <strong className="text-dark">{email}</strong>.
              </p>
              <div className="form-floating mb-3">
                <input
                  type="text"
                  className="form-control text-center fs-4 letter-spacing-5 rounded-3"
                  id="otpCode"
                  placeholder="######"
                  maxLength="6"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
                <label htmlFor="otpCode">6-Digit OTP Code</label>
              </div>

              <button
                type="submit"
                className="btn btn-warning w-100 py-2.5 fw-semibold text-dark rounded-3 mb-3 d-flex align-items-center justify-content-center"
                disabled={loading}
              >
                {loading ? <span className="spinner-border spinner-border-sm me-2" role="status"></span> : null}
                Verify Account
              </button>

              <div className="text-center small">
                {resendTimer > 0 ? (
                  <span className="text-muted">Resend OTP in {resendTimer}s</span>
                ) : (
                  <button
                    type="button"
                    className="btn btn-link btn-sm text-warning p-0 text-decoration-none fw-bold"
                    onClick={handleResendOtp}
                    disabled={loading}
                  >
                    Resend OTP
                  </button>
                )}
              </div>
              
              <div className="text-center mt-3 small">
                <button
                  type="button"
                  className="btn btn-link btn-sm text-muted p-0 text-decoration-none"
                  onClick={() => setView('login')}
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}

          {/* FORGOT PASSWORD VIEW */}
          {currentView === 'forgot-password' && (
            <form onSubmit={handleForgotPassword}>
              <p className="text-muted text-center small mb-3">
                Enter your registered email and we'll send you an OTP to reset your password.
              </p>
              <div className="form-floating mb-3">
                <input
                  type="email"
                  className="form-control rounded-3"
                  id="forgotEmail"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <label htmlFor="forgotEmail">Email address</label>
              </div>

              <button
                type="submit"
                className="btn btn-warning w-100 py-2.5 fw-semibold text-dark rounded-3 mb-3 d-flex align-items-center justify-content-center"
                disabled={loading}
              >
                {loading ? <span className="spinner-border spinner-border-sm me-2" role="status"></span> : null}
                Send Reset OTP
              </button>

              <div className="text-center small">
                <button
                  type="button"
                  className="btn btn-link btn-sm text-warning p-0 text-decoration-none fw-bold"
                  onClick={() => setView('login')}
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}

          {/* RESET PASSWORD VIEW */}
          {currentView === 'reset-password-otp' && (
            <form onSubmit={handleResetPassword}>
              <p className="text-muted text-center small mb-3">
                Enter the OTP sent to <strong className="text-dark">{email}</strong> and set your new password.
              </p>
              <div className="form-floating mb-3">
                <input
                  type="text"
                  className="form-control text-center fs-4 rounded-3"
                  id="resetOtp"
                  placeholder="######"
                  maxLength="6"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
                <label htmlFor="resetOtp">6-Digit OTP</label>
              </div>

              <div className="form-floating mb-3">
                <input
                  type="password"
                  className="form-control rounded-3"
                  id="resetNewPassword"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength="8"
                  required
                />
                <label htmlFor="resetNewPassword">New Password (min 8 chars)</label>
              </div>

              <button
                type="submit"
                className="btn btn-warning w-100 py-2.5 fw-semibold text-dark rounded-3 mb-3 d-flex align-items-center justify-content-center"
                disabled={loading}
              >
                {loading ? <span className="spinner-border spinner-border-sm me-2" role="status"></span> : null}
                Reset Password
              </button>

              <div className="text-center small">
                <button
                  type="button"
                  className="btn btn-link btn-sm text-warning p-0 text-decoration-none fw-bold"
                  onClick={() => setView('login')}
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
