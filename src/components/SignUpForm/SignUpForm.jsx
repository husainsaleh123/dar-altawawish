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

export default function SignUpForm({ setUser }) {
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
  const googleButtonRef = useRef(null);

  const isDisabled = useMemo(() => {
    if (isGoogleFlow) {
      return !formData.phone.trim() || isSubmittingGoogle;
    }

    return (
      !formData.email.trim() ||
      !formData.name.trim() ||
      !formData.password ||
      !formData.confirm ||
      formData.password !== formData.confirm
    );
  }, [formData, isGoogleFlow, isSubmittingGoogle]);

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
      }
    }

    loadGoogleConfig();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!googleClientId) return;

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
          text: 'signup_with',
          shape: 'rectangular',
          width: 520
        });
      }

    };

    if (!script) {
      script = document.createElement('script');
      script.src = GOOGLE_SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.onload = initGoogle;
      script.onerror = () => setError('Unable to load Google sign-in.');
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

  async function handleSubmit(evt) {
    evt.preventDefault();
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        countryCode: formData.countryCode,
        phone: formData.phone.trim()
      };
      const user = await signUp(payload);
      setUser(user);
    } catch {
      setError('Registration failed. Please try again.');
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
      <section className={styles.registerSection}>
        <div className={styles.registerCard}>
          <h1>Update my phone number</h1>

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
    <section className={styles.registerSection}>
      <div className={styles.registerCard}>
        <h1>Register</h1>

        {googleClientId ? (
          <div className={styles.googleButtonWrap}>
            <div ref={googleButtonRef} />
          </div>
        ) : null}

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
              required
            />
          </div>

          <button type="submit" className={styles.registerButton} disabled={isDisabled}>
            Register
          </button>
        </form>

        <p className={styles.errorText}>{error || '\u00A0'}</p>
      </div>

      <p className={styles.loginPrompt}>
        Have an account? <Link to="/login">Login</Link>
      </p>
    </section>
  );
}
