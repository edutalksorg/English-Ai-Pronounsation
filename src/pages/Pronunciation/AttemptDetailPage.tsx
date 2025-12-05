/**
 * AttemptDetailPage.tsx
 * Display detailed pronunciation assessment with word-by-word breakdown
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pronunciationApi } from '../../lib/api/pronunciationApi';
import {
  AttemptDetailResponse,
  WordLevelFeedback,
} from '../../lib/api/pronunciationTypes';

export default function AttemptDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState<AttemptDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedWords, setExpandedWords] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!id) {
      setError('No attempt ID provided');
      setLoading(false);
      return;
    }
    loadAttempt();
  }, [id]);

  const loadAttempt = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await pronunciationApi.getAttempt(id);
      setAttempt(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load attempt');
    } finally {
      setLoading(false);
    }
  };

  const toggleWordExpand = (index: number) => {
    setExpandedWords((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const formatScore = (score: number): string => {
    return (score * 100).toFixed(1) + '%';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getScoreColor = (score: number): string => {
    if (score >= 0.8) return '#4CAF50'; // Green
    if (score >= 0.6) return '#FF9800'; // Orange
    return '#f44336'; // Red
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <p style={styles.loading}>Loading assessment details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <button
          onClick={() => navigate(-1)}
          style={styles.backButton}
        >
          ← Back
        </button>
        <div style={styles.errorBox}>{error}</div>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div style={styles.container}>
        <button
          onClick={() => navigate(-1)}
          style={styles.backButton}
        >
          ← Back
        </button>
        <div style={styles.emptyBox}>Attempt not found</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <button
        onClick={() => navigate(-1)}
        style={styles.backButton}
      >
        ← Back to History
      </button>

      {/* Header */}
      <div style={styles.headerSection}>
        <h1 style={styles.title}>{attempt.paragraphTitle}</h1>
        <div style={styles.timestampRow}>
          <span>📅 Submitted: {formatDate(attempt.submittedAt)}</span>
          {attempt.assessedAt && (
            <span>✓ Assessed: {formatDate(attempt.assessedAt)}</span>
          )}
        </div>
        <div style={styles.statusRow}>
          <span
            style={{
              ...styles.statusBadge,
              backgroundColor:
                attempt.processingStatus.toLowerCase() === 'completed'
                  ? '#4CAF50'
                  : '#FF9800',
            }}
          >
            {attempt.processingStatus}
          </span>
        </div>
      </div>

      {/* Error Message */}
      {attempt.errorMessage && (
        <div style={styles.errorBox}>
          <strong>Processing Error:</strong> {attempt.errorMessage}
        </div>
      )}

      {/* Overall Scores */}
      <div style={styles.scoresGrid}>
        <div style={styles.scoreCard}>
          <div style={styles.scoreLabel}>Overall Score</div>
          <div
            style={{
              ...styles.scoreValue,
              color: getScoreColor(attempt.overallScore),
            }}
          >
            {formatScore(attempt.overallScore)}
          </div>
        </div>
        <div style={styles.scoreCard}>
          <div style={styles.scoreLabel}>Pronunciation</div>
          <div
            style={{
              ...styles.scoreValue,
              color: getScoreColor(attempt.pronunciationAccuracy),
            }}
          >
            {formatScore(attempt.pronunciationAccuracy)}
          </div>
        </div>
        <div style={styles.scoreCard}>
          <div style={styles.scoreLabel}>Fluency</div>
          <div
            style={{
              ...styles.scoreValue,
              color: getScoreColor(attempt.fluencyScore),
            }}
          >
            {formatScore(attempt.fluencyScore)}
          </div>
        </div>
        <div style={styles.scoreCard}>
          <div style={styles.scoreLabel}>Completeness</div>
          <div
            style={{
              ...styles.scoreValue,
              color: getScoreColor(attempt.completenessScore),
            }}
          >
            {formatScore(attempt.completenessScore)}
          </div>
        </div>
      </div>

      {/* Audio Info */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>📻 Audio Recording</h2>
        <div style={styles.audioInfo}>
          <span>Duration: {attempt.audioDurationSeconds}s</span>
          {attempt.audioFileUrl && (
            <>
              <span>•</span>
              <audio
                controls
                src={attempt.audioFileUrl}
                style={styles.audioPlayer}
              />
            </>
          )}
        </div>
      </div>

      {/* Word-Level Feedback */}
      {attempt.wordLevelFeedback && attempt.wordLevelFeedback.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            📝 Word-by-Word Feedback ({attempt.wordLevelFeedback.length} words)
          </h2>

          <div style={styles.wordsList}>
            {attempt.wordLevelFeedback.map((wordFeedback, idx) => (
              <div key={idx} style={styles.wordItem}>
                <div
                  style={styles.wordHeader}
                  onClick={() => toggleWordExpand(idx)}
                >
                  <div style={styles.wordTitle}>
                    <span style={styles.wordText}>{wordFeedback.word}</span>
                    <span
                      style={{
                        ...styles.wordScore,
                        backgroundColor: getScoreColor(
                          wordFeedback.accuracyScore
                        ),
                      }}
                    >
                      {formatScore(wordFeedback.accuracyScore)}
                    </span>
                    <span style={styles.errorType}>
                      {wordFeedback.errorType}
                    </span>
                  </div>
                  <span style={styles.expandIcon}>
                    {expandedWords.has(idx) ? '▼' : '▶'}
                  </span>
                </div>

                {expandedWords.has(idx) && (
                  <div style={styles.wordDetails}>
                    {wordFeedback.syllables.length > 0 && (
                      <>
                        <div style={styles.syllablesHeader}>Syllables:</div>
                        {wordFeedback.syllables.map((syllable, sylIdx) => (
                          <div key={sylIdx} style={styles.syllableBox}>
                            <div style={styles.syllableRow}>
                              <span style={styles.syllableText}>
                                {syllable.text}
                              </span>
                              <span
                                style={{
                                  ...styles.syllableScore,
                                  backgroundColor: getScoreColor(
                                    syllable.accuracyScore
                                  ),
                                }}
                              >
                                {formatScore(syllable.accuracyScore)}
                              </span>
                            </div>

                            {syllable.phonemes.length > 0 && (
                              <div style={styles.phonemesContainer}>
                                {syllable.phonemes.map((phoneme, pIdx) => (
                                  <div
                                    key={pIdx}
                                    style={styles.phonemeItem}
                                  >
                                    <span style={styles.phonemeText}>
                                      {phoneme.text}
                                    </span>
                                    <span
                                      style={{
                                        ...styles.phonemeScore,
                                        backgroundColor: getScoreColor(
                                          phoneme.accuracyScore
                                        ),
                                      }}
                                    >
                                      {formatScore(phoneme.accuracyScore)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Feedback */}
      {(!attempt.wordLevelFeedback ||
        attempt.wordLevelFeedback.length === 0) && (
        <div style={styles.emptyBox}>
          No word-level feedback available yet
        </div>
      )}
    </div>
  );
}

// ============ Styles ============
const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '30px 20px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  backButton: {
    marginBottom: '20px',
    padding: '8px 16px',
    fontSize: '0.95rem',
    backgroundColor: '#f5f5f5',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 600,
    color: '#333',
  },
  headerSection: {
    marginBottom: '30px',
    paddingBottom: '20px',
    borderBottom: '2px solid #e0e0e0',
  },
  title: {
    fontSize: '2rem',
    marginBottom: '10px',
    color: '#222',
    marginTop: 0,
  },
  timestampRow: {
    display: 'flex',
    gap: '20px',
    marginBottom: '10px',
    flexWrap: 'wrap',
    fontSize: '0.9rem',
    color: '#666',
  },
  statusRow: {
    marginTop: '10px',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '6px 16px',
    borderRadius: '20px',
    color: '#fff',
    fontSize: '0.85rem',
    fontWeight: 600,
  },
  scoresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '15px',
    marginBottom: '30px',
  },
  scoreCard: {
    backgroundColor: '#f9f9f9',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '15px',
    textAlign: 'center',
  },
  scoreLabel: {
    fontSize: '0.85rem',
    color: '#666',
    fontWeight: 600,
    marginBottom: '10px',
  },
  scoreValue: {
    fontSize: '1.8rem',
    fontWeight: 700,
  },
  section: {
    backgroundColor: '#f9f9f9',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '1.2rem',
    marginBottom: '15px',
    color: '#222',
    marginTop: 0,
  },
  audioInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    flexWrap: 'wrap',
    fontSize: '0.95rem',
    color: '#555',
  },
  audioPlayer: {
    maxWidth: '300px',
    height: '30px',
  },
  wordsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  wordItem: {
    border: '1px solid #ddd',
    borderRadius: '6px',
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  wordHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    backgroundColor: '#f5f5f5',
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'background-color 0.2s',
  },
  wordTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1,
  },
  wordText: {
    fontWeight: 600,
    fontSize: '1rem',
    color: '#333',
    minWidth: '80px',
  },
  wordScore: {
    padding: '4px 10px',
    borderRadius: '12px',
    color: '#fff',
    fontWeight: 600,
    fontSize: '0.8rem',
  },
  errorType: {
    fontSize: '0.85rem',
    color: '#666',
    fontStyle: 'italic',
    minWidth: '100px',
  },
  expandIcon: {
    color: '#999',
    fontSize: '0.9rem',
  },
  wordDetails: {
    padding: '15px',
    backgroundColor: '#fafafa',
    borderTop: '1px solid #e0e0e0',
  },
  syllablesHeader: {
    fontWeight: 600,
    fontSize: '0.9rem',
    color: '#333',
    marginBottom: '10px',
  },
  syllableBox: {
    marginBottom: '12px',
    padding: '10px',
    backgroundColor: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
  },
  syllableRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  syllableText: {
    fontWeight: 600,
    color: '#333',
  },
  syllableScore: {
    padding: '3px 8px',
    borderRadius: '10px',
    color: '#fff',
    fontWeight: 600,
    fontSize: '0.75rem',
  },
  phonemesContainer: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginTop: '8px',
  },
  phonemeItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 8px',
    backgroundColor: '#f0f0f0',
    borderRadius: '4px',
    fontSize: '0.85rem',
  },
  phonemeText: {
    fontFamily: 'monospace',
    fontWeight: 600,
    color: '#333',
  },
  phonemeScore: {
    padding: '2px 6px',
    borderRadius: '8px',
    color: '#fff',
    fontWeight: 600,
    fontSize: '0.7rem',
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
  loading: {
    textAlign: 'center',
    color: '#999',
    fontSize: '1rem',
    padding: '40px',
  },
};
