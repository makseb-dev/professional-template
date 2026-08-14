import { useState } from 'react';

const IMAGE_KEY_RE =
  /(image|img|thumb|thumbnail|logo|hero|avatar|banner|photo|picture|cover|media|icon)/i;

export function isImageFieldKey(key: string): boolean {
  return IMAGE_KEY_RE.test(key);
}

export function isHttpUrl(value: string): boolean {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function ImageTextInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [failed, setFailed] = useState(false);
  const valid = isHttpUrl(value);
  return (
    <div className="field">
      <span className="field-label">{label}</span>
      <input
        type="url"
        value={value}
        placeholder={placeholder ?? 'https://…'}
        onChange={(e) => {
          onChange(e.target.value);
          setFailed(false);
        }}
      />
      {valid && (
        <div className="img-preview">
          <img
            src={value}
            alt="preview"
            loading="lazy"
            onError={() => setFailed(true)}
          />
          <span className={`img-preview-state ${failed ? 'is-bad' : 'is-ok'}`}>
            {failed ? 'Image failed to load' : 'Image OK'}
          </span>
        </div>
      )}
    </div>
  );
}