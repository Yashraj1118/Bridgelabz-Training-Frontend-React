import React, { useState, useRef, useEffect } from 'react';
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

export default function NoteCreator({ labels, onNoteCreated }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState('#FFFFFF');
  const [isPinned, setIsPinned] = useState(false);
  const [isArchived, setIsArchived] = useState(false);
  const [reminder, setReminder] = useState('');
  const [selectedLabels, setSelectedLabels] = useState([]); // labels to attach
  
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  
  const creatorRef = useRef(null);

  // Click outside to close and save
  useEffect(() => {
    function handleClickOutside(event) {
      if (creatorRef.current && !creatorRef.current.contains(event.target)) {
        if (isExpanded) {
          handleClose();
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded, title, content, color, isPinned, isArchived, reminder, selectedLabels]);

  const resetForm = () => {
    setTitle('');
    setContent('');
    setColor('#FFFFFF');
    setIsPinned(false);
    setIsArchived(false);
    setReminder('');
    setSelectedLabels([]);
    setIsExpanded(false);
    setShowColorPicker(false);
    setShowLabelPicker(false);
    setShowReminderPicker(false);
  };

  const handleClose = async () => {
    // Only save if title or content has value
    if (title.trim() || content.trim()) {
      try {
        // 1. Create the note
        const notePayload = {
          title: title.trim(),
          content: content.trim() || ' ', // Backend has @NotBlank for content
          color: color
        };
        const response = await notesApi.create(notePayload);
        const createdNote = response.data.data;
        
        // 2. Perform updates (Pin, Archive, Reminder, Labels)
        if (isPinned) {
          await notesApi.togglePin(createdNote.id);
        }
        if (isArchived) {
          await notesApi.toggleArchive(createdNote.id);
        }
        if (reminder) {
          await notesApi.setReminder(createdNote.id, reminder);
        }
        
        // 3. Attach labels
        for (const labelId of selectedLabels) {
          await labelsApi.addLabelToNote(labelId, createdNote.id);
        }
        
        // Notify parent
        onNoteCreated();
      } catch (err) {
        console.error('Error creating note:', err);
      }
    }
    resetForm();
  };

  const toggleLabelSelection = (labelId) => {
    setSelectedLabels((prev) => 
      prev.includes(labelId) ? prev.filter((id) => id !== labelId) : [...prev, labelId]
    );
  };

  return (
    <div 
      ref={creatorRef}
      className={`card border shadow-sm mx-auto mb-4 note-creator-card rounded-4 transition-all`}
      style={{ 
        maxWidth: '560px', 
        backgroundColor: color,
        borderColor: color === '#FFFFFF' ? '#e2e8f0' : 'transparent',
      }}
    >
      {/* Collapsed view */}
      {!isExpanded && (
        <div 
          className="p-3 d-flex align-items-center justify-content-between text-muted cursor-text"
          onClick={() => setIsExpanded(true)}
        >
          <span className="fw-medium">Take a note...</span>
          <div className="d-flex align-items-center gap-3">
            <button className="btn btn-link p-1 text-muted border-0 hover-light rounded-circle" type="button" title="New list">
              <i className="bi bi-check-square"></i>
            </button>
            <button className="btn btn-link p-1 text-muted border-0 hover-light rounded-circle" type="button" title="New drawing">
              <i className="bi bi-brush"></i>
            </button>
            <button className="btn btn-link p-1 text-muted border-0 hover-light rounded-circle" type="button" title="New image">
              <i className="bi bi-image"></i>
            </button>
          </div>
        </div>
      )}

      {/* Expanded view */}
      {isExpanded && (
        <div className="card-body p-3">
          {/* Pin & Title */}
          <div className="d-flex align-items-start justify-content-between mb-2">
            <input 
              type="text" 
              className="form-control border-0 bg-transparent shadow-none fs-5 fw-semibold p-0 text-dark" 
              placeholder="Title" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ letterSpacing: '-0.3px' }}
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

          {/* Note content body */}
          <textarea 
            className="form-control border-0 bg-transparent shadow-none p-0 mb-3 text-dark note-textarea" 
            placeholder="Take a note..." 
            rows="3"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{ resize: 'none', minHeight: '80px' }}
            autoFocus
          ></textarea>

          {/* Selected Labels & Reminder tags display */}
          <div className="d-flex flex-wrap gap-1.5 mb-3">
            {reminder && (
              <span className="badge bg-dark bg-opacity-10 text-dark border-0 rounded-pill d-inline-flex align-items-center gap-1 py-1 px-2.5 small fw-semibold">
                <i className="bi bi-bell fs-6"></i>
                {new Date(reminder).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                <button type="button" className="btn-close ms-1 shadow-none" style={{ fontSize: '0.65rem' }} onClick={() => setReminder('')}></button>
              </span>
            )}
            {selectedLabels.map(labelId => {
              const labelObj = labels.find(l => l.id === labelId);
              if (!labelObj) return null;
              return (
                <span key={labelId} className="badge bg-dark bg-opacity-10 text-dark border-0 rounded-pill d-inline-flex align-items-center gap-1 py-1 px-2.5 small fw-semibold">
                  <i className="bi bi-tag fs-6"></i>
                  {labelObj.name}
                  <button type="button" className="btn-close ms-1 shadow-none" style={{ fontSize: '0.65rem' }} onClick={() => toggleLabelSelection(labelId)}></button>
                </span>
              );
            })}
          </div>

          {/* Expanded bottom toolbar */}
          <div className="d-flex align-items-center justify-content-between pt-2 border-top border-dark border-opacity-10">
            <div className="d-flex align-items-center gap-1.5 position-relative">
              
              {/* Reminder option */}
              <div className="position-relative">
                <button 
                  className={`btn btn-link p-2 text-secondary hover-light border-0 rounded-circle ${reminder ? 'text-warning-emphasis bg-warning bg-opacity-10' : ''}`}
                  type="button" 
                  title="Remind me"
                  onClick={() => { setShowReminderPicker(!showReminderPicker); setShowColorPicker(false); setShowLabelPicker(false); }}
                >
                  <i className="bi bi-bell"></i>
                </button>
                {showReminderPicker && (
                  <div className="picker-popover shadow-lg rounded-3 p-3 bg-white border border-light position-absolute" style={{ bottom: '45px', left: 0, zIndex: 1100, width: '260px' }}>
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

              {/* Color picker */}
              <div className="position-relative">
                <button 
                  className="btn btn-link p-2 text-secondary hover-light border-0 rounded-circle" 
                  type="button" 
                  title="Background options"
                  onClick={() => { setShowColorPicker(!showColorPicker); setShowReminderPicker(false); setShowLabelPicker(false); }}
                >
                  <i className="bi bi-palette"></i>
                </button>
                {showColorPicker && (
                  <div className="picker-popover shadow-lg rounded-4 p-2 bg-white border border-light position-absolute d-flex flex-wrap gap-1.5" style={{ bottom: '45px', left: 0, zIndex: 1100, width: '170px' }}>
                    {KEEP_COLORS.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        className="rounded-circle border border-dark border-opacity-10 color-btn"
                        style={{ backgroundColor: c.value, width: '26px', height: '26px' }}
                        title={c.name}
                        onClick={() => { setColor(c.value); setShowColorPicker(false); }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Label Selector */}
              <div className="position-relative">
                <button 
                  className="btn btn-link p-2 text-secondary hover-light border-0 rounded-circle" 
                  type="button" 
                  title="Add label"
                  onClick={() => { setShowLabelPicker(!showLabelPicker); setShowReminderPicker(false); setShowColorPicker(false); }}
                >
                  <i className="bi bi-tag"></i>
                </button>
                {showLabelPicker && (
                  <div className="picker-popover shadow-lg rounded-3 p-2.5 bg-white border border-light position-absolute" style={{ bottom: '45px', left: 0, zIndex: 1100, width: '200px', maxHeight: '180px', overflowY: 'auto' }}>
                    <h6 className="fw-bold text-dark px-2 mb-2 small">Label Note</h6>
                    {labels.length === 0 ? (
                      <p className="text-muted small px-2 py-1">No labels found. Create labels first.</p>
                    ) : (
                      labels.map(l => (
                        <div key={l.id} className="form-check px-4.5 py-1 label-checkbox hover-light rounded-2">
                          <input 
                            className="form-check-input text-warning" 
                            type="checkbox" 
                            id={`creator-lbl-${l.id}`}
                            checked={selectedLabels.includes(l.id)}
                            onChange={() => toggleLabelSelection(l.id)}
                          />
                          <label className="form-check-label text-dark small text-truncate d-block" htmlFor={`creator-lbl-${l.id}`}>
                            {l.name}
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Archive toggle */}
              <button 
                className={`btn btn-link p-2 border-0 rounded-circle ${isArchived ? 'text-warning' : 'text-secondary hover-light'}`}
                type="button" 
                title="Archive"
                onClick={() => setIsArchived(!isArchived)}
              >
                <i className={`bi bi-archive${isArchived ? '-fill' : ''}`}></i>
              </button>

            </div>

            <button 
              type="button" 
              className="btn btn-light btn-sm fw-bold border-0 text-dark rounded-pill py-1 px-3 shadow-none bg-transparent hover-light"
              onClick={handleClose}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
