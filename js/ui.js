export const UI = {
    updateTable: (name, time) => {
        const body = document.getElementById('attendance-body');
        let row = document.getElementById(`row-${name}`);
        
        // Nếu nhân viên chưa có trong bảng, tạo mới hàng
        if (!row) {
            row = document.createElement('tr');
            row.id = `row-${name}`;
            row.innerHTML = `
                <td>${name}</td>
                <td class="status">ĐÃ CÓ MẶT</td>
                <td class="time">${time}</td>
            `;
            body.appendChild(row);
        } else {
            // Nếu đã có rồi, chỉ cập nhật giờ nếu cần
            row.querySelector('.time').innerText = time;
            row.querySelector('.status').innerText = "ĐÃ CÓ MẶT";
            row.style.background = "#005500"; // Đổi màu xanh
        }
    },
    
    alertVIP: (name) => {
        const box = document.getElementById('vip-alert-box');
        box.innerText = `⚠️ CẢNH BÁO: VIP ${name} ĐÃ CÓ MẶT!`;
        box.style.display = 'block';
        setTimeout(() => box.style.display = 'none', 3000);
    }
};
