export const UI = {
    updateTable: (name, time) => {
        const body = document.getElementById('attendance-body');
        let row = document.getElementById(`row-${name}`);
        if (!row) {
            body.innerHTML += `<tr id="row-${name}"><td>${name}</td><td class="status">ĐÃ ĐẾN</td><td class="time">${time}</td></tr>`;
        }
    },
    alertVIP: (name) => {
        const box = document.getElementById('vip-alert-box');
        box.innerText = `⚠️ CẢNH BÁO: VIP ${name} ĐÃ CÓ MẶT!`;
        box.style.display = 'block';
        setTimeout(() => box.style.display = 'none', 3000);
    }
};