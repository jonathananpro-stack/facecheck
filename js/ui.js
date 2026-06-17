// js/ui.js - Tầng Giao diện & Hiệu ứng
export const UI = {
    // Vẽ khung khuôn mặt (đỏ cho mới, xanh cho đã nhận diện)
    drawFaceBox(canvas, box, label) {
        const ctx = canvas.getContext('2d');
        ctx.strokeStyle = label === "NEW" ? '#FF0000' : '#00FFCC';
        ctx.lineWidth = 4;
        ctx.strokeRect(box.x, box.y, box.width, box.height);
        
        // Thêm nhãn
        ctx.fillStyle = ctx.strokeStyle;
        ctx.fillText(label, box.x, box.y - 10);
    },

    // Hiệu ứng "Snap & Drop": Cắt mặt bay xuống hàng đợi
    animateSnapToQueue(videoElement, box) {
        console.log("[UI] Kích hoạt hiệu ứng Snap & Drop...");
        
        // 1. Cắt ảnh (Crop)
        const canvas = document.createElement('canvas');
        canvas.width = box.width;
        canvas.height = box.height;
        canvas.getContext('2d').drawImage(videoElement, box.x, box.y, box.width, box.height, 0, 0, box.width, box.height);
        
        // 2. Chèn vào hàng đợi với hiệu ứng GSAP (giả lập)
        const queue = document.getElementById('face-queue');
        const faceCard = document.createElement('div');
        faceCard.className = 'face-card';
        faceCard.appendChild(canvas);
        queue.appendChild(faceCard);
        
        // Gán sự kiện click vào faceCard để xác nhận thông tin
        faceCard.onclick = () => this.openDetails(faceCard);
    },

    openDetails(card) {
        // Mở bảng nhập thông tin cho đối tượng
        console.log("[UI] Đang mở bảng xác nhận...");
    }
};
