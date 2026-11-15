import { useState, type FormEvent } from 'react';
import { planetById } from '../../config/planets';
import { site } from '../../config/site';
import { trackEvent } from '../../lib/analytics';
import { useStore } from '../../state/store';
import { Arrow, Reveal, useCopy } from '../bits';
import { Footer, NextDestination, PageHero } from './shared';

type Status = 'idle' | 'sending' | 'sent' | 'mail' | 'error';

/**
 * Destination 06: contact.
 * The form either POSTs to `site.form.endpoint` (when configured) or opens the
 * visitor's own e-mail app with the message prepared. It never reports a
 * message as sent unless the endpoint confirmed it.
 */
export function ContactPage() {
  const c = useCopy();
  const lang = useStore((s) => s.lang);
  const planet = planetById('contact')!;
  const t = c.contact;
  const hasEndpoint = !!site.form.endpoint;
  const [values, setValues] = useState({ name: '', email: '', company: '', interest: t.interests[0], message: '', website: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [copied, setCopied] = useState(false);

  const wa = site.contact.whatsapp ? `https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(t.whatsappText)}` : '';
  const mailto = `mailto:${site.contact.email}?subject=${encodeURIComponent(t.mailSubject)}`;

  const set = (k: keyof typeof values) => (e: { target: { value: string } }) => {
    setValues((v) => ({ ...v, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: '' }));
    if (status !== 'idle' && status !== 'sending') setStatus('idle');
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!values.name.trim()) er.name = t.required;
    if (!values.email.trim()) er.email = t.required;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) er.email = t.invalidEmail;
    if (!values.message.trim()) er.message = t.required;
    setErrors(er);
    if (Object.keys(er).length) {
      const first = Object.keys(er)[0];
      document.getElementById(`f-${first}`)?.focus();
      return;
    }
    if (values.website) return; // honeypot

    if (hasEndpoint) {
      setStatus('sending');
      try {
        const res = await fetch(site.form.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            ...site.form.extraFields,
            name: values.name,
            email: values.email,
            company: values.company,
            interest: values.interest,
            message: values.message,
            language: lang,
            subject: t.mailSubject,
          }),
        });
        if (!res.ok) throw new Error(String(res.status));
        setStatus('sent');
        trackEvent('contact_form_sent');
      } catch {
        setStatus('error');
      }
      return;
    }

    // mailto fallback — opens the visitor's e-mail app; the visitor sends it.
    const body = [
      `${t.name}: ${values.name}`,
      `${t.email}: ${values.email}`,
      ...(values.company ? [`${t.company}: ${values.company}`] : []),
      `${t.interest}: ${values.interest}`,
      '',
      values.message,
    ].join('\n');
    window.location.href = `${mailto}&body=${encodeURIComponent(body)}`;
    setStatus('mail');
    trackEvent('contact_form_mailto');
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(site.contact.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable — the address is visible and selectable */
    }
  };

  return (
    <main className="page page-contact">
      <PageHero planet={planet} eyebrow={t.eyebrow} title={t.title} lede={t.lede}>
        <div className="hero-actions">
          {wa && (
            <a className="btn btn-primary" href={wa} target="_blank" rel="noopener noreferrer">
              {t.whatsappCta} <Arrow dir="out" />
            </a>
          )}
          <a className="btn" href={mailto}>
            {t.emailLabel} <Arrow dir="out" />
          </a>
          <a className="btn" href={site.contact.instagram} target="_blank" rel="noopener noreferrer">
            Instagram <Arrow dir="out" />
          </a>
        </div>
      </PageHero>

      <section className="section contact-grid">
        <Reveal className="contact-methods">
          <h2 className="section-title small">{t.methodsTitle}</h2>
          <dl className="methods">
            <div>
              <dt>{t.emailLabel}</dt>
              <dd>
                <a href={mailto} className="method-link">
                  {site.contact.email}
                </a>
                <button type="button" className="chip" onClick={copyEmail} aria-live="polite">
                  {copied ? t.copied : t.copy}
                </button>
              </dd>
            </div>
            {wa && (
              <div>
                <dt>{t.whatsappLabel}</dt>
                <dd>
                  <a href={wa} target="_blank" rel="noopener noreferrer" className="method-link">
                    {site.contact.whatsappDisplay}
                  </a>
                </dd>
              </div>
            )}
            <div>
              <dt>{t.instagramLabel}</dt>
              <dd>
                <a href={site.contact.instagram} target="_blank" rel="noopener noreferrer" className="method-link">
                  {site.contact.instagramHandle}
                </a>
              </dd>
            </div>
            <div>
              <dt>{t.locationLabel}</dt>
              <dd>{site.location[lang]}</dd>
            </div>
          </dl>
        </Reveal>

        <Reveal className="contact-form-wrap" delay={100}>
          <h2 className="section-title small">{t.formTitle}</h2>
          {!hasEndpoint && <p className="note">{t.formNote}</p>}
          <form className="form" onSubmit={submit} noValidate>
            <div className="field">
              <label htmlFor="f-name">{t.name} *</label>
              <input id="f-name" name="name" autoComplete="name" value={values.name} onChange={set('name')} aria-invalid={!!errors.name} aria-describedby={errors.name ? 'e-name' : undefined} required />
              {errors.name && (
                <p className="field-error" id="e-name">
                  {errors.name}
                </p>
              )}
            </div>
            <div className="field">
              <label htmlFor="f-email">{t.email} *</label>
              <input id="f-email" name="email" type="email" autoComplete="email" inputMode="email" value={values.email} onChange={set('email')} aria-invalid={!!errors.email} aria-describedby={errors.email ? 'e-email' : undefined} required />
              {errors.email && (
                <p className="field-error" id="e-email">
                  {errors.email}
                </p>
              )}
            </div>
            <div className="field">
              <label htmlFor="f-company">{t.company}</label>
              <input id="f-company" name="company" autoComplete="organization" value={values.company} onChange={set('company')} />
            </div>
            <div className="field">
              <label htmlFor="f-interest">{t.interest}</label>
              <select id="f-interest" name="interest" value={values.interest} onChange={set('interest')}>
                {t.interests.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </div>
            <div className="field field-wide">
              <label htmlFor="f-message">{t.message} *</label>
              <textarea id="f-message" name="message" rows={5} placeholder={t.messagePlaceholder} value={values.message} onChange={set('message')} aria-invalid={!!errors.message} aria-describedby={errors.message ? 'e-message' : undefined} required />
              {errors.message && (
                <p className="field-error" id="e-message">
                  {errors.message}
                </p>
              )}
            </div>
            {/* honeypot — hidden from people, visible to bots */}
            <div className="hp" aria-hidden="true">
              <label>
                Website
                <input tabIndex={-1} autoComplete="off" value={values.website} onChange={set('website')} />
              </label>
            </div>
            <div className="field-wide form-foot">
              <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>
                {status === 'sending' ? t.sending : hasEndpoint ? t.send : t.sendMail} <Arrow />
              </button>
              <p className={`form-status is-${status}`} role="status" aria-live="polite">
                {status === 'sent' && t.sent}
                {status === 'mail' && t.mailOpened}
                {status === 'error' && t.failed}
              </p>
            </div>
          </form>
        </Reveal>
      </section>

      <NextDestination current={planet} />
      <Footer />
    </main>
  );
}
