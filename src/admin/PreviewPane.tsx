import { useEffect, useRef, useState } from 'react';
import type { ReactNode, Ref } from 'react';
import { ExternalLink, Monitor, RefreshCw } from 'lucide-react';
import { SECTION_RENDERERS } from '../components/SectionRenderers';

const DESIGN_WIDTH = 1180;

export const ROUTE_BY_SECTION: Record<string, string> = {
  hero: '/',
  about: '/about',
  packages: '/packages',
  destinations: '/destinations',
  offers: '/offers',
  gallery: '/gallery',
  faq: '/support',
  contact: '/support',
};

export function PreviewPane({
  sectionKey,
  content,
  label,
  stageRef,
  externalHref,
  select,
  children,
}: {
  sectionKey: string;
  content?: Record<string, unknown>;
  label?: string;
  stageRef?: Ref<HTMLDivElement>;
  externalHref?: string | null;
  select?: ReactNode;
  children?: ReactNode;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [frameH, setFrameH] = useState(320);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    const frame = frameRef.current;
    const inner = innerRef.current;
    if (!frame || !inner) return;

    const update = () => {
      const width = frame.clientWidth;
      const s = Math.max(0.2, Math.min(1, width / DESIGN_WIDTH));
      setScale(s);
      setFrameH(Math.max(160, Math.ceil(inner.scrollHeight * s)));
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(frame);
    ro.observe(inner);
    return () => ro.disconnect();
  }, [sectionKey, nonce]);

  const Renderer = SECTION_RENDERERS[sectionKey];
  const routeTo = externalHref !== undefined ? externalHref : ROUTE_BY_SECTION[sectionKey];

  return (
    <div className="preview-pane">
      <div className="preview-pane-head">
        <span className="preview-pane-title">
          <Monitor size={15} /> {label ?? sectionKey}
        </span>
        <div className="preview-pane-actions">
          {select}
          <button
            type="button"
            className="icon-btn"
            title="Refresh preview"
            onClick={() => setNonce((n) => n + 1)}
          >
            <RefreshCw size={14} />
          </button>
          {routeTo && (
            <a
              className="icon-btn"
              href={routeTo}
              target="_blank"
              rel="noreferrer"
              title="Open live page"
            >
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      </div>
      <div className="preview-stage" ref={stageRef}>
        <div className="preview-frame" ref={frameRef} style={{ height: frameH }}>
          <div
            className="preview-canvas"
            style={{
              width: DESIGN_WIDTH,
              transform: `scale(${scale})`,
            }}
          >
            <div
              ref={innerRef}
              className="preview-canvas-inner"
              style={{ width: DESIGN_WIDTH }}
            >
              {children ?? (Renderer ? (
                <Renderer content={content ?? {}} />
              ) : (
                <div className="preview-empty">
                  No live preview available for “{sectionKey}”.
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}