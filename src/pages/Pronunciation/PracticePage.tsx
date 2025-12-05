/**
 * PracticePage.tsx
 * Main pronunciation practice interface with recording and real-time feedback
 */

import { useEffect, useState, useRef } from 'react';
import { pronunciationApi } from '../../lib/api/pronunciationApi';
import { Paragraph, ParagraphsListResponse } from '../../lib/api/pronunciationTypes';
import '../styles/PronunciationPages.css';

interface RecordingState {
  isRecording: boolean;
  recordedBlob: Blob | null;
  recordedDuration: number;
}

interface FilterState {
  difficulty: string;
  language: string;
}

interface PageState {
  pageNum: number;
  pageSize: number;
}

export default function PracticePage() {
  // Data fetching
  const [paragraphs, setParagraphs] = useState<Paragraph[]>([]);
  const [selectedParagraph, setSelectedParagraph] = useState<Paragraph | null>(null);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  // Recording
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    recordedBlob: null,
    recordedDuration: 0,
  });
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingStartTimeRef = useRef<number>(0);

  // Assessment
  const [assessmentLoading, setAssessmentLoading] = useState(false);
  const [assessmentError, setAssessmentError] = useState<string | null>(null);
  const [assessmentFeedback, setAssessmentFeedback] = useState<string | null>(null);

  // Filters
  const [filters, setFilters] = useState<FilterState>({
    difficulty: '',
    language: '',
  });

  // Pagination
  const [page, setPage] = useState<PageState>({
    pageNum: 1,
    pageSize: 20,
  });
  const [totalPages, setTotalPages] = useState(0);

  // Load paragraphs on mount and when filters/pagination change
  useEffect(() => {
    loadParagraphs();
  }, [filters, page.pageNum]);

  const loadParagraphs = async () => {
    setListLoading(true);
    setListError(null);
    try {
      const response: ParagraphsListResponse = await pronunciationApi.listParagraphs(
        page.pageNum,
        page.pageSize,
        filters.difficulty || undefined,
        filters.language || undefined
      );

      if (response.succeeded && response.data) {
        setParagraphs(response.data);
        setTotalPages(response.totalPages);
      } else {
        setListError(response.errors?.[0] || 'Failed to load paragraphs');
      }
    } catch (err) {
      setListError(
        err instanceof Error ? err.message : 'Failed to load paragraphs'
      );
    } finally {
      setListLoading(false);
    }
  };

  const handleParagraphChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const paragraph = paragraphs.find((p) => p.id === id) || null;
    setSelectedParagraph(paragraph);
    resetRecording();
    setAssessmentFeedback(null);
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    filterKey: keyof FilterState
  ) => {
    setFilters((prev) => ({
      ...prev,
      [filterKey]: e.target.value,
    }));
    setPage({ ...page, pageNum: 1 });
  };

  const resetRecording = () => {
    setRecordingState({
      isRecording: false,
      recordedBlob: null,
      recordedDuration: 0,
    });
    audioChunksRef.current = [];
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      audioChunksRef.current = [];
      recordingStartTimeRef.current = Date.now();

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: 'audio/webm',
        });
        const duration = Math.round(
          (Date.now() - recordingStartTimeRef.current) / 1000
        );

        setRecordingState({
          isRecording: false,
          recordedBlob: audioBlob,
          recordedDuration: duration,
        });

        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setRecordingState((prev) => ({
        ...prev,
        isRecording: true,
      }));
    } catch (err) {
      setAssessmentError(
        err instanceof Error
          ? err.message
          : 'Failed to access microphone'
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recordingState.isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const submitAudio = async () => {
    if (!selectedParagraph || !recordingState.recordedBlob) {
      setAssessmentError('Please select a paragraph and record audio');
      return;
    }

    setAssessmentLoading(true);
    setAssessmentError(null);
    setAssessmentFeedback(null);

    try {
      const feedback = await pronunciationApi.assess(
        selectedParagraph.id,
        recordingState.recordedBlob
      );

      setAssessmentFeedback(feedback || 'Assessment completed');
      resetRecording();
    } catch (err) {
      setAssessmentError(
        err instanceof Error ? err.message : 'Failed to assess audio'
      );
    } finally {
      setAssessmentLoading(false);
    }
  };

  const uniqueDifficulties = Array.from(
    new Set(paragraphs.map((p) => p.difficulty))
  ).sort();
  const uniqueLanguages = Array.from(
    new Set(paragraphs.map((p) => p.language))
  ).sort();

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Pronunciation Practice</h1>

      {/* Filters */}
      <div style={styles.filtersSection}>
        <div style={styles.filterGroup}>
          <label style={styles.label}>Difficulty</label>
          <select
            value={filters.difficulty}
            onChange={(e) => handleFilterChange(e, 'difficulty')}
            style={styles.select}
          >
            <option value="">All Levels</option>
            {uniqueDifficulties.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.label}>Language</label>
          <select
            value={filters.language}
            onChange={(e) => handleFilterChange(e, 'language')}
            style={styles.select}
          >
            <option value="">All Languages</option>
            {uniqueLanguages.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Paragraph Selection */}
      <div style={styles.section}>
        <label style={styles.label}>Select a Paragraph</label>
        {listLoading && <p style={styles.loading}>Loading paragraphs...</p>}
        {listError && <p style={styles.error}>{listError}</p>}
        {paragraphs.length === 0 && !listLoading && (
          <p style={styles.empty}>No paragraphs available</p>
        )}
        {paragraphs.length > 0 && (
          <>
            <select
              value={selectedParagraph?.id || ''}
              onChange={handleParagraphChange}
              style={styles.select}
            >
              <option value="">Choose a paragraph...</option>
              {paragraphs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.difficulty} - {p.language})
                </option>
              ))}
            </select>

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
                Previous
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
                Next
              </button>
            </div>
          </>
        )}
      </div>

      {/* Paragraph Preview */}
      {selectedParagraph && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>{selectedParagraph.title}</h2>
          <div style={styles.metadata}>
            <span>{selectedParagraph.difficulty}</span>
            <span>{selectedParagraph.language}</span>
            <span>{selectedParagraph.wordCount} words</span>
            <span>~{selectedParagraph.estimatedDurationSeconds}s</span>
          </div>

          <p style={styles.paragraphText}>{selectedParagraph.text}</p>

          {selectedParagraph.phoneticTranscription && (
            <div style={styles.phoneticBox}>
              <strong>Phonetic:</strong>
              <p>{selectedParagraph.phoneticTranscription}</p>
            </div>
          )}

          <p style={styles.timestamp}>
            Created: {new Date(selectedParagraph.createdAt).toLocaleDateString()}
          </p>
        </div>
      )}

      {/* Recording Control */}
      {selectedParagraph && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Record Your Pronunciation</h3>

          <div style={styles.recordingControls}>
            {!recordingState.isRecording && !recordingState.recordedBlob && (
              <button
                onClick={startRecording}
                style={{ ...styles.button, backgroundColor: '#4CAF50' }}
              >
                🎤 Start Recording
              </button>
            )}

            {recordingState.isRecording && (
              <>
                <div style={styles.recordingIndicator}>
                  <div style={styles.recordingDot}></div>
                  Recording...
                </div>
                <button
                  onClick={stopRecording}
                  style={{ ...styles.button, backgroundColor: '#f44336' }}
                >
                  Stop Recording
                </button>
              </>
            )}

            {recordingState.recordedBlob && !recordingState.isRecording && (
              <>
                <div style={styles.recordedInfo}>
                  ✓ Recorded: {recordingState.recordedDuration}s
                </div>
                <div style={styles.recordingButtonGroup}>
                  <button
                    onClick={() => {
                      if (recordingState.recordedBlob) {
                        const url = URL.createObjectURL(recordingState.recordedBlob);
                        const audio = new Audio(url);
                        audio.play();
                      }
                    }}
                    style={{ ...styles.button, backgroundColor: '#2196F3' }}
                  >
                    🔊 Play
                  </button>
                  <button
                    onClick={resetRecording}
                    style={{ ...styles.button, backgroundColor: '#FF9800' }}
                  >
                    Re-record
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Submit Button */}
          <button
            onClick={submitAudio}
            disabled={
              !recordingState.recordedBlob || assessmentLoading
            }
            style={{
              ...styles.button,
              ...styles.submitButton,
              opacity:
                !recordingState.recordedBlob || assessmentLoading
                  ? 0.5
                  : 1,
            }}
          >
            {assessmentLoading ? '⏳ Assessing...' : '📤 Submit for Assessment'}
          </button>
        </div>
      )}

      {/* Feedback Display */}
      {assessmentError && (
        <div style={styles.errorBox}>
          <strong>Error:</strong> {assessmentError}
        </div>
      )}

      {assessmentFeedback && (
        <div style={styles.feedbackBox}>
          <h3 style={styles.sectionTitle}>📊 AI Feedback</h3>
          <p>{assessmentFeedback}</p>
        </div>
      )}
    </div>
  );
}

