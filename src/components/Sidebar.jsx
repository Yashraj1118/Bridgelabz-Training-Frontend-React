import React from 'react';

export default function Sidebar({ 
  isCollapsed, 
  activeTab, 
  setActiveTab, 
  labels, 
  onEditLabelsClick 
}) {
  const navItems = [
    { id: 'notes', label: 'Notes', icon: 'bi-lightbulb' },
    { id: 'reminders', label: 'Reminders', icon: 'bi-bell' },
  ];

  const archiveTrashItems = [
    { id: 'archive', label: 'Archive', icon: 'bi-archive' },
    { id: 'trash', label: 'Trash', icon: 'bi-trash3' },
  ];

  return (
    <div 
      className={`sidebar bg-white border-end position-fixed h-100 transition-all ${isCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}
      style={{ 
        top: '64px', // header height
        left: 0,
        zIndex: 1000,
      }}
    >
      <div className="d-flex flex-column h-100 py-3 overflow-y-auto" style={{ paddingBottom: '80px' }}>
        
        {/* Core items (Notes, Reminders) */}
        <ul className="nav nav-pills flex-column px-2 gap-1 mb-2">
          {navItems.map((item) => (
            <li key={item.id} className="nav-item">
              <button
                className={`nav-link w-100 text-start d-flex align-items-center gap-3 py-2.5 px-3 rounded-pill border-0 transition-all ${activeTab === item.id ? 'bg-warning bg-opacity-25 text-warning-emphasis fw-semibold' : 'text-dark bg-transparent hover-light'}`}
                onClick={() => setActiveTab(item.id)}
              >
                <i className={`bi ${item.icon} fs-5`}></i>
                <span className={`sidebar-text text-truncate transition-all ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
                  {item.label}
                </span>
              </button>
            </li>
          ))}
        </ul>

        {/* Separator / Labels header */}
        <div className="border-top my-2 mx-3"></div>
        {!isCollapsed && (
          <div className="px-4 py-1 text-muted text-uppercase tracking-wider small fw-bold sidebar-text">
            Labels
          </div>
        )}

        {/* Dynamic Labels List */}
        <ul className="nav nav-pills flex-column px-2 gap-1 mb-2">
          {labels.map((label) => (
            <li key={label.id} className="nav-item">
              <button
                className={`nav-link w-100 text-start d-flex align-items-center gap-3 py-2 px-3 rounded-pill border-0 transition-all ${activeTab === `label-${label.id}` ? 'bg-warning bg-opacity-25 text-warning-emphasis fw-semibold' : 'text-dark bg-transparent hover-light'}`}
                onClick={() => setActiveTab(`label-${label.id}`)}
              >
                <i className="bi bi-tag fs-5"></i>
                <span className={`sidebar-text text-truncate transition-all ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
                  {label.name}
                </span>
              </button>
            </li>
          ))}

          {/* Edit labels click */}
          <li className="nav-item">
            <button
              className="nav-link w-100 text-start d-flex align-items-center gap-3 py-2 px-3 rounded-pill border-0 text-dark bg-transparent hover-light"
              onClick={onEditLabelsClick}
            >
              <i className="bi bi-pencil fs-5"></i>
              <span className={`sidebar-text text-truncate transition-all ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
                Edit labels
              </span>
            </button>
          </li>
        </ul>

        {/* Separator */}
        <div className="border-top my-2 mx-3"></div>

        {/* Archive, Trash */}
        <ul className="nav nav-pills flex-column px-2 gap-1">
          {archiveTrashItems.map((item) => (
            <li key={item.id} className="nav-item">
              <button
                className={`nav-link w-100 text-start d-flex align-items-center gap-3 py-2.5 px-3 rounded-pill border-0 transition-all ${activeTab === item.id ? 'bg-warning bg-opacity-25 text-warning-emphasis fw-semibold' : 'text-dark bg-transparent hover-light'}`}
                onClick={() => setActiveTab(item.id)}
              >
                <i className={`bi ${item.icon} fs-5`}></i>
                <span className={`sidebar-text text-truncate transition-all ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
                  {item.label}
                </span>
              </button>
            </li>
          ))}
        </ul>

      </div>
    </div>
  );
}
