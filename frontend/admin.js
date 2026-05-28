// Premium Custom Alert & Confirm Engine (Dynamic Injected Glassmorphism UI)
(function initCustomAlertSystem() {
    const styles = `
        .custom-alert-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.65);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            z-index: 999999;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            pointer-events: none;
            direction: rtl;
            font-family: 'Cairo', sans-serif;
            padding: 1rem;
        }
        .custom-alert-overlay.show {
            opacity: 1;
            pointer-events: auto;
        }
        .custom-alert-card {
            background: rgba(15, 23, 42, 0.9);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 24px;
            padding: 2rem;
            width: 100%;
            max-width: 420px;
            text-align: center;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
            transform: scale(0.92);
            transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            position: relative;
            overflow: hidden;
        }
        .custom-alert-overlay.show .custom-alert-card {
            transform: scale(1);
        }
        .custom-alert-card::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(124, 111, 234, 0.1) 0%, transparent 60%);
            pointer-events: none;
            z-index: 0;
        }
        .custom-alert-icon {
            width: 56px;
            height: 56px;
            background: rgba(124, 111, 234, 0.15);
            border: 1px solid rgba(124, 111, 234, 0.25);
            color: #a78bfa;
            border-radius: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            margin: 0 auto 1.5rem auto;
            position: relative;
            z-index: 1;
        }
        .custom-alert-icon.confirm-type {
            background: rgba(245, 158, 11, 0.15);
            border-color: rgba(245, 158, 11, 0.25);
            color: #fbbf24;
        }
        .custom-alert-content {
            font-size: 0.95rem;
            color: #cbd5e1;
            line-height: 1.7;
            margin-bottom: 2rem;
            font-weight: 700;
            position: relative;
            z-index: 1;
        }
        .custom-alert-buttons {
            display: flex;
            gap: 0.75rem;
            justify-content: center;
            position: relative;
            z-index: 1;
        }
        .custom-alert-btn {
            padding: 0.75rem 1.75rem;
            border-radius: 14px;
            font-size: 0.85rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
            outline: none;
            border: none;
        }
        .custom-alert-btn-primary {
            background: linear-gradient(135deg, #7c6fea, #a78bfa);
            color: #fff;
            box-shadow: 0 4px 12px rgba(124, 111, 234, 0.25);
        }
        .custom-alert-btn-primary:hover {
            opacity: 0.9;
            transform: translateY(-1px);
        }
        .custom-alert-btn-secondary {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.08);
            color: #94a3b8;
        }
        .custom-alert-btn-secondary:hover {
            background: rgba(255, 255, 255, 0.08);
            color: #fff;
        }
    `;

    const styleEl = document.createElement('style');
    styleEl.innerHTML = styles;
    document.head.appendChild(styleEl);

    const overlay = document.createElement('div');
    overlay.className = 'custom-alert-overlay';
    overlay.id = 'customAlertOverlay';
    overlay.innerHTML = `
        <div class="custom-alert-card" onclick="event.stopPropagation()">
            <div class="custom-alert-icon" id="customAlertIcon"><i class="fi fi-rr-bell flex items-center"></i></div>
            <div class="custom-alert-content" id="customAlertText">-</div>
            <div class="custom-alert-buttons" id="customAlertButtons">
                <button class="custom-alert-btn custom-alert-btn-primary" id="customAlertOkBtn">حسناً</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    const alertText = document.getElementById('customAlertText');
    const alertIcon = document.getElementById('customAlertIcon');
    const alertButtons = document.getElementById('customAlertButtons');

    window.alert = function(message) {
        alertIcon.className = 'custom-alert-icon';
        alertIcon.innerHTML = '<i class="fi fi-rr-bell flex items-center"></i>';
        alertText.textContent = message;
        alertButtons.innerHTML = '';
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'custom-alert-btn custom-alert-btn-primary px-8';
        closeBtn.textContent = 'حسناً';
        closeBtn.onclick = () => {
            overlay.classList.remove('show');
        };
        alertButtons.appendChild(closeBtn);
        overlay.classList.add('show');
    };

    window.customConfirm = function(message) {
        return new Promise((resolve) => {
            alertIcon.className = 'custom-alert-icon confirm-type';
            alertIcon.innerHTML = '<i class="fi fi-rr-interrogation flex items-center"></i>';
            alertText.textContent = message;
            alertButtons.innerHTML = '';

            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'custom-alert-btn custom-alert-btn-secondary';
            cancelBtn.textContent = 'إلغاء';
            cancelBtn.onclick = () => {
                overlay.classList.remove('show');
                resolve(false);
            };

            const confirmBtn = document.createElement('button');
            confirmBtn.className = 'custom-alert-btn custom-alert-btn-primary';
            confirmBtn.textContent = 'تأكيد';
            confirmBtn.onclick = () => {
                overlay.classList.remove('show');
                resolve(true);
            };

            alertButtons.appendChild(confirmBtn);
            alertButtons.appendChild(cancelBtn);
            overlay.classList.add('show');
        });
    };
})();

// Admin Panel JavaScript

let products = [];
let editingProductId = null;

// Check if user is logged in
function checkLogin() {
    const hasToken = sessionStorage.getItem('adminToken');
    if (hasToken) {
        showAdminPanel();
    }
}

// Login function
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const password = document.getElementById('passwordInput').value;
    
    try {
        const response = await fetch('/api/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            sessionStorage.setItem('adminToken', data.token);
            showAdminPanel();
        } else {
            throw new Error(data.message || 'رمز الأمان غير صحيح');
        }
    } catch (err) {
        console.error('Admin login error:', err);
        document.getElementById('loginError').classList.remove('hidden');
        setTimeout(() => {
            document.getElementById('loginError').classList.add('hidden');
        }, 3000);
    }
});

// Logout function
document.getElementById('logoutBtn').addEventListener('click', function() {
    sessionStorage.removeItem('adminToken');
    location.reload();
});

// Show admin panel
function showAdminPanel() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('adminPanel').classList.remove('hidden');
    loadProducts();
}

// Load products from JSON file
async function loadProducts() {
    try {
        const response = await fetch('/api/admin/products');
        const data = await response.json();
        products = data.products || [];
        renderProducts();
    } catch (error) {
        console.error('Error loading products:', error);
        products = [];
        renderProducts();
    }
}

// Render products table
function renderProducts() {
    const tbody = document.getElementById('productsTableBody');
    const noProducts = document.getElementById('noProducts');
    
    if (products.length === 0) {
        tbody.innerHTML = '';
        noProducts.classList.remove('hidden');
        return;
    }
    
    noProducts.classList.add('hidden');
    
    tbody.innerHTML = products.map(product => `
        <tr class="table-row border-b border-white/10">
            <td class="py-4 px-4 font-semibold whitespace-nowrap">${product.name}</td>
            <td class="py-4 px-4 whitespace-nowrap font-bold text-indigo-300">${product.price} R$</td>
            <td class="py-4 px-4 font-mono text-gray-300">${product.gamePassId}</td>
            <td class="py-4 px-4 max-w-xs truncate text-gray-400" title="${product.description}">${product.description}</td>
            <td class="py-4 px-4 whitespace-nowrap">
                ${product.video ? `<a href="${product.video}" target="_blank" class="text-blue-400 hover:text-blue-300 hover:underline font-semibold">مشاهدة ↗</a>` : '<span class="text-gray-600">-</span>'}
            </td>
            <td class="py-4 px-4 whitespace-nowrap">
                ${product.downloadUrl ? `<span class="px-2.5 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg text-xs font-extrabold whitespace-nowrap inline-block">رابط سري</span>` : '<span class="text-gray-600">-</span>'}
            </td>
            <td class="py-4 px-4 whitespace-nowrap text-center">
                <div class="flex gap-2 justify-center">
                    <button onclick="editProduct(${product.id})" class="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 rounded-lg text-black font-bold text-xs transition-all duration-200">تعديل</button>
                    <button onclick="deleteProduct(${product.id})" class="px-3 py-1.5 bg-red-500 hover:bg-red-600 rounded-lg font-bold text-xs transition-all duration-200">حذف</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Add/Edit product form
document.getElementById('productForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const productData = {
        name: document.getElementById('productName').value,
        price: parseFloat(document.getElementById('productPrice').value),
        gamePassId: parseInt(document.getElementById('productGamePassId').value),
        description: document.getElementById('productDescription').value,
        video: document.getElementById('productVideo').value || null,
        downloadUrl: document.getElementById('productDownloadUrl').value || null
    };
    
    if (editingProductId !== null) {
        // Update existing product
        const index = products.findIndex(p => p.id === editingProductId);
        if (index !== -1) {
            products[index] = { ...products[index], ...productData };
        }
        editingProductId = null;
        document.getElementById('cancelEditBtn').classList.add('hidden');
    } else {
        // Add new product
        const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
        products.push({ id: newId, ...productData });
    }
    
    await saveProducts();
    renderProducts();
    this.reset();
});

