import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDown,
  ArrowUp,
  GripVertical,
  Lock,
  RefreshCw,
  RotateCcw,
  Save,
} from 'lucide-react';
import {
  fetchSections,
  reorderSections,
  resetSectionsOrder,
} from '../api/agency';
import type { AdminSection } from '../types';

function sameOrder(
  a: AdminSection[],
  b: AdminSection[],
): boolean {
  if (a.length !== b.length) return false;
  return a.every((item, i) => {
    const other = b[i];
    return (
      other !== undefined &&
      item.templateSectionId === other.templateSectionId &&
      item.isEnabled === other.isEnabled
    );
  });
}

export function WebsiteSections() {
  const [original, setOriginal] = useState<AdminSection[]>([]);
  const [items, setItems] = useState<AdminSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const dragIndex = useRef<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchSections();
      const sorted = [...list].sort((a, b) => a.sortOrder - b.sortOrder);
      setOriginal(sorted);
      setItems(sorted);
      setSaved(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const dirty = useMemo(
    () => !sameOrder(original, items),
    [original, items],
  );

  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  const save = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const updated = await reorderSections(
        items.map((s, i) => ({
          templateSectionId: s.templateSectionId,
          sortOrder: i,
          isEnabled: s.isEnabled,
        })),
      );
      const sorted = [...updated].sort((a, b) => a.sortOrder - b.sortOrder);
      setOriginal(sorted);
      setItems(sorted);
      setSaved(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const discard = () => {
    setItems(original);
    setSaved(false);
    setError(null);
  };

  const resetDefault = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const updated = await resetSectionsOrder();
      const sorted = [...updated].sort((a, b) => a.sortOrder - b.sortOrder);
      setOriginal(sorted);
      setItems(sorted);
      setSaved(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const move = (index: number, dir: number) => {
    const j = index + dir;
    if (j < 0 || j >= items.length) return;
    if (items[index].isFixed || items[j].isFixed) return;
    setItems((prev) => {
      const next = [...prev];
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });
    setSaved(false);
  };

  const toggleEnabled = (index: number) => {
    if (items[index].isFixed) return;
    setItems((prev) =>
      prev.map((s, i) =>
        i === index ? { ...s, isEnabled: !s.isEnabled } : s,
      ),
    );
    setSaved(false);
  };

  const setPosition = (index: number, raw: string) => {
    const n = Number(raw);
    if (!Number.isFinite(n) || items[index].isFixed) return;
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], sortOrder: n };
      return next.sort((a, b) => a.sortOrder - b.sortOrder);
    });
    setSaved(false);
  };

  const onDragStart = (index: number) => {
    if (items[index].isFixed) return;
    dragIndex.current = index;
  };
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  const onDrop = (target: number) => {
    const from = dragIndex.current;
    dragIndex.current = null;
    if (from === null || from === target) return;
    if (items[from].isFixed || items[target].isFixed) return;
    setItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(target, 0, moved);
      return next;
    });
    setSaved(false);
  };

  if (loading) {
    return (
      <div className="admin-splash" aria-busy="true">
        <div className="skeleton" style={{ height: '2rem', width: '40%', marginBottom: '2rem' }} />
        <div className="skeleton" style={{ height: '12rem' }} />
      </div>
    );
  }

  const disabledCount = items.filter((s) => s.isEnabled === false).length;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <div>
          <h2 className="section-title" style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>
            Website sections
          </h2>
          <p style={{ color: 'var(--muted-foreground)', margin: 0, fontSize: '0.85rem' }}>
            Reorder sections and toggle visibility. The live site renders them in this order.
            {disabledCount > 0 && ` ${disabledCount} section${disabledCount > 1 ? 's are' : ' is'} hidden.`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-secondary" onClick={resetDefault} disabled={saving}>
            <RotateCcw size={15} /> Reset defaults
          </button>
          <button type="button" className="btn btn-secondary" onClick={discard} disabled={!dirty || saving}>
            Discard
          </button>
          <button type="button" className="btn btn-primary" onClick={save} disabled={!dirty || saving}>
            {saving ? 'Saving…' : <><Save size={15} /> Save order</>}
          </button>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {saved && <div className="success-banner">Section order saved and published.</div>}

      {items.length === 0 ? (
        <div className="admin-card">
          <p style={{ color: 'var(--muted-foreground)' }}>No sections found for this template.</p>
        </div>
      ) : (
        <div className="admin-card ws-list" style={{ padding: '0.5rem 0' }}>
          {items.map((s, i) => (
            <div
              key={s.templateSectionId}
              className={`ws-row${s.isFixed ? ' is-fixed' : ''}${s.isEnabled === false ? ' is-disabled' : ''}`}
              draggable={!s.isFixed}
              onDragStart={() => onDragStart(i)}
              onDragOver={onDragOver}
              onDrop={() => onDrop(i)}
              onDragEnd={() => { dragIndex.current = null; }}
            >
              <span className="ws-grip" title={s.isFixed ? 'Fixed sections cannot be moved' : 'Drag to reorder'}>
                {s.isFixed ? <Lock size={15} /> : <GripVertical size={16} />}
              </span>

              <div className="ws-main">
                <Link to={`/admin/sections/${s.templateSectionId}`} className="ws-name">
                  {s.displayName || s.sectionKey}
                </Link>
                <span className="ws-key">{s.sectionKey}</span>
                {s.isFixed && <span className="ws-badge">Fixed</span>}
                {s.isEnabled === false && <span className="ws-badge is-off">Hidden</span>}
              </div>

              <div className="ws-position">
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => move(i, -1)}
                  disabled={s.isFixed || i === 0}
                  title="Move up"
                  aria-label="Move up"
                >
                  <ArrowUp size={14} />
                </button>
                <input
                  type="number"
                  min={0}
                  value={s.sortOrder}
                  disabled={s.isFixed}
                  onChange={(e) => setPosition(i, e.target.value)}
                  className="ws-order-input"
                  aria-label="Position"
                />
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => move(i, 1)}
                  disabled={s.isFixed || i === items.length - 1}
                  title="Move down"
                  aria-label="Move down"
                >
                  <ArrowDown size={14} />
                </button>
              </div>

              <button
                type="button"
                className={`ws-toggle${s.isEnabled !== false ? ' is-on' : ''}`}
                onClick={() => toggleEnabled(i)}
                disabled={s.isFixed}
                title={s.isFixed ? 'Fixed sections cannot be disabled' : s.isEnabled === false ? 'Enable section' : 'Disable section'}
                aria-pressed={s.isEnabled !== false}
              >
                <span className="ws-toggle-track"><span className="ws-toggle-thumb" /></span>
                <span className="ws-toggle-label">
                  {s.isEnabled === false ? 'Off' : 'On'}
                </span>
              </button>
            </div>
          ))}
        </div>
      )}

      <p style={{ color: 'var(--muted-foreground)', fontSize: '0.8rem', marginTop: '0.75rem' }}>
        Fixed sections (hero/footer) are locked and always render at their template position. Use
        <RefreshCw size={12} style={{ verticalAlign: '-2px', margin: '0 0.25rem' }} />
        Reset defaults to restore the template order.
      </p>
    </div>
  );
}
