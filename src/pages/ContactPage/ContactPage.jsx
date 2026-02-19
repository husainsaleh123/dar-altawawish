import styles from './ContactPage.module.scss';
import 'font-awesome/css/font-awesome.min.css';
import { useState } from 'react';
import { submitContactForm } from '../../utilities/contact-api';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  function handleChange(evt) {
    const { name, value } = evt.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSuccessMsg('');
    setErrorMsg('');
  }

  async function handleSubmit(evt) {
    evt.preventDefault();
    setIsSubmitting(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const response = await submitContactForm(formData);
      setSuccessMsg(response.message || 'Your message has been sent successfully.');
      setFormData({
        name: '',
        email: '',
        company: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      setErrorMsg(error?.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <h1>More than happy to help.</h1>
        <p>For any inquiries or feedback, pls fill the form.</p>
      </header>

      <div className={styles.formCard}>
        <form className={styles.contactForm} autoComplete="off" onSubmit={handleSubmit}>
          <div className={styles.fieldGroup}>
            <label htmlFor="name">
              <i className="fa fa-user" aria-hidden="true" />
              Name*
            </label>
            <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} required />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="email">
              <i className="fa fa-envelope-o" aria-hidden="true" />
              Email*
            </label>
            <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="company">
              <i className="fa fa-building-o" aria-hidden="true" />
              Company
            </label>
            <input id="company" name="company" type="text" value={formData.company} onChange={handleChange} />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="subject">
              <i className="fa fa-tag" aria-hidden="true" />
              Subject
            </label>
            <input id="subject" name="subject" type="text" value={formData.subject} onChange={handleChange} />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="message">
              <i className="fa fa-comment-o" aria-hidden="true" />
              Message*
            </label>
            <textarea id="message" name="message" rows={4} value={formData.message} onChange={handleChange} required />
          </div>

          <button type="submit" className={styles.sendButton} disabled={isSubmitting}>
            <span>{isSubmitting ? 'Sending...' : 'Send message'}</span>
            <i className="fa fa-paper-plane" aria-hidden="true" />
          </button>
          {successMsg && <p className={styles.successMsg}>{successMsg}</p>}
          {errorMsg && <p className={styles.errorMsg}>{errorMsg}</p>}
        </form>
      </div>
    </section>
  );
}
