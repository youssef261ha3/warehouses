// Firebase configuration - Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCipCX2qabmYwOxUpJr07M0O1n4e6OTNrk",
  authDomain: "flashenergy-35783.firebaseapp.com",
  databaseURL: "https://flashenergy-35783-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "flashenergy-35783",
  storageBucket: "flashenergy-35783.appspot.com",
  messagingSenderId: "661915550417",
  appId: "1:661915550417:web:d461c040fc6acfec593bf0"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

let currentUser = null;
let items = [];

// DOM Elements
const authContainer = document.getElementById('auth-container');
const mainContainer = document.getElementById('main-container');
const userEmailSpan = document.getElementById('user-email');
const itemsTableBody = document.getElementById('items-table-body');
const searchInput = document.getElementById('search-input');

// Check authentication state
auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        userEmailSpan.textContent = user.email;
        showMainContainer();
        loadItems();

        // Show or hide Activity Logs tab based on user email
        const allowedEmails = ['hamdyfg@gmail.com', 'flashgroup17@gmail.com'];
        const activityTabButton = document.getElementById('activity-tab');
        const activityTabPane = document.getElementById('activity-tab-pane');
        if (allowedEmails.includes(currentUser.email)) {
            activityTabButton.style.display = 'block';
            activityTabPane.style.display = 'block';
            loadActivityLogs();
        } else {
            activityTabButton.style.display = 'none';
            activityTabPane.style.display = 'none';
        }
    } else {
        showAuthContainer();
    }
});

function showAuthContainer() {
    authContainer.style.display = 'block';
    mainContainer.style.display = 'none';
}

function showMainContainer() {
    authContainer.style.display = 'none';
    mainContainer.style.display = 'block';
}

function showLogin() {
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('register-section').style.display = 'none';
}

function showRegister() {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('register-section').style.display = 'block';
}

function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
        alert('Please enter both email and password');
        return;
    }

    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            // No logActivity call since privileges system removed
        })
        .catch((error) => {
            alert('Login failed: ' + error.message);
        });
}

function register() {
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (!email || !password || !confirmPassword) {
        alert('Please fill all fields');
        return;
    }

    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    auth.createUserWithEmailAndPassword(email, password)
        .then(() => {
            // No saving user to database since privileges system removed
            showLogin();
        })
        .catch((error) => {
            alert('Registration failed: ' + error.message);
        });
}

function logout() {
    auth.signOut()
        .then(() => {
            // No logActivity call since privileges system removed
        })
        .catch((error) => {
            alert('Logout failed: ' + error.message);
        });
}



function loadItems() {
    database.ref('items').on('value', (snapshot) => {
        items = [];
        snapshot.forEach((childSnapshot) => {
            const item = childSnapshot.val();
            item.id = childSnapshot.key;
            items.push(item);
        });
        displayItems(items);
    });
}

