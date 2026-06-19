const CORE = {
    state: { mode: 'TRAIN', facingMode: "user", isCombatScanning: false, combatInterval: null, faceMatcher: null, session: { isActive: false, checkedInSet: new Set(), unknownsQueue: [] } },

    init: async function() {
        this.log("HỆ THỐNG ĐANG NẠP LÕI AI...");
        const modelPath = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
        try {
            this.log("[1/3] Nạp mạng nhận diện khối...");
            await faceapi.nets.ssdMobilenetv1.loadFromUri(modelPath);
            
            this.log("[2/3] Nạp mạng phân tích điểm ảnh...");
            await faceapi.nets.faceLandmark68Net.loadFromUri(modelPath);
            
            this.log("[3/3] Nạp mạng đối chiếu DNA...");
            await faceapi.nets.faceRecognitionNet.loadFromUri(modelPath);
            
            const statusLabel = document.getElementById('sys-status');
            statusLabel.innerText = "SYS: [ TRỰC TUYẾN ]";
            statusLabel.style.color = "#00ffcc";
            
            this.log("<b style='color:#00ffcc'>=> HỆ THỐNG ĐÃ TRỰC TUYẾN!</b>");
            this.db.loadFromStorage();
        } catch (e) {
            this.log(`<span style='color:red'>LỖI MẠNG: Không thể tải AI (${e.message})</span>`);
        }
    },

    log(msg) {
        const logBox = document.getElementById('system-logs');
        if(logBox) {
            logBox.innerHTML += `<div style="border-bottom: 1px dashed #333; padding: 5px 0;">${msg}</div>`;
            logBox.scrollTop = logBox.scrollHeight;
        }
    },

    ui: {
        switchMode(m) {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.module').forEach(el => el.classList.remove('active'));
            document.getElementById('tab-' + m.toLowerCase()).classList.add('active');
            document.getElementById('module-' + m.toLowerCase()).classList.add('active');
            CORE.state.mode = m;
            if(m === 'TRAIN') CORE.combat.stopScan();
        },
        openModal(id, imgSrc, descArray, matchedId = null) {
            document.getElementById('modal-id').value = id;
            document.getElementById('modal-img').src = imgSrc;
            document.getElementById('modal-descriptor').value = descArray.join(',');
            document.getElementById('modal-matched-id').value = matchedId || "";
            if (matchedId && CORE.db.profiles[matchedId]) {
                document.getElementById('ai-suggestion-box').style.display = 'block';
                document.getElementById('ai-suggestion-name').innerText = CORE.db.profiles[matchedId].info.name;
                document.getElementById('modal-name').value = CORE.db.profiles[matchedId].info.name;
                document.getElementById('btn-save-target').innerText = "✅ XÁC NHẬN";
            } else {
                document.getElementById('ai-suggestion-box').style.display = 'none';
                document.getElementById('modal-name').value = '';
                document.getElementById('btn-save-target').innerText = "💾 LƯU MỚI";
            }
            document.getElementById('label-modal').classList.add('active');
        },
        closeModal() { document.getElementById('label-modal').classList.remove('active'); },
        openDatabaseModal() {
            const grid = document.getElementById('saved-grid');
            grid.innerHTML = Object.entries(CORE.db.profiles).map(([id, p]) => `
                <div class="face-card"><img src="${p.media.base64}"><div style="font-size:9px; color:#00ffcc;">${p.info.name}</div><button onclick="CORE.db.deleteTarget('${id}')" style="background:red; color:white; border:none; width:100%; cursor:pointer;">XÓA</button></div>
            `).join('');
            document.getElementById('db-count').innerText = Object.keys(CORE.db.profiles).length;
            document.getElementById('database-modal').classList.add('active');
        },
        closeDatabaseModal() { document.getElementById('database-modal').classList.remove('active'); }
    },

    media: {
        async startCamera(vidId) {
            const v = document.getElementById(vidId);
            try {
                if (v.srcObject) v.srcObject.getTracks().forEach(t => t.stop());
                v.srcObject = await navigator.mediaDevices.getUserMedia({ video: { facingMode: CORE.state.facingMode } });
                v.style.display = 'block';
                if(vidId === 'vid') document.getElementById('img-view').style.display = 'none';
            } catch (e) { CORE.log("<span style='color:red'>Lỗi mở Camera!</span>"); }
        },
        clearSource() {
            const v = document.getElementById('vid');
            if (v.srcObject) v.srcObject.getTracks().forEach(t => t.stop());
            v.style.display = 'none'; document.getElementById('img-view').style.display = 'none';
            document.getElementById('out').getContext('2d').clearRect(0,0,2000,2000);
        },
        handleUpload(e) {
            const file = e.target.files[0]; if(!file) return;
            const r = new FileReader();
            r.onload = ev => {
                document.getElementById('img-view').src = ev.target.result;
                document.getElementById('img-view').style.display = 'block';
                this.clearSource(); // Tắt cam nếu đang bật
            };
            r.readAsDataURL(file);
        }
    },

    db: {
        profiles: {},
        loadFromStorage() {
            const data = localStorage.getItem('SEC_DB');
            if (data) { this.profiles = JSON.parse(data); CORE.combat.buildFaceMatcher(); }
        },
        saveTarget() {
            const id = document.getElementById('modal-id').value;
            const name = document.getElementById('modal-name').value || "UNKNOWN";
            const desc = document.getElementById('modal-descriptor').value.split(',').map(Number);
            const matchedId = document.getElementById('modal-matched-id').value;
            
            if (matchedId && this.profiles[matchedId]) {
                if(!this.profiles[matchedId].biometrics.descriptors) this.profiles[matchedId].biometrics.descriptors = [];
                this.profiles[matchedId].biometrics.descriptors.push(desc);
            } else {
                const newId = 'SEC_' + Date.now();
                this.profiles[newId] = { info: { name: name }, biometrics: { descriptors: [desc] }, media: { base64: document.getElementById('modal-img').src } };
            }
            localStorage.setItem('SEC_DB', JSON.stringify(this.profiles));
            CORE.combat.buildFaceMatcher();
            document.getElementById(`card-${id}`)?.remove();
            CORE.ui.closeModal();
        },
        deleteTarget(id) { delete this.profiles[id]; localStorage.setItem('SEC_DB', JSON.stringify(this.profiles)); CORE.ui.openDatabaseModal(); CORE.combat.buildFaceMatcher(); },
        exportData() {
            const a = document.createElement('a');
            a.href = URL.createObjectURL(new Blob([btoa(encodeURIComponent(JSON.stringify(this.profiles)))], {type: "text/plain"}));
            a.download = "SEC_DATA.sec"; a.click();
        },
        importData(e) {
            const r = new FileReader();
            r.onload = ev => { 
                Object.assign(this.profiles, JSON.parse(decodeURIComponent(atob(ev.target.result)))); 
                localStorage.setItem('SEC_DB', JSON.stringify(this.profiles)); CORE.combat.buildFaceMatcher(); CORE.ui.openDatabaseModal(); 
            };
            r.readAsText(e.target.files[0]);
        }
    },

    ai: {
        async extractFacesTrain() {
            const src = document.getElementById('vid').style.display === 'block' ? document.getElementById('vid') : document.getElementById('img-view');
            const faces = await faceapi.detectAllFaces(src, new faceapi.SsdMobilenetv1Options({minConfidence: 0.4})).withFaceLandmarks().withFaceDescriptors();
            faces.forEach((f, i) => {
                const c = document.createElement('canvas'); const b = f.detection.box;
                c.width = b.width; c.height = b.height;
                c.getContext('2d').drawImage(src, b.x, b.y, b.width, b.height, 0, 0, b.width, b.height);
                
                let mId = null;
                if (CORE.state.faceMatcher) {
                    const match = CORE.state.faceMatcher.findBestMatch(f.descriptor);
                    if (match.label !== 'unknown' && match.distance <= 0.6) mId = match.label;
                }
                
                const card = document.createElement('div'); card.className = 'face-card'; card.id = `card-t${Date.now()}`;
                card.onclick = () => CORE.ui.openModal(card.id, c.toDataURL(), Array.from(f.descriptor), mId);
                card.innerHTML = `<img src="${c.toDataURL()}"><div style="color:${mId?'#00ffcc':'#ffcc00'}; font-size:9px;">${mId?'Gợi ý AI':'GÁN NHÃN'}</div>`;
                document.getElementById('face-queue').appendChild(card);
            });
        }
    },

    combat: {
        startSession() {
            CORE.state.session = { isActive: true, checkedInSet: new Set(), unknownsQueue: [] };
            document.getElementById('session-setup').style.display = 'none';
            document.getElementById('session-active').style.display = 'flex';
        },
        endSession() {
            this.stopScan(); CORE.state.session.isActive = false;
            document.getElementById('session-setup').style.display = 'block';
            document.getElementById('session-active').style.display = 'none';
        },
        buildFaceMatcher() {
            const labels = [];
            for (const id in CORE.db.profiles) {
                if(CORE.db.profiles[id].biometrics.descriptors) {
                    labels.push(new faceapi.LabeledFaceDescriptors(id, CORE.db.profiles[id].biometrics.descriptors.map(d => new Float32Array(d))));
                }
            }
            CORE.state.faceMatcher = labels.length > 0 ? new faceapi.FaceMatcher(labels, 0.55) : null;
        },
        toggleScan() {
            CORE.state.isCombatScanning = !CORE.state.isCombatScanning;
            document.getElementById('btn-scan-live').innerText = CORE.state.isCombatScanning ? "⏹ DỪNG RADAR" : "🔴 BẬT RADAR";
            if(CORE.state.isCombatScanning) this.scanLoop();
        },
        stopScan() { CORE.state.isCombatScanning = false; clearTimeout(CORE.state.combatInterval); },
        
        async scanLoop() {
            if (!CORE.state.isCombatScanning) return;
            const v = document.getElementById('combat-vid'); const c = document.getElementById('combat-out');
            if (v.paused || !v.srcObject) { CORE.state.combatInterval = setTimeout(() => this.scanLoop(), 1000); return; }
            
            faceapi.matchDimensions(c, {width: v.videoWidth, height: v.videoHeight});
            const faces = await faceapi.detectAllFaces(v, new faceapi.SsdMobilenetv1Options({minConfidence: 0.4})).withFaceLandmarks().withFaceDescriptors();
            const ctx = c.getContext('2d'); ctx.clearRect(0, 0, c.width, c.height);
            
            faces.forEach(f => {
                const b = f.detection.box; let label = 'unknown'; let dist = 1;
                if (CORE.state.faceMatcher) { const m = CORE.state.faceMatcher.findBestMatch(f.descriptor); label = m.label; dist = m.distance; }
                
                if (label !== 'unknown' && dist <= 0.55) {
                    ctx.strokeStyle = "#00ffcc"; ctx.strokeRect(b.x, b.y, b.width, b.height);
                    if(!CORE.state.session.checkedInSet.has(label)) {
                        CORE.state.session.checkedInSet.add(label);
                        document.getElementById('combat-count').innerText = CORE.state.session.checkedInSet.size;
                        document.getElementById('combat-log').innerHTML += `<div style="color:#00ffcc;">+ Đã nhận diện: ${CORE.db.profiles[label].info.name}</div>`;
                    }
                } else {
                    ctx.strokeStyle = "#ff3333"; ctx.strokeRect(b.x, b.y, b.width, b.height);
                    // Đẩy đối tượng lạ vào hàng đợi (Giản lược logic cắt ảnh cho mượt trên mobile)
                }
            });
            CORE.state.combatInterval = setTimeout(() => this.scanLoop(), 300);
        }
    }
};

window.onload = () => CORE.init();
