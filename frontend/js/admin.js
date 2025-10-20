// Admin Dashboard functionality
let currentDeleteType = null;
let currentDeleteId = null;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize admin dashboard if on admin dashboard page
    if (window.location.pathname.includes('dashboard-admin')) {
        initAdminDashboard();
    }
});

function initAdminDashboard() {
    // Load initial data
    loadAllUsers();
    loadAllRides();
    
    // Bind event handlers
    bindAdminEventHandlers();
}

function bindAdminEventHandlers() {
    // Tab change handlers
    document.getElementById('users-tab').addEventListener('click', loadAllUsers);
    document.getElementById('rides-tab').addEventListener('click', loadAllRides);
    
    // Delete confirmation handler
    document.getElementById('confirmDeleteBtn').addEventListener('click', confirmDelete);
}

// Load all users
async function loadAllUsers() {
    const container = document.getElementById('usersContainer');
    const totalUsersElement = document.getElementById('totalUsers');
    
    try {
        container.innerHTML = '<div class="text-center"><i class="fas fa-spinner fa-spin fa-2x text-muted"></i><p class="mt-2 text-muted">Loading users...</p></div>';
        
        const users = await apiRequest('/users');
        
        // Update total count
        totalUsersElement.textContent = `${users.length} User${users.length !== 1 ? 's' : ''}`;
        
        if (users.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <h4>No users found</h4>
                </div>
            `;
            return;
        }
        
        // Create users table
        const usersTable = `
            <div class="table-responsive">
                <table class="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Phone</th>
                            <th>Joined</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${users.map(user => `
                            <tr>
                                <td>
                                    <i class="fas fa-user text-muted me-2"></i>
                                    ${user.name}
                                </td>
                                <td>${user.email}</td>
                                <td>
                                    <span class="badge bg-${user.role === 'admin' ? 'danger' : 'primary'}">
                                        ${user.role === 'admin' ? 'Admin' : 'User'}
                                    </span>
                                </td>
                                <td>${user.phone || 'N/A'}</td>
                                <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                                <td>
                                    ${user.email !== 'admin@ecoride.com' ? `
                                        <button class="btn btn-danger btn-sm" onclick="showDeleteModal('user', '${user._id}', '${user.name}')">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    ` : `
                                        <span class="text-muted">Protected</span>
                                    `}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        container.innerHTML = usersTable;
    } catch (error) {
        container.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle me-1"></i>
                Error loading users: ${error.message}
            </div>
        `;
    }
}

// Load all rides
async function loadAllRides() {
    const container = document.getElementById('ridesContainer');
    const totalRidesElement = document.getElementById('totalRides');
    
    try {
        container.innerHTML = '<div class="text-center"><i class="fas fa-spinner fa-spin fa-2x text-muted"></i><p class="mt-2 text-muted">Loading rides...</p></div>';
        
        const rides = await apiRequest('/rides');
        
        // Update total count
        totalRidesElement.textContent = `${rides.length} Ride${rides.length !== 1 ? 's' : ''}`;
        
        if (rides.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-car"></i>
                    <h4>No rides found</h4>
                </div>
            `;
            return;
        }
        
        // Create rides cards
        const ridesHtml = rides.map(ride => `
            <div class="card ride-card mb-3">
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-9">
                            <h6 class="card-title">
                                <i class="fas fa-map-marker-alt text-success me-1"></i>
                                ${ride.from} → ${ride.to}
                            </h6>
                            <div class="row">
                                <div class="col-md-6">
                                    <p class="card-text mb-1">
                                        <small class="text-muted">
                                            <i class="fas fa-calendar me-1"></i>
                                            ${new Date(ride.departureDate).toLocaleDateString()} at ${ride.departureTime}
                                        </small>
                                    </p>
                                    <p class="card-text mb-1">
                                        <i class="fas fa-user me-1"></i> Driver: ${ride.driver.name}
                                    </p>
                                    <p class="card-text mb-1">
                                        <i class="fas fa-envelope me-1"></i> ${ride.driver.email}
                                    </p>
                                </div>
                                <div class="col-md-6">
                                    <p class="card-text mb-1">
                                        <i class="fas fa-users me-1"></i> 
                                        Available: ${ride.availableSeats} | Booked: ${ride.passengers.length}
                                    </p>
                                    <p class="card-text mb-1">
                                        <i class="fas fa-dollar-sign me-1"></i> $${ride.pricePerSeat} per seat
                                    </p>
                                    <p class="card-text mb-1">
                                        <span class="badge bg-${ride.status === 'active' ? 'success' : 'secondary'}">${ride.status}</span>
                                    </p>
                                </div>
                            </div>
                            ${ride.description ? `<p class="card-text mt-2"><small class="text-muted">${ride.description}</small></p>` : ''}
                            ${ride.passengers.length > 0 ? `
                                <div class="mt-2">
                                    <h6>Passengers:</h6>
                                    <div>
                                        ${ride.passengers.map(p => `
                                            <span class="badge bg-light text-dark me-2">
                                                ${p.user.name} (${p.bookedSeats} seat${p.bookedSeats > 1 ? 's' : ''})
                                            </span>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                        <div class="col-md-3 text-end">
                            <button class="btn btn-danger btn-sm" onclick="showDeleteModal('ride', '${ride._id}', '${ride.from} → ${ride.to}')">
                                <i class="fas fa-trash me-1"></i> Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = ridesHtml;
    } catch (error) {
        container.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle me-1"></i>
                Error loading rides: ${error.message}
            </div>
        `;
    }
}

// Show delete confirmation modal
function showDeleteModal(type, id, name) {
    currentDeleteType = type;
    currentDeleteId = id;
    
    const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
    const titleElement = document.getElementById('deleteModalTitle');
    const bodyElement = document.getElementById('deleteModalBody');
    
    titleElement.textContent = `Delete ${type === 'user' ? 'User' : 'Ride'}`;
    bodyElement.innerHTML = `
        Are you sure you want to delete ${type === 'user' ? 'user' : 'ride'} <strong>${name}</strong>?
        <br><br>
        <span class="text-danger">This action cannot be undone.</span>
    `;
    
    modal.show();
}

// Confirm delete action
async function confirmDelete() {
    if (!currentDeleteType || !currentDeleteId) {
        return;
    }
    
    try {
        const endpoint = currentDeleteType === 'user' ? `/users/${currentDeleteId}` : `/rides/${currentDeleteId}`;
        await apiRequest(endpoint, { method: 'DELETE' });
        
        // Hide modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
        modal.hide();
        
        // Show success message
        showAdminAlert(`${currentDeleteType === 'user' ? 'User' : 'Ride'} deleted successfully!`, 'success');
        
        // Reload appropriate data
        if (currentDeleteType === 'user') {
            loadAllUsers();
        } else {
            loadAllRides();
        }
        
        // Reset variables
        currentDeleteType = null;
        currentDeleteId = null;
        
    } catch (error) {
        showAdminAlert(`Error deleting ${currentDeleteType}: ${error.message}`, 'danger');
    }
}

// Utility function to show admin alerts
function showAdminAlert(message, type) {
    // Create a temporary alert at the top of the page
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alertDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}
