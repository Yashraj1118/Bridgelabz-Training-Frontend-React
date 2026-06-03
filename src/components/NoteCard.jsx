import React, { useState } from 'react';
import { notesApi, labelsApi } from '../api';

const KEEP_COLORS = [
  { name: 'Default', value: '#FFFFFF' },
  { name: 'Red', value: '#F28B82' },
  { name: 'Orange', value: '#FBBC04' },
  { name: 'Yellow', value: '#FFF475' },
  { name: 'Green', value: '#CCFF90' },
  { name: 'Teal', value: '#A7FFEB' },
  { name: 'Blue', value: '#CBF0F8' },
  { name: 'Dark Blue', value: '#AECBFA' },
  { name: 'Purple', value: '#D7AEFB' },
  { name: 'Pink', value: '#FDCFE8' },
  { name: 'Brown', value: '#E6C9A8' },
  { name: 'Gray', value: '#E8EAED' }
];

export default function NoteCard({ 
  note, 
  allLabels, 
  onNoteUpdated, 
  onEditClick 
}) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [reminderTime, setReminderTime] = useState('');

  const handlePinToggle = async (e) => {
    e.stopPropagation();
    try {
      await notesApi.togglePin(note.id);
      onNoteUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  const handleArchiveToggle = async (e) => {
    e.stopPropagation();
    try {
      await notesApi.toggleArchive(note.id);
      onNoteUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  const handleTrashToggle = async (e) => {
    e.stopPropagation();
    try {
      await notesApi.toggleTrash(note.id);
      onNoteUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePermanently = async (e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this note permanently?")) {
      try {
        await notesApi.deletePermanently(note.id);
        onNoteUpdated();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleColorChange = async (e, colorValue) => {
    e.stopPropagation();
    try {
      await notesApi.update(note.id, { 
        title: note.title, 
        content: note.content, 
        color: colorValue 
      });
      onNoteUpdated();
    } catch (err) {
      console.error(err);
    } finally {
      setShowColorPicker(false);
    }
  };

  const handleLabelToggle = async (e, labelId) => {
    e.stopPropagation();
    const hasLabel = note.labels.some(l => l.id === labelId);
    try {
      if (hasLabel) {
        await labelsApi.removeLabelFromNote(labelId, note.id);
      } else {
        await labelsApi.addLabelToNote(labelId, note.id);
      }
      onNoteUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveReminder = async (e) => {
    e.stopPropagation();
    try {
      await notesApi.removeReminder(note.id);
      onNoteUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSetReminder = async (e) => {
    e.stopPropagation();
    if (!reminderTime) return;
    try {
      await notesApi.setReminder(note.id, reminderTime);
      onNoteUpdated();
      setShowReminderPicker(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to set reminder');
    }
  };

  return (
    <div 
      className="card note-card h-100 rounded-3 shadow-hover position-relative d-flex flex-column"
      style={{ 
        backgroundColor: note.color || '#FFFFFF',
        borderColor: note.color === '#FFFFFF' ? '#e2e8f0' : 'transparent',
        transition: 'all 0.25s ease'
      }}
      onClick={() => !note.isTrashed && onEditClick(note)}
    >
      <div className="card-body p-3.5 d-flex flex-column flex-grow-1">
        
        {/* Title & Pin Icon */}
        <div className="d-flex align-items-start justify-content-between mb-1.5">
          {note.title ? (
            <h6 className="card-title fw-bold text-dark mb-0 text-truncate" style={{ fontSize: '0.975rem', letterSpacing: '-0.2px' }}>
              {note.title}
            </h6>
          ) : (
            <div style={{ minHeight: '1px' }}></div>
          )}

          {!note.isTrashed && (
            <button
              className={`btn btn-link p-1 border-0 rounded-circle pin-btn opacity-0 transition-opacity ${note.isPinned ? 'opacity-100 text-warning' : 'text-secondary hover-light'}`}
              onClick={handlePinToggle}
              title={note.isPinned ? "Unpin note" : "Pin note"}
              type="button"
            >
              <i className={`bi bi-pin${note.isPinned ? '-fill' : ''}`}></i>
            </button>
          )}
        </div>

        {/* Content Body */}
        <p className="card-text text-dark text-break flex-grow-1 small note-card-content mb-3" style={{ whiteSpace: 'pre-wrap' }}>
          {note.content}
        </p>

        {/* Labels & Reminder Badges */}
        <div className="d-flex flex-wrap gap-1 mb-2.5">
          {note.reminder && (
            <span 
              className="badge bg-dark bg-opacity-10 text-dark border-0 rounded-pill d-inline-flex align-items-center gap-1.5 py-1 px-2.5 small fw-semibold"
              title="Reminder"
              onClick={(e) => e.stopPropagation()}
            >
              <i className="bi bi-bell"></i>
              {new Date(note.reminder).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
              {!note.isTrashed && (
                <button 
                  type="button" 
                  className="btn-close ms-1 shadow-none" 
                  style={{ fontSize: '0.6rem' }} 
                  onClick={handleRemoveReminder}
                />
              )}
            </span>
          )}

          {note.labels?.map(lbl => (
            <span 
              key={lbl.id} 
              className="badge bg-dark bg-opacity-10 text-dark border-0 rounded-pill d-inline-flex align-items-center gap-1.5 py-1 px-2.5 small fw-semibold"
              onClick={(e) => e.stopPropagation()}
            >
              <i className="bi bi-tag"></i>
              {lbl.name}
              {!note.isTrashed && (
                <button 
                  type="button" 
                  className="btn-close ms-1 shadow-none" 
                  style={{ fontSize: '0.6rem' }} 
                  onClick={(e) => handleLabelToggle(e, lbl.id)}
                />
              )}
            </span>
          ))}
        </div>

        {/* Footer toolbar - hidden by default, visible on card hover */}
        <div className="note-card-footer mt-auto pt-2 border-top border-dark border-opacity-10 d-flex align-items-center gap-1.5 position-relative opacity-0 transition-opacity">
          
          {/* TRASH MODE ACTIONS */}
          {note.isTrashed ? (
            <>
              <button 
                className="btn btn-link p-1 text-secondary hover-light border-0 rounded-circle" 
                type="button" 
                title="Delete forever"
                onClick={handleDeletePermanently}
              >
                <i className="bi bi-trash-fill text-danger"></i>
              </button>
              <button 
                className="btn btn-link p-1 text-secondary hover-light border-0 rounded-circle" 
                type="button" 
                title="Restore note"
                onClick={handleTrashToggle}
              >
                <i className="bi bi-arrow-counterclockwise text-success"></i>
              </button>
            </>
          ) : (
            // ACTIVE / ARCHIVE ACTIONS
            <>
              {/* Reminder Picker */}
              <div className="position-relative">
                <button 
                  className="btn btn-link p-1 text-secondary hover-light border-0 rounded-circle" 
                  type="button" 
                  title="Remind me"
                  onClick={(e) => { e.stopPropagation(); setShowReminderPicker(!showReminderPicker); setShowColorPicker(false); setShowLabelPicker(false); }}
                >
                  <i className="bi bi-bell fs-6"></i>
                </button>
                {showReminderPicker && (
                  <div 
                    className="picker-popover shadow-lg rounded-3 p-3 bg-white border border-light position-absolute" 
                    style={{ bottom: '35px', left: 0, zIndex: 1100, width: '240px' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h6 className="fw-bold text-dark mb-2 small">Set Reminder</h6>
                    <input 
                      type="datetime-local" 
                      className="form-control form-control-sm mb-2 rounded-2"
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                    />
                    <div className="text-end">
                      <button 
                        className="btn btn-warning btn-sm text-dark fw-semibold rounded-2 py-1 px-2"
                        onClick={handleSetReminder}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Color Chooser */}
              <div className="position-relative">
                <button 
                  className="btn btn-link p-1 text-secondary hover-light border-0 rounded-circle" 
                  type="button" 
                  title="Change color"
                  onClick={(e) => { e.stopPropagation(); setShowColorPicker(!showColorPicker); setShowReminderPicker(false); setShowLabelPicker(false); }}
                >
                  <i className="bi bi-palette fs-6"></i>
                </button>
                {showColorPicker && (
                  <div 
                    className="picker-popover shadow-lg rounded-4 p-2 bg-white border border-light position-absolute d-flex flex-wrap gap-1.5" 
                    style={{ bottom: '35px', left: 0, zIndex: 1100, width: '160px' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {KEEP_COLORS.map(c => (
                      <button
                        key={c.name}
                        type="button"
                        className="rounded-circle border border-dark border-opacity-10 color-btn"
                        style={{ backgroundColor: c.value, width: '22px', height: '22px' }}
                        title={c.name}
                        onClick={(e) => handleColorChange(e, c.value)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Labels Assigner */}
              <div className="position-relative">
                <button 
                  className="btn btn-link p-1 text-secondary hover-light border-0 rounded-circle" 
                  type="button" 
                  title="Change labels"
                  onClick={(e) => { e.stopPropagation(); setShowLabelPicker(!showLabelPicker); setShowColorPicker(false); setShowReminderPicker(false); }}
                >
                  <i className="bi bi-tag fs-6"></i>
                </button>
                {showLabelPicker && (
                  <div 
                    className="picker-popover shadow-lg rounded-3 p-2 bg-white border border-light position-absolute" 
                    style={{ bottom: '35px', left: 0, zIndex: 1100, width: '180px', maxHeight: '150px', overflowY: 'auto' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h6 className="fw-bold text-dark px-1 mb-1.5 small">Labels</h6>
                    {allLabels.length === 0 ? (
                      <p className="text-muted small px-1 py-1 mb-0">No labels found.</p>
                    ) : (
                      allLabels.map(l => (
                        <div key={l.id} className="form-check px-3.5 py-0.5 hover-light rounded-1">
                          <input 
                            className="form-check-input" 
                            type="checkbox" 
                            id={`card-lbl-${note.id}-${l.id}`}
                            checked={note.labels.some(nl => nl.id === l.id)}
                            onChange={(e) => handleLabelToggle(e, l.id)}
                          />
                          <label className="form-check-label text-dark small text-truncate d-block" htmlFor={`card-lbl-${note.id}-${l.id}`}>
                            {l.name}
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Archive Toggle */}
              <button 
                className="btn btn-link p-1 text-secondary hover-light border-0 rounded-circle" 
                type="button" 
                title={note.isArchived ? "Unarchive" : "Archive"}
                onClick={handleArchiveToggle}
              >
                <i className={`bi bi-archive${note.isArchived ? '-fill' : ''} fs-6`}></i>
              </button>

              {/* Trash Toggle */}
              <button 
                className="btn btn-link p-1 text-secondary hover-light border-0 rounded-circle ms-auto" 
                type="button" 
                title="Move to trash"
                onClick={handleTrashToggle}
              >
                <i className="bi bi-trash3 fs-6"></i>
              </button>
            </>
          )}

        </div>

      </div>
    </div>
  );
}
