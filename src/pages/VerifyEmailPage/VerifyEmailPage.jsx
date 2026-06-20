import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { resendRegistrationCode, verifyRegistration } from '../../utilities/users-service';
import styles from './VerifyEmailPage.module.scss';

function secondsUntil(value) {
  const timestamp = new Date(value || 0).getTime();
  return Number.isFinite(timestamp) ? Math.max(0, Math.ceil((timestamp - Date.now()) / 1000)) : 0;
}

export default function VerifyEmailPage({ setUser }) {
  const location = useLocation();
  const navigate = useNavigate();
  const inputsRef = useRef([]);
  const email = String(location.state?.email || sessionStorage.getItem('pendingRegistrationEmail') || '').trim().toLowerCase();
  const [digits, setDigits] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [expiresIn, setExpiresIn] = useState(() => secondsUntil(sessionStorage.getItem('verificationExpiresAt')));
  const [resendIn, setResendIn] = useState(() => secondsUntil(sessionStorage.getItem('verificationResendAt')));
  const code = useMemo(() => digits.join(''), [digits]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setExpiresIn(secondsUntil(sessionStorage.getItem('verificationExpiresAt')));
      setResendIn(secondsUntil(sessionStorage.getItem('verificationResendAt')));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  function updateDigit(index, value) {
    const numericValue = String(value).replace(/\D/g, '');
    if (numericValue.length > 1) {
      const nextDigits = [...digits];
      numericValue.slice(0, 4 - index).split('').forEach((digit, offset) => {
        nextDigits[index + offset] = digit;
      });
      setDigits(nextDigits);
      inputsRef.current[Math.min(index + numericValue.length, 4) - 1]?.focus();
      setError('');
      return;
    }

    const nextValue = numericValue.slice(-1);
    setDigits((current) => current.map((digit, position) => (position === index ? nextValue : digit)));
    setError('');
    if (nextValue && index < 3) inputsRef.current[index + 1]?.focus();
  }

  function handleKeyDown(index, event) {
    if (event.key === 'Backspace' && !digits[index] && index > 0) inputsRef.current[index - 1]?.focus();
  }

  function handlePaste(event) {
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (!pasted) return;
    event.preventDefault();
    setDigits(Array.from({ length: 4 }, (_, index) => pasted[index] || ''));
    inputsRef.current[Math.min(pasted.length, 4) - 1]?.focus();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!email) return setError('Your registration email is missing. Please sign up again.');
    if (!/^\d{4}$/.test(code)) return setError('Enter the complete 4-digit code.');

    try {
      setIsSubmitting(true);
      const user = await verifyRegistration({ email, code });
      sessionStorage.removeItem('pendingRegistrationEmail');
      sessionStorage.removeItem('verificationExpiresAt');
      sessionStorage.removeItem('verificationResendAt');
      setUser(user);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err?.message || 'Verification failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    if (!email || resendIn > 0) return;
    try {
      setIsResending(true);
      const response = await resendRegistrationCode(email);
      sessionStorage.setItem('verificationExpiresAt', response?.expiresAt || '');
      sessionStorage.setItem('verificationResendAt', response?.resendAvailableAt || '');
      setExpiresIn(secondsUntil(response?.expiresAt));
      setResendIn(secondsUntil(response?.resendAvailableAt));
      setDigits(['', '', '', '']);
      setError('');
      setMessage(response?.message || 'A new code was sent.');
      inputsRef.current[0]?.focus();
    } catch (err) {
      setMessage('');
      setError(err?.message || 'Unable to resend the code.');
    } finally {
      setIsResending(false);
    }
  }

  const minutes = Math.floor(expiresIn / 60);
  const seconds = String(expiresIn % 60).padStart(2, '0');

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.icon} aria-hidden="true">✉</div>
        <p className={styles.eyebrow}>Email verification</p>
        <h1>Check your inbox</h1>
        {email ? (
          <p>We sent a 4-digit code from Dar Altawawish to <strong>{email}</strong>.</p>
        ) : (
          <p>Your registration details are no longer available. Please sign up again.</p>
        )}

        {email && (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.codeInputs} onPaste={handlePaste}>
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(element) => { inputsRef.current[index] = element; }}
                  value={digit}
                  onChange={(event) => updateDigit(index, event.target.value)}
                  onKeyDown={(event) => handleKeyDown(index, event)}
                  inputMode="numeric"
                  type="text"
                  pattern="[0-9]*"
                  autoComplete={index === 0 ? 'one-time-code' : 'off'}
                  aria-label={`Verification code digit ${index + 1}`}
                  maxLength="1"
                />
              ))}
            </div>
            <p className={styles.timer}>
              {expiresIn > 0 ? `Code expires in ${minutes}:${seconds}` : 'This code has expired. Request a new one.'}
            </p>
            <button type="submit" className={styles.primaryButton} disabled={isSubmitting || code.length !== 4 || expiresIn === 0}>
              {isSubmitting ? 'Verifying…' : 'Verify and create account'}
            </button>
            <button type="button" className={styles.resendButton} onClick={handleResend} disabled={isResending || resendIn > 0}>
              {isResending ? 'Sending…' : resendIn > 0 ? `Resend code in ${resendIn}s` : 'Resend code'}
            </button>
          </form>
        )}

        <p className={error ? styles.error : styles.message}>{error || message || '\u00A0'}</p>
        <Link to="/signup" className={styles.backLink}>← Back to sign up</Link>
      </section>
    </main>
  );
}
