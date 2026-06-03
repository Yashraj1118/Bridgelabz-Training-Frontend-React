import React, { useState, useEffect } from 'react';
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

export default function EditNoteModal({ 
  note, 
  allLabels, 
  onClose, 
  onNoteUpdated 
}) {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [color, setColor] = useState(note?.color || '#FFFFFF');
  const [isPinned, setIsPinned] = useState(note?.isPinned || false);
  const [isArchived, setIsArchived] = useState(note?.isArchived || false);
  const [reminder, setReminder] = useState(note?.reminder || '');

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const [showReminderPicker, setShowReminderPicker] = useState(false);

  // Synchronize on note changes
  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setColor(note.color || '#FFFFFF');
      setIsPinned(note.isPinned || false);
      setIsArchived(note.isArchived || false);
      setReminder(note.reminder || '');
    }
  }, [note]);

  if (!note) return null;

  const handleSaveAndClose = async () => {
    try {
      // 1. Update basic fields (must match validation)
      await notesApi.update(note.id, {
        title: title.trim(),
        content: content.trim() || ' ',
        color: color
      });

      // 2. Update pin / archive if they changed
      if (isPinned !== note.isPinned) {
        await notesApi.togglePin(note.id);
      }
      if (isArchived !== note.isArchived) {
        await notesApi.toggleArchive(note.id);
      }

      // 3. Update reminder if changed
      if (reminder !== note.reminder) {
        if (reminder) {
          await notesApi.setReminder(note.id, reminder);
        } else {
          await notesApi.removeReminder(note.id);
        }
      }

      onNoteUpdated();
      onClose();
    } catch (err) {
      console.error('Error updating note in modal:', err);
      alert(err.response?.data?.message || 'Error updating note');
    }
  };

  const handleLabelToggleInModal = async (labelId) => {
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

  return (
    <div className="modal-backdrop-custom d-flex align-items-center justify-content-center px-3" onClick={handleSaveAndClose}>
      <div 
        className="card border-0 shadow-lg rounded-4 w-100 position-relative edit-modal-card overflow-hidden"
        style={{ 
          maxWidth: '560px', 
          backgroundColor: color, 
          transition: 'background-color 0.2s ease'
        }}
        onClick={(e) => e.stopPropagation()} // stop close on modal click
      >
        <div className="card-body p-4">
          
          {/* Header toolbar: Pin */}
          <div className="d-flex align-items-start justify-content-between mb-2">
            <input 
              type="text" 
              className="form-control border-0 bg-transparent shadow-none fs-5 fw-bold p-0 text-dark" 
              placeholder="Title" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <button 
              className={`btn btn-link p-2 border-0 rounded-circle ${isPinned ? 'text-warning' : 'text-secondary hover-light'}`}
              type="button"
              onClick={() => setIsPinned(!isPinned)}
              title={isPinned ? "Unpin note" : "Pin note"}
            >
              <i className={`bi bi-pin${isPinned ? '-fill' : ''} fs-5`}></i>
            </button>
          </div>

          {/* Text Area */}
          <textarea 
            className="form-control border-0 bg-transparent shadow-none p-0 mb-3 text-dark modal-textarea" 
            placeholder="Note" 
            rows="5"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{ resize: 'none', minHeight: '120px' }}
          ></textarea>

          {/* Labels & Reminder badges */}
          <div className="d-flex flex-wrap gap-1.5 mb-3.5">
            {reminder && (
              <span className="badge bg-dark bg-opacity-10 text-dark border-0 rounded-pill d-inline-flex align-items-center gap-1.5 py-1 px-2.5 small fw-semibold">
                <i className="bi bi-bell"></i>
                {new Date(reminder).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                <button type="button" className="btn-close ms-1 shadow-none" style={{ fontSize: '0.6rem' }} onClick={() => setReminder('')}></button>
              </span>
            )}
            {note.labels?.map(lbl => (
              <span key={lbl.id} className="badge bg-dark bg-opacity-10 text-dark border-0 rounded-pill d-inline-flex align-items-center gap-1.5 py-1 px-2.5 small fw-semibold">
                <i className="bi bi-tag"></i>
                {lbl.name}
                <button type="button" className="btn-close ms-1 shadow-none" style={{ fontSize: '0.6rem' }} onClick={() => handleLabelToggleInModal(lbl.id)}></button>
              </span>
            ))}
          </div>

          {/* Toolbar footer */}
          <div className="d-flex align-items-center justify-content-between pt-3 border-top border-dark border-opacity-10">
            <div className="d-flex align-items-center gap-1.5">
              
              {/* Reminder Picker */}
              <div className="position-relative">
                <button 
                  className={`btn btn-link p-2 text-secondary hover-light border-0 rounded-circle ${reminder ? 'text-warning-emphasis bg-warning bg-opacity-10' : ''}`}
                  type="button" 
                  title="Remind me"
                  onClick={() => { setShowReminderPicker(!showReminderPicker); setShowColorPicker(false); setShowLabelPicker(false); }}
                >
                  <i className="bi bi-bell fs-5"></i>
                </button>
                {showReminderPicker && (
                  <div className="picker-popover shadow-lg rounded-3 p-3 bg-white border border-light position-absolute" style={{ bottom: '45px', left: 0, zIndex: 1200, width: '250px' }}>
                    <h6 className="fw-bold text-dark mb-2.5 small">Set Reminder</h6>
                    <input 
                      type="datetime-local" 
                      className="form-control form-control-sm mb-2 rounded-2"
                      value={reminder}
                      onChange={(e) => setReminder(e.target.value)}
                    />
                    <div className="text-end">
                      <button 
                        className="btn btn-warning btn-sm text-dark fw-semibold rounded-2 py-1 px-2.5"
                        onClick={() => setShowReminderPicker(false)}
                      >
                        Done
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Color Picker */}
              <div className="position-relative">
                <button 
                  className="btn btn-link p-2 text-secondary hover-light border-0 rounded-circle" 
                  type="button" 
                  title="Change color"
                  onClick={() => { setShowColorPicker(!showColorPicker); setShowReminderPicker(false); setShowLabelPicker(false); }}
                >
                  <i className="bi bi-palette fs-5"></i>
                </button>
                {showColorPicker && (
                  <div className="picker-popover shadow-lg rounded-4 p-2 bg-white border border-light position-absolute d-flex flex-wrap gap-1.5" style={{ bottom: '45px', left: 0, zIndex: 1200, width: '170px' }}>
                    {KEEP_COLORS.map(c => (
                      <button
                        key={c.name}
                        type="button"
                        className="rounded-circle border border-dark border-opacity-10 color-btn"
                        style={{ backgroundColor: c.value, width: '24px', height: '24px' }}
                        title={c.name}
                        onClick={() => { setColor(c.value); setShowColorPicker(false); }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Labels Picker */}
              <div className="position-relative">
                <button 
                  className="btn btn-link p-2 text-secondary hover-light border-0 rounded-circle" 
                  type="button" 
                  title="Labels"
                  onClick={() => { setShowLabelPicker(!showLabelPicker); setShowColorPicker(false); setShowReminderPicker(false); }}
                >
                  <i className="bi bi-tag fs-5"></i>
                </button>
                {showLabelPicker && (
                  <div className="picker-popover shadow-lg rounded-3 p-2.5 bg-white border border-light position-absolute" style={{ bottom: '45px', left: 0, zIndex: 1200, width: '180px', maxHeight: '150px', overflowY: 'auto' }}>
                    <h6 className="fw-bold text-dark px-1.5 mb-2 small">Labels</h6>
                    {allLabels.length === 0 ? (
                      <p className="text-muted small px-1.5 py-1 mb-0">No labels found.</p>
                    ) : (
                      allLabels.map(l => (
                        <div key={l.id} className="form-check px-4 py-0.5 hover-light rounded-1">
                          <input 
                            className="form-check-input" 
                            type="checkbox" 
                            id={`modal-lbl-${l.id}`}
                            checked={note.labels.some(nl => nl.id === l.id)}
                            onChange={() => handleLabelToggleInModal(l.id)}
                          />
                          <label className="form-check-label text-dark small text-truncate d-block" htmlFor={`modal-lbl-${l.id}`}>
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
                className={`btn btn-link p-2 border-0 rounded-circle ${isArchived ? 'text-warning' : 'text-secondary hover-light'}`}
                type="button" 
                title={isArchived ? "Unarchive" : "Archive"}
                onClick={() => setIsArchived(!isArchived)}
              >
                <i className={`bi bi-archive${isArchived ? '-fill' : ''} fs-5`}></i>
              </button>

            </div>

            <button 
              type="button" 
              className="btn btn-warning py-1.5 px-3 rounded-pill fw-bold text-dark border-0 shadow-sm"
              onClick={handleSaveAndClose}
            >
              Save & Close
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
