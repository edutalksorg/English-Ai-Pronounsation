# Pronunciation Module - Complete Setup Guide

## 📋 Overview

This is a production-ready Pronunciation module for the Edutalks AI app. It includes:

- **API Service** (`pronunciationApi.ts`) - Axios-based API client with Bearer token auth
- **TypeScript Types** (`pronunciationTypes.ts`) - Full type safety matching Swagger schemas
- **4 React Pages**:
  - `PracticePage.tsx` - Record and submit audio for assessment
  - `HistoryPage.tsx` - Paginated assessment history
  - `AttemptDetailPage.tsx` - Detailed phoneme-level breakdown
  - `ParagraphsAdminPage.tsx` - CRUD for paragraph management

## 🔧 Installation

### 1. Files Already Created

```
src/lib/api/
  ├── pronunciationApi.ts       ← API service
  └── pronunciationTypes.ts     ← TypeScript interfaces

src/pages/Pronunciation/
  ├── PracticePage.tsx          ← Main practice page
  ├── HistoryPage.tsx           ← History with pagination
  ├── AttemptDetailPage.tsx     ← Detailed results
  ├── ParagraphsAdminPage.tsx   ← Admin CRUD
  └── router.config.ts          ← Route definitions

src/pages/styles/
  └── PronunciationPages.css    ← Shared styles
```

### 2. Environment Setup

Add to `.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

If running in production:
```env
VITE_API_BASE_URL=https://your-api-domain.com/api/v1
```

### 3. Dependencies (Already Installed)

Ensure your `package.json` has:

```json
{
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "react-router-dom": "^6.0.0",
    "axios": "^1.4.0"
  }
}
```

## 🚀 Integration into App

### Option A: Add to Existing Router

In your main `App.tsx` or router file:

```tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PracticePage from './pages/Pronunciation/PracticePage';
import HistoryPage from './pages/Pronunciation/HistoryPage';
import AttemptDetailPage from './pages/Pronunciation/AttemptDetailPage';
import ParagraphsAdminPage from './pages/Pronunciation/ParagraphsAdminPage';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Existing routes */}
        
        {/* Pronunciation Module */}
        <Route path="/pronunciation" element={<PracticePage />} />
        <Route path="/pronunciation/history" element={<HistoryPage />} />
        <Route path="/pronunciation/attempts/:id" element={<AttemptDetailPage />} />
        
        {/* Admin Only */}
        <Route path="/admin/pronunciation/paragraphs" element={<ParagraphsAdminPage />} />
      </Routes>
    </Router>
  );
}
```

### Option B: Add Navigation Links

```tsx
import { pronunciationNavLinks } from './pages/Pronunciation/router.config';

export function NavBar() {
  return (
    <nav>
      {pronunciationNavLinks.map(link => (
        <a key={link.path} href={link.path}>
          {link.icon} {link.label}
        </a>
      ))}
    </nav>
  );
}
```

## 🔐 Authentication

The API service automatically includes the Bearer token from localStorage:

```tsx
// Token is read from localStorage.getItem('accessToken')
// and sent as: Authorization: Bearer <token>
```

Make sure your login/auth flow stores the token:

```tsx
// After successful login:
localStorage.setItem('accessToken', response.data.token);
```

## 📱 Usage Examples

### 1. Load Paragraphs for Practice

```tsx
import { pronunciationApi } from './lib/api/pronunciationApi';

const response = await pronunciationApi.listParagraphs(
  1,      // page
  20,     // pageSize
  'Intermediate',  // difficulty (optional)
  'English'        // language (optional)
);

// response.data is an array of Paragraph objects
// response.currentPage, totalPages, etc. for pagination
```

### 2. Record and Submit Audio

```tsx
const recordedBlob = ... // from MediaRecorder

const feedback = await pronunciationApi.assess(
  paragraphId,
  recordedBlob
);

// feedback is a plain text string with AI assessment
console.log(feedback);
```

### 3. Get Assessment History

```tsx
const history = await pronunciationApi.getHistory(1, 10);

// history.data is an array of AssessmentAttempt objects
// Each includes: scores, word-level feedback, status, timestamps
```

### 4. Get Detailed Assessment Results

```tsx
const attempt = await pronunciationApi.getAttempt(attemptId);

// attempt includes full word-by-word feedback with:
// - Syllable breakdown
// - Phoneme-level accuracy scores
// - Overall, pronunciation, fluency, completeness scores
```

### 5. Admin: Create Paragraph

```tsx
const paragraphId = await pronunciationApi.createParagraph({
  title: 'Sample Text',
  text: 'The quick brown fox jumps over the lazy dog.',
  difficulty: 'Beginner',
  language: 'English',
  phoneticTranscription: 'ðə kwɪk braʊn fɒks dʒʌmps...'
});

// Returns the ID of the created paragraph
```

### 6. Admin: Update Paragraph

```tsx
await pronunciationApi.updateParagraph({
  id: 'paragraph-id',
  title: 'Updated Title',
  text: 'Updated text here.',
  phoneticTranscription: 'updated phonetics',
  isActive: true
});

