const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Simple In-Memory Rate Limiter to protect endpoints from DDoS/abuse
const rateLimitMap = new Map();
const LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100; // 100 requests per minute per IP

function rateLimiter(req, res, next) {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const now = Date.now();
    
    if (!rateLimitMap.has(ip)) {
        rateLimitMap.set(ip, []);
    }
    
    let timestamps = rateLimitMap.get(ip);
    timestamps = timestamps.filter(t => now - t < LIMIT_WINDOW);
    
    if (timestamps.length >= MAX_REQUESTS) {
        return res.status(429).send('⚠️ تنبيه حماية: تم اكتشاف طلبات مفرطة من هذا العنوان! الرجاء المحاولة بعد دقيقة.');
    }
    
    timestamps.push(now);
    rateLimitMap.set(ip, timestamps);
    next();
}

// Secure Password Hashing helper (Zero-dependency SHA-256 + Salt!)
function hashPassword(password) {
    return crypto.createHmac('sha256', 'RoSellersSecureSalt123!').update(password).digest('hex');
}

// AES-256-CBC Encryption & Decryption Helper functions for products-admin.json
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'RoSellersSecureKey32BytesForAES!';
const IV_LENGTH = 16;

function encryptData(text) {
    try {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    } catch (e) {
        console.error('Encryption error:', e.message);
        return text;
    }
}

function decryptData(text) {
    try {
        const trimmed = text.trim();
        // If it starts with { or [, it is plain text
        if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
            return text;
        }
        const textParts = text.split(':');
        if (textParts.length < 2) return text;
        const iv = Buffer.from(textParts.shift(), 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (e) {
        console.error('Decryption error:', e.message);
        return text;
    }
}

// One-time self-healing auto-encryption for existing users in users.json
(function encryptExistingUsersFile() {
    try {
        const filePath = path.join(__dirname, '../config/users.json');
        if (fs.existsSync(filePath)) {
            const rawData = fs.readFileSync(filePath, 'utf8').trim();
            if (rawData.length > 0) {
                const parsed = JSON.parse(rawData);
                const users = parsed.users || [];
                let changed = false;
                
                const updatedUsers = users.map(user => {
                    let userChanged = false;
                    let email = user.email;
                    let password = user.password;
                    
                    if (email && !email.includes(':')) {
                        email = encryptData(email);
                        userChanged = true;
                    }
                    if (password && !password.includes(':')) {
                        password = encryptData(password);
                        userChanged = true;
                    }
                    
                    if (userChanged) {
                        changed = true;
                        return { ...user, email, password };
                    }
                    return user;
                });
                
                if (changed) {
                    console.log('🔒 Plain-text user emails and passwords detected in users.json. Encrypting now...');
                    fs.writeFileSync(filePath, JSON.stringify({ users: updatedUsers }, null, 2), 'utf8');
                    console.log('✅ users.json sensitive fields have been securely encrypted!');
                }
            }
        }
    } catch (err) {
        console.error('Failed to auto-encrypt users.json:', err.message);
    }
})();

// Admin login protection tracking
const loginAttemptsMap = new Map();
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_BAN_TIME = 15 * 60 * 1000; // 15 minutes

// Reusable Helper to Send Discord Webhook notifications (Async & Fail-safe!)
async function sendDiscordNotification(embedData) {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl || webhookUrl.includes('your_webhook_id') || webhookUrl.trim().length === 0) {
        console.log('Discord Webhook URL not configured. Skipping notification.');
        return;
    }
    
    try {
        await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: "RoSellers Security Bot",
                avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=rosellers",
                embeds: [embedData]
            })
        });
    } catch (err) {
        console.error('Error sending Discord webhook:', err.message);
    }
}

// Middleware
app.use(rateLimiter);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set Basic Security Headers to prevent Clickjacking/XSS
app.use((req, res, next) => {
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
});

