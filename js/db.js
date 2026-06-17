export const db = {
    initSession: (name, list) => { const s = { id: Date.now(), expected: list, present: [] }; localStorage.setItem('current_session', JSON.stringify(s)); return s; },
    saveUser: (p) => { const lib = JSON.parse(localStorage.getItem('library')||'[]'); lib.push(p); localStorage.setItem('library', JSON.stringify(lib)); },
    findMatch: (desc) => { const lib = JSON.parse(localStorage.getItem('library')||'[]'); const matcher = new faceapi.FaceMatcher(lib.map(p => new faceapi.LabeledFaceDescriptors(p.name, [new Float32Array(Object.values(p.descriptor))])), 0.4); return matcher.findBestMatch(desc).label !== 'unknown' ? { name: matcher.findBestMatch(desc).label } : null; },
    markPresence: (name) => { let s = JSON.parse(localStorage.getItem('current_session')); if (s && s.expected.includes(name) && !s.present.includes(name)) { s.present.push(name); localStorage.setItem('current_session', JSON.stringify(s)); return true; } return false; }
};
