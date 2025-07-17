document.addEventListener('DOMContentLoaded', function() {
    // Vault variables
    let vaultItems = JSON.parse(localStorage.getItem('vaultItems')) || [];
    let masterPin = localStorage.getItem('masterPin') || '1234'; // Default PIN for demo
    let currentPinAttempt = '';
    let isAuthenticated = false;
    let failedAttempts = parseInt(localStorage.getItem('failedAttempts')) || 0;
    let lastLogin = localStorage.getItem('lastLogin') || 'Never';
    let lastActivity = localStorage.getItem('lastActivity') || 'No activity yet';
    let accessCount = parseInt(localStorage.getItem('accessCount')) || 0;
    
    // DOM elements
    const vaultContainer = document.getElementById('vault');
    const vaultItemsGrid = document.getElementById('vault-items-grid');
    const addVaultItemBtn = document.getElementById('add-vault-item-btn');
    const vaultItemModal = document.getElementById('vault-item-modal');
    const viewItemModal = document.getElementById('view-item-modal');
    const securitySettingsModal = document.getElementById('security-settings-modal');
    const pinModal = document.getElementById('pin-modal');
    const pinModalTitle = document.getElementById('pin-modal-title');
    const pinDisplay = document.getElementById('pin-display');
    const pinError = document.getElementById('pin-error');
    const vaultFilter = document.getElementById('vault-filter');
    
    // Stats elements
    const totalItemsEl = document.getElementById('total-items');
    const lastLoginEl = document.getElementById('last-login');
    const failedAttemptsEl = document.getElementById('failed-attempts');
    const lastActivityEl = document.getElementById('last-activity');
    const currentDeviceEl = document.getElementById('current-device');
    const accessCountEl = document.getElementById('access-count');
    
    // Initialize vault
    initVault();
    
    // Event listeners
    addVaultItemBtn.addEventListener('click', showAddItemModal);
    vaultFilter.addEventListener('change', renderVaultItems);
    
    // PIN pad event delegation
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('pin-btn') && e.target.id !== 'pin-clear') {
            handlePinInput(e.target.dataset.value);
        } else if (e.target.id === 'pin-clear') {
            clearPinInput();
        } else if (e.target.classList.contains('close-modal1')) {
            closeAllModals();
        }
    });
    
    // Modal close when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal1')) {
            closeAllModals();
        }
    });
    
    // Initialize vault
    function initVault() {
        updateStats();
        checkAuthentication();
    }
    
    // Check authentication state
    function checkAuthentication() {
        const biometricAuth = localStorage.getItem('biometricAuth') === 'true';
        const autoLockTime = parseInt(localStorage.getItem('autoLockTime')) || 2;
        
        if (biometricAuth && 'credentials' in navigator) {
            // Try biometric authentication
            authenticateWithBiometrics();
        } else {
            // Show PIN modal
            showPinModal('Enter your PIN to access the vault');
        }
    }
    
    // Show PIN modal
    function showPinModal(title, isChangePin = false) {
        pinModalTitle.textContent = title;
        pinModal.style.display = 'flex';
        currentPinAttempt = '';
        updatePinDisplay();
        
        if (isChangePin) {
            pinModal.dataset.mode = 'change';
        } else {
            pinModal.dataset.mode = 'auth';
        }
    }
    
    // Handle PIN input
    function handlePinInput(value) {
        if (currentPinAttempt.length < 4) {
            currentPinAttempt += value;
            updatePinDisplay();
            
            if (currentPinAttempt.length === 4) {
                verifyPin();
            }
        }
    }
    
    // Clear PIN input
    function clearPinInput() {
        currentPinAttempt = '';
        updatePinDisplay();
        pinError.textContent = '';
    }
    
    // Update PIN display
    function updatePinDisplay() {
        let display = '';
        for (let i = 0; i < 4; i++) {
            display += i < currentPinAttempt.length ? '•' : '_';
        }
        pinDisplay.textContent = display;
    }
    
    // Verify PIN
    function verifyPin() {
        const mode = pinModal.dataset.mode;
        
        if (mode === 'auth') {
            if (currentPinAttempt === masterPin) {
                // Successful authentication
                isAuthenticated = true;
                failedAttempts = 0;
                accessCount++;
                lastLogin = new Date().toLocaleString();
                lastActivity = 'Vault accessed';
                
                localStorage.setItem('failedAttempts', failedAttempts);
                localStorage.setItem('lastLogin', lastLogin);
                localStorage.setItem('accessCount', accessCount);
                localStorage.setItem('lastActivity', lastActivity);
                
                updateStats();
                closeAllModals();
                vaultContainer.hidden = false;
            } else {
                // Failed attempt
                failedAttempts++;
                localStorage.setItem('failedAttempts', failedAttempts);
                updateStats();
                
                pinError.textContent = 'Incorrect PIN';
                currentPinAttempt = '';
                updatePinDisplay();
                
                // Check for intruder alert
                if (failedAttempts >= 3 && localStorage.getItem('intruderAlert') === 'true') {
                    alert('Too many failed attempts! Security alert triggered.');
                    // In a real app, you would implement actual security measures here
                }
            }
        } else if (mode === 'change') {
            // Change PIN flow
            if (!pinModal.dataset.step) {
                // First step - enter current PIN
                if (currentPinAttempt === masterPin) {
                    pinModal.dataset.step = 'new';
                    pinModalTitle.textContent = 'Enter new PIN';
                    currentPinAttempt = '';
                    updatePinDisplay();
                    pinError.textContent = '';
                } else {
                    pinError.textContent = 'Incorrect current PIN';
                    currentPinAttempt = '';
                    updatePinDisplay();
                }
            } else if (pinModal.dataset.step === 'new') {
                pinModal.dataset.newPin = currentPinAttempt;
                pinModal.dataset.step = 'confirm';
                pinModalTitle.textContent = 'Confirm new PIN';
                currentPinAttempt = '';
                updatePinDisplay();
                pinError.textContent = '';
            } else if (pinModal.dataset.step === 'confirm') {
                if (currentPinAttempt === pinModal.dataset.newPin) {
                    masterPin = currentPinAttempt;
                    localStorage.setItem('masterPin', masterPin);
                    pinError.textContent = 'PIN changed successfully!';
                    pinError.style.color = 'green';
                    
                    setTimeout(() => {
                        closeAllModals();
                    }, 1000);
                } else {
                    pinError.textContent = 'PINs do not match';
                    currentPinAttempt = '';
                    updatePinDisplay();
                }
            }
        }
    }
    
    // Close all modals
    function closeAllModals() {
        document.querySelectorAll('.modal1').forEach(modal => {
            modal.style.display = 'none';
        });
        
        // Reset PIN modal state if it was for changing PIN
        if (pinModal.dataset.mode === 'change') {
            delete pinModal.dataset.mode;
            delete pinModal.dataset.step;
            delete pinModal.dataset.newPin;
        }
    }
    
    // Update stats display
    function updateStats() {
        totalItemsEl.textContent = vaultItems.length;
        lastLoginEl.textContent = lastLogin;
        failedAttemptsEl.textContent = failedAttempts;
        lastActivityEl.textContent = lastActivity;
        accessCountEl.textContent = accessCount;
        
        // Detect device
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        currentDeviceEl.textContent = isMobile ? 'This Mobile Device' : 'This Computer';
    }
    
    // Show add item modal
    function showAddItemModal() {
        if (!isAuthenticated) {
            showPinModal('Enter your PIN to continue');
            return;
        }
        
        // Reset form
        document.getElementById('vault-item-form').reset();
        document.getElementById('note-fields').style.display = 'block';
        document.getElementById('password-fields').style.display = 'none';
        document.getElementById('file-fields').style.display = 'none';
        
        vaultItemModal.style.display = 'flex';
    }
    
    // Handle item type change
    document.getElementById('item-type').addEventListener('change', function() {
        const type = this.value;
        
        document.getElementById('note-fields').style.display = type === 'note' ? 'block' : 'none';
        document.getElementById('password-fields').style.display = type === 'password' ? 'block' : 'none';
        document.getElementById('file-fields').style.display = type === 'file' ? 'block' : 'none';
    });
    
    // Generate password
    document.getElementById('generate-password').addEventListener('click', function() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
        let password = '';
        
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        document.getElementById('password-value').value = password;
    });
    
    // Toggle password visibility
    document.getElementById('toggle-password').addEventListener('click', function() {
        const passwordInput = document.getElementById('password-value');
        passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
        this.innerHTML = passwordInput.type === 'password' ? '<i class="fas fa-eye"></i> Show' : '<i class="fas fa-eye-slash"></i> Hide';
    });
    
    // Save vault item
    document.getElementById('vault-item-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const type = document.getElementById('item-type').value;
        const tags = document.getElementById('item-tags').value.split(',').map(tag => tag.trim());
        const now = new Date().toISOString();
        
        let newItem;
        
        if (type === 'note') {
            newItem = {
                id: Date.now().toString(),
                type: 'note',
                title: document.getElementById('note-title').value,
                content: document.getElementById('note-content').value,
                tags,
                createdAt: now,
                updatedAt: now
            };
        } else if (type === 'password') {
            newItem = {
                id: Date.now().toString(),
                type: 'password',
                service: document.getElementById('password-service').value,
                username: document.getElementById('password-username').value,
                password: document.getElementById('password-value').value,
                url: document.getElementById('password-url').value,
                tags,
                createdAt: now,
                updatedAt: now
            };
        } else if (type === 'file') {
            // In a real app, you would handle file uploads here
            // For this demo, we'll just store the file name
            const fileInput = document.getElementById('file-upload');
            const fileName = fileInput.files[0] ? fileInput.files[0].name : 'No file selected';
            
            newItem = {
                id: Date.now().toString(),
                type: 'file',
                title: document.getElementById('file-title').value,
                fileName,
                notes: document.getElementById('file-notes').value,
                tags,
                createdAt: now,
                updatedAt: now
            };
        }
        
        vaultItems.push(newItem);
        saveVaultItems();
        renderVaultItems();
        closeAllModals();
        
        // Update activity
        lastActivity = `Added new ${type}`;
        localStorage.setItem('lastActivity', lastActivity);
        updateStats();
    });
    
    // Save vault items to localStorage
    function saveVaultItems() {
        localStorage.setItem('vaultItems', JSON.stringify(vaultItems));
        updateStats();
    }
    
    // Render vault items based on filter
    function renderVaultItems() {
        const filter = vaultFilter.value;
        let filteredItems = vaultItems;
        
        if (filter !== 'all') {
            filteredItems = vaultItems.filter(item => item.type === filter);
        }
        
        if (filteredItems.length === 0) {
            vaultItemsGrid.innerHTML = '<div class="empty-state">No items found</div>';
            return;
        }
        
        vaultItemsGrid.innerHTML = '';
        
        filteredItems.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.className = 'vault-item';
            itemEl.dataset.id = item.id;
            
            let content = '';
            let typeLabel = '';
            
            if (item.type === 'note') {
                typeLabel = 'Note';
                content = item.content.length > 100 ? item.content.substring(0, 100) + '...' : item.content;
            } else if (item.type === 'password') {
                typeLabel = 'Password';
                content = `Username: ${item.username}<br>Password: ••••••••`;
            } else if (item.type === 'file') {
                typeLabel = 'File';
                content = `File: ${item.fileName}`;
                if (item.notes) content += `<br>Notes: ${item.notes}`;
            }
            
            itemEl.innerHTML = `
                <div class="vault-item-header">
                    <div class="vault-item-title">${item.title || item.service || item.fileName}</div>
                    <div class="vault-item-type">${typeLabel}</div>
                </div>
                <div class="vault-item-content">${content}</div>
                <div class="vault-item-footer">
                    <div>${new Date(item.createdAt).toLocaleDateString()}</div>
                    <div>${item.tags.join(', ')}</div>
                </div>
            `;
            
            itemEl.addEventListener('click', () => viewVaultItem(item.id));
            vaultItemsGrid.appendChild(itemEl);
        });
    }
    
    // View vault item
    function viewVaultItem(id) {
        if (!isAuthenticated) {
            showPinModal('Enter your PIN to view this item');
            return;
        }
        
        const item = vaultItems.find(item => item.id === id);
        if (!item) return;
        
        const viewItemContent = document.getElementById('view-item-content');
        viewItemTitle.textContent = item.title || item.service || item.fileName;
        
        let content = '';
        
        if (item.type === 'note') {
            content = `
                <div class="item-detail">
                    <h4>Note Content</h4>
                    <p>${item.content.replace(/\n/g, '<br>')}</p>
                </div>
            `;
        } else if (item.type === 'password') {
            content = `
                <div class="item-detail">
                    <h4>Login Details</h4>
                    <p><strong>Service:</strong> ${item.service}</p>
                    <p><strong>Username:</strong> ${item.username}</p>
                    <p><strong>Password:</strong> <span id="password-display">••••••••</span> 
                        <button id="show-password" class="small-btn"><i class="fas fa-eye"></i> Show</button>
                        <button id="copy-password" class="small-btn"><i class="fas fa-copy"></i> Copy</button>
                    </p>
                    ${item.url ? `<p><strong>URL:</strong> <a href="${item.url}" target="_blank">${item.url}</a></p>` : ''}
                </div>
            `;
        } else if (item.type === 'file') {
            content = `
                <div class="item-detail">
                    <h4>File Details</h4>
                    <p><strong>File Name:</strong> ${item.fileName}</p>
                    ${item.notes ? `<p><strong>Notes:</strong> ${item.notes}</p>` : ''}
                </div>
            `;
        }
        
        content += `
            <div class="item-meta">
                <p><strong>Created:</strong> ${new Date(item.createdAt).toLocaleString()}</p>
                <p><strong>Last Updated:</strong> ${new Date(item.updatedAt).toLocaleString()}</p>
                ${item.tags.length ? `<p><strong>Tags:</strong> ${item.tags.join(', ')}</p>` : ''}
            </div>
        `;
        
        viewItemContent.innerHTML = content;
        
        // Set up password display toggle if it's a password item
        if (item.type === 'password') {
            const passwordDisplay = document.getElementById('password-display');
            const showPasswordBtn = document.getElementById('show-password');
            const copyPasswordBtn = document.getElementById('copy-password');
            let isPasswordVisible = false;
            
            showPasswordBtn.addEventListener('click', () => {
                isPasswordVisible = !isPasswordVisible;
                passwordDisplay.textContent = isPasswordVisible ? item.password : '••••••••';
                showPasswordBtn.innerHTML = isPasswordVisible ? '<i class="fas fa-eye-slash"></i> Hide' : '<i class="fas fa-eye"></i> Show';
            });
            
            copyPasswordBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(item.password);
                alert('Password copied to clipboard!');
            });
        }
        
        // Set up item actions
        document.getElementById('edit-item-btn').onclick = () => editVaultItem(item.id);
        document.getElementById('delete-item-btn').onclick = () => deleteVaultItem(item.id);
        document.getElementById('copy-item-btn').onclick = () => copyVaultItem(item);
        
        viewItemModal.style.display = 'flex';
        
        // Update activity
        lastActivity = `Viewed ${item.type}: ${item.title || item.service || item.fileName}`;
        localStorage.setItem('lastActivity', lastActivity);
        updateStats();
    }
    
    // Edit vault item
    function editVaultItem(id) {
        closeAllModals();
        
        const item = vaultItems.find(item => item.id === id);
        if (!item) return;
        
        // For simplicity, we'll just delete and re-add the item
        // In a real app, you would implement a proper edit form
        deleteVaultItem(id, false);
        
        if (item.type === 'note') {
            document.getElementById('item-type').value = 'note';
            document.getElementById('note-title').value = item.title;
            document.getElementById('note-content').value = item.content;
        } else if (item.type === 'password') {
            document.getElementById('item-type').value = 'password';
            document.getElementById('password-service').value = item.service;
            document.getElementById('password-username').value = item.username;
            document.getElementById('password-value').value = item.password;
            document.getElementById('password-url').value = item.url || '';
        } else if (item.type === 'file') {
            document.getElementById('item-type').value = 'file';
            document.getElementById('file-title').value = item.title;
            document.getElementById('file-notes').value = item.notes || '';
        }
        
        document.getElementById('item-tags').value = item.tags.join(', ');
        
        vaultItemModal.style.display = 'flex';
    }
    
    // Delete vault item
    function deleteVaultItem(id, confirm = true) {
        if (confirm && !window.confirm('Are you sure you want to delete this item?')) {
            return;
        }
        
        vaultItems = vaultItems.filter(item => item.id !== id);
        saveVaultItems();
        renderVaultItems();
        closeAllModals();
        
        // Update activity
        lastActivity = 'Deleted an item';
        localStorage.setItem('lastActivity', lastActivity);
        updateStats();
    }
    
    // Copy vault item to clipboard
    function copyVaultItem(item) {
        let text = '';
        
        if (item.type === 'note') {
            text = `${item.title}\n\n${item.content}`;
        } else if (item.type === 'password') {
            text = `Service: ${item.service}\nUsername: ${item.username}\nPassword: ${item.password}`;
            if (item.url) text += `\nURL: ${item.url}`;
        } else if (item.type === 'file') {
            text = `File: ${item.fileName}`;
            if (item.notes) text += `\nNotes: ${item.notes}`;
        }
        
        navigator.clipboard.writeText(text);
        alert('Item copied to clipboard!');
        
        // Update activity
        lastActivity = `Copied ${item.type} to clipboard`;
        localStorage.setItem('lastActivity', lastActivity);
        updateStats();
    }
    
    // Security settings
    document.getElementById('biometric-auth').addEventListener('change', function() {
        const isEnabled = this.checked;
        localStorage.setItem('biometricAuth', isEnabled);
        document.getElementById('biometric-status').textContent = isEnabled ? 'Enabled' : 'Disabled';
    });
    
    document.getElementById('auto-lock-time').addEventListener('change', function() {
        localStorage.setItem('autoLockTime', this.value);
    });
    
    document.getElementById('intruder-alert').addEventListener('change', function() {
        const isEnabled = this.checked;
        localStorage.setItem('intruderAlert', isEnabled);
        document.getElementById('intruder-status').textContent = isEnabled ? 'Enabled' : 'Disabled';
    });
    
    document.getElementById('change-pin-btn').addEventListener('click', function() {
        showPinModal('Enter current PIN to change', true);
    });
    
    // Initialize security settings
    function initSecuritySettings() {
        // Biometric auth
        const biometricAuth = localStorage.getItem('biometricAuth') === 'true';
        document.getElementById('biometric-auth').checked = biometricAuth;
        document.getElementById('biometric-status').textContent = biometricAuth ? 'Enabled' : 'Disabled';
        
        // Auto-lock time
        const autoLockTime = localStorage.getItem('autoLockTime') || '2';
        document.getElementById('auto-lock-time').value = autoLockTime;
        
        // Intruder alert
        const intruderAlert = localStorage.getItem('intruderAlert') === 'true';
        document.getElementById('intruder-alert').checked = intruderAlert;
        document.getElementById('intruder-status').textContent = intruderAlert ? 'Enabled' : 'Disabled';
    }
    
    // Biometric authentication (simplified for demo)
    function authenticateWithBiometrics() {
        // In a real app, you would use the Web Authentication API or similar
        console.log('Attempting biometric authentication...');
        
        // For demo purposes, we'll simulate biometric auth with a timeout
        setTimeout(() => {
            // Simulate successful auth 80% of the time
            if (Math.random() < 0.8) {
                isAuthenticated = true;
                failedAttempts = 0;
                accessCount++;
                lastLogin = new Date().toLocaleString();
                lastActivity = 'Vault accessed via biometrics';
                
                localStorage.setItem('failedAttempts', failedAttempts);
                localStorage.setItem('lastLogin', lastLogin);
                localStorage.setItem('accessCount', accessCount);
                localStorage.setItem('lastActivity', lastActivity);
                
                updateStats();
                vaultContainer.hidden = false;
            } else {
                // Fall back to PIN
                showPinModal('Biometric failed. Enter your PIN');
            }
        }, 1000);
    }
    
    // Initialize security settings
    initSecuritySettings();
    
    // Auto-lock timer
    let lockTimer;
    function resetLockTimer() {
        clearTimeout(lockTimer);
        
        const autoLockTime = parseInt(localStorage.getItem('autoLockTime')) || 2;
        if (autoLockTime > 0) {
            lockTimer = setTimeout(() => {
                isAuthenticated = false;
                vaultContainer.hidden = true;
                showPinModal('Session timed out. Enter your PIN to continue');
            }, autoLockTime * 60 * 1000);
        }
    }
    
    // Reset timer on user activity
    document.addEventListener('mousemove', resetLockTimer);
    document.addEventListener('keydown', resetLockTimer);
    document.addEventListener('click', resetLockTimer);
    
    // Initial timer setup
    if (isAuthenticated) {
        resetLockTimer();
    }
});

// Add this at the end of your security.js file
function initSecurityVault() {
    // Your existing vault initialization code
    console.log("Security vault initialized");
    
    // Make sure the vault container is visible
    document.getElementById('vault').hidden = false;
    
    // Load any necessary data
    renderVaultItems();
    updateStats();
}


// Make sure these functions are available globally
window.initSecurityVault = initSecurityVault;
window.showPinModal = showPinModal;