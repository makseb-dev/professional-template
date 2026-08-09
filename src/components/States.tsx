export function LoadingState({
  variant = 'default',
}: {
  variant?: 'default' | 'cards';
}) {
  if (variant === 'cards') {
    return (
      <div className="grid grid-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div className="skeleton-card" key={i}>
            <div className="skeleton-media" />
            <div className="skeleton-line" style={{ width: '60%' }} />
            <div className="skeleton-line" style={{ width: '90%' }} />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="skeleton" style={{ height: '3rem', maxWidth: 720, marginBottom: '1rem' }} />
  );
}

export function EmptyState({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div className="empty-state" role="status">
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="error-state" role="alert">
      <h3>Something went wrong</h3>
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="btn btn-secondary" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}
