const AppEngine = {
    // 1. GIAO DIỆN
    render: function(view) {
        const main = document.getElementById('mainView');
        if (view === 'events') {
            main.innerHTML = `<div class="card"><h3>Quản lý hội nghị</h3>
                <input type="text" id="evName" placeholder="Tên hội nghị...">
                <button onclick="AppEngine.createEvent()">Tạo mới</button>
                <div id="evList"></div></div>`;
            this.loadEvents();
        } else if (view === 'camera') {
            main.innerHTML = `<div class="card"><h3>Camera Check-in</h3>
                <video id="vid" width="100%" autoplay></video>
                <div id="camStatus">Đang khởi động AI...</div></div>`;
            this.startCamera();
        }
    },

    // 2. HỘI NGHỊ & EXCEL
    createEvent: function() {
        const name = document.getElementById('evName').value;
        if(!name) return;
        let evs = JSON.parse(localStorage.getItem('evs') || '[]');
        evs.push({id: Date.now(), name, data: []});
        localStorage.setItem('evs', JSON.stringify(evs));
        this.render('events');
    },

    loadEvents: function() {
        const evs = JSON.parse(localStorage.getItem('evs') || '[]');
        document.getElementById('evList').innerHTML = evs.map(e => `
            <div class="card"><b>${e.name}</b>
                <input type="file" onchange="AppEngine.handleExcel(event, ${e.id})">
                <div id="tbl-${e.id}"></div>
            </div>`).join('');
    },

    handleExcel: function(e, id) {
        const reader = new FileReader();
        reader.onload = (evt) => {
            const wb = XLSX.read(evt.target.result, {type: 'binary'});
            const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
            localStorage.setItem('current_data', JSON.stringify(data));
            this.renderTable(id, data);
        };
        reader.readAsBinaryString(e.target.files[0]);
    },

    renderTable: function(id, data) {
        let html = `<table><tr><th>Họ tên</th><th>Đơn vị</th><th>Trạng thái</th></tr>`;
        data.forEach(p => {
            html += `<tr><td>${p['Họ tên']||''}</td><td>${p['Đơn vị']||''}</td><td>${p['Trạng thái']||'Chưa điểm danh'}</td></tr>`;
        });
        document.getElementById('tbl-'+id).innerHTML = html + `</table>`;
    },

    // 3. CAMERA & NHẬN DIỆN AI
    startCamera: async function() {
        const video = document.getElementById('vid');
        const stream = await navigator.mediaDevices.getUserMedia({video: true});
        video.srcObject = stream;

        // Tải model Face-API
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
        
        document.getElementById('camStatus').innerText = "Đã sẵn sàng quét mặt!";
        
        video.addEventListener('play', () => {
            setInterval(async () => {
                const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceDescriptor();
                if (detection) this.autoCheckIn(detection.descriptor);
            }, 2000);
        });
    },

    // 4. TỰ ĐỘNG ĐIỂM DANH
    autoCheckIn: function(descriptor) {
        let data = JSON.parse(localStorage.getItem('current_data') || '[]');
        data = data.map(p => {
            // Logic so khớp: Nếu khớp descriptor (giả lập) thì đổi trạng thái
            if (p.faceId && faceapi.euclideanDistance(p.faceId, descriptor) < 0.5) {
                p['Trạng thái'] = "✅ Có mặt";
                console.log("Đã tìm thấy:", p['Họ tên']);
            }
            return p;
        });
        localStorage.setItem('current_data', JSON.stringify(data));
    }
};

document.addEventListener("DOMContentLoaded", () => AppEngine.render('events'));