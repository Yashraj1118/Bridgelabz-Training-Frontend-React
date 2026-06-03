import React, { useState, useEffect } from 'react';
import { notesApi, labelsApi, authApi } from './api';
import Auth from './components/Auth';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import NoteCreator from './components/NoteCreator';
import NoteCard from './components/NoteCard';
import EditNoteModal from './components/EditNoteModal';
import LabelsModal from './components/LabelsModal';
import './App.css';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [authView, setAuthView] = useState('login'); // login, register, verify-otp, forgot-password, reset-password-otp
  
  // Dashboard States
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth <= 768);
  const [activeTab, setActiveTab] = useState('notes'); // notes, reminders, archive, trash, label-{id}
  const [searchQuery, setSearchQuery] = useState('');
  const [isGridView, setIsGridView] = useState(true);
  
  // Data States
  const [notes, setNotes] = useState([]);
  const [pinnedNotes, setPinnedNotes] = useState([]);
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Modals States
  const [editingNote, setEditingNote] = useState(null);
  const [showLabelsModal, setShowLabelsModal] = useState(false);

  // Load initial dashboard data when logged in
  useEffect(() => {
    if (isLoggedIn) {
      fetchLabels();
      fetchNotes();
    }
  }, [isLoggedIn, activeTab]);

  // Handle Search Input Debouncing / Fetching
  useEffect(() => {
    if (isLoggedIn) {
      if (searchQuery.trim()) {
        const delayDebounce = setTimeout(() => {
          fetchSearchResults();
        }, 300);
        return () => clearTimeout(delayDebounce);
      } else {
        fetchNotes();
      }
    }
  }, [searchQuery, isLoggedIn]);

  const fetchLabels = async () => {
    try {
      const response = await labelsApi.getAll();
      setLabels(response.data.data || []);
    } catch (err) {
      console.error('Error fetching labels:', err);
    }
  };

  const fetchNotes = async () => {
    setLoading(true);
    try {
      if (activeTab === 'notes') {
        // Fetch active notes (non-archived, non-trashed)
        const responseActive = await notesApi.getAllActive();
        setNotes(responseActive.data.data || []);

        // Fetch pinned notes
        const responsePinned = await notesApi.getPinned();
        setPinnedNotes(responsePinned.data.data || []);
      } else if (activeTab === 'reminders') {
        // Reminders: Fetch all active notes, filter those with a reminder
        const responseActive = await notesApi.getAllActive();
        const activeNotes = responseActive.data.data || [];
        setNotes(activeNotes.filter(note => note.reminder));
        setPinnedNotes([]);
      } else if (activeTab === 'archive') {
        const responseArchived = await notesApi.getArchived();
        setNotes(responseArchived.data.data || []);
        setPinnedNotes([]);
      } else if (activeTab === 'trash') {
        const responseTrashed = await notesApi.getTrashed();
        setNotes(responseTrashed.data.data || []);
        setPinnedNotes([]);
      } else if (activeTab.startsWith('label-')) {
        const labelId = activeTab.split('-')[1];
        const responseLabel = await labelsApi.getNotesByLabel(labelId);
        setNotes(responseLabel.data.data || []);
        setPinnedNotes([]);
      }
    } catch (err) {
      console.error('Error fetching notes:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSearchResults = async () => {
    setLoading(true);
    try {
      const response = await notesApi.search(searchQuery);
      setNotes(response.data.data || []);
      setPinnedNotes([]);
    } catch (err) {
      console.error('Error searching notes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setActiveTab('notes');
  };

  const handleLogout = () => {
    authApi.logout();
    setIsLoggedIn(false);
    setAuthView('login');
    setNotes([]);
    setPinnedNotes([]);
    setLabels([]);
  };

  const handleRefresh = () => {
    setSearchQuery('');
    fetchLabels();
    fetchNotes();
  };

  const handleNoteUpdated = () => {
    fetchNotes();
    // Update labels if modal actions modified them
    fetchLabels();
    if (editingNote) {
      // Refresh current editing note reference if open
      const refreshedNote = [...notes, ...pinnedNotes].find(n => n.id === editingNote.id);
      setEditingNote(refreshedNote || null);
    }
  };

  const handleLabelsUpdated = () => {
    fetchLabels();
    fetchNotes();
  };

  const getTabTitle = () => {
    if (searchQuery.trim()) return `Search Results for "${searchQuery}"`;
    if (activeTab === 'notes') return 'Notes';
    if (activeTab === 'reminders') return 'Reminders';
    if (activeTab === 'archive') return 'Archive';
    if (activeTab === 'trash') return 'Trash';
    if (activeTab.startsWith('label-')) {
      const id = activeTab.split('-')[1];
      const lbl = labels.find(l => String(l.id) === String(id));
      return lbl ? `Label: ${lbl.name}` : 'Label Notes';
    }
    return 'Notes';
  };

  // Auth screen router
  if (!isLoggedIn) {
    return (
      <Auth 
        onLoginSuccess={handleLoginSuccess} 
        currentView={authView} 
        setView={setAuthView} 
      />
    );
  }

  // Dashboard layout
  return (
    <div className="dashboard-container min-vh-100 bg-light">
      {/* Header */}
      <Header 
        onMenuToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isGridView={isGridView}
        setIsGridView={setIsGridView}
        onRefresh={handleRefresh}
        onLogout={handleLogout}
      />

      {/* Sidebar Drawer */}
      <Sidebar 
        isCollapsed={isSidebarCollapsed}
        activeTab={activeTab}
        setActiveTab={(tab) => { 
          setActiveTab(tab); 
          setSearchQuery(''); 
          if (window.innerWidth <= 768) {
            setIsSidebarCollapsed(true);
          }
        }}
        labels={labels}
        onEditLabelsClick={() => setShowLabelsModal(true)}
      />

      {/* Main Content Area */}
      <div 
        className={`main-wrapper p-4 transition-all ${isSidebarCollapsed ? 'main-wrapper-collapsed' : 'main-wrapper-expanded'}`}
      >
        <div className="container-fluid max-width-xl p-0">
          
          {/* Note Creator - Only visible on 'Notes' or dynamic label views, and not searching */}
          {!searchQuery && (activeTab === 'notes' || activeTab.startsWith('label-')) && (
            <NoteCreator 
              labels={labels} 
              onNoteCreated={handleNoteUpdated} 
            />
          )}

          {/* Dynamic Title Header */}
          <div className="d-flex align-items-center justify-content-between mb-4 mt-2">
            <h5 className="fw-semibold text-secondary mb-0">{getTabTitle()}</h5>
            {loading && (
              <div className="spinner-border spinner-border-sm text-warning" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            )}
          </div>

          {/* Empty State Display */}
          {!loading && notes.length === 0 && pinnedNotes.length === 0 && (
            <div className="text-center py-5">
              <div className="text-muted mb-3">
                <i className={`bi bi-${
                  activeTab === 'notes' ? 'lightbulb' : 
                  activeTab === 'reminders' ? 'bell' : 
                  activeTab === 'archive' ? 'archive' : 
                  activeTab === 'trash' ? 'trash3' : 'tag'
                } fs-1 opacity-25`}></i>
              </div>
              <p className="text-muted fw-medium">
                {activeTab === 'notes' ? 'Notes you add appear here' :
                 activeTab === 'reminders' ? 'Notes with upcoming reminders appear here' :
                 activeTab === 'archive' ? 'Archived notes appear here' :
                 activeTab === 'trash' ? 'No notes in Trash' : 'No notes with this label yet'}
              </p>
            </div>
          )}

          {/* PINNED NOTES SECTION */}
          {pinnedNotes.length > 0 && (
            <div className="pinned-notes-container mb-5">
              <div className="text-uppercase tracking-wider small fw-bold text-muted mb-3" style={{ fontSize: '0.725rem' }}>Pinned</div>
              <div className={`row ${isGridView ? 'row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3.5' : 'row-cols-1 g-3'} justify-content-start`}>
                {pinnedNotes.map((note) => (
                  <div className="col" key={note.id}>
                    <NoteCard 
                      note={note} 
                      allLabels={labels} 
                      onNoteUpdated={handleNoteUpdated}
                      onEditClick={setEditingNote}
                    />
                  </div>
                ))}
              </div>
              
              <div className="border-top my-4"></div>
              <div className="text-uppercase tracking-wider small fw-bold text-muted mb-3" style={{ fontSize: '0.725rem' }}>Others</div>
            </div>
          )}

          {/* ACTIVE / ARCHIVED / TRASHED / LABELED / SEARCHED NOTES LIST */}
          {notes.length > 0 && (
            <div className={`row ${isGridView ? 'row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3.5' : 'row-cols-1 g-3'} justify-content-start`}>
              {notes.map((note) => (
                <div className="col" key={note.id}>
                  <NoteCard 
                    note={note} 
                    allLabels={labels} 
                    onNoteUpdated={handleNoteUpdated}
                    onEditClick={setEditingNote}
                  />
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* Edit Note Modal */}
      {editingNote && (
        <EditNoteModal 
          note={editingNote} 
          allLabels={labels} 
          onClose={() => setEditingNote(null)}
          onNoteUpdated={handleNoteUpdated}
        />
      )}

      {/* Edit Labels Modal */}
      {showLabelsModal && (
        <LabelsModal 
          labels={labels}
          onClose={() => setShowLabelsModal(false)}
          onLabelsUpdated={handleLabelsUpdated}
        />
      )}
    </div>
  );
}
