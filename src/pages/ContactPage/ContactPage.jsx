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
      <div className={styles.contactShell}>
        <aside className={styles.contactIntro}>
          <span className={styles.kicker}>Contact Dar AlTawawish</span>
          <h1>More than happy to help.</h1>
          <p>For product inquiries, quotations, and general feedback, send us a message and we will get back to you.</p>

          <div className={styles.contactHighlights} aria-label="Contact support details">
            <div>
              <i className="fa fa-clock-o" aria-hidden="true" />
              <span>Prompt follow-up</span>
            </div>
            <div>
              <i className="fa fa-diamond" aria-hidden="true" />
              <span>Jewellery tools and gemstones</span>
            </div>
            <div>
              <i className="fa fa-comments-o" aria-hidden="true" />
              <span>Custom requests welcome</span>
            </div>
          </div>
        </aside>

        <div className={styles.formCard}>
          <form className={styles.contactForm} autoComplete="off" onSubmit={handleSubmit}>
            <div className={styles.formHeader}>
              <h2>Send a message</h2>
              <p>Required fields are marked with an asterisk.</p>
            </div>

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
              <textarea
                id="message"
                name="message"
                rows={4}
                value={formData.message}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className={styles.sendButton} disabled={isSubmitting}>
              <span>{isSubmitting ? 'Sending...' : 'Send message'}</span>
              <i className="fa fa-paper-plane" aria-hidden="true" />
            </button>
            {successMsg && <p className={styles.successMsg}>{successMsg}</p>}
            {errorMsg && <p className={styles.errorMsg}>{errorMsg}</p>}
          </form>
        </div>
      </div>
    </section>
  );
}
