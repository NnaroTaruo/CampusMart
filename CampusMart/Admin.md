<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Campus Elite | Sell</title>
    <link rel="stylesheet" href="globals.css">
    <style>
        /* DASHBOARD LAYOUT */
        body {
            display: flex;
            min-height: 100vh;
            overflow: hidden;
            background-color: #0f0f11;
        }

        /* SIDEBAR (Match new Shop page) */
        .sidebar {
            width: 260px;
            background: #121214; 
            border-right: 1px solid var(--border-subtle);
            display: flex;
            flex-direction: column;
            z-index: 100;
            transition: var(--transition-smooth);
        }

        .sidebar-header {
            padding: 24px;
            display: flex;
            align-items: center;
        }

        .sidebar-brand {
            font-size: 20px;
            font-weight: 800;
            color: var(--primary);
            text-decoration: none;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }

        .portal-title {
            padding: 0 24px 16px;
        }

        .portal-title h3 {
            font-size: 16px;
            color: var(--primary);
            margin-bottom: 2px;
        }

        .portal-title p {
            font-size: 11px;
            color: var(--text-muted);
            font-weight: 600;
        }

        .sidebar-nav {
            flex: 1;
            display: flex;
            flex-direction: column;
        }

        .nav-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px 24px;
            color: var(--text-muted);
            text-decoration: none;
            font-size: 14px;
            font-weight: 600;
            transition: var(--transition-smooth);
        }

        .nav-item.active {
            background: rgba(255, 215, 0, 0.1);
            color: var(--primary);
            border-left: 3px solid var(--primary);
        }
        
        .nav-item:not(.active):hover {
            background: rgba(255, 255, 255, 0.05);
            color: white;
        }

        .nav-icon {
            font-size: 18px;
            width: 24px;
            text-align: center;
        }

        .user-profile {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 20px 24px;
            border-top: 1px solid rgba(255,255,255,0.05);
            margin-top: auto;
            cursor: pointer;
            transition: var(--transition-smooth);
        }

        .user-profile:hover {
            background: rgba(255,255,255,0.05);
        }

        .user-avatar {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: #222;
            object-fit: cover;
        }

        .user-info h3 {
            font-size: 13px;
            margin-bottom: 2px;
            color: white;
        }

        .user-info p {
            font-size: 10px;
            color: var(--primary);
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        /* MAIN CONTENT */
        .main-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow-y: auto;
            background-color: var(--bg-base);
            position: relative;
            background-image: var(--bg-radial);
        }

        /* TOP NAVBAR */
        .top-navbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 40px;
            background: rgba(15, 15, 17, 0.9);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            border-bottom: 1px solid var(--border-subtle);
            position: sticky;
            top: 0;
            z-index: 50;
        }

        .top-nav-links {
            display: flex;
            gap: 32px;
            align-items: center;
            margin-left: 40px;
        }

        .top-link {
            color: var(--text-muted);
            text-decoration: none;
            font-size: 14px;
            font-weight: 600;
            transition: var(--transition-smooth);
            padding-bottom: 4px;
            border-bottom: 2px solid transparent;
        }

        .top-link:hover {
            color: white;
        }

        .top-link.active {
            color: var(--primary);
            border-bottom-color: var(--primary);
        }

        .top-actions {
            display: flex;
            align-items: center;
            gap: 20px;
        }

        .icon-btn {
            background: transparent;
            border: none;
            color: var(--text-muted);
            font-size: 18px;
            cursor: pointer;
            transition: var(--transition-smooth);
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .icon-btn:hover {
            color: white;
        }

        .profile-trigger {
            border-radius: 50%;
        }

        /* SELL CONTAINER */
        .dashboard-container {
            padding: 40px;
            max-width: 900px; /* Thinner for forms */
            margin: 0 auto;
            width: 100%;
        }

        .form-header {
            text-align: center;
            margin-bottom: 40px;
        }

        .form-title {
            font-size: 32px;
            color: white;
            font-weight: 800;
            margin-bottom: 12px;
        }

        .form-subtitle {
            font-size: 15px;
            color: var(--text-muted);
            max-width: 600px;
            margin: 0 auto;
        }

        /* FORM STYLING */
        .sell-form {
            background: var(--card-bg);
            border: 1px solid var(--border-subtle);
            border-radius: 20px;
            padding: 40px;
            backdrop-filter: blur(12px);
        }

        .form-group {
            margin-bottom: 24px;
        }

        .form-row {
            display: flex;
            gap: 24px;
            margin-bottom: 24px;
        }

        .form-row .form-group {
            flex: 1;
            margin-bottom: 0;
        }

        .form-label {
            display: block;
            font-size: 13px;
            color: var(--text-muted);
            font-weight: 700;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .form-input, .form-select, .form-textarea {
            width: 100%;
            background: rgba(0, 0, 0, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.1);
            padding: 14px 18px;
            border-radius: 12px;
            color: white;
            font-size: 15px;
            font-family: inherit;
            transition: var(--transition-smooth);
        }

        .form-input:focus, .form-select:focus, .form-textarea:focus {
            outline: none;
            border-color: var(--primary);
            background: rgba(0, 0, 0, 0.6);
            box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.1);
        }

        .form-select {
            appearance: none;
            background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
            background-repeat: no-repeat;
            background-position: right 16px center;
            background-size: 16px;
        }
        
        .form-select option {
            background: #121214;
            color: white;
        }

        .form-textarea {
            resize: vertical;
            min-height: 120px;
        }

        /* UPLOAD ZONE */
        .upload-zone {
            border: 2px dashed rgba(255, 255, 255, 0.15);
            border-radius: 16px;
            padding: 40px;
            text-align: center;
            background: rgba(0, 0, 0, 0.2);
            transition: var(--transition-smooth);
            cursor: pointer;
            margin-bottom: 32px;
        }

        .upload-zone:hover {
            border-color: var(--primary);
            background: rgba(255, 215, 0, 0.05);
        }

        .upload-icon {
            font-size: 40px;
            color: var(--primary);
            margin-bottom: 16px;
            display: inline-block;
        }

        .upload-text {
            color: white;
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 8px;
        }

        .upload-subtext {
            color: var(--text-muted);
            font-size: 13px;
        }

        .submit-btn {
            width: 100%;
            background: var(--primary);
            color: #0f0f11;
            font-size: 16px;
            font-weight: 800;
            padding: 16px;
            border: none;
            border-radius: 12px;
            cursor: pointer;
            transition: var(--transition-smooth);
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .submit-btn:hover {
            transform: translateY(-2px);
            background: var(--primary-hover);
            box-shadow: 0 10px 25px rgba(255, 215, 0, 0.3);
        }

        /* PROFILE MODAL */
        .modal-overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            backdrop-filter: blur(5px);
            z-index: 1000;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        .modal-overlay.active {
            display: flex;
            opacity: 1;
        }
        .profile-modal {
            background: #141417;
            border: 1px solid var(--border-subtle);
            border-radius: 20px;
            width: 100%;
            max-width: 450px;
            padding: 30px;
            transform: translateY(20px);
            transition: transform 0.3s ease;
            box-shadow: 0 20px 40px rgba(0,0,0,0.5);
        }
        .modal-overlay.active .profile-modal {
            transform: translateY(0);
        }
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
        }
        .modal-title {
            font-size: 20px;
            color: white;
            font-weight: 700;
        }
        .close-modal {
            background: transparent;
            border: none;
            color: var(--text-muted);
            font-size: 24px;
            cursor: pointer;
            transition: var(--transition-smooth);
        }
        .close-modal:hover {
            color: white;
        }
        .profile-pic-edit {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-bottom: 24px;
            gap: 12px;
        }
        .profile-pic-preview {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            object-fit: cover;
            border: 3px solid var(--primary);
        }
        .btn-outline {
            background: transparent;
            border: 1px solid var(--primary);
            color: var(--primary);
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
            transition: var(--transition-smooth);
        }
        .btn-outline:hover {
            background: rgba(255, 215, 0, 0.1);
        }
        .modal-form-group {
            margin-bottom: 16px;
        }
        .modal-label {
            display: block;
            font-size: 12px;
            color: var(--text-muted);
            margin-bottom: 8px;
            font-weight: 600;
            text-transform: uppercase;
        }
        .modal-input {
            width: 100%;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            padding: 12px 16px;
            border-radius: 10px;
            color: white;
            font-size: 14px;
            font-family: inherit;
        }
        .modal-input:focus {
            outline: none;
            border-color: var(--primary);
        }
        .modal-input[readonly] {
            background: rgba(0,0,0,0.2);
            color: rgba(255,255,255,0.4);
            cursor: not-allowed;
            border-color: transparent;
        }
        .btn-save {
            width: 100%;
            background: var(--primary);
            color: #0f0f11;
            border: none;
            padding: 14px;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 800;
            cursor: pointer;
            margin-top: 8px;
            transition: var(--transition-smooth);
        }
        .btn-save:hover {
            background: var(--primary-hover);
        }

        /* HISTORY LIST */
        .history-list {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        .history-section-title {
            font-size: 18px;
            color: white;
            font-weight: 700;
            margin: 32px 0 16px;
        }
        .history-card {
            background: rgba(255,255,255,0.03);
            border: 1px solid var(--border-subtle);
            border-radius: 12px;
            padding: 20px;
            display: flex;
            align-items: center;
            gap: 20px;
            transition: var(--transition-smooth);
        }
        .history-card:hover {
            background: rgba(255,255,255,0.06);
            border-color: rgba(255,255,255,0.15);
        }
        .history-img {
            width: 80px;
            height: 80px;
            border-radius: 8px;
            object-fit: cover;
            background: #222;
        }
        .history-details {
            flex: 1;
        }
        .history-title {
            font-size: 16px;
            font-weight: 700;
            color: white;
            margin-bottom: 4px;
        }
        .history-meta {
            font-size: 13px;
            color: var(--text-muted);
            display: flex;
            gap: 16px;
        }
        .history-price {
            font-size: 16px;
            font-weight: 800;
            color: var(--primary);
        }
        .status-badge {
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
        }
        .status-active {
            background: rgba(74, 222, 128, 0.1);
            color: #4ade80;
            border: 1px solid rgba(74, 222, 128, 0.2);
        }
        .status-sold {
            background: rgba(255, 215, 0, 0.1);
            color: var(--primary);
            border: 1px solid rgba(255, 215, 0, 0.2);
        }
        .history-actions {
            display: flex;
            gap: 8px;
        }
        .btn-small {
            background: transparent;
            border: 1px solid rgba(255,255,255,0.2);
            color: white;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: var(--transition-smooth);
        }
        .btn-small:hover {
            background: rgba(255,255,255,0.1);
        }
        .btn-small.danger:hover {
            background: rgba(239, 68, 68, 0.1);
            color: #ef4444;
            border-color: #ef4444;
        }
    </style>
</head>
<body>

    <!-- SIDEBAR -->
    <aside class="sidebar">
        <div class="sidebar-header">
            <a href="#" class="sidebar-brand">CAMPUSELITE</a>
        </div>
        
        <div class="portal-title">
            <h3>Student Portal</h3>
            <p>Elite Concierge Service</p>
        </div>

        <nav class="sidebar-nav" id="sidebarNav">
            <a href="#" class="nav-item active" data-target="postListingSection">
                <span class="nav-icon">➕</span> Post Listing
            </a>
            <a href="#" class="nav-item" data-target="activeListingsSection">
                <span class="nav-icon">📦</span> My Active Listings
            </a>
            <a href="#" class="nav-item">
                <span class="nav-icon">📈</span> Analytics
            </a>
            <a href="#" class="nav-item">
                <span class="nav-icon">💳</span> Payouts
            </a>
        </nav>

        <div class="user-profile profile-trigger" id="userProfileBtn">
            <img src="https://ui-avatars.com/api/?name=Alex+Chen&background=222&color=fff" alt="Alex Chen" class="user-avatar" id="sidebarAvatar">
            <div class="user-info">
                <h3 id="sidebarName">Alex Chen</h3>
                <p>Premium Member</p>
            </div>
        </div>
    </aside>

    <!-- MAIN CONTENT -->
    <main class="main-content">
        <!-- TOP NAVBAR -->
        <header class="top-navbar">
            <div class="top-nav-links">
                <a href="student_dashboard.html" class="top-link">Shop</a>
                <a href="student_renting.html" class="top-link">Rentals</a>
                <a href="student_sell.html" class="top-link active">Sell</a>
            </div>

            <div class="top-actions">
                <button class="icon-btn">🔔</button>
                <button class="icon-btn profile-trigger" id="topProfileBtn" type="button" aria-label="Open profile editor">👤</button>
            </div>
        </header>

        <!-- DASHBOARD CONTAINER -->
        <div class="dashboard-container">
            
            <!-- POST LISTING SECTION -->
            <div id="postListingSection">
                <div class="form-header animate-fade-in">
                    <h1 class="form-title">Post a New Listing</h1>
                    <p class="form-subtitle">Turn your unused textbooks, gadgets, and campus essentials into cash. Reach thousands of students securely.</p>
                </div>

            <div class="sell-form animate-fade-in delay-1">
                
                <div class="upload-zone">
                    <span class="upload-icon">📸</span>
                    <h3 class="upload-text">Drop images here or click to upload</h3>
                    <p class="upload-subtext">Add up to 5 high-quality photos (JPG, PNG). Max 5MB per file.</p>
                </div>

                <div class="form-group">
                    <label class="form-label">Item Title</label>
                    <input type="text" class="form-input" placeholder="e.g. Calculus Early Transcendentals 9th Edition">
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Price ($)</label>
                        <input type="number" class="form-input" placeholder="0.00">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Category</label>
                        <select class="form-select">
                            <option>Select a category...</option>
                            <option>Textbooks & Academics</option>
                            <option>Electronics & Gadgets</option>
                            <option>Dorm Essentials</option>
                            <option>Clothing & Apparel</option>
                            <option>Other</option>
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Condition</label>
                    <select class="form-select">
                        <option>Brand New (Sealed)</option>
                        <option>Like New (No signs of wear)</option>
                        <option>Good (Minor wear, fully functional)</option>
                        <option>Fair (Visible wear, works fine)</option>
                    </select>
                </div>

                <div class="form-group">
                    <label class="form-label">Description</label>
                    <textarea class="form-textarea" placeholder="Describe the item, note any flaws, and mention what is included..."></textarea>
                </div>

                <button class="submit-btn">Publish Listing</button>

            </div>
            </div> <!-- End Post Listing Section -->

            <!-- ACTIVE LISTINGS SECTION -->
            <div id="activeListingsSection" style="display: none;">
                <div class="form-header animate-fade-in">
                    <h1 class="form-title">My Active Listings</h1>
                    <p class="form-subtitle">Manage your current listings and view past sales.</p>
                </div>

                <h2 class="history-section-title">Active Listings</h2>
                <div class="history-list animate-fade-in delay-1">
                    <div class="history-card">
                        <img src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=2000&auto=format&fit=crop" alt="Book" class="history-img">
                        <div class="history-details">
                            <h3 class="history-title">Calculus Early Transcendentals 9th Ed</h3>
                            <div class="history-meta">
                                <span>Listed: Oct 12, 2023</span>
                                <span>Views: 45</span>
                            </div>
                        </div>
                        <div class="history-price">$85.00</div>
                        <span class="status-badge status-active">Active</span>
                        <div class="history-actions">
                            <button class="btn-small">Edit</button>
                            <button class="btn-small danger">Del</button>
                        </div>
                    </div>
                    <div class="history-card">
                        <img src="https://images.unsplash.com/photo-1517336714739-489689fd1ca8?q=80&w=2000&auto=format&fit=crop" alt="Tablet" class="history-img">
                        <div class="history-details">
                            <h3 class="history-title">iPad Air 5 with Apple Pencil</h3>
                            <div class="history-meta">
                                <span>Listed: Nov 01, 2023</span>
                                <span>Views: 68</span>
                            </div>
                        </div>
                        <div class="history-price">$540.00</div>
                        <span class="status-badge status-active">Active</span>
                        <div class="history-actions">
                            <button class="btn-small">Edit</button>
                            <button class="btn-small danger">Del</button>
                        </div>
                    </div>
                </div>

                <h2 class="history-section-title">Selling History</h2>
                <div class="history-list">
                    <div class="history-card">
                        <img src="https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?q=80&w=2000&auto=format&fit=crop" alt="Laptop" class="history-img">
                        <div class="history-details">
                            <h3 class="history-title">MacBook Pro M1 2020</h3>
                            <div class="history-meta">
                                <span>Sold: Sep 05, 2023</span>
                                <span>Buyer: Sarah J.</span>
                            </div>
                        </div>
                        <div class="history-price">$800.00</div>
                        <span class="status-badge status-sold">Sold</span>
                        <div class="history-actions">
                            <button class="btn-small">View Receipt</button>
                        </div>
                    </div>
                    <div class="history-card">
                        <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2000&auto=format&fit=crop" alt="Headphones" class="history-img">
                        <div class="history-details">
                            <h3 class="history-title">Sony WH-1000XM4 Headphones</h3>
                            <div class="history-meta">
                                <span>Sold: Aug 18, 2023</span>
                                <span>Buyer: Mark T.</span>
                            </div>
                        </div>
                        <div class="history-price">$210.00</div>
                        <span class="status-badge status-sold">Sold</span>
                        <div class="history-actions">
                            <button class="btn-small">View Receipt</button>
                        </div>
                    </div>
                </div>
            </div> <!-- End Active Listings Section -->

        </div>
    </main>

    <!-- PROFILE EDIT MODAL -->
    <div class="modal-overlay" id="profileModal">
        <div class="profile-modal">
            <div class="modal-header">
                <h2 class="modal-title">Edit Profile</h2>
                <button class="close-modal" id="closeProfileModal">&times;</button>
            </div>
            
            <div class="profile-pic-edit">
                <img src="https://ui-avatars.com/api/?name=Alex+Chen&background=222&color=fff" alt="Profile" class="profile-pic-preview" id="modalPicPreview">
                <button class="btn-outline" onclick="document.getElementById('profilePicInput').click()">Change Picture</button>
                <input type="file" id="profilePicInput" style="display: none;" accept="image/*">
            </div>

            <div class="modal-form-group">
                <label class="modal-label">Full Name</label>
                <input type="text" class="modal-input" id="profileNameInput" value="Alex Chen">
            </div>

            <div class="modal-form-group">
                <label class="modal-label">ID Number</label>
                <input type="text" class="modal-input" value="2021-00123" readonly>
            </div>

            <div class="modal-form-group">
                <label class="modal-label">Course</label>
                <input type="text" class="modal-input" value="BS Computer Science" readonly>
            </div>

            <button class="btn-save" id="saveProfileBtn">Save Changes</button>
        </div>
    </div>

    <script>
        // Sidebar Navigation
        const navItems = document.querySelectorAll('#sidebarNav .nav-item');
        const sections = {
            'postListingSection': document.getElementById('postListingSection'),
            'activeListingsSection': document.getElementById('activeListingsSection')
        };

        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Remove active class
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');

                // Show target section if it exists
                const targetId = item.getAttribute('data-target');
                if (targetId && sections[targetId]) {
                    Object.values(sections).forEach(sec => {
                        if(sec) sec.style.display = 'none';
                    });
                    sections[targetId].style.display = 'block';
                }
            });
        });

        // Profile Modal Logic
        const profileModal = document.getElementById('profileModal');
        const profileTriggers = document.querySelectorAll('.profile-trigger');
        const closeProfileModal = document.getElementById('closeProfileModal');
        const saveProfileBtn = document.getElementById('saveProfileBtn');
        const profilePicInput = document.getElementById('profilePicInput');
        const modalPicPreview = document.getElementById('modalPicPreview');
        const sidebarAvatar = document.getElementById('sidebarAvatar');
        const sidebarName = document.getElementById('sidebarName');
        const profileNameInput = document.getElementById('profileNameInput');
        const body = document.body;

        function openProfileModal() {
            profileModal.classList.add('active');
            body.style.overflow = 'hidden';
        }

        function closeProfileEditor() {
            profileModal.classList.remove('active');
            body.style.overflow = '';
        }

        profileTriggers.forEach(trigger => {
            trigger.addEventListener('click', openProfileModal);
        });

        // Close Modal
        closeProfileModal.addEventListener('click', closeProfileEditor);

        // Close when clicking outside
        profileModal.addEventListener('click', (e) => {
            if(e.target === profileModal) {
                closeProfileEditor();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && profileModal.classList.contains('active')) {
                closeProfileEditor();
            }
        });

        // Handle Image Upload Preview
        profilePicInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    modalPicPreview.src = e.target.result;
                }
                reader.readAsDataURL(this.files[0]);
            }
        });

        // Save Profile
        saveProfileBtn.addEventListener('click', () => {
            if(profileNameInput.value.trim() !== '') {
                sidebarName.textContent = profileNameInput.value.trim();
            }
            sidebarAvatar.src = modalPicPreview.src;
            closeProfileEditor();
        });
    </script>
</body>
</html>



can you make this to a Tag helper and the sidebar of the admin make it separate to make it cleanliness and readability and also before you do this can you give me an explain that how to create an admin account only put a code that static like i put in my code 

admin id: admin
admin pass: Admin@123

in my code build it you can add another by put it in code pls help me to put it.

and also the css and js i want to put it in separate file in wwwroot folder and change all the file if you want or create for admin

and make it logic for admin if you want to change the design you can change it and also make it logic UI/UX and the admin readablility and cleanleniss UI