function displayItems(itemsToDisplay) {
    itemsTableBody.innerHTML = '';
    itemsToDisplay.forEach((item) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${getWarehouseName(item.warehouse)}</td>
            <td>${item.quantity}</td>
            <td>${item.unit}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary btn-action" onclick="openEditModal('${item.id}', '${item.name}', ${item.quantity})">Edit</button>
                <button class="btn btn-sm btn-outline-danger btn-action" onclick="deleteItem('${item.id}')">Delete</button>
                <button class="btn btn-sm btn-outline-warning btn-action" onclick="openTransferModal('${item.id}', '${item.warehouse}', ${item.quantity})">Transfer</button>
            </td>
        `;
        itemsTableBody.appendChild(row);
    });
}

function getWarehouseName(warehouseCode) {
    const warehouses = {
        'faisal': 'Faisal Warehouse',
        'lebini': 'Lebini Warehouse',
        'cairo': 'Cairo Warehouse'
    };
    return warehouses[warehouseCode] || warehouseCode;
}

function addItem() {
    const warehouse = document.getElementById('warehouse-select').value;
    const unit = document.getElementById('unit-select').value;
    const quantity = parseInt(document.getElementById('quantity-input').value);
    const name = document.getElementById('item-name-input').value;

    if (!name || !quantity) {
        alert('Please fill all fields');
        return;
    }

    const newItem = {
        name: name,
        warehouse: warehouse,
        unit: unit,
        quantity: quantity,
        createdBy: currentUser.email,
        createdAt: firebase.database.ServerValue.TIMESTAMP
    };

    database.ref('items').push(newItem)
        .then(() => {
            document.getElementById('item-name-input').value = '';
            document.getElementById('quantity-input').value = '1';
            logActivity(`Added item: ${name} (${quantity} ${unit}) to ${getWarehouseName(warehouse)}`);
        })
        .catch((error) => {
            alert('Error adding item: ' + error.message);
        });
}

function openEditModal(itemId, itemName, quantity) {
    document.getElementById('edit-item-id').value = itemId;
    document.getElementById('edit-item-name').value = itemName;
    document.getElementById('edit-item-quantity').value = quantity;
    new bootstrap.Modal(document.getElementById('editItemModal')).show();
}

function updateItem() {
    const itemId = document.getElementById('edit-item-id').value;
    const name = document.getElementById('edit-item-name').value;
    const quantity = parseInt(document.getElementById('edit-item-quantity').value);

    if (!name || !quantity) {
        alert('Please fill all fields');
        return;
    }

    database.ref('items/' + itemId).update({
        name: name,
        quantity: quantity,
        updatedBy: currentUser.email,
        updatedAt: firebase.database.ServerValue.TIMESTAMP
    })
    .then(() => {
        new bootstrap.Modal(document.getElementById('editItemModal')).hide();
        logActivity(`Updated item: ${name} (quantity: ${quantity})`);
    })
    .catch((error) => {
        alert('Error updating item: ' + error.message);
    });
}

function deleteItem(itemId) {
    if (!confirm('Are you sure you want to delete this item?')) {
        return;
    }

    const item = items.find(i => i.id === itemId);

    database.ref('items/' + itemId).remove()
        .then(() => {
            logActivity(`Deleted item: ${item.name} from ${getWarehouseName(item.warehouse)}`);
        })
        .catch((error) => {
            alert('Error deleting item: ' + error.message);
        });
}

function openTransferModal(itemId, currentWarehouse, currentQuantity) {
    document.getElementById('transfer-item-id').value = itemId;
    document.getElementById('transfer-current-warehouse').value = currentWarehouse;
    document.getElementById('transfer-quantity').value = '1';
    document.getElementById('transfer-quantity').max = currentQuantity;
    
    // Remove current warehouse from destination options
    const destinationSelect = document.getElementById('transfer-destination');
    Array.from(destinationSelect.options).forEach(option => {
        option.style.display = 'block';
        if (option.value === currentWarehouse) {
            option.style.display = 'none';
        }
    });
    
    new bootstrap.Modal(document.getElementById('transferModal')).show();
}

function transferItem() {
    const itemId = document.getElementById('transfer-item-id').value;
    const currentWarehouse = document.getElementById('transfer-current-warehouse').value;
    const transferQuantity = parseInt(document.getElementById('transfer-quantity').value);
    const destination = document.getElementById('transfer-destination').value;

    const item = items.find(i => i.id === itemId);

    if (transferQuantity > item.quantity) {
        alert('Transfer quantity cannot exceed available quantity');
        return;
    }

    // Update source item quantity
    const newQuantity = item.quantity - transferQuantity;
    if (newQuantity > 0) {
        database.ref('items/' + itemId).update({
            quantity: newQuantity,
            updatedBy: currentUser.email,
            updatedAt: firebase.database.ServerValue.TIMESTAMP
        });
    } else {
        database.ref('items/' + itemId).remove();
    }

    // Create destination item
    const destinationItem = {
        name: item.name,
        warehouse: destination,
        unit: item.unit,
        quantity: transferQuantity,
        createdBy: currentUser.email,
        createdAt: firebase.database.ServerValue.TIMESTAMP
    };

    database.ref('items').push(destinationItem)
        .then(() => {
            new bootstrap.Modal(document.getElementById('transferModal')).hide();
            logActivity(`Transferred ${transferQuantity} ${item.unit} of ${item.name} from ${getWarehouseName(currentWarehouse)} to ${getWarehouseName(destination)}`);
        })
        .catch((error) => {
            alert('Error transferring item: ' + error.message);
        });
}

function searchItems() {
    const searchTerm = searchInput.value.toLowerCase();
    if (!searchTerm) {
        displayItems(items);
        return;
    }

    const filteredItems = items.filter(item => 
        item.name.toLowerCase().includes(searchTerm) ||
        getWarehouseName(item.warehouse).toLowerCase().includes(searchTerm) ||
        item.unit.toLowerCase().includes(searchTerm)
    );
    displayItems(filteredItems);
}



function logActivity(message) {
    const logEntry = {
        message: message,
        user: currentUser.email,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    };
    database.ref('activity_logs').push(logEntry);
}

// Load and display activity logs
function loadActivityLogs() {
    const activityLogsContainer = document.getElementById('activity-logs');
    database.ref('activity_logs').orderByChild('timestamp').limitToLast(50).on('value', (snapshot) => {
        activityLogsContainer.innerHTML = '';
        const logs = [];
        snapshot.forEach((childSnapshot) => {
            logs.push(childSnapshot.val());
        });
        logs.sort((a, b) => b.timestamp - a.timestamp);
        if (logs.length === 0) {
            activityLogsContainer.innerHTML = '<p class="text-muted">No activity logs available</p>';
            return;
        }
        logs.forEach(log => {
            const logEntry = document.createElement('div');
            logEntry.className = 'log-entry mb-2 p-2 border rounded';
            const date = new Date(log.timestamp);
            const timeString = date.toLocaleString();
            logEntry.innerHTML = `
                <div><strong>${log.message}</strong></div>
                <div><small class="text-muted">By: ${log.user} at ${timeString}</small></div>
            `;
            activityLogsContainer.appendChild(logEntry);
        });
    });
}

// Event listeners
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchItems();
    }
});