// Edit product
function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    editingProductId = id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productGamePassId').value = product.gamePassId;
    document.getElementById('productDescription').value = product.description;
    document.getElementById('productVideo').value = product.video || '';
    document.getElementById('productDownloadUrl').value = product.downloadUrl || '';
    
    document.getElementById('cancelEditBtn').classList.remove('hidden');
    document.getElementById('productName').focus();
}

// Cancel edit
document.getElementById('cancelEditBtn').addEventListener('click', function() {
    editingProductId = null;
    document.getElementById('productForm').reset();
    this.classList.add('hidden');
});

// Delete product
async function deleteProduct(id) {
    if (!await customConfirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    
    products = products.filter(p => p.id !== id);
    await saveProducts();
    renderProducts();
}

// Save products to JSON file (via backend API)
async function saveProducts() {
    const token = sessionStorage.getItem('adminToken') || '';
    try {
        const response = await fetch('/api/admin/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify({ products })
        });
        
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Failed to save products');
        }
    } catch (error) {
        console.error('Error saving products:', error);
        alert('فشل حفظ البيانات: ' + error.message);
    }
}

// Initialize
checkLogin();

// Cinematic Preloader Fade Out
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        setTimeout(() => {
            preloader.style.opacity = '0';
            preloader.style.pointerEvents = 'none';
            setTimeout(() => {
                preloader.remove();
            }, 700);
        }, 350);
    }
});

