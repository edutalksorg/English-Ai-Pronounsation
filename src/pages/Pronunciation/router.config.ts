// ============ Route Definitions ============
// Add these routes to your App.tsx:
// <Route path="/pronunciation" element={<PracticePage />} />
// <Route path="/pronunciation/history" element={<HistoryPage />} />
// <Route path="/pronunciation/attempts/:id" element={<AttemptDetailPage />} />
// <Route path="/admin/pronunciation/paragraphs" element={<ParagraphsAdminPage />} />

export const pronunciationRoutes = [
  {
    path: '/pronunciation',
    component: 'PracticePage',
    title: 'Pronunciation Practice',
    description: 'Practice and record pronunciation with AI feedback',
  },
  {
    path: '/pronunciation/history',
    component: 'HistoryPage',
    title: 'Assessment History',
    description: 'View past pronunciation assessments',
  },
  {
    path: '/pronunciation/attempts/:id',
    component: 'AttemptDetailPage',
    title: 'Attempt Details',
    description: 'Detailed breakdown of a pronunciation assessment',
  },
  {
    path: '/admin/pronunciation/paragraphs',
    component: 'ParagraphsAdminPage',
    title: 'Manage Paragraphs',
    description: 'Create, edit, and delete pronunciation paragraphs',
    adminOnly: true,
  },
];

// ============ Navigation Links ============
export const pronunciationNavLinks = [
  {
    label: 'Practice',
    path: '/pronunciation',
    icon: '🎤',
  },
  {
    label: 'History',
    path: '/pronunciation/history',
    icon: '📊',
  },
  {
    label: 'Admin',
    path: '/admin/pronunciation/paragraphs',
    icon: '⚙️',
    adminOnly: true,
  },
];
