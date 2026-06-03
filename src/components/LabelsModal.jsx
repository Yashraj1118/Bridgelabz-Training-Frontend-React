import React, { useState } from 'react';
import { labelsApi } from '../api';

export default function LabelsModal({ labels, onClose, onLabelsUpdated }) {
  const [newLabelName, setNewLabelName] = useState('');
  const [editingLabelId, setEditingLabelId] = useState(null);
  const [editingLabelName, setEditingLabelName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateLabel = async (e) => {
    e.preventDefault();
    if (!newLabelName.trim()) return;
    setLoading(true);
    try {
      await labelsApi.create(newLabelName.trim());
      setNewLabelName('');
      onLabelsUpdated();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating label');
    } finally {
      setLoading(false);
    }
  };

  const handleStartEditing = (label) => {
    setEditingLabelId(label.id);
    setEditingLabelName(label.name);
  };

  const handleSaveRename = async (id) => {
    if (!editingLabelName.trim()) return;
    setLoading(true);
    try {
      await labelsApi.update(id, editingLabelName.trim());
      setEditingLabelId(null);
      onLabelsUpdated();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating label');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLabel = async (id) => {
    if (window.confirm("Are you sure you want to delete this label? It will be removed from all notes.")) {
      setLoading(true);
      try {
        await labelsApi.delete(id);
        onLabelsUpdated();
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting label');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="modal-backdrop-custom d-flex align-items-center justify-content-center px-3" onClick={onClose}>
      <div 
        className="card border-0 shadow-lg rounded-4 w-100 labels-modal-card overflow-hidden bg-white"
        style={{ maxWidth: '380px' }}
        onClick={(e) => e.stopPropagation()} // prevent close on modal card click
      >
        <div className="card-body p-4">
          
          <h5 className="fw-bold text-dark mb-3">Edit Labels</h5>
          
          {/* Create Label Form */}
          <form onSubmit={handleCreateLabel} className="d-flex align-items-center gap-2 mb-3 border-bottom pb-3">
            <button className="btn btn-link p-1 text-muted border-0 rounded-circle" type="button">
              <i className="bi bi-x-lg" onClick={() => setNewLabelName('')}></i>
            </button>
            <input 
              type="text" 
              className="form-control form-control-sm border-0 shadow-none text-dark bg-transparent font-medium"
              placeholder="Create new label..."
              value={newLabelName}
              onChange={(e) => setNewLabelName(e.target.value)}
              disabled={loading}
              maxLength="30"
              style={{ fontSize: '0.925rem' }}
            />
            <button 
              className="btn btn-link p-1 text-warning border-0 rounded-circle" 
              type="submit"
              disabled={loading || !newLabelName.trim()}
              title="Create label"
            >
              <i className="bi bi-plus-lg fs-5"></i>
            </button>
          </form>

          {/* Labels List */}
          <div className="labels-list-container overflow-y-auto mb-3" style={{ maxHeight: '240px' }}>
            {labels.length === 0 ? (
              <p className="text-muted text-center small py-3 my-0">No labels created yet.</p>
            ) : (
              labels.map((lbl) => {
                const isEditing = editingLabelId === lbl.id;
                return (
                  <div key={lbl.id} className="d-flex align-items-center justify-content-between py-1.5 label-row rounded-3 px-2 mb-1">
                    <div className="d-flex align-items-center gap-2 flex-grow-1">
                      <i className={`bi bi-${isEditing ? 'trash text-danger cursor-pointer' : 'tag text-muted'}`} 
                         onClick={() => isEditing && handleDeleteLabel(lbl.id)}
                         title={isEditing ? "Delete label" : "Label icon"}
                      />
                      
                      {isEditing ? (
                        <input
                          type="text"
                          className="form-control form-control-sm py-0.5 border-bottom border-0 rounded-0 shadow-none bg-transparent font-medium text-dark"
                          value={editingLabelName}
                          onChange={(e) => setEditingLabelName(e.target.value)}
                          disabled={loading}
                          maxLength="30"
                          style={{ fontSize: '0.9rem' }}
                        />
                      ) : (
                        <span className="text-dark small text-truncate" style={{ maxWidth: '200px' }}>{lbl.name}</span>
                      )}
                    </div>

                    <div className="d-flex align-items-center">
                      {isEditing ? (
                        <>
                          <button 
                            className="btn btn-link p-1 text-muted border-0 rounded-circle" 
                            type="button"
                            onClick={() => setEditingLabelId(null)}
                            disabled={loading}
                          >
                            <i className="bi bi-x-lg"></i>
                          </button>
                          <button 
                            className="btn btn-link p-1 text-warning border-0 rounded-circle" 
                            type="button"
                            onClick={() => handleSaveRename(lbl.id)}
                            disabled={loading || !editingLabelName.trim()}
                          >
                            <i className="bi bi-check-lg fs-5"></i>
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            className="btn btn-link p-1 text-muted border-0 rounded-circle label-edit-btn" 
                            type="button"
                            onClick={() => handleStartEditing(lbl)}
                            title="Rename label"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button 
                            className="btn btn-link p-1 text-muted border-0 rounded-circle label-delete-btn" 
                            type="button"
                            onClick={() => handleDeleteLabel(lbl.id)}
                            title="Delete label"
                          >
                            <i className="bi bi-trash3"></i>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Close button */}
          <div className="text-end border-top pt-3">
            <button 
              type="button" 
              className="btn btn-warning py-1.5 px-4 rounded-pill fw-bold text-dark border-0 shadow-sm"
              onClick={onClose}
              disabled={loading}
            >
              Done
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
