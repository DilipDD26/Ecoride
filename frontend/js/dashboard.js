// User Dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize dashboard if on user dashboard page
    if (window.location.pathname.includes('dashboard-user')) {
        initUserDashboard();
    }
});

let notifications = [];

function initUserDashboard() {
    // Load initial data
    loadMyRides();
    loadMyBookings();
    loadUserProfile();
    loadNotifications();
    
    // Set today's date as minimum for search and offer forms
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('searchDate').setAttribute('min', today);
    document.getElementById('offerDate').setAttribute('min', today);

    // Bind event handlers
    bindEventHandlers();
    
    // Poll for new notifications every 30 seconds
    setInterval(loadNotifications, 30000);
}

function bindEventHandlers() {
    // Search form
    document.getElementById('searchForm').addEventListener('submit', handleSearchRides);
    
    // Offer ride form
    document.getElementById('offerForm').addEventListener('submit', handleOfferRide);
    
    // Profile form
    document.getElementById('profileForm').addEventListener('submit', handleUpdateProfile);
    
    // Tab change handlers
    document.getElementById('my-rides-tab').addEventListener('click', loadMyRides);
    document.getElementById('bookings-tab').addEventListener('click', loadMyBookings);
    document.getElementById('profile-tab').addEventListener('click', loadUserProfile);
}

// Search rides functionality with nearby matches
async function handleSearchRides(e) {
    e.preventDefault();
    
    const from = document.getElementById('searchFrom').value;
    const to = document.getElementById('searchTo').value;
    const date = document.getElementById('searchDate').value;
    const minSeats = document.getElementById('searchMinSeats').value;
    const minPrice = document.getElementById('searchMinPrice').value;
    const maxPrice = document.getElementById('searchMaxPrice').value;
    
    try {
        const params = new URLSearchParams();
        if (from) params.append('from', from);
        if (to) params.append('to', to);
        if (date) params.append('date', date);
        if (minSeats) params.append('minSeats', minSeats);
        if (minPrice) params.append('minPrice', minPrice);
        if (maxPrice) params.append('maxPrice', maxPrice);
        
        const result = await apiRequest(`/rides/search?${params.toString()}`);
        displaySearchResults(result.exactMatches || [], result.nearbyMatches || []);
    } catch (error) {
        showAlert('Error searching rides: ' + error.message, 'danger');
    }
}

// Clear search filters
function clearSearchFilters() {
    document.getElementById('searchFrom').value = '';
    document.getElementById('searchTo').value = '';
    document.getElementById('searchDate').value = '';
    document.getElementById('searchMinSeats').value = '';
    document.getElementById('searchMinPrice').value = '';
    document.getElementById('searchMaxPrice').value = '';
    document.getElementById('searchResults').innerHTML = '';
}

