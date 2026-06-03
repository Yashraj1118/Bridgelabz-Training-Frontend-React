import React from 'react';

export default function Header({ 
  onMenuToggle, 
  searchQuery, 
  setSearchQuery, 
  isGridView, 
  setIsGridView, 
  onRefresh, 
  onLogout 
}) {
  const email = localStorage.getItem('email') || 'User';

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom fixed-top py-2 px-3 align-items-center">
      <div className="container-fluid p-0 d-flex align-items-center justify-content-between">
        
        {/* Left Section: Brand & Sidebar toggle */}
        <div className="d-flex align-items-center gap-2">
          <button 
            className="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center border-0 sidebar-toggle"
            type="button" 
            onClick={onMenuToggle}
            title="Main menu"
            style={{ width: '42px', height: '42px' }}
          >
            <i className="bi bi-list fs-5"></i>
          </button>
          
          <a className="navbar-brand d-flex align-items-center gap-2 m-0 p-0 text-dark" href="#" onClick={(e) => { e.preventDefault(); onRefresh(); }}>
            <div className="bg-warning bg-opacity-25 text-warning rounded-3 p-1.5 d-flex align-items-center justify-content-center" style={{ width: '38px', height: '38px' }}>
              <i className="bi bi-journal-bookmark-fill fs-5"></i>
            </div>
            <span className="fw-bold tracking-tight text-secondary d-none d-sm-inline" style={{ fontSize: '1.25rem' }}>
              <span className="text-dark">Fundoo</span>Notes
            </span>
          </a>
        </div>

        {/* Middle Section: Search Bar */}
        <div className="flex-grow-1 mx-3 mx-md-5" style={{ maxWidth: '720px' }}>
          <div className="input-group bg-light rounded-pill border-0 px-2 py-1 align-items-center">
            <span className="input-group-text bg-transparent border-0 text-muted ps-3">
              <i className="bi bi-search"></i>
            </span>
            <input 
              type="text" 
              className="form-control bg-transparent border-0 shadow-none ps-2" 
              placeholder="Search your notes..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                className="btn btn-transparent border-0 text-muted pe-3 shadow-none" 
                type="button"
                onClick={() => setSearchQuery('')}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            )}
          </div>
        </div>

        {/* Right Section: Toolbar & Profile */}
        <div className="d-flex align-items-center gap-2">
          {/* Refresh button */}
          <button 
            className="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center border-0 text-secondary"
            type="button"
            onClick={onRefresh}
            title="Refresh"
            style={{ width: '42px', height: '42px' }}
          >
            <i className="bi bi-arrow-clockwise fs-5"></i>
          </button>

          {/* Grid/List layout toggle */}
          <button 
            className="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center border-0 text-secondary"
            type="button"
            onClick={() => setIsGridView(!isGridView)}
            title={isGridView ? "List view" : "Grid view"}
            style={{ width: '42px', height: '42px' }}
          >
            <i className={`bi bi-${isGridView ? 'view-list' : 'grid'} fs-5`}></i>
          </button>

          {/* User profile dropdown */}
          <div className="dropdown">
            <button 
              className="btn btn-light rounded-circle p-0 border-0 overflow-hidden d-flex align-items-center justify-content-center bg-warning text-dark fw-bold position-relative"
              type="button" 
              id="profileDropdown" 
              data-bs-toggle="dropdown" 
              aria-expanded="false"
              style={{ width: '38px', height: '38px', fontSize: '0.9rem' }}
            >
              {email.charAt(0).toUpperCase()}
            </button>
            <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2 p-3" aria-labelledby="profileDropdown" style={{ minWidth: '220px', borderRadius: '12px' }}>
              <li className="text-center py-2 border-bottom mb-2">
                <div className="bg-warning bg-opacity-25 text-warning rounded-circle d-inline-flex align-items-center justify-content-center fw-bold fs-3 mb-2" style={{ width: '56px', height: '56px' }}>
                  {email.charAt(0).toUpperCase()}
                </div>
                <div className="fw-semibold text-dark text-truncate small px-2">{email}</div>
              </li>
              <li>
                <button 
                  className="dropdown-item rounded-3 text-danger d-flex align-items-center gap-2 py-2" 
                  type="button"
                  onClick={onLogout}
                >
                  <i className="bi bi-box-arrow-right"></i>
                  Sign Out
                </button>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </nav>
  );
}
