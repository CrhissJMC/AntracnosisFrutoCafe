import { useState } from 'react';
import { Button, Checkbox, Input, Text, Textarea } from '../atoms';
import { Alert, FormField } from '../molecules';
import { useForm } from '../../hooks/useForm.js';
import { renderMarkdown } from '../../lib/markdown.jsx';
import './ArticleForm.css';

export const EMPTY_ARTICLE = {
  title: '',
  slug: '',
  category: '',
  subtitle: '',
  content: '',
  image_url: '',
  source_text: '',
  source_url: '',
  published: true,
};

// Misma regla que el servidor (backend/src/lib/readingTime.js): ~200 palabras por minuto.
function estimateReadingMinutes(markdown = '') {
  const text = String(markdown)
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~|-]/g, ' ');
  const words = text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
  return Math.min(120, Math.max(1, Math.ceil(words / 200)));
}

/** Formulario de creación/edición de artículos con vista previa del contenido. */
export function ArticleForm({ initial = EMPTY_ARTICLE, onSubmit, onCancel, submitLabel = 'Guardar' }) {
  const [tab, setTab] = useState('write');
  const form = useForm({ ...EMPTY_ARTICLE, ...initial }, onSubmit);
  const f = form.field;
  const e = form.errors;

  return (
    <form className="article-form" onSubmit={form.handleSubmit} noValidate>
      <div className="article-form__main">
        <FormField label="Título" error={e.title}>
          <Input {...f('title')} required maxLength={200} />
        </FormField>
        <FormField label="Resumen" error={e.subtitle} hint="Aparece en la tarjeta del blog y bajo el título.">
          <Textarea {...f('subtitle')} rows={2} maxLength={400} />
        </FormField>

        <div className="article-form__editor">
          <div className="article-form__tabs" role="tablist" aria-label="Editor de contenido">
            <button type="button" role="tab" aria-selected={tab === 'write'} onClick={() => setTab('write')}>
              Escribir
            </button>
            <button type="button" role="tab" aria-selected={tab === 'preview'} onClick={() => setTab('preview')}>
              Vista previa
            </button>
          </div>
          {tab === 'write' ? (
            <FormField
              label="Contenido"
              error={e.content}
              hint="Formato: ## Subtítulo · párrafos separados por una línea en blanco · *cursiva* · **negrita** · - listas · [enlace](https://…)"
            >
              <Textarea {...f('content')} rows={18} className="article-form__content" />
            </FormField>
          ) : (
            <div className="article-form__preview prose">{renderMarkdown(form.values.content)}</div>
          )}
        </div>
      </div>

      <aside className="article-form__side">
        <div className="article-form__panel">
          <Checkbox label="Publicado (visible en el blog)" {...f('published', { type: 'checkbox' })} />
          <FormField label="Categoría" error={e.category} hint="Ej.: PREVENCIÓN, CIENCIA, CLIMA">
            <Input {...f('category')} required maxLength={40} list="article-categories" />
          </FormField>
          <datalist id="article-categories">
            {['PREVENCIÓN', 'CIENCIA', 'CLIMA', 'MANEJO', 'CALIDAD', 'CAMPO'].map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          <Text size="sm">
            Tiempo de lectura estimado: <strong>{estimateReadingMinutes(form.values.content)} min</strong> (se calcula
            automáticamente a partir del contenido).
          </Text>
          <FormField label="Slug (URL)" optional error={e.slug} hint="Se genera del título si lo dejas vacío.">
            <Input {...f('slug')} maxLength={160} placeholder="mi-articulo" />
          </FormField>
        </div>
        <div className="article-form__panel">
          <FormField label="Imagen (URL)" optional error={e.image_url}>
            <Input {...f('image_url')} type="url" placeholder="https://…" />
          </FormField>
          {form.values.image_url && /^https?:\/\//.test(form.values.image_url) && (
            <img className="article-form__thumb" src={form.values.image_url} alt="Vista previa de la imagen" />
          )}
          <FormField label="Fuente (texto)" optional error={e.source_text}>
            <Input {...f('source_text')} maxLength={200} />
          </FormField>
          <FormField label="Fuente (URL)" optional error={e.source_url}>
            <Input {...f('source_url')} type="url" placeholder="https://…" />
          </FormField>
        </div>
        {form.formError && <Alert tone="error">{form.formError}</Alert>}
        <div className="article-form__actions">
          <Button type="submit" loading={form.submitting} block>
            {submitLabel}
          </Button>
          {onCancel && (
            <Button variant="secondary" onClick={onCancel} block>
              Cancelar
            </Button>
          )}
        </div>
        <Text size="sm">Los cambios se publican al guardar.</Text>
      </aside>
    </form>
  );
}
