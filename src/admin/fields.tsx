import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  ImageOff, ImagePlus, Link2, Loader2, Plus, Star, Trash2, X,
} from 'lucide-react';

/* =====================================================================
   Shared human-friendly form fields for the commercial dashboard.
   These wrap the existing `.field` design tokens so every form looks and
   behaves the same. All technical conversions (arrays, data URLs, dates)
   happen inside these components — the dashboard user never sees them.
   ===================================================================== */

export function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="field">
      <span className="field-label">
        {label}
        {required && <span className="required-dot">*</span>}
      </span>
      {children}
      {hint && <small className="field-hint">{hint}</small>}
    </div>
  );
}

export function TextInput({
  label,
  value,
  onChange,
  placeholder,
  hint,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  required?: boolean;
}) {
  return (
    <Field label={label} hint={hint} required={required}>
      <input
        type="text"
        value={value || ''}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  placeholder,
  hint,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  rows?: number;
}) {
  return (
    <Field label={label} hint={hint}>
      <textarea
        rows={rows}
        value={value || ''}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

export function NumberInput({
  label,
  value,
  onChange,
  placeholder,
  hint,
  min,
  max,
  step = 'any',
  prefix,
  suffix,
}: {
  label: string;
  value: number | undefined;
  onChange: (v: number) => void;
  placeholder?: string;
  hint?: string;
  min?: number;
  max?: number;
  step?: number | string;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <div className="number-input">
        {prefix && <span className="number-input-affix">{prefix}</span>}
        <input
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          step={step}
          placeholder={placeholder}
          value={typeof value === 'number' && Number.isFinite(value) ? value : ''}
          onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
        />
        {suffix && <span className="number-input-affix">{suffix}</span>}
      </div>
    </Field>
  );
}

export function SelectInput({
  label,
  value,
  onChange,
  options,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  hint?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <select value={value || ''} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select…</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </Field>
  );
}

export function DateInput({
  label,
  value,
  onChange,
  hint,
  min,
  max,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  min?: string;
  max?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <input
        type="date"
        value={value || ''}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value || '')}
      />
    </Field>
  );
}

