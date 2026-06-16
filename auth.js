const AuthManager = {
    async _hashPassword(password, salt) {
        const encoder = new TextEncoder();
        const saltedPass = encoder.encode(password + salt);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', saltedPass);
        return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    },
    _generateSalt() {
        const array = new Uint8Array(16);
        window.crypto.getRandomValues(array);
        return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
    },
    async register({ fullName, username, password, role }) {
        const users = JSON.parse(localStorage.getItem('facecheck_users') || '[]');
        if (users.some(u => u.username === username)) return false;
        const salt = this._generateSalt();
        const passwordHash = await this._hashPassword(password, salt);
        users.push({ username, fullName, passwordHash, salt, role, createdAt: Date.now() });
        localStorage.setItem('facecheck_users', JSON.stringify(users));
        return true;
    },
    async login(username, password, rememberMe) {
        let users = JSON.parse(localStorage.getItem('facecheck_users') || '[]');
        if (users.length === 0) { // Cấu hình tài khoản Quản trị mặc định v2.0
            const defaultSalt = "facecheck2026";
            const defaultHash = await this._hashPassword("12345668", defaultSalt);
            users.push({ username: "admin", fullName: "Quản trị viên", passwordHash: defaultHash, salt: defaultSalt, role: "Admin", requirePasswordChange: false });
            localStorage.setItem('facecheck_users', JSON.stringify(users));
        }
        const user = users.find(u => u.username === username.toLowerCase().trim());
        if (!user || await this._hashPassword(password, user.salt) !== user.passwordHash) return false;
        
        const session = { username: user.username, fullName: user.fullName, role: user.role };
        if (rememberMe) localStorage.setItem('facecheck_session', JSON.stringify(session));
        else sessionStorage.setItem('facecheck_session', JSON.stringify(session));
        return true;
    },
    getCurrentSession() {
        return JSON.parse(localStorage.getItem('facecheck_session') || sessionStorage.getItem('facecheck_session'));
    },
    logout() {
        localStorage.removeItem('facecheck_session');
        sessionStorage.removeItem('facecheck_session');
        window.location.href = './login.html';
    }
};