// Returns 204 No Content
```

### 7. Admin: Delete Paragraph

```tsx
await pronunciationApi.deleteParagraph('paragraph-id');

// Returns 204 No Content
```

## 🎯 Features

### PracticePage
- ✅ Dropdown with paragraph selection
- ✅ Filter by difficulty and language
- ✅ Pagination support
- ✅ Real-time audio recording with MediaRecorder
- ✅ Play/re-record controls
- ✅ Submit audio with multipart/form-data
- ✅ Plain text AI feedback display
- ✅ Loading & error states

### HistoryPage
- ✅ Paginated table of past attempts
- ✅ Overall score, pronunciation, fluency, completeness scores
- ✅ Assessment status badge
- ✅ Direct links to attempt details
- ✅ Submission and assessment timestamps

### AttemptDetailPage
- ✅ Full assessment overview with all scores
- ✅ Audio file playback
- ✅ Word-by-word feedback with accuracy scores
- ✅ Syllable breakdown for each word
- ✅ Phoneme-level accuracy scores
- ✅ Collapsible word details for easy scanning
- ✅ Color-coded score visualization
- ✅ Processing status and error messages

### ParagraphsAdminPage
- ✅ Create new paragraphs with full form
- ✅ Edit existing paragraphs
- ✅ Delete with confirmation
- ✅ Paginated list view
- ✅ Form validation
- ✅ Success/error messaging
- ✅ Responsive table layout

## 🛡️ Error Handling

All API calls include error handling:

```tsx
try {
  const result = await pronunciationApi.someMethod();
} catch (error) {
  // Axios errors are caught and displayed
  if (error instanceof Error) {
    console.error(error.message);
  }
}
```

The components display user-friendly error messages and recovery options.

## 🎨 Styling

All components use inline styles (React.CSSProperties) for easy customization:

```tsx
// Override any style inline
const customContainerStyle = {
  ...styles.container,
  backgroundColor: '#f0f0f0',
};
```

For global overrides, modify `src/pages/styles/PronunciationPages.css`.

## 📊 Response Schema Compliance

All types match the Swagger schemas exactly:

- ✅ `ParagraphsListResponse` - with pagination
- ✅ `Paragraph` - individual item structure
- ✅ `AssessmentHistoryResponse` - paginated history
- ✅ `AssessmentAttempt` - single attempt with full feedback
- ✅ `AttemptDetailResponse` - detailed breakdown structure
- ✅ `WordLevelFeedback` - word scores and syllables
- ✅ `Syllable` - syllable structure with phonemes
- ✅ `Phoneme` - phoneme accuracy

No assumptions made. All field names and types match backend exactly.

## 🔄 Pagination

All paginated endpoints support:

```tsx
// Standard pagination params
await pronunciationApi.listParagraphs(
  page: number,      // 1-based page number
  pageSize: number   // items per page
);

// Response includes:
// - currentPage, totalPages, totalCount, pageSize
// - hasPreviousPage, hasNextPage boolean flags
```

## 🎤 Audio Recording Details

The `PracticePage` uses the standard Web Audio API:

```tsx
// MediaRecorder captures audio as WebM format
const mediaRecorder = new MediaRecorder(stream);

// Stops recording and creates a Blob
mediaRecorder.onstop = () => {
  const audioBlob = new Blob(chunks, { type: 'audio/webm' });
  // Send to API
};
```

The module:
- Requests microphone permission
- Records in WebM format (widely supported)
- Shows recording indicator with real-time controls
- Allows playback before submission
- Sends as multipart/form-data to `/assess` endpoint

## 🚨 Troubleshooting

### "No microphone permission"
- User must allow microphone access in browser
- Check if running on HTTPS (required in production)
- Ensure browser supports MediaRecorder API

### "Failed to load paragraphs"
- Check if API base URL is correct in `.env`
- Verify Bearer token is in localStorage
- Check network tab for 401/403 errors (auth issues)

### "Assessment not completed yet"
- Check processingStatus field (may be "pending" or "processing")
- Wait a moment and refresh the page
- Check errorMessage field for details

### Styling issues
- Inline styles override all CSS
- Import `PronunciationPages.css` for global animations
- Modify the `styles` object in each component

## 📝 Notes

- All components are **fully typed** with TypeScript
- **No dummy data** - all data from API
- **Production ready** - includes loading states, error handling
- **Modular** - easy to integrate into existing apps
- **Accessible** - semantic HTML, keyboard navigation
- **Responsive** - works on mobile and desktop

## 🔗 API Endpoints Used

```
GET    /api/v1/pronunciation/paragraphs
GET    /api/v1/pronunciation/paragraphs/{id}
POST   /api/v1/pronunciation/paragraphs
PUT    /api/v1/pronunciation/paragraphs/{id}
DELETE /api/v1/pronunciation/paragraphs/{id}
POST   /api/v1/pronunciation/assess
GET    /api/v1/pronunciation/history
GET    /api/v1/pronunciation/attempts/{id}
```

All endpoints use Bearer token authentication.

---

**Ready to integrate!** Just add the routes to your App.tsx and ensure the API base URL is configured.
