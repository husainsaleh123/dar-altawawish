import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getGoogleConfig, googleAuth, signUp } from '../../utilities/users-service';
import styles from './SignUpForm.module.scss';

const GCC_COUNTRIES = [
  { value: '+973', flag: '🇧🇭', name: 'Bahrain' },
  { value: '+966', flag: '🇸🇦', name: 'Saudi Arabia' },
  { value: '+971', flag: '🇦🇪', name: 'UAE' },
  { value: '+965', flag: '🇰🇼', name: 'Kuwait' },
  { value: '+968', flag: '🇴🇲', name: 'Oman' },
  { value: '+974', flag: '🇶🇦', name: 'Qatar' }
];

const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

function decodeJwtPayload(token) {
  try {
    const payload = token.split('.')[1] || '';
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - (normalized.length % 4 || 4)) % 4);
    return JSON.parse(atob(padded));
  } catch {
    return {};
  }
}

function validateRegistration(formData) {
  const errors = [];
  const email = formData.email.trim();
  const name = formData.name.trim();
  const phone = formData.phone.trim();

  if (!email) {
    errors.push('Email is required.');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Enter a valid email address.');
  }

  if (!name) {
    errors.push('Full name is required.');
  }

  if (!phone) {
    errors.push('Phone number is required.');
  } else if (!/^\d{7,15}$/.test(phone.replace(/\s+/g, ''))) {
    errors.push('Phone number must contain 7 to 15 digits.');
  }

  if (!formData.password) {
    errors.push('Password is required.');
  } else if (formData.password.length < 6) {
    errors.push('Password must be at least 6 characters.');
  }

  if (!formData.confirm) {
    errors.push('Confirm password is required.');
  } else if (formData.password !== formData.confirm) {
    errors.push('Password and confirm password must match.');
  }

  return errors;
}

