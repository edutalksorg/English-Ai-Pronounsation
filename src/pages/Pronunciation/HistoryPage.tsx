/**
 * HistoryPage.tsx
 * Display paginated assessment history with navigation to details
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pronunciationApi } from '../../lib/api/pronunciationApi';
import { AssessmentHistoryResponse, AssessmentAttempt } from '../../lib/api/pronunciationTypes';

interface PageState {
  pageNum: number;
  pageSize: number;
}

export default function HistoryPage() {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState<AssessmentAttempt[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<PageState>({
    pageNum: 1,
    pageSize: 10,
  });
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    loadHistory();
  }, [page.pageNum]);

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response: AssessmentHistoryResponse =
        await pronunciationApi.getHistory(page.pageNum, page.pageSize);

      if (response.succeeded && response.data) {
        setAttempts(response.data);
        setTotalPages(response.totalPages);
        setTotalCount(response.totalCount);
      } else {
        setError(response.errors?.[0] || 'Failed to load history');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'success':
        return '#4CAF50';
      case 'pending':
      case 'processing':
        return '#FF9800';
      case 'failed':
      case 'error':
        return '#f44336';
      default:
        return '#666';
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const formatScore = (score: number): string => {
    return (score * 100).toFixed(1) + '%';
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Assessment History</h1>

      {loading && <p style={styles.loading}>Loading history...</p>}
      {error && <div style={styles.errorBox}>{error}</div>}

      {attempts.length === 0 && !loading && (
        <div style={styles.emptyBox}>No assessments yet</div>
      )}

      {attempts.length > 0 && (
        <>
          <div style={styles.countText}>
            Total: {totalCount} assessments
          </div>

          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={styles.th}>Paragraph</th>
                  <th style={styles.th}>Overall Score</th>
                  <th style={styles.th}>Pronunciation</th>
                  <th style={styles.th}>Fluency</th>
                  <th style={styles.th}>Completeness</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Submitted</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((attempt) => (
                  <tr key={attempt.id} style={styles.tableRow}>
                    <td style={styles.td}>{attempt.paragraphTitle}</td>
                    <td style={styles.td}>
                      <strong>{formatScore(attempt.overallScore)}</strong>
                    </td>
                    <td style={styles.td}>
                      {formatScore(attempt.pronunciationAccuracy)}
                    </td>
                    <td style={styles.td}>
                      {formatScore(attempt.fluencyScore)}
                    </td>
                    <td style={styles.td}>
                      {formatScore(attempt.completenessScore)}
                    </td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.statusBadge,
                          backgroundColor: getStatusColor(attempt.processingStatus),
                        }}
                      >
                        {attempt.processingStatus}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <small>{formatDate(attempt.submittedAt)}</small>
                    </td>
                    <td style={styles.td}>
                      <button
                        onClick={() =>
                          navigate(`/pronunciation/attempts/${attempt.id}`)
                        }
                        style={styles.detailButton}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={styles.paginationGroup}>
            <button
              onClick={() =>
                setPage((p) => ({
                  ...p,
                  pageNum: Math.max(1, p.pageNum - 1),
                }))
              }
              disabled={page.pageNum === 1}
              style={{
                ...styles.button,
                opacity: page.pageNum === 1 ? 0.5 : 1,
              }}
            >
              ← Previous
            </button>
            <span style={styles.paginationText}>
              Page {page.pageNum} of {totalPages}
            </span>
            <button
              onClick={() =>
                setPage((p) => ({
                  ...p,
                  pageNum: Math.min(totalPages, p.pageNum + 1),
                }))
              }
              disabled={page.pageNum === totalPages}
              style={{
                ...styles.button,
                opacity: page.pageNum === totalPages ? 0.5 : 1,
              }}
            >
              Next →
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ============ Styles ============
const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '30px 20px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  title: {
    fontSize: '2rem',
    marginBottom: '30px',
    color: '#222',
  },
  countText: {
    fontSize: '0.95rem',
    color: '#666',
    marginBottom: '15px',
  },
  tableWrapper: {
    overflowX: 'auto',
    border: '1px solid #ddd',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: '#fff',
  },
  tableHeader: {
    backgroundColor: '#f5f5f5',
    borderBottom: '2px solid #ddd',
  },
  th: {
    padding: '12px',
    textAlign: 'left',
    fontWeight: 600,
    color: '#333',
    fontSize: '0.9rem',
  },
  tableRow: {
    borderBottom: '1px solid #e0e0e0',
  },
  td: {
    padding: '12px',
    color: '#555',
    fontSize: '0.9rem',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '20px',
    color: '#fff',
    fontSize: '0.85rem',
    fontWeight: 600,
  },
  detailButton: {
    padding: '6px 12px',
    fontSize: '0.85rem',
    backgroundColor: '#2196F3',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 600,
    transition: 'background-color 0.2s',
  },
  paginationGroup: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '15px',
    marginTop: '20px',
  },
  paginationText: {
    fontSize: '0.95rem',
    color: '#666',
    minWidth: '100px',
    textAlign: 'center',
  },
  button: {
    padding: '10px 20px',
    fontSize: '0.95rem',
    borderRadius: '6px',
    border: '1px solid #ddd',
    backgroundColor: '#f9f9f9',
    cursor: 'pointer',
    fontWeight: 600,
    color: '#333',
    transition: 'background-color 0.2s',
  },
  loading: {
    textAlign: 'center',
    color: '#999',
    fontSize: '1rem',
    padding: '40px',
  },
  errorBox: {
    backgroundColor: '#ffebee',
    border: '1px solid #ef5350',
    color: '#c62828',
    padding: '15px',
    borderRadius: '6px',
    marginBottom: '20px',
  },
  emptyBox: {
    backgroundColor: '#f5f5f5',
    border: '1px solid #e0e0e0',
    color: '#999',
    padding: '40px',
    textAlign: 'center',
    borderRadius: '6px',
    fontSize: '1rem',
  },
};