function displaySearchResults(exactMatches, nearbyMatches) {
    const container = document.getElementById('searchResults');
    
    if (exactMatches.length === 0 && nearbyMatches.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h4>No rides found</h4>
                <p>Try adjusting your search criteria or check nearby alternatives</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    // Display exact matches
    if (exactMatches.length > 0) {
        html += `
            <div class="mb-4">
                <h5 class="text-success"><i class="fas fa-check-circle me-2"></i>Perfect Matches</h5>
                ${exactMatches.map(ride => renderRideCard(ride, false)).join('')}
            </div>
        `;
    }
    
    // Display nearby matches
    if (nearbyMatches.length > 0) {
        html += `
            <div class="mb-4">
                <h5 class="text-info"><i class="fas fa-map-marked-alt me-2"></i>Nearby Options (within 5km)</h5>
                <p class="text-muted small">These rides have pickup/dropoff locations near your search</p>
                ${nearbyMatches.map(ride => renderRideCard(ride, true)).join('')}
            </div>
        `;
    }
    
    container.innerHTML = html;
}

function renderRideCard(ride, isNearby) {
    const availableSeats = ride.actualAvailableSeats !== undefined ? ride.actualAvailableSeats : ride.availableSeats;
    
    return `
        <div class="card ride-card mb-3 ${isNearby ? 'border-info' : ''}">
            <div class="card-body">
                <div class="row">
                    <div class="col-md-8">
                        <h6 class="card-title">
                            <i class="fas fa-map-marker-alt text-success me-1"></i>
                            ${ride.from} → ${ride.to}
                            ${ride.averageRating > 0 ? `
                                <span class="ms-2">
                                    <i class="fas fa-star text-warning"></i> ${ride.averageRating.toFixed(1)}
                                    <small class="text-muted">(${ride.reviews ? ride.reviews.length : 0})</small>
                                </span>
                            ` : ''}
                        </h6>
                        ${isNearby && ride.fromDistance !== undefined ? `
                            <div class="mb-2">
                                <span class="badge bg-info">
                                    <i class="fas fa-route me-1"></i>
                                    Pickup: ${ride.fromDistance.toFixed(1)} km away
                                </span>
                                <span class="badge bg-info ms-1">
                                    <i class="fas fa-flag-checkered me-1"></i>
                                    Dropoff: ${ride.toDistance.toFixed(1)} km away
                                </span>
                            </div>
                        ` : ''}
                        <p class="card-text">
                            <small class="text-muted">
                                <i class="fas fa-calendar me-1"></i>
                                ${new Date(ride.departureDate).toLocaleDateString()} at ${ride.departureTime}
                            </small>
                        </p>
                        <p class="card-text">
                            <i class="fas fa-user me-1"></i> Driver: ${ride.driver.name}
                            <br>
                            <i class="fas fa-users me-1"></i> Available seats: ${availableSeats}
                            <br>
                            <i class="fas fa-dollar-sign me-1"></i> $${ride.pricePerSeat} per seat
                        </p>
                        ${ride.description ? `<p class="card-text"><small>${ride.description}</small></p>` : ''}
                    </div>
                    <div class="col-md-4 text-end">
                        ${availableSeats > 0 ? `
                            <button class="btn btn-success btn-sm" onclick="bookRide('${ride._id}')">
                                <i class="fas fa-ticket-alt me-1"></i> Book Ride
                            </button>
                        ` : `
                            <span class="badge bg-secondary">No Seats Available</span>
                        `}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Book ride functionality
async function bookRide(rideId) {
    try {
        await apiRequest(`/rides/${rideId}/book`, { 
            method: 'POST',
            body: JSON.stringify({ seats: 1 })
        });
        showAlert('Booking request sent! The driver will review your request.', 'success');
        
        // Refresh search results and bookings
        document.getElementById('searchForm').dispatchEvent(new Event('submit'));
        loadMyBookings();
    } catch (error) {
        showAlert('Error booking ride: ' + error.message, 'danger');
    }
}

// Offer ride functionality
async function handleOfferRide(e) {
    e.preventDefault();
    
    const formData = {
        from: document.getElementById('offerFrom').value,
        to: document.getElementById('offerTo').value,
        departureDate: document.getElementById('offerDate').value,
        departureTime: document.getElementById('offerTime').value,
        availableSeats: parseInt(document.getElementById('offerSeats').value),
        pricePerSeat: parseFloat(document.getElementById('offerPrice').value),
        description: document.getElementById('offerDescription').value
    };
    
    try {
        await apiRequest('/rides', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
        
        showAlert('Ride offered successfully!', 'success', 'offerAlert');
        document.getElementById('offerForm').reset();
        loadMyRides();
    } catch (error) {
        showAlert('Error creating ride: ' + error.message, 'danger', 'offerAlert');
    }
}

// Load user's rides with booking requests management
async function loadMyRides() {
    const container = document.getElementById('myRidesContainer');
    
    try {
        container.innerHTML = '<div class="text-center"><i class="fas fa-spinner fa-spin fa-2x text-muted"></i><p class="mt-2 text-muted">Loading your rides...</p></div>';
        
        const rides = await apiRequest('/rides/my-rides');
        
        if (rides.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-car"></i>
                    <h4>No rides offered yet</h4>
                    <p>Create your first ride to start carpooling</p>
                </div>
            `;
            return;
        }
        
        const ridesHtml = rides.map(ride => {
            const pendingRequests = ride.passengers.filter(p => p.status === 'pending');
            const acceptedPassengers = ride.passengers.filter(p => p.status === 'accepted');
            const acceptedSeats = acceptedPassengers.reduce((sum, p) => sum + p.bookedSeats, 0);
            const actualAvailable = ride.availableSeats - acceptedSeats;
            
            return `
                <div class="card ride-card mb-3">
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-8">
                                <h6 class="card-title">
                                    <i class="fas fa-map-marker-alt text-success me-1"></i>
                                    ${ride.from} → ${ride.to}
                                </h6>
                                <p class="card-text">
                                    <small class="text-muted">
                                        <i class="fas fa-calendar me-1"></i>
                                        ${new Date(ride.departureDate).toLocaleDateString()} at ${ride.departureTime}
                                    </small>
                                </p>
                                <p class="card-text">
                                    <i class="fas fa-users me-1"></i> 
                                    Available: ${actualAvailable} | 
                                    Accepted: ${acceptedPassengers.length} (${acceptedSeats} seats)
                                    ${pendingRequests.length > 0 ? `<br><i class="fas fa-clock me-1 text-warning"></i> Pending Requests: ${pendingRequests.length}` : ''}
                                    <br>
                                    <i class="fas fa-dollar-sign me-1"></i> $${ride.pricePerSeat} per seat
                                </p>
                                <div class="mt-2">
                                    <span class="badge bg-${ride.status === 'active' ? 'success' : ride.status === 'completed' ? 'secondary' : 'warning'}">${ride.status}</span>
                                </div>
                            </div>
                            <div class="col-md-4 text-end">
                                ${ride.status === 'active' ? `
                                    <button class="btn btn-primary btn-sm mb-1" onclick="completeRide('${ride._id}')">
                                        <i class="fas fa-check me-1"></i> Complete Ride
                                    </button>
                                ` : ''}
                                <button class="btn btn-danger btn-sm" onclick="deleteRide('${ride._id}')">
                                    <i class="fas fa-trash me-1"></i> Delete
                                </button>
                            </div>
                        </div>
                        
                        ${pendingRequests.length > 0 ? `
                            <div class="mt-3">
                                <h6 class="text-warning"><i class="fas fa-bell me-1"></i> Pending Booking Requests:</h6>
                                ${pendingRequests.map(p => `
                                    <div class="card bg-light mb-2">
                                        <div class="card-body p-3">
                                            <div class="row align-items-center">
                                                <div class="col-md-6">
                                                    <strong>${p.user.name}</strong>
                                                    <br>
                                                    <small class="text-muted">
                                                        <i class="fas fa-envelope me-1"></i> ${p.user.email}<br>
                                                        <i class="fas fa-users me-1"></i> Requested ${p.bookedSeats} seat(s)<br>
                                                        <i class="fas fa-clock me-1"></i> ${new Date(p.bookedAt).toLocaleString()}
                                                    </small>
                                                </div>
                                                <div class="col-md-6 text-end">
                                                    <button class="btn btn-success btn-sm me-1" onclick="acceptBooking('${ride._id}', '${p.user._id}')">
                                                        <i class="fas fa-check me-1"></i> Accept
                                                    </button>
                                                    <button class="btn btn-danger btn-sm" onclick="rejectBooking('${ride._id}', '${p.user._id}')">
                                                        <i class="fas fa-times me-1"></i> Reject
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                        
                        ${acceptedPassengers.length > 0 ? `
                            <div class="mt-3">
                                <h6><i class="fas fa-users me-1"></i> Accepted Passengers:</h6>
                                ${acceptedPassengers.map(p => `
                                    <span class="badge bg-success me-2 mb-1">
                                        ${p.user.name} (${p.bookedSeats} seat${p.bookedSeats > 1 ? 's' : ''})
                                    </span>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
        
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

// Accept booking request
async function acceptBooking(rideId, passengerId) {
    try {
        await apiRequest(`/rides/${rideId}/accept`, {
            method: 'POST',
            body: JSON.stringify({ passengerId })
        });
        showAlert('Booking request accepted!', 'success');
        loadMyRides();
    } catch (error) {
        showAlert('Error accepting booking: ' + error.message, 'danger');
    }
}

// Reject booking request
async function rejectBooking(rideId, passengerId) {
    if (!confirm('Are you sure you want to reject this booking request?')) {
        return;
    }
    
    try {
        await apiRequest(`/rides/${rideId}/reject`, {
            method: 'POST',
            body: JSON.stringify({ passengerId })
        });
        showAlert('Booking request rejected.', 'info');
        loadMyRides();
    } catch (error) {
        showAlert('Error rejecting booking: ' + error.message, 'danger');
    }
}

// Complete ride
async function completeRide(rideId) {
    if (!confirm('Mark this ride as completed? Passengers will be able to leave reviews.')) {
        return;
    }
    
    try {
        await apiRequest(`/rides/${rideId}/complete`, { method: 'POST' });
        showAlert('Ride marked as completed!', 'success');
        loadMyRides();
    } catch (error) {
        showAlert('Error completing ride: ' + error.message, 'danger');
    }
}

// Load user's bookings with status
async function loadMyBookings() {
    const container = document.getElementById('bookingsContainer');
    
    try {
        container.innerHTML = '<div class="text-center"><i class="fas fa-spinner fa-spin fa-2x text-muted"></i><p class="mt-2 text-muted">Loading your bookings...</p></div>';
        
        const rides = await apiRequest('/rides/my-bookings');
        
        if (rides.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-ticket-alt"></i>
                    <h4>No bookings yet</h4>
                    <p>Search and book your first ride</p>
                </div>
            `;
            return;
        }
        
        const bookingsHtml = rides.map(ride => {
            const status = ride.userBookingStatus || 'pending';
            const bookedSeats = ride.userBookedSeats || 1;
            const hasReviewed = ride.reviews && ride.reviews.some(r => r.user._id === getUserData().id);
            const canReview = ride.status === 'completed' && status === 'accepted' && !hasReviewed;
            
            const statusBadgeClass = {
                'pending': 'bg-warning',
                'accepted': 'bg-success',
                'rejected': 'bg-danger'
            }[status] || 'bg-secondary';
            
            return `
                <div class="card ride-card mb-3">
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-8">
                                <h6 class="card-title">
                                    <i class="fas fa-map-marker-alt text-success me-1"></i>
                                    ${ride.from} → ${ride.to}
                                    ${ride.averageRating > 0 ? `
                                        <span class="ms-2">
                                            <i class="fas fa-star text-warning"></i> ${ride.averageRating.toFixed(1)}
                                        </span>
                                    ` : ''}
                                </h6>
                                <p class="card-text">
                                    <small class="text-muted">
                                        <i class="fas fa-calendar me-1"></i>
                                        ${new Date(ride.departureDate).toLocaleDateString()} at ${ride.departureTime}
                                    </small>
                                </p>
                                <p class="card-text">
                                    <i class="fas fa-user me-1"></i> Driver: ${ride.driver.name}
                                    <br>
                                    <i class="fas fa-users me-1"></i> Your seats: ${bookedSeats}
                                    <br>
                                    <i class="fas fa-dollar-sign me-1"></i> Total: $${(ride.pricePerSeat * bookedSeats).toFixed(2)}
                                </p>
                                <div class="mt-2">
                                    <span class="badge bg-${ride.status === 'active' ? 'info' : 'secondary'}">${ride.status}</span>
                                    <span class="badge ${statusBadgeClass} ms-1">${status}</span>
                                </div>
                            </div>
                            <div class="col-md-4 text-end">
                                ${ride.status === 'active' && status === 'pending' ? `
                                    <button class="btn btn-warning btn-sm" onclick="cancelBooking('${ride._id}')">
                                        <i class="fas fa-times me-1"></i> Cancel Request
                                    </button>
                                ` : ''}
                                ${canReview ? `
                                    <button class="btn btn-primary btn-sm mt-1" onclick="showReviewModal('${ride._id}')">
                                        <i class="fas fa-star me-1"></i> Leave Review
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        container.innerHTML = bookingsHtml;
    } catch (error) {
        container.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle me-1"></i>
                Error loading bookings: ${error.message}
            </div>
        `;
    }
}

// Delete ride
async function deleteRide(rideId) {
    if (!confirm('Are you sure you want to delete this ride?')) {
        return;
    }
    
    try {
        await apiRequest(`/rides/${rideId}`, { method: 'DELETE' });
        showAlert('Ride deleted successfully!', 'success');
        loadMyRides();
    } catch (error) {
        showAlert('Error deleting ride: ' + error.message, 'danger');
    }
}

// Cancel booking
async function cancelBooking(rideId) {
    if (!confirm('Are you sure you want to cancel this booking?')) {
        return;
    }
    
    try {
        const response = await apiRequest(`/rides/${rideId}/cancel`, { method: 'POST' });
        showAlert(response.message || 'Booking cancelled successfully!', 'success');
        loadMyBookings();
    } catch (error) {
        showAlert('Error cancelling booking: ' + error.message, 'danger');
    }
}

// Show review modal
function showReviewModal(rideId) {
    const modalHtml = `
        <div class="modal fade" id="reviewModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Leave a Review</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="reviewForm">
                            <input type="hidden" id="reviewRideId" value="${rideId}">
                            <div class="mb-3">
                                <label class="form-label">Rating *</label>
                                <div class="rating-stars">
                                    ${[1,2,3,4,5].map(star => `
                                        <i class="fas fa-star rating-star text-muted" data-rating="${star}" onclick="selectRating(${star})" style="cursor: pointer; font-size: 2rem;"></i>
                                    `).join('')}
                                </div>
                                <input type="hidden" id="reviewRating" required>
                            </div>
                            <div class="mb-3">
                                <label for="reviewComment" class="form-label">Comment (Optional)</label>
                                <textarea class="form-control" id="reviewComment" rows="3" placeholder="Share your experience..."></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-success" onclick="submitReview()">Submit Review</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('reviewModal'));
    modal.show();
    
    document.getElementById('reviewModal').addEventListener('hidden.bs.modal', function () {
        this.remove();
    });
}

// Select rating
function selectRating(rating) {
    document.getElementById('reviewRating').value = rating;
    document.querySelectorAll('.rating-star').forEach((star, index) => {
        if (index < rating) {
            star.classList.add('text-warning');
            star.classList.remove('text-muted');
        } else {
            star.classList.remove('text-warning');
            star.classList.add('text-muted');
        }
    });
}

// Submit review
async function submitReview() {
    const rideId = document.getElementById('reviewRideId').value;
    const rating = document.getElementById('reviewRating').value;
    const comment = document.getElementById('reviewComment').value;
    
    if (!rating) {
        alert('Please select a rating');
        return;
    }
    
    try {
        await apiRequest(`/rides/${rideId}/review`, {
            method: 'POST',
            body: JSON.stringify({ rating: parseInt(rating), comment })
        });
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('reviewModal'));
        modal.hide();
        
        showAlert('Review submitted successfully!', 'success');
        loadMyBookings();
    } catch (error) {
        showAlert('Error submitting review: ' + error.message, 'danger');
    }
}

// Load user profile
async function loadUserProfile() {
    try {
        const user = await apiRequest('/auth/profile');
        
        document.getElementById('profileName').value = user.name || '';
        document.getElementById('profileEmail').value = user.email || '';
        document.getElementById('profilePhone').value = user.phone || '';
        document.getElementById('profileRole').value = user.role === 'admin' ? 'Administrator' : 'User';
    } catch (error) {
        showAlert('Error loading profile: ' + error.message, 'danger', 'profileAlert');
    }
}

// Update user profile
async function handleUpdateProfile(e) {
    e.preventDefault();
    
    const profileData = {
        name: document.getElementById('profileName').value,
        email: document.getElementById('profileEmail').value,
        phone: document.getElementById('profilePhone').value
    };
    
    try {
        const updatedUser = await apiRequest('/users/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
        
        // Update stored user data
        const currentUserData = getUserData();
        currentUserData.name = updatedUser.name;
        currentUserData.email = updatedUser.email;
        localStorage.setItem('userData', JSON.stringify(currentUserData));
        
        // Update display name
        document.getElementById('userName').textContent = updatedUser.name;
        
        showAlert('Profile updated successfully!', 'success', 'profileAlert');
    } catch (error) {
        showAlert('Error updating profile: ' + error.message, 'danger', 'profileAlert');
    }
}

// Load notifications
async function loadNotifications() {
    try {
        const notifs = await apiRequest('/notifications');
        notifications = notifs;
        updateNotificationUI();
    } catch (error) {
        console.error('Error loading notifications:', error);
    }
}

// Toggle notifications panel
function toggleNotifications() {
    const panel = document.getElementById('notificationPanel');
    const isHidden = panel.classList.contains('d-none');
    
    if (isHidden) {
        loadNotifications(); // Refresh notifications when opening
        panel.classList.remove('d-none');
        panel.style.display = 'block';
        panel.style.position = 'absolute';
        panel.style.top = '100%';
        panel.style.right = '0';
        panel.style.zIndex = '1000';
        
        // Mark all as read after a short delay
        setTimeout(() => {
            apiRequest('/notifications/read-all', { method: 'PUT' }).catch(() => {});
        }, 2000);
    } else {
        panel.classList.add('d-none');
    }
}

// Update notification UI
function updateNotificationUI() {
    const badge = document.getElementById('notificationBadge');
    const list = document.getElementById('notificationList');
    
    const unreadCount = notifications.filter(n => !n.isRead).length;
    
    if (unreadCount > 0) {
        badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
        badge.classList.remove('d-none');
    } else {
        badge.classList.add('d-none');
    }
    
    if (notifications.length > 0) {
        list.innerHTML = notifications.slice(0, 10).map(notif => `
            <div class="notification-item border-bottom pb-2 mb-2 ${notif.isRead ? '' : 'bg-light'}" style="padding: 8px; border-radius: 4px;">
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <div class="d-flex align-items-center mb-1">
                            ${getNotificationIcon(notif.type)}
                            <strong class="ms-2">${getNotificationTitle(notif.type)}</strong>
                        </div>
                        <small class="text-muted d-block">${notif.message}</small>
                        <small class="text-muted">${getTimeAgo(new Date(notif.createdAt).getTime())}</small>
                    </div>
                </div>
            </div>
        `).join('');
    } else {
        list.innerHTML = '<p class="text-muted text-center small">No notifications</p>';
    }
}

function getNotificationIcon(type) {
    const icons = {
        'booking_request': '<i class="fas fa-bell text-warning"></i>',
        'booking_accepted': '<i class="fas fa-check-circle text-success"></i>',
        'booking_rejected': '<i class="fas fa-times-circle text-danger"></i>',
        'ride_completed': '<i class="fas fa-flag-checkered text-info"></i>'
    };
    return icons[type] || '<i class="fas fa-info-circle text-primary"></i>';
}

function getNotificationTitle(type) {
    const titles = {
        'booking_request': 'New Booking Request',
        'booking_accepted': 'Booking Accepted',
        'booking_rejected': 'Booking Declined',
        'ride_completed': 'Ride Completed'
    };
    return titles[type] || 'Notification';
}

// Get time ago string
function getTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
}

// Close notifications when clicking outside
document.addEventListener('click', function(event) {
    const panel = document.getElementById('notificationPanel');
    const btn = document.getElementById('notificationBtn');
    
    if (panel && btn && !panel.contains(event.target) && !btn.contains(event.target)) {
        panel.classList.add('d-none');
    }
});

// Utility function to show alerts
function showAlert(message, type, containerId = null) {
    if (containerId) {
        const alertElement = document.getElementById(containerId);
        if (alertElement) {
            alertElement.className = `alert alert-${type}`;
            alertElement.textContent = message;
            alertElement.classList.remove('d-none');
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                alertElement.classList.add('d-none');
            }, 5000);
        }
    } else {
        // Create a temporary alert at the top of the page
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.style.position = 'fixed';
        alertDiv.style.top = '20px';
        alertDiv.style.right = '20px';
        alertDiv.style.zIndex = '9999';
        alertDiv.style.minWidth = '300px';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alertDiv);
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }
}
