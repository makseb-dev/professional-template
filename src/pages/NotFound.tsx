import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <section className="section" style={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}>
      <div className="container" style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(4rem, 12vw, 8rem)', marginBottom: '0.25rem', color: 'var(--secondary)' }}>
          404
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--muted-foreground)', marginBottom: '1.5rem' }}>
          The page you're looking for doesn't exist.
        </p>
        <Link to="/" className="btn btn-primary">
          Go home
        </Link>
      </div>
    </section>
  );
}