export function ListEditor({
  label,
  value,
  onChange,
  placeholder,
  addLabel = 'Add',
  hint,
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  addLabel?: string;
  hint?: string;
}) {
  const [draft, setDraft] = useState('');

  const add = () => {
    const v = draft.trim();
    if (!v) return;
    onChange([...value, v]);
    setDraft('');
  };

  return (
    <Field label={label} hint={hint}>
      {value.length > 0 && (
        <ul className="list-editor">
          {value.map((v, i) => (
            <li className="list-editor-item" key={`${i}-${v}`}>
              <span>{v}</span>
              <button
                type="button"
                className="list-editor-remove"
                onClick={() => onChange(value.filter((_, j) => j !== i))}
                title="Remove"
                aria-label={`Remove item “${v}”`}
              >
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="list-editor-add">
        <input
          type="text"
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
        />
        <button type="button" className="btn btn-secondary" onClick={add} disabled={!draft.trim()}>
          <Plus size={14} /> {addLabel}
        </button>
      </div>
    </Field>
  );
}

/* ------------------------------------------------------------------
   ImageUploader — visual media picker. Converts local files to data
   URLs internally and stores a plain string[] (the backend contract).
   ------------------------------------------------------------------ */

const MAX_IMAGES = 10;

function TileImage({ src, alt }: { src: string; alt: string }) {
  const [bad, setBad] = useState(false);
  if (bad) {
    return (
      <div className="uploader-tile-broken" role="img" aria-label="Image could not be displayed">
        <ImageOff size={18} />
      </div>
    );
  }
  return <img src={src} alt={alt} loading="lazy" onError={() => setBad(true)} />;
}

export function ImageUploader({
  images,
  onChange,
  label = 'Photos',
  hint,
}: {
  images: string[];
  onChange: (images: string[]) => void;
  label?: string;
  hint?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [showLink, setShowLink] = useState(false);
  const [linkDraft, setLinkDraft] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const readFiles = async (files: FileList | File[]) => {
    setError('');
    const fileList = Array.from(files);
    const imagesOnly = fileList.filter((f) => f.type.startsWith('image/'));
    if (imagesOnly.length === 0) {
      if (fileList.length > 0) setError('Only image files can be added.');
      return;
    }
    setBusy(true);
    try {
      const urls = await Promise.all(
        imagesOnly.map(
          (file) =>
            new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(String(reader.result));
              reader.onerror = () => reject(new Error('File could not be read'));
              reader.readAsDataURL(file);
            }),
        ),
      );
      onChange([...images, ...urls].slice(0, MAX_IMAGES));
    } catch {
      setError('One of the selected files could not be read. Please try again.');
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const addLink = () => {
    const v = linkDraft.trim();
    if (!/^https?:\/\//i.test(v)) {
      setError('Please paste a full link starting with https://');
      return;
    }
    if (images.includes(v)) {
      setError('That photo is already in the list.');
      return;
    }
    onChange([...images, v].slice(0, MAX_IMAGES));
    setError('');
    setLinkDraft('');
    setShowLink(false);
  };

  const remove = (i: number) => onChange(images.filter((_, j) => j !== i));

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= images.length) return;
    const next = [...images];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <Field
      label={label}
      hint={hint ?? `The first photo is the cover. Drag & drop works too.`}
    >
      <div
        className={`uploader${busy ? ' is-busy' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'copy';
        }}
        onDrop={(e) => {
          e.preventDefault();
          void readFiles(e.dataTransfer.files);
        }}
      >
        <div className="uploader-grid">
          {images.map((src, i) => (
            <div className="uploader-tile" key={`${i}-${src}`}>
              <div className="uploader-tile-media">
                <TileImage src={src} alt={`Photo ${i + 1}`} />
                {i === 0 && (
                  <span className="uploader-cover">
                    <Star size={10} fill="currentColor" /> Cover
                  </span>
                )}
              </div>
              <div className="uploader-tile-tools">
                <button
                  type="button"
                  className="uploader-tool"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  title="Move left"
                  aria-label={`Move photo ${i + 1} left`}
                >
                  ←
                </button>
                <button
                  type="button"
                  className="uploader-tool"
                  onClick={() => move(i, 1)}
                  disabled={i === images.length - 1}
                  title="Move right"
                  aria-label={`Move photo ${i + 1} right`}
                >
                  →
                </button>
                <span className="uploader-index">{i + 1}</span>
                <button
                  type="button"
                  className="uploader-tool uploader-tool-danger"
                  onClick={() => remove(i)}
                  title="Remove photo"
                  aria-label={`Remove photo ${i + 1}`}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
          {images.length < MAX_IMAGES && (
            <label className={`uploader-tile uploader-add${busy ? ' is-busy' : ''}`}>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                disabled={busy}
                onChange={(e) => {
                  if (e.target.files) void readFiles(e.target.files);
                }}
              />
              {busy ? <Loader2 size={20} className="spin" /> : <ImagePlus size={20} />}
              <span>{busy ? 'Uploading…' : 'Add photos'}</span>
            </label>
          )}
        </div>

        <div className="uploader-foot">
          <p>
            Drag & drop images here, or choose them from your computer. The first
            photo is the cover shown on cards.
          </p>
          <button
            type="button"
            className="link-btn"
            onClick={() => setShowLink((s) => !s)}
          >
            <Link2 size={13} /> {showLink ? 'Hide link option' : 'Add a photo from a link (advanced)'}
          </button>
        </div>

        {showLink && (
          <div className="list-editor-add">
            <input
              type="url"
              value={linkDraft}
              placeholder="https://example.com/photo.jpg"
              onChange={(e) => setLinkDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addLink();
                }
              }}
            />
            <button type="button" className="btn btn-secondary" onClick={addLink} disabled={!linkDraft.trim()}>
              Add photo
            </button>
          </div>
        )}

        {error && <div className="field-error">{error}</div>}
      </div>
    </Field>
  );
}

/* ------------------------------------------------------------------
   ConfirmDialog — accessible destructive/confirm modal (replaces the
   native window.confirm so the flow matches the dashboard design).
   ------------------------------------------------------------------ */

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'primary',
  busy = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'primary' | 'danger';
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) confirmRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={busy ? undefined : onCancel}>
      <div
        className="confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="confirm-dialog-head">
          <h3 id="confirm-dialog-title">{title}</h3>
          <button type="button" className="icon-btn" onClick={onCancel} disabled={busy} aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <div className="confirm-dialog-body">{message}</div>
        <div className="confirm-dialog-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            className={`btn ${tone === 'danger' ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy && <Loader2 size={14} className="spin" />}
            {busy ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}