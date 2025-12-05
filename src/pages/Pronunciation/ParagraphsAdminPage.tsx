/**
 * ParagraphsAdminPage.tsx
 * Admin UI for managing paragraphs (Create, Read, Update, Delete)
 */

import { useEffect, useState } from 'react';
import { pronunciationApi } from '../../lib/api/pronunciationApi';
import {
  Paragraph,
  ParagraphsListResponse,
  CreateParagraphRequest,
  UpdateParagraphRequest,
} from '../../lib/api/pronunciationTypes';

type FormMode = 'create' | 'edit' | null;

interface FormData {
  id?: string;
  title: string;
  text: string;
  difficulty: string;
  language: string;
  phoneticTranscription: string;
  isActive?: boolean;
}

interface PageState {
  pageNum: number;
  pageSize: number;
}

const initialFormData: FormData = {
  title: '',
  text: '',
  difficulty: '',
  language: '',
  phoneticTranscription: '',
  isActive: true,
};

export default function ParagraphsAdminPage() {
  const [paragraphs, setParagraphs] = useState<Paragraph[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formMode, setFormMode] = useState<FormMode>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [page, setPage] = useState<PageState>({
    pageNum: 1,
    pageSize: 10,
  });
  const [totalPages, setTotalPages] = useState(0);

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadParagraphs();
  }, [page.pageNum]);

  const loadParagraphs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response: ParagraphsListResponse = await pronunciationApi.listParagraphs(
        page.pageNum,
        page.pageSize
      );

      if (response.succeeded && response.data) {
        setParagraphs(response.data);
        setTotalPages(response.totalPages);
      } else {
        setError(response.errors?.[0] || 'Failed to load paragraphs');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load paragraphs');
    } finally {
      setLoading(false);
    }
  };

  const openCreateForm = () => {
    setFormMode('create');
    setFormData(initialFormData);
    setFormError(null);
  };

  const openEditForm = (paragraph: Paragraph) => {
    setFormMode('edit');
    setFormData({
      id: paragraph.id,
      title: paragraph.title,
      text: paragraph.text,
      difficulty: paragraph.difficulty,
      language: paragraph.language,
      phoneticTranscription: paragraph.phoneticTranscription,
      isActive: true,
    });
    setFormError(null);
  };

  const closeForm = () => {
    setFormMode(null);
    setFormData(initialFormData);
    setFormError(null);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as any;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (
      !formData.title.trim() ||
      !formData.text.trim() ||
      !formData.difficulty ||
      !formData.language
    ) {
      setFormError('All fields are required');
      return;
    }

    setFormLoading(true);

    try {
      if (formMode === 'create') {
        const request: CreateParagraphRequest = {
          title: formData.title,
          text: formData.text,
          difficulty: formData.difficulty,
          language: formData.language,
          phoneticTranscription: formData.phoneticTranscription,
        };
        const createdId = await pronunciationApi.createParagraph(request);
        setSuccessMessage(`Paragraph created successfully (ID: ${createdId})`);
        closeForm();
        setPage({ ...page, pageNum: 1 });
        await loadParagraphs();
      } else if (formMode === 'edit' && formData.id) {
        const request: UpdateParagraphRequest = {
          id: formData.id,
          title: formData.title,
          text: formData.text,
          phoneticTranscription: formData.phoneticTranscription,
          isActive: formData.isActive ?? true,
        };
        await pronunciationApi.updateParagraph(request);
        setSuccessMessage('Paragraph updated successfully');
        closeForm();
        await loadParagraphs();
      }
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Failed to save paragraph'
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id);
      return;
    }

    try {
      await pronunciationApi.deleteParagraph(id);
      setSuccessMessage('Paragraph deleted successfully');
      setDeleteConfirm(null);
      await loadParagraphs();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete paragraph');
      setDeleteConfirm(null);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Paragraphs Management</h1>

      {error && <div style={styles.errorBox}>{error}</div>}
      {successMessage && (
        <div style={styles.successBox}>
          {successMessage}
          <button
            onClick={() => setSuccessMessage(null)}
            style={styles.closeMessage}
          >
            ✕
          </button>
        </div>
      )}

      {/* Form Section */}
      {formMode && (
        <div style={styles.formSection}>
          <h2 style={styles.formTitle}>
            {formMode === 'create' ? 'Create New Paragraph' : 'Edit Paragraph'}
          </h2>

          {formError && <div style={styles.formErrorBox}>{formError}</div>}

          <form onSubmit={submitForm} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleFormChange}
                placeholder="Paragraph title"
                style={styles.input}
              />
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Difficulty *</label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleFormChange}
                  style={styles.input}
                >
                  <option value="">Select difficulty...</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Language *</label>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleFormChange}
                  style={styles.input}
                >
                  <option value="">Select language...</option>
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                  <option value="Mandarin">Mandarin</option>
                </select>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Paragraph Text *</label>
              <textarea
                name="text"
                value={formData.text}
                onChange={handleFormChange}
                placeholder="Enter the paragraph text..."
                style={{ ...styles.input, ...styles.textarea }}
                rows={6}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Phonetic Transcription</label>
              <textarea
                name="phoneticTranscription"
                value={formData.phoneticTranscription}
                onChange={handleFormChange}
                placeholder="Optional phonetic transcription..."
                style={{ ...styles.input, ...styles.textarea }}
                rows={3}
              />
            </div>

            {formMode === 'edit' && (
              <div style={styles.formGroup}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive ?? true}
                    onChange={handleFormChange}
                  />
                  Active
                </label>
              </div>
            )}

            <div style={styles.formActions}>
              <button
                type="submit"
                disabled={formLoading}
                style={{
                  ...styles.button,
                  ...styles.submitButton,
                  opacity: formLoading ? 0.6 : 1,
                }}
              >
                {formLoading
                  ? formMode === 'create'
                    ? 'Creating...'
                    : 'Updating...'
                  : formMode === 'create'
                    ? 'Create'
                    : 'Update'}
              </button>
              <button
                type="button"
                onClick={closeForm}
                style={{ ...styles.button, ...styles.cancelButton }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Action Button */}
      {!formMode && (
        <button
          onClick={openCreateForm}
          style={{ ...styles.button, ...styles.createButton, marginBottom: '20px' }}
        >
          + Create Paragraph
        </button>
      )}

      {/* Paragraphs List */}
      {loading && <p style={styles.loading}>Loading paragraphs...</p>}

      {paragraphs.length === 0 && !loading && (
        <div style={styles.emptyBox}>No paragraphs found</div>
      )}

      {paragraphs.length > 0 && (
        <>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={styles.th}>Title</th>
                  <th style={styles.th}>Difficulty</th>
                  <th style={styles.th}>Language</th>
                  <th style={styles.th}>Words</th>
                  <th style={styles.th}>Created</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paragraphs.map((p) => (
                  <tr key={p.id} style={styles.tableRow}>
                    <td style={styles.td}>
                      <strong>{p.title}</strong>
                      <div style={styles.preview}>{p.text.substring(0, 60)}...</div>
                    </td>
                    <td style={styles.td}>{p.difficulty}</td>
                    <td style={styles.td}>{p.language}</td>
                    <td style={styles.td}>{p.wordCount}</td>
                    <td style={styles.td}>
                      <small>{new Date(p.createdAt).toLocaleDateString()}</small>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionButtons}>
                        <button
                          onClick={() => openEditForm(p)}
                          style={{
                            ...styles.actionButton,
                            ...styles.editButton,
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          style={{
                            ...styles.actionButton,
                            ...styles.deleteButton,
                            backgroundColor:
                              deleteConfirm === p.id ? '#c62828' : '#f44336',
                          }}
                        >
                          {deleteConfirm === p.id ? 'Confirm Delete' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
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
          )}
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
  errorBox: {
    backgroundColor: '#ffebee',
    border: '1px solid #ef5350',
    color: '#c62828',
    padding: '15px',
    borderRadius: '6px',
    marginBottom: '20px',
  },
  successBox: {
    backgroundColor: '#c8e6c9',
    border: '1px solid #66bb6a',
    color: '#2e7d32',
    padding: '15px',
    borderRadius: '6px',
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeMessage: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#2e7d32',
    cursor: 'pointer',
    fontSize: '1.2rem',
    fontWeight: 'bold',
  },
  formSection: {
    backgroundColor: '#f9f9f9',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '25px',
    marginBottom: '30px',
  },
  formTitle: {
    fontSize: '1.3rem',
    marginBottom: '20px',
    marginTop: 0,
    color: '#222',
  },
  formErrorBox: {
    backgroundColor: '#ffebee',
    border: '1px solid #ef5350',
    color: '#c62828',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '15px',
    fontSize: '0.9rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontWeight: 600,
    fontSize: '0.9rem',
    color: '#333',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.95rem',
    color: '#333',
    cursor: 'pointer',
  },
  input: {
    padding: '10px',
    fontSize: '0.95rem',
    borderRadius: '6px',
    border: '1px solid #ccc',
    backgroundColor: '#fff',
    fontFamily: 'inherit',
  },
  textarea: {
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  formActions: {
    display: 'flex',
    gap: '10px',
    marginTop: '10px',
  },
  button: {
    padding: '10px 20px',
    fontSize: '0.95rem',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
    transition: 'background-color 0.2s',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    color: '#fff',
    flex: 1,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    color: '#333',
    border: '1px solid #ddd',
  },
  createButton: {
    backgroundColor: '#2196F3',
    color: '#fff',
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
  preview: {
    fontSize: '0.8rem',
    color: '#999',
    marginTop: '4px',
  },
  actionButtons: {
    display: 'flex',
    gap: '8px',
  },
  actionButton: {
    padding: '6px 12px',
    fontSize: '0.85rem',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 600,
    color: '#fff',
  },
  editButton: {
    backgroundColor: '#2196F3',
  },
  deleteButton: {
    backgroundColor: '#f44336',
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
  loading: {
    textAlign: 'center',
    color: '#999',
    fontSize: '1rem',
    padding: '40px',
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
