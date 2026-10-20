import { useState } from 'react';
import { Button, Icon, Input, Text, Textarea } from '../atoms';
import { Alert, FormField } from '../molecules';
import { useForm } from '../../hooks/useForm.js';
import { api } from '../../lib/api.js';
import './ContactForm.css';

const EMPTY = { name: '', email: '', message: '', website: '' };

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const form = useForm(EMPTY, async (values) => {
    await api.post('/messages', values);
    form.setValues(EMPTY);
    setSent(true);
  });

  return (
    <form className="contact-form" onSubmit={form.handleSubmit} noValidate>
      <div className="contact-form__row">
        <FormField label="Nombre" error={form.errors.name}>
          <Input {...form.field('name')} autoComplete="name" required maxLength={100} />
        </FormField>
        <FormField label="Correo electrónico" error={form.errors.email}>
          <Input {...form.field('email')} type="email" autoComplete="email" inputMode="email" required maxLength={160} />
        </FormField>
      </div>
      <FormField label="Mensaje" error={form.errors.message}>
        <Textarea {...form.field('message')} rows={6} required maxLength={4000} />
      </FormField>
      {/* Campo trampa para bots: oculto a personas y lectores de pantalla */}
      <input {...form.field('website')} className="contact-form__trap" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <Text size="sm">Tus datos se usarán únicamente para atender esta consulta.</Text>
      {form.formError && <Alert tone="error">{form.formError}</Alert>}
      {sent && (
        <Alert tone="success" onClose={() => setSent(false)}>
          ¡Mensaje enviado! Te responderemos pronto.
        </Alert>
      )}
      <div>
        <Button type="submit" loading={form.submitting}>
          {!form.submitting && <Icon name="mail" size={16} />} Enviar mensaje
        </Button>
      </div>
    </form>
  );
}
