import { useState, useEffect } from 'react';
import {
  getCourse,
  getVersions,
  getEnrollment,
  getContentTOC,
  isAdmin,
  canAccessOrgStructure,
  type ContentModule,
} from './lib/d2l-api';

type AuthState = 'loading' | 'no-context' | 'denied' | 'ok';

function App() {
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modules, setModules] = useState<ContentModule[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const ou = getCourse();
        if (!ou) {
          if (!cancelled) setAuthState('no-context');
          return;
        }

        const versions = await getVersions();
        const lpVersion = versions.lp ?? '1.82';
        const leVersion = versions.le ?? '1.91';

        const enrollment = await getEnrollment(ou, lpVersion);
        let hasAccess = isAdmin(enrollment);
        if (!hasAccess && !enrollment) {
          hasAccess = await canAccessOrgStructure(ou, lpVersion);
        }
        if (!hasAccess) {
          if (!cancelled) setAuthState('denied');
          return;
        }

        if (!cancelled) setAuthState('ok');

        // Phase 1: read-only – fetch content TOC
        const toc = await getContentTOC(ou, leVersion);
        if (!cancelled) setModules(toc ?? []);
      } catch (e) {
        if (!cancelled) {
          setAuthState('denied');
          setError(e instanceof Error ? e.message : 'Failed to initialize');
        }
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleExport = async () => {
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      setMessage('Export not yet implemented – requires Google Drive API setup.');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Export failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      setMessage('Clear not yet implemented – requires D2L Content API.');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Clear failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBackCopy = async () => {
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      setMessage('Back-copy not yet implemented – requires template/live course identification.');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Back-copy failed');
    } finally {
      setLoading(false);
    }
  };

  if (authState === 'loading') {
    return (
      <div className="cmp-template-manager">
        <p>Loading...</p>
      </div>
    );
  }

  if (authState === 'no-context') {
    return (
      <div className="cmp-template-manager">
        <p>No course context. Open this tool from within an eLC course.</p>
      </div>
    );
  }

  if (authState === 'denied') {
    return (
      <div className="cmp-template-manager">
        <p>Access denied. Admin or instructor role required.</p>
        {error && <p style={{ color: '#ba0c2f' }}>Error: {error}</p>}
      </div>
    );
  }

  const moduleCount = modules?.length ?? 0;
  const topicCount = modules?.reduce((n, m) => n + (m.Topics?.length ?? 0), 0) ?? 0;

  return (
    <div className="cmp-template-manager">
      <h2 className="cmp-template-manager__title cmp-heading-4">Course Template Manager</h2>
      <p>Admin-only. Export template to Drive, clear template, or back-copy live course to template.</p>

      {/* Phase 1: read-only listing */}
      {modules && (
        <div className="cmp-template-manager__toc">
          <strong>Content:</strong> {moduleCount} module{moduleCount !== 1 ? 's' : ''},{' '}
          {topicCount} topic{topicCount !== 1 ? 's' : ''}
        </div>
      )}

      <div className="cmp-template-manager__actions">
        <button
          className="cmp-template-manager__btn"
          onClick={handleExport}
          disabled={loading}
        >
          Export template to Google Drive
        </button>
        <button
          className="cmp-template-manager__btn"
          onClick={handleClear}
          disabled={loading}
        >
          Clear template contents
        </button>
        <button
          className="cmp-template-manager__btn"
          onClick={handleBackCopy}
          disabled={loading}
        >
          Back-copy live course to template
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {message && <p style={{ color: '#666' }}>{message}</p>}
      {error && <p style={{ color: '#ba0c2f' }}>Error: {error}</p>}
    </div>
  );
}

export default App;