// ============ Styles ============
const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '30px 20px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  title: {
    fontSize: '2rem',
    marginBottom: '30px',
    color: '#222',
  },
  filtersSection: {
    display: 'flex',
    gap: '20px',
    marginBottom: '30px',
    flexWrap: 'wrap',
  },
  filterGroup: {
    flex: 1,
    minWidth: '150px',
  },
  section: {
    backgroundColor: '#f9f9f9',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid #e0e0e0',
  },
  sectionTitle: {
    fontSize: '1.3rem',
    marginBottom: '15px',
    color: '#222',
    marginTop: 0,
  },
  label: {
    display: 'block',
    fontSize: '0.95rem',
    fontWeight: 600,
    marginBottom: '8px',
    color: '#333',
  },
  select: {
    width: '100%',
    padding: '10px',
    fontSize: '1rem',
    borderRadius: '6px',
    border: '1px solid #ccc',
    backgroundColor: '#fff',
    cursor: 'pointer',
  },
  metadata: {
    display: 'flex',
    gap: '15px',
    marginBottom: '15px',
    fontSize: '0.9rem',
    color: '#666',
    flexWrap: 'wrap',
  },
  paragraphText: {
    fontSize: '1.1rem',
    lineHeight: '1.6',
    color: '#333',
    marginBottom: '15px',
    padding: '15px',
    backgroundColor: '#fff',
    borderRadius: '6px',
    border: '1px solid #ddd',
  },
  phoneticBox: {
    backgroundColor: '#e3f2fd',
    padding: '15px',
    borderRadius: '6px',
    marginBottom: '15px',
    borderLeft: '4px solid #2196F3',
  },
  timestamp: {
    fontSize: '0.85rem',
    color: '#999',
    marginTop: '10px',
  },
  paginationGroup: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '15px',
    marginTop: '15px',
  },
  paginationText: {
    fontSize: '0.95rem',
    color: '#666',
    minWidth: '100px',
    textAlign: 'center',
  },
  button: {
    padding: '10px 20px',
    fontSize: '1rem',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
    color: '#fff',
    transition: 'opacity 0.2s',
  },
  submitButton: {
    width: '100%',
    padding: '14px',
    fontSize: '1.05rem',
    backgroundColor: '#4CAF50',
    marginTop: '15px',
  },
  recordingControls: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '15px',
  },
  recordingButtonGroup: {
    display: 'flex',
    gap: '10px',
  },
  recordedInfo: {
    padding: '10px',
    backgroundColor: '#c8e6c9',
    borderRadius: '6px',
    color: '#2e7d32',
    fontWeight: 600,
  },
  recordingIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px',
    backgroundColor: '#ffe0e0',
    borderRadius: '6px',
    color: '#d32f2f',
    fontWeight: 600,
  },
  recordingDot: {
    width: '12px',
    height: '12px',
    backgroundColor: '#d32f2f',
    borderRadius: '50%',
    animation: 'pulse 1s infinite',
  },
  errorBox: {
    backgroundColor: '#ffebee',
    border: '1px solid #ef5350',
    color: '#c62828',
    padding: '15px',
    borderRadius: '6px',
    marginBottom: '20px',
  },
  feedbackBox: {
    backgroundColor: '#f1f8e9',
    border: '1px solid #9ccc65',
    color: '#33691e',
    padding: '15px',
    borderRadius: '6px',
    marginBottom: '20px',
  },
  loading: {
    color: '#999',
    fontStyle: 'italic',
  },
  error: {
    color: '#d32f2f',
    fontWeight: 600,
  },
  empty: {
    color: '#999',
    fontStyle: 'italic',
  },
};
