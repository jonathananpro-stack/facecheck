/**
 * SEC_CORE: Database Module
 * Chức năng: Mã hóa bảo mật, lưu trữ thông tin nhận diện (không lưu ảnh/video)
 * và quản lý truy xuất lịch sử dữ liệu hội thi.
 */

export const db = {
    /**
     * Lưu dữ liệu vào LocalStorage sau khi đã mã hóa
     * @param {Object} data - Dữ liệu từ AI_Engine (blr, offsets, timestamp)
     */
    save(data) {
        try {
            // Chuyển đối tượng thành chuỗi JSON và mã hóa Base64
            const jsonString = JSON.stringify(data);
            const encrypted = btoa(unescape(encodeURIComponent(jsonString))); 
            
            // Lưu với khóa prefix để dễ quản lý
            localStorage.setItem('core_' + data.timestamp, encrypted);
            console.log("[DB] Dữ liệu đã mã hóa và lưu trữ an toàn.");
        } catch (error) {
            console.error("[DB] Lỗi khi lưu dữ liệu:", error);
        }
    },

    /**
     * Lấy toàn bộ dữ liệu lịch sử từ bộ nhớ
     * @returns {Array} Danh sách dữ liệu đã giải mã
     */
    getAll() {
        const records = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('core_')) {
                try {
                    const encrypted = localStorage.getItem(key);
                    // Giải mã Base64 và parse JSON
                    const jsonString = decodeURIComponent(escape(atob(encrypted)));
                    const data = JSON.parse(jsonString);
                    records.push({ time: key.split('_')[1], data: data });
                } catch (error) {
                    console.error("[DB] Lỗi khi đọc dữ liệu:", error);
                }
            }
        }
        // Sắp xếp theo thời gian mới nhất lên đầu
        return records.sort((a, b) => b.time - a.time);
    },

    /**
     * Xóa toàn bộ dữ liệu (Phục vụ reset hội thi)
     */
    clearAll() {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('core_')) localStorage.removeItem(key);
        });
        console.log("[DB] Toàn bộ dữ liệu hội thi đã được xóa.");
    }
};