// Serve static files from frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.get('/api/testimonials', (req, res) => {
    try {
        const filePath = path.join(__dirname, '../config/testimonials.json');
        const data = fs.readFileSync(filePath, 'utf8');
        res.json(JSON.parse(data));
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.get('/api/products', (req, res) => {
    try {
        const filePath = path.join(__dirname, '../config/products-admin.json');
        const data = fs.readFileSync(filePath, 'utf8');
        res.json(JSON.parse(data));
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.get('/api/settings', (req, res) => {
    try {
        const filePath = path.join(__dirname, '../config/settings.json');
        const data = fs.readFileSync(filePath, 'utf8');
        res.json(JSON.parse(data));
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Admin Login Endpoint (Server-side validation)
app.post('/api/admin/login', async (req, res) => {
    const { password } = req.body;
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const now = Date.now();
    
    // Check if locked out
    if (loginAttemptsMap.has(ip)) {
        const record = loginAttemptsMap.get(ip);
        if (record.attempts >= MAX_LOGIN_ATTEMPTS && now - record.lastAttempt < LOGIN_BAN_TIME) {
            const minutesLeft = Math.ceil((LOGIN_BAN_TIME - (now - record.lastAttempt)) / 60000);
            return res.status(403).json({ 
                success: false, 
                message: `تنبيه أمان: تم حظر محاولات الدخول مؤقتاً بسبب إدخال كلمة مرور خاطئة متكررة. يرجى المحاولة بعد ${minutesLeft} دقيقة.` 
            });
        }
    }
    
    if (!password) {
        return res.status(400).json({ success: false, message: 'رمز الأمان مطلوب' });
    }
    
    const adminPassword = process.env.ADMIN_PASSWORD || '123';
    const expectedHash = hashPassword(adminPassword);
    const inputHash = hashPassword(password);
    
    if (inputHash === expectedHash) {
        // Reset attempts on success
        loginAttemptsMap.delete(ip);
        
        // Generate secure dynamic session token
        const token = hashPassword(adminPassword + new Date().toDateString());
        
        // Send Discord audit webhook for successful login
        await sendDiscordNotification({
            title: "🔐 تسجيل دخول ناجح للوحة التحكم",
            description: `تم المصادقة وتسجيل الدخول بنجاح إلى لوحة تحكم RoSellers.`,
            color: 3066993, // Green
            fields: [
                { name: "العنوان الرقمي (IP)", value: `\`${ip}\``, inline: true },
                { name: "توقيت الدخول", value: `<t:${Math.floor(Date.now() / 1000)}:f>`, inline: true }
            ],
            footer: { text: "نظام أمان RoSellers Shield" }
        });
        
        res.json({ success: true, token });
    } else {
        // Increment attempts on failure
        let attempts = 1;
        if (loginAttemptsMap.has(ip)) {
            const record = loginAttemptsMap.get(ip);
            if (now - record.lastAttempt < LOGIN_BAN_TIME) {
                attempts = record.attempts + 1;
            }
        }
        loginAttemptsMap.set(ip, { attempts, lastAttempt: now });
        
        // Send alert on failed login to Discord
        await sendDiscordNotification({
            title: "⚠️ محاولة اختراق / دخول فاشلة للوحة التحكم!",
            description: `تم اكتشاف محاولة دخول غير مصرح بها للوحة التحكم بكلمة مرور خاطئة.`,
            color: 15158332, // Red
            fields: [
                { name: "العنوان الرقمي (IP)", value: `\`${ip}\``, inline: true },
                { name: "عدد المحاولات الفاشلة", value: `\`${attempts} / ${MAX_LOGIN_ATTEMPTS}\``, inline: true },
                { name: "التوقيت", value: `<t:${Math.floor(Date.now() / 1000)}:f>`, inline: true }
            ],
            footer: { text: "نظام كشف التطفل - RoSellers Intrusion Warning" }
        });
        
        res.status(401).json({ success: false, message: 'رمز الأمان غير صحيح' });
    }
});

// Admin Panel API Routes
app.get('/api/admin/products', (req, res) => {
    try {
        const filePath = path.join(__dirname, '../config/products-admin.json');
        const data = fs.readFileSync(filePath, 'utf8');
        res.json(JSON.parse(data));
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/admin/products', (req, res) => {
    const { products } = req.body;
    const authHeader = req.headers['authorization'];
    const adminPassword = process.env.ADMIN_PASSWORD || '123';
    const expectedToken = hashPassword(adminPassword + new Date().toDateString());
    
    if (authHeader !== expectedToken) {
        return res.status(401).json({ success: false, message: 'تنبيه أمني: غير مصرح لك بتعديل المنتجات!' });
    }
    
    const filePath = path.join(__dirname, '../config/products-admin.json');
    
    try {
        fs.writeFileSync(filePath, JSON.stringify({ products }, null, 2));
        res.json({ success: true, message: 'Products saved successfully' });
    } catch (error) {
        console.error('Error saving products:', error);
        res.status(500).json({ success: false, message: 'Failed to save products' });
    }
});

// Roblox User Lookup Proxy API
app.get('/api/roblox/user-check', async (req, res) => {
    const { username } = req.query;
    if (!username) {
        return res.status(400).json({ success: false, message: 'Username is required' });
    }
    
    try {
        let robloxResponse = await fetch("https://users.roproxy.com/v1/usernames/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
            },
            body: JSON.stringify({
                usernames: [username],
                excludeBannedUsers: false
            })
        });
        
        // Fallback to RosProxy
        if (!robloxResponse.ok) {
            robloxResponse = await fetch("https://users.rosproxy.com/v1/usernames/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
                },
                body: JSON.stringify({
                    usernames: [username],
                    excludeBannedUsers: false
                })
            });
        }
        
        // Final fallback to direct Roblox
        if (!robloxResponse.ok) {
            robloxResponse = await fetch("https://users.roblox.com/v1/usernames/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
                },
                body: JSON.stringify({
                    usernames: [username],
                    excludeBannedUsers: false
                })
            });
        }
        
        if (!robloxResponse.ok) {
            throw new Error(`Roblox API responded with status ${robloxResponse.status}`);
        }
        
        const data = await robloxResponse.json();
        if (!data.data || data.data.length === 0) {
            return res.json({ data: [] });
        }
        
        const robloxUser = data.data[0];
        const userId = robloxUser.id;
        
        // Fetch avatar headshot from Roblox API on the server (Bypasses CORS entirely!)
        let directAvatarUrl = null;
        try {
            const thumbResponse = await fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=true`);
            if (thumbResponse.ok) {
                const thumbData = await thumbResponse.json();
                if (thumbData.data && thumbData.data.length > 0) {
                    directAvatarUrl = thumbData.data[0].imageUrl;
                }
            }
        } catch (thumbErr) {
            console.error('Error fetching Roblox thumbnail:', thumbErr.message);
        }
        
        // Use our own server-side proxy URL to avoid browser CORS issues with tr.rbxcdn.com
        const avatarUrl = directAvatarUrl 
            ? `/api/roblox/avatar-proxy?userId=${userId}`
            : `https://www.roblox.com/headshot-thumbnail/image?userId=${userId}&width=150&height=150&format=png`;
        
        // Attach resolved proxy URL
        robloxUser.avatarUrl = avatarUrl;
        
        res.json({ data: [robloxUser] });
    } catch (error) {
        console.error('Roblox Proxy error:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Avatar Image Proxy — fetches Roblox headshot on server side to avoid browser CORS blocks
app.get('/api/roblox/avatar-proxy', async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).send('userId required');

    try {
        const thumbRes = await fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=true`, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });

        if (!thumbRes.ok) throw new Error('Roblox thumbnail API error');

        const thumbData = await thumbRes.json();
        if (!thumbData.data || thumbData.data.length === 0) throw new Error('No thumbnail found');

        const imageUrl = thumbData.data[0].imageUrl;
        const imgRes = await fetch(imageUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });

        if (!imgRes.ok) throw new Error('Failed to fetch image');

        // Use arrayBuffer — works correctly with Node 18+ native fetch (no .pipe())
        const buffer = await imgRes.arrayBuffer();
        const contentType = imgRes.headers.get('content-type') || 'image/png';

        res.set('Content-Type', contentType);
        res.set('Cache-Control', 'public, max-age=3600');
        res.set('Access-Control-Allow-Origin', '*');
        res.send(Buffer.from(buffer));
    } catch (err) {
        console.error('Avatar proxy error:', err.message);
        // Redirect to official Roblox headshot image as fallback
        res.redirect(`https://www.roblox.com/headshot-thumbnail/image?userId=${userId}&width=150&height=150&format=png`);
    }
});

// Reusable Helper to Check GamePass Ownership dynamically (Real Roblox API & RoProxy!)
async function checkGamePassOwnership(username, gamePassId) {
    if (!username || !gamePassId) return false;
    try {
        // Step 1: Resolve Roblox User ID
        const userRes = await fetch("https://users.roblox.com/v1/usernames/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
            },
            body: JSON.stringify({
                usernames: [username],
                excludeBannedUsers: false
            })
        });

        if (!userRes.ok) return false;
        const userData = await userRes.json();
        if (!userData.data || userData.data.length === 0) return false;

        const userId = userData.data[0].id;

        // Step 2: Query Roblox Inventory for GamePass
        const proxyUrls = [
            `https://inventory.rosproxy.com/v1/users/${userId}/items/GamePass/${gamePassId}`,
            `https://inventory.roblox.com/v1/users/${userId}/items/GamePass/${gamePassId}`
        ];

        for (const url of proxyUrls) {
            try {
                const invRes = await fetch(url, {
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
                    }
                });
                if (invRes.ok) {
                    const invData = await invRes.json();
                    if (invData.data && invData.data.length > 0) {
                        return invData.data.some(item => item.id == gamePassId);
                    }
                    return false;
                }
            } catch (err) {
                // Continue to next fallback URL
            }
        }
        return false;
    } catch (e) {
        console.error('Error checking GamePass ownership:', e.message);
        return false;
    }
}

// Roblox GamePass Ownership Check API
app.get('/api/roblox/check-ownership', async (req, res) => {
    const { username, gamePassId } = req.query;
    if (!username || !gamePassId) {
        return res.status(400).json({ success: false, message: 'username and gamePassId are required' });
    }
    const owned = await checkGamePassOwnership(username, gamePassId);
    res.json({ owned });
});

// Secure server-side redirect/download proxy endpoint
app.get('/api/products/download', async (req, res) => {
    const { email, productId } = req.query;
    if (!email || !productId) {
        return res.status(400).send('Parameters email and productId are required');
    }
    
    const pid = parseInt(productId);
    const users = readUsers();
    const user = users.find(u => u.email === email.toLowerCase());
    
    if (!user || !user.purchasedProducts || !user.purchasedProducts.includes(pid)) {
        return res.status(403).send('غير مصرح لك بتحميل هذا المنتج. تأكد من إتمام الشراء.');
    }
    
    try {
        const filePath = path.join(__dirname, '../config/products-admin.json');
        const productsData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const product = productsData.products.find(p => p.id === pid);
        
        if (!product || !product.downloadUrl) {
            return res.status(404).send('رابط التحميل غير متوفر لهذا المنتج.');
        }
        
        // Double check ownership dynamically in Roblox before sending the redirect!
        const isRealOwner = await checkGamePassOwnership(user.robloxUser, product.gamePassId);
        if (!isRealOwner) {
            return res.status(403).send('⚠️ حظر حماية: حساب روبلوكس الخاص بك لا يمتلك الجيم باس المطلوبة حالياً.');
        }
        
        // Securely redirect to the hidden raw download link!
        res.redirect(product.downloadUrl);
    } catch (err) {
        console.error('Secure download proxy error:', err.message);
        res.status(500).send('Internal Server Error');
    }
});

// User Database API Routes (Persistent Storage)
const USERS_FILE = path.join(__dirname, '../config/users.json');

// Get all users helper
function readUsers() {
    try {
        if (!fs.existsSync(USERS_FILE) || fs.readFileSync(USERS_FILE, 'utf8').trim().length === 0) {
            fs.writeFileSync(USERS_FILE, JSON.stringify({ users: [] }, null, 2));
            return [];
        }
        const data = fs.readFileSync(USERS_FILE, 'utf8');
        const parsed = JSON.parse(data);
        const users = parsed.users || [];
        
        // Transparently decrypt email and password on read
        return users.map(user => {
            return {
                ...user,
                email: decryptData(user.email),
                password: decryptData(user.password)
            };
        });
    } catch (e) {
        console.error('Error reading users database, resetting file:', e.message);
        fs.writeFileSync(USERS_FILE, JSON.stringify({ users: [] }, null, 2));
        return [];
    }
}

// Write users helper
function writeUsers(users) {
    try {
        // Transparently encrypt email and password on write
        const encryptedUsers = users.map(user => {
            return {
                ...user,
                email: encryptData(user.email),
                password: encryptData(user.password)
            };
        });
        fs.writeFileSync(USERS_FILE, JSON.stringify({ users: encryptedUsers }, null, 2));
        return true;
    } catch (e) {
        console.error('Error writing to users database:', e.message);
        return false;
    }
}

// Server Ping Health Check
app.get('/api/ping', (req, res) => {
    res.json({ success: true });
});

// Register user endpoint
app.post('/api/users/register', (req, res) => {
    const { robloxUser, robloxId, realName, email, password, robloxAvatar } = req.body;
    
    if (!robloxUser || !realName || !email || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    
    const users = readUsers();
    
    // Check if email already exists
    if (users.some(u => u.email === email.toLowerCase())) {
        return res.status(400).json({ success: false, message: 'البريد الإلكتروني مسجل بالفعل ⚠️' });
    }
    
    // Check if Roblox username already exists in database
    if (users.some(u => u.robloxUser.toLowerCase() === robloxUser.toLowerCase())) {
        return res.status(400).json({ success: false, message: 'اسم حساب روبلوكس هذا مسجل بالفعل ومربوط بمستخدم آخر ⚠️' });
    }
    
    // Build proxy avatar URL (avoids CORS from browser hitting Roblox CDN directly)
    const avatarUrl = robloxId 
        ? `/api/roblox/avatar-proxy?userId=${robloxId}`
        : (robloxAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${robloxUser}`);
    
    const newUser = {
        id: users.length > 0 ? Math.max(...users.map(u => u.id || 0)) + 1 : 1,
        robloxUser,
        robloxId: robloxId || null,
        realName,
        email: email.toLowerCase(),
        password: hashPassword(password), // SECURE HASHING
        robloxAvatar: avatarUrl,
        purchasedProducts: []
    };
    
    users.push(newUser);
    if (writeUsers(users)) {
        // Send dynamic Discord notification embed
        sendDiscordNotification({
            title: "👤 تسجيل عضو جديد بنجاح! 🎉",
            color: 65280, // Green
            fields: [
                { name: "حساب روبلوكس المربوط", value: `[${robloxUser}](https://www.roblox.com/users/profile?username=${encodeURIComponent(robloxUser)})`, inline: true },
                { name: "الاسم الثنائي الحقيقي", value: realName, inline: true },
                { name: "البريد الإلكتروني", value: email.toLowerCase() }
            ],
            footer: { text: "نظام حماية RoSellers" },
            timestamp: new Date().toISOString()
        });
        
        res.json({ success: true, user: newUser });
    } else {
        res.status(500).json({ success: false, message: 'Failed to write to database' });
    }
});

// Login user endpoint
app.post('/api/users/login', (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    
    const users = readUsers();
    const hashedPassword = hashPassword(password);
    const userIndex = users.findIndex(u => u.email === email.toLowerCase());
    
    if (userIndex === -1) {
        return res.status(400).json({ success: false, message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    }
    
    const user = users[userIndex];
    
    // Support plain text fallback (for legacy accounts) and hash validation
    const isValid = user.password === password || user.password === hashedPassword;
    
    if (!isValid) {
        return res.status(400).json({ success: false, message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    }
    
    // Auto-upgrade plain text password to secure hash in DB
    if (user.password === password) {
        user.password = hashedPassword;
        users[userIndex] = user;
        writeUsers(users);
    }
    
    res.json({ success: true, user });
});

// Sync purchased products list to persistent DB
app.post('/api/users/sync-purchases', (req, res) => {
    const { email, productId } = req.body;
    if (!email || !productId) {
        return res.status(400).json({ success: false, message: 'Missing parameters' });
    }
    
    const users = readUsers();
    const userIndex = users.findIndex(u => u.email === email.toLowerCase());
    
    if (userIndex !== -1) {
        if (!users[userIndex].purchasedProducts) {
            users[userIndex].purchasedProducts = [];
        }
        if (!users[userIndex].purchasedProducts.includes(productId)) {
            users[userIndex].purchasedProducts.push(productId);
        }
        
        // Also save detailed purchase receipt
        if (!users[userIndex].purchases) {
            users[userIndex].purchases = [];
        }
        
        const alreadyHasDetails = users[userIndex].purchases.some(p => p.productId === productId);
        if (!alreadyHasDetails) {
            // Find product name and details
            let price = 0;
            let productName = "نظام روبلوكس";
            try {
                const productsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/products-admin.json'), 'utf8'));
                const matchedProduct = productsData.products.find(p => p.id === productId);
                if (matchedProduct) {
                    price = matchedProduct.price;
                    productName = matchedProduct.name;
                }
            } catch (err) {
                console.error('Error finding product details for invoice:', err);
            }
            
            const invoiceNumber = 'ROS-' + Math.floor(100000 + Math.random() * 900000);
            
            users[userIndex].purchases.push({
                productId,
                invoiceNumber,
                purchaseDate: new Date().toISOString(),
                robloxUser: users[userIndex].robloxUser,
                price: price
            });
            
            // Send dynamic Discord Webhook notification embed
            sendDiscordNotification({
                title: "💰 إتمام عملية شراء ناجحة بنجاح! 🎉",
                color: 8321504, // Purple
                fields: [
                    { name: "المنتج المشترى", value: productName, inline: true },
                    { name: "المبلغ المدفوع", value: `${price} R$`, inline: true },
                    { name: "رقم الفاتورة", value: invoiceNumber, inline: true },
                    { name: "حساب روبلوكس المرخص", value: `[@${users[userIndex].robloxUser}](https://www.roblox.com/users/profile?username=${encodeURIComponent(users[userIndex].robloxUser)})` }
                ],
                footer: { text: "بوابة فحص الفواتير الآمنة لـ RoSellers" },
                timestamp: new Date().toISOString()
            });
        }
        
        writeUsers(users);
        res.json({ success: true, user: users[userIndex] });
    } else {
        res.status(404).json({ success: false, message: 'User not found' });
    }
});

// Sync session to get fresh user details (Bypasses local storage staleness!)
app.get('/api/users/sync-session', async (req, res) => {
    const { email } = req.query;
    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required' });
    }
    
    const users = readUsers();
    const userIndex = users.findIndex(u => u.email === email.toLowerCase());
    
    if (userIndex === -1) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const user = users[userIndex];
    let dbChanged = false;
    
    // Auto-resolve avatar for legacy accounts lacking a robloxAvatar field
    if (!user.robloxAvatar) {
        try {
            const robloxRes = await fetch("https://users.roblox.com/v1/usernames/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
                },
                body: JSON.stringify({ usernames: [user.robloxUser], excludeBannedUsers: false })
            });
            if (robloxRes.ok) {
                const robloxData = await robloxRes.json();
                if (robloxData.data && robloxData.data.length > 0) {
                    const rUser = robloxData.data[0];
                    // Store proxy URL so browser doesn't hit CORS from tr.rbxcdn.com
                    user.robloxAvatar = `/api/roblox/avatar-proxy?userId=${rUser.id}`;
                    dbChanged = true;
                }
            }
        } catch (err) {
            console.error('Error auto-resolving legacy user roblox avatar:', err);
        }
    }
    
    // Load products-admin to check gamePassId
    let products = [];
    try {
        const filePath = path.join(__dirname, '../config/products-admin.json');
        if (fs.existsSync(filePath)) {
            const productsData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            products = productsData.products || [];
        }
    } catch (err) {
        console.error('Error loading products-admin for session validation:', err);
    }
    
    if (user.purchasedProducts && user.purchasedProducts.length > 0) {
        const validatedProducts = [];
        const validatedPurchases = [];
        let ownershipChanged = false;
        
        for (const productId of user.purchasedProducts) {
            const product = products.find(p => p.id === productId);
            if (product) {
                // Verify ownership live in Roblox!
                const isRealOwner = await checkGamePassOwnership(user.robloxUser, product.gamePassId);
                if (isRealOwner) {
                    validatedProducts.push(productId);
                    if (user.purchases) {
                        const receipt = user.purchases.find(p => p.productId === productId);
                        if (receipt) validatedPurchases.push(receipt);
                    }
                } else {
                    ownershipChanged = true;
                    console.log(`User ${user.email} lost or lacks Roblox ownership of product ${productId}. Removing.`);
                }
            } else {
                // Product no longer exists in products-admin.json database, remove it!
                ownershipChanged = true;
                console.log(`Product ${productId} not found in database. Removing from purchased list.`);
            }
        }
        
        if (ownershipChanged) {
            user.purchasedProducts = validatedProducts;
            user.purchases = validatedPurchases;
            dbChanged = true;
        }
    }
    
    if (dbChanged) {
        users[userIndex] = user;
        writeUsers(users);
    }
    
    res.json({ success: true, user });
});

// Promocode Database File Path
const PROMOCODES_FILE = path.join(__dirname, '../config/promocodes.json');

// Validate Promo Code Endpoint
app.get('/api/promocodes/validate', (req, res) => {
    const { code } = req.query;
    if (!code) {
        return res.status(400).json({ success: false, message: 'Promo code is required' });
    }
    
    try {
        if (!fs.existsSync(PROMOCODES_FILE)) {
            return res.status(404).json({ success: false, message: 'ملف أكواد الخصم غير متوفر حالياً.' });
        }
        
        const data = fs.readFileSync(PROMOCODES_FILE, 'utf8');
        const promocodes = JSON.parse(data).promocodes || [];
        const matched = promocodes.find(p => p.code.toUpperCase() === code.toUpperCase().trim());
        
        if (!matched) {
            return res.status(404).json({ success: false, message: 'كود الخصم غير موجود ❌' });
        }
        
        if (!matched.isActive) {
            return res.status(400).json({ success: false, message: 'كود الخصم غير نشط حالياً ⚠️' });
        }
        
        if (matched.uses >= matched.maxUses) {
            return res.status(400).json({ success: false, message: 'انتهت عدد مرات استخدام كود الخصم ❌' });
        }
        
        res.json({ success: true, discountPercent: matched.discountPercent });
    } catch (err) {
        console.error('Validate promocode error:', err.message);
        res.status(500).json({ success: false, message: 'خطأ داخلي في الخادم' });
    }
});

// Increment Promo Code Usage Endpoint
app.post('/api/promocodes/use', (req, res) => {
    const { code } = req.body;
    if (!code) return res.status(400).json({ success: false });
    
    try {
        if (!fs.existsSync(PROMOCODES_FILE)) return res.status(404).json({ success: false });
        
        const data = fs.readFileSync(PROMOCODES_FILE, 'utf8');
        const fileData = JSON.parse(data);
        const promocodes = fileData.promocodes || [];
        const idx = promocodes.findIndex(p => p.code.toUpperCase() === code.toUpperCase().trim());
        
        if (idx !== -1) {
            promocodes[idx].uses += 1;
            fs.writeFileSync(PROMOCODES_FILE, JSON.stringify({ promocodes }, null, 2));
            res.json({ success: true });
        } else {
            res.status(404).json({ success: false });
        }
    } catch (err) {
        console.error('Use promocode error:', err.message);
        res.status(500).json({ success: false });
    }
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Frontend: http://localhost:${PORT}`);
    console.log(`Admin Panel: http://localhost:${PORT}/admin.html`);
});
