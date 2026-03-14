import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineMail, HiOutlineLockClosed } from 'react-icons/hi';

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: email, 2: otp, 3: new password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const otpRefs = useRef([]);
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const generatedOtp = '123456'; // Simulated OTP

  const handleSendOtp = (e) => {
    e.preventDefault();
    setError('');
    if (!email) { setError('Please enter your email'); return; }
    setSuccess('OTP sent to your email! (Use: 123456)');
    setStep(2);
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setError('');
    const enteredOtp = otp.join('');
    if (enteredOtp !== generatedOtp) {
      setError('Invalid OTP. Please try again.');
      return;
    }
    setSuccess('OTP verified successfully!');
    setStep(3);
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    const result = resetPassword(email, newPassword);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess('Password reset successfully! Redirecting...');
      setTimeout(() => navigate('/login'), 2000);
    }
  };

  const stepVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <div className="auth-container">
      <div className="auth-bg">
        <div className="auth-bg-orb"></div>
        <div className="auth-bg-orb"></div>
        <div className="auth-bg-orb"></div>
      </div>
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="auth-logo">
          <h1>🔐 Reset Password</h1>
          <p>Step {step} of 3</p>
        </div>

        {/* Step indicators */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{
              width: 40, height: 4, borderRadius: 2,
              background: s <= step ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
              transition: 'all 0.3s',
            }} />
          ))}
        </div>

        {error && <div className="auth-error" style={{ marginBottom: 16 }}>{error}</div>}
        {success && <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399', padding: '10px 16px', borderRadius: 8, fontSize: 13, textAlign: 'center', marginBottom: 16 }}>{success}</div>}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.form key="step1" className="auth-form" onSubmit={handleSendOtp} variants={stepVariants} initial="initial" animate="animate" exit="exit">
              <div className="input-group">
                <label><HiOutlineMail style={{ verticalAlign: 'middle', marginRight: 6 }} />Email Address</label>
                <input type="email" className="input-field" placeholder="Enter your registered email" value={email} onChange={(e) => setEmail(e.target.value)} id="forgot-email" />
              </div>
              <button type="submit" className="auth-btn" id="send-otp-btn">Send OTP</button>
            </motion.form>
          )}

          {step === 2 && (
            <motion.form key="step2" className="auth-form" onSubmit={handleVerifyOtp} variants={stepVariants} initial="initial" animate="animate" exit="exit">
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 14 }}>Enter the 6-digit code sent to {email}</p>
              <div className="otp-container">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => otpRefs.current[i] = el}
                    type="text"
                    className="otp-input"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    id={`otp-${i}`}
                  />
                ))}
              </div>
              <button type="submit" className="auth-btn" id="verify-otp-btn">Verify OTP</button>
            </motion.form>
          )}

          {step === 3 && (
            <motion.form key="step3" className="auth-form" onSubmit={handleResetPassword} variants={stepVariants} initial="initial" animate="animate" exit="exit">
              <div className="input-group">
                <label><HiOutlineLockClosed style={{ verticalAlign: 'middle', marginRight: 6 }} />New Password</label>
                <input type="password" className="input-field" placeholder="Enter new password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} id="new-password" />
              </div>
              <div className="input-group">
                <label><HiOutlineLockClosed style={{ verticalAlign: 'middle', marginRight: 6 }} />Confirm Password</label>
                <input type="password" className="input-field" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} id="confirm-password" />
              </div>
              <button type="submit" className="auth-btn" id="reset-password-btn">Reset Password</button>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="auth-link">
          <Link to="/login">← Back to Login</Link>
        </div>
      </motion.div>
    </div>
  );
}