export default function SignUpForm({ setUser, onSwitchToLogin, embedded = false }) {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    countryCode: '+973',
    phone: '',
    password: '',
    confirm: ''
  });
  const [error, setError] = useState('');
  const [googleCredential, setGoogleCredential] = useState('');
  const [googleClientId, setGoogleClientId] = useState('');
  const [isGoogleFlow, setIsGoogleFlow] = useState(false);
  const [isSubmittingGoogle, setIsSubmittingGoogle] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isGoogleReady, setIsGoogleReady] = useState(false);
  const googleButtonRef = useRef(null);
  const validationErrors = useMemo(() => validateRegistration(formData), [formData]);

  const isDisabled = useMemo(() => {
    if (isGoogleFlow) {
      return !formData.phone.trim() || isSubmittingGoogle;
    }

    return isSubmitting;
  }, [isGoogleFlow, isSubmitting, isSubmittingGoogle, formData.phone]);

  const handleGoogleCredential = useCallback((response) => {
    const credential = response?.credential;
    if (!credential) {
      setError('Google sign-in failed. Please try again.');
      return;
    }

    const payload = decodeJwtPayload(credential);
    setGoogleCredential(credential);
    setIsGoogleFlow(true);
    setFormData((prev) => ({
      ...prev,
      email: String(payload.email || prev.email || '').trim(),
      name: String(payload.name || payload.given_name || prev.name || '').trim(),
      phone: String(payload.phone_number || prev.phone || '').trim()
    }));
    setError('');
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadGoogleConfig() {
      try {
        const cfg = await getGoogleConfig();
        if (!mounted) return;
        setGoogleClientId(String(cfg?.googleClientId || '').trim());
      } catch {
        if (!mounted) return;
        setGoogleClientId('');
        setIsGoogleReady(false);
      }
    }

    loadGoogleConfig();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!googleClientId) {
      setIsGoogleReady(false);
      return;
    }

    let script = document.querySelector(`script[src="${GOOGLE_SCRIPT_SRC}"]`);
    const initGoogle = () => {
      if (!window.google?.accounts?.id) return;

      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleGoogleCredential
      });

      if (googleButtonRef.current) {
        googleButtonRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          type: 'standard',
          theme: 'filled_blue',
          size: 'large',
          text: 'signin_with',
          shape: 'rectangular',
          logo_alignment: 'left',
          width: googleButtonRef.current.offsetWidth || 520
        });
        setIsGoogleReady(true);
      }

    };

    if (!script) {
      script = document.createElement('script');
      script.src = GOOGLE_SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.onload = initGoogle;
      script.onerror = () => {
        setIsGoogleReady(false);
        setError('Unable to load Google sign-in.');
      };
      document.body.appendChild(script);
    } else {
      initGoogle();
    }
  }, [googleClientId, handleGoogleCredential]);

  function handleChange(evt) {
    setFormData((prev) => ({
      ...prev,
      [evt.target.name]: evt.target.value
    }));
    setError('');
  }

  function hasValidationError(matchers) {
    if (!hasSubmitted) return false;
    return validationErrors.some((message) => matchers.some((matcher) => message.includes(matcher)));
  }

  function handleGoogleShellClick() {
    if (!googleClientId) {
      setError('Google sign-in is not configured yet.');
      return;
    }

    if (googleButtonRef.current) {
      const clickable = googleButtonRef.current.querySelector('div[role="button"], iframe');
      if (clickable instanceof HTMLElement) {
        clickable.click();
        return;
      }

      googleButtonRef.current.click();
    }
  }

  async function handleSubmit(evt) {
    evt.preventDefault();
    setHasSubmitted(true);

    if (validationErrors.length > 0) {
      setError(validationErrors[0]);
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        countryCode: formData.countryCode,
        phone: formData.phone.trim()
      };
      const user = await signUp(payload);
      setUser(user);
    } catch (err) {
      setError(err?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleSubmit(evt) {
    evt.preventDefault();
    if (!googleCredential) {
      setError('Please sign in with Google first.');
      return;
    }

    try {
      setIsSubmittingGoogle(true);
      const user = await googleAuth({
        credential: googleCredential,
        countryCode: formData.countryCode,
        phone: formData.phone.trim()
      });
      setUser(user);
    } catch (err) {
      setError(err?.message || 'Google sign-in failed.');
    } finally {
      setIsSubmittingGoogle(false);
    }
  }

  if (isGoogleFlow) {
    return (
      <section className={`${styles.registerSection} ${embedded ? styles.embeddedSection : ''}`.trim()}>
        <div className={`${styles.registerCard} ${embedded ? styles.embeddedCard : ''}`.trim()}>
          <div className={styles.headerBlock}>
            <h1>Finish with Google</h1>
            <p>Add your phone number to complete your account.</p>
          </div>

          <form onSubmit={handleGoogleSubmit} className={styles.registerForm} autoComplete="off">
            <div className={styles.fieldBlock}>
              <label htmlFor="signup-email">Email</label>
              <input id="signup-email" type="email" name="email" value={formData.email} readOnly />
            </div>

            <div className={styles.fieldBlock}>
              <label htmlFor="signup-name">Name</label>
              <input id="signup-name" type="text" name="name" value={formData.name} readOnly />
            </div>

            <div className={styles.countryPhoneRow}>
              <div className={styles.fieldBlock}>
                <label htmlFor="signup-country">Country</label>
              <div className={styles.countrySelectWrap}>
                  <select
                    id="signup-country"
                    name="countryCode"
                    value={formData.countryCode}
                    onChange={handleChange}
                  >
                    {GCC_COUNTRIES.map((country) => (
                      <option key={country.value} value={country.value}>
                        {country.flag} {country.name} ({country.value})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.fieldBlock}>
                <label htmlFor="signup-phone">Phone</label>
                <input
                  id="signup-phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button type="submit" className={styles.registerButton} disabled={isDisabled}>
              Proceed
            </button>
          </form>

          <p className={styles.errorText}>{error || '\u00A0'}</p>
        </div>
      </section>
    );
  }

  return (
    <section className={`${styles.registerSection} ${embedded ? styles.embeddedSection : ''}`.trim()}>
      <div className={`${styles.registerCard} ${embedded ? styles.embeddedCard : ''}`.trim()}>
        <div className={styles.headerBlock}>
          <h1>Create account</h1>
          <p>Use your email as your account identity or continue with Google.</p>
        </div>

        <div className={styles.googleButtonWrap}>
          <div className={styles.googleButtonShell}>
            <button
              type="button"
              className={`${styles.googleVisualButton} ${!googleClientId ? styles.googleVisualButtonDisabled : ''}`.trim()}
              onClick={handleGoogleShellClick}
            >
              <span className={styles.googleIconBadge}>
                <svg viewBox="0 0 18 18" aria-hidden="true">
                  <path fill="#EA4335" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.71-1.57 2.68-3.89 2.68-6.62Z" />
                  <path fill="#4285F4" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.31-1.58-5.02-3.7H.96v2.33A9 9 0 0 0 9 18Z" />
                  <path fill="#FBBC05" d="M3.98 10.72A5.4 5.4 0 0 1 3.7 9c0-.6.1-1.18.28-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.05l3.02-2.33Z" />
                  <path fill="#34A853" d="M9 3.58c1.32 0 2.5.45 3.44 1.33l2.58-2.58C13.46.9 11.42 0 9 0A9 9 0 0 0 .96 4.95l3.02 2.33c.71-2.12 2.68-3.7 5.02-3.7Z" />
                </svg>
              </span>
              <span className={styles.googleButtonText}>Sign up with Google</span>
            </button>
            <div
              ref={googleButtonRef}
              className={`${styles.googleNativeButton} ${isGoogleReady ? styles.googleNativeButtonReady : ''}`.trim()}
            />
          </div>
        </div>

        <p className={styles.orText}>Or</p>

        <form onSubmit={handleSubmit} className={styles.registerForm} autoComplete="off">
          <div className={styles.fieldBlock}>
            <label htmlFor="signup-email">Email</label>
            <input
              id="signup-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={hasValidationError(['Email']) ? styles.inputError : ''}
              aria-invalid={hasValidationError(['Email'])}
              required
            />
          </div>

          <div className={styles.fieldBlock}>
            <label htmlFor="signup-name">Full Name</label>
            <input
              id="signup-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={hasValidationError(['Full name']) ? styles.inputError : ''}
              aria-invalid={hasValidationError(['Full name'])}
              required
            />
          </div>

          <div className={styles.countryPhoneRow}>
            <div className={styles.fieldBlock}>
              <label htmlFor="signup-country">Country</label>
              <div className={styles.countrySelectWrap}>
                <select
                  id="signup-country"
                  name="countryCode"
                  value={formData.countryCode}
                  onChange={handleChange}
                >
                  {GCC_COUNTRIES.map((country) => (
                    <option key={country.value} value={country.value}>
                      {country.flag} {country.name} ({country.value})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className={styles.fieldBlock}>
              <label htmlFor="signup-phone">Phone</label>
              <input
                id="signup-phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={hasValidationError(['Phone number']) ? styles.inputError : ''}
                aria-invalid={hasValidationError(['Phone number'])}
              />
            </div>
          </div>

          <div className={styles.fieldBlock}>
            <label htmlFor="signup-password">Password</label>
            <input
              id="signup-password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={hasValidationError(['Password']) ? styles.inputError : ''}
              aria-invalid={hasValidationError(['Password'])}
              minLength="6"
              required
            />
          </div>

          <div className={styles.fieldBlock}>
            <label htmlFor="signup-confirm">Confirm Password</label>
            <input
              id="signup-confirm"
              type="password"
              name="confirm"
              value={formData.confirm}
              onChange={handleChange}
              className={hasValidationError(['Confirm password', 'Password and confirm password']) ? styles.inputError : ''}
              aria-invalid={hasValidationError(['Confirm password', 'Password and confirm password'])}
              minLength="6"
              required
            />
          </div>

          <button type="submit" className={styles.registerButton} disabled={isDisabled}>
            {isSubmitting ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className={styles.errorText}>{error || '\u00A0'}</p>
      </div>

      {onSwitchToLogin ? (
        <p className={styles.loginPrompt}>
          Have an account?{' '}
          <button type="button" className={styles.inlineSwitchButton} onClick={onSwitchToLogin}>
            Log in
          </button>
        </p>
      ) : (
        <p className={styles.loginPrompt}>
          Have an account? <Link to="/login">Login</Link>
        </p>
      )}
    </section>
  );
}
