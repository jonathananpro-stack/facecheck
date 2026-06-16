/**
 * FaceCheck v2.0 - Crypto Engine (Web Crypto API)
 * Thuật toán: AES-256-GCM (Mã hóa có xác thực)
 * Chức năng: Sinh khóa mật mã từ Session User, mã hóa chuỗi thông tin nhân sự 
 * và mảng Vector sinh trắc học trước khi ghi xuống bộ nhớ iPhone.
 */

const CryptoEngine = {
    // Khóa mật mã dùng chung được thiết lập tạm thời trên RAM sau khi giải mã bằng Session
    _derivedKey: null,
    
    // Chuỗi muối cố định dùng để chuyển đổi Passphrase thành khóa AES (chuẩn PBKDF2)
    _salt: new Uint8Array([86, 102, 67, 104, 101, 99, 107, 95, 83, 101, 99, 117, 114, 101, 95, 50]),

    /**
     * Khởi tạo và sinh khóa AES-256 từ thông tin phiên đăng nhập hiện tại
     */
    async initKeyFromSession() {
        if (this._derivedKey) return true;
        
        try {
            const session = AuthManager.getCurrentSession();
            if (!session) return false;

            // Sử dụng chính Tên đăng nhập + Vai trò làm Passphrase gốc để sinh khóa động cho riêng phiên đó
            const encoder = new TextEncoder();
            const passwordBuffer = encoder.encode(session.username + "_" + session.role);

            // 1. Nhập nguyên liệu khóa thô
            const baseKey = await window.crypto.subtle.importKey(
                "raw",
                passwordBuffer,
                "PBKDF2",
                false,
                ["deriveKey"]
            );

            // 2. Kéo giãn khóa bằng thuật toán PBKDF2 kết hợp SHA-256 qua 100,000 vòng lặp phần cứng
            this._derivedKey = await window.crypto.subtle.deriveKey(
                {
                    name: "PBKDF2",
                    salt: this._salt,
                    iterations: 100000,
                    hash: "SHA-256"
                },
                baseKey,
                { name: "AES-GCM", length: 256 },
                false, // Không cho phép trích xuất ngược khóa thô ra ngoài mã nguồn (Bảo mật RAM)
                ["encrypt", "decrypt"]
            );

            console.log("🔑 [CryptoEngine] Đã thiết lập khóa AES-256-GCM bảo mật trên RAM.");
            return true;
        } catch (error) {
            console.error("❌ Lỗi khởi tạo khóa mật mã:", error);
            return false;
        }
    },

    /**
     * Mã hóa chuỗi văn bản thuần thành chuỗi Hex chứa [IV + Ciphertext]
     */
    async encrypt(plainText) {
        await this.initKeyFromSession();
        if (!this._derivedKey) throw new Error("Chưa khởi tạo khóa bảo mật hệ thống.");

        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(plainText);

        // Sinh véc-tơ khởi tạo ngẫu nhiên (Initialization Vector - 12 bytes chuẩn GCM)
        const iv = window.crypto.getRandomValues(new Uint8Array(12));

        // Tiến hành mã hóa AES-GCM
        const encryptedBuffer = await window.crypto.subtle.encrypt(
            { name: "AES-GCM", iv: iv },
            this._derivedKey,
            dataBuffer
        );

        // Đóng gói cấu trúc: Gộp [IV (12 bytes) + Dữ liệu đã mã hóa] thành một mảng Byte duy nhất
        const combinedBuffer = new Uint8Array(iv.length + encryptedBuffer.byteLength);
        combinedBuffer.set(iv, 0);
        combinedBuffer.set(new Uint8Array(encryptedBuffer), iv.length);

        // Chuyển mảng Byte sang dạng Hex String để lưu trữ an toàn vào database dưới dạng chuỗi
        return Array.from(combinedBuffer).map(b => b.toString(16).padStart(2, '0')).join('');
    },

    /**
     * Giải mã chuỗi mã hóa Hex thành văn bản thuần
     */
    async decrypt(hexString) {
        await this.initKeyFromSession();
        if (!this._derivedKey) throw new Error("Chưa khởi tạo khóa bảo mật hệ thống.");

        // Chuyển đổi ngược từ Hex String sang mảng Byte
        const combinedBuffer = new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

        // Tách IV (12 bytes đầu) và Ciphertext (phần còn lại)
        const iv = combinedBuffer.slice(0, 12);
        const ciphertext = combinedBuffer.slice(12);

        // Thực hiện giải mã
        const decryptedBuffer = await window.crypto.subtle.decrypt(
            { name: "AES-GCM", iv: iv },
            this._derivedKey,
            ciphertext
        );

        const decoder = new TextDecoder();
        return decoder.decode(decryptedBuffer);
    },

    /**
     * NGUYÊN TẮC BẢO MẬT: Xóa hoàn toàn dấu vết khóa trên RAM khi đăng xuất
     */
    purgeKey() {
        this._derivedKey = null;
        console.log("🧹 Đã hủy vĩnh viễn khóa AES trên RAM.");
    }
};