export const db = {
    initSession: (name, list) => { localStorage.setItem('current_session', JSON.stringify({id:Date.now(), expected:list, present:[]})); },
    findMatch: (desc) => { const lib = JSON.parse(localStorage.getItem('library')||'[]'); const matcher = new faceapi.FaceMatcher(lib.map(p => new faceapi.LabeledFaceDescriptors(p.name, [new Float32Array(Object.values(p.descriptor))])), 0.4); const res = matcher.findBestMatch(desc); return res.label !== 'unknown' ? {name: res.label} : null; },
    markPresence: (name) => { let s = JSON.parse(localStorage.getItem('current_session')); if (s && s.expected.includes(name) && !s.present.includes(name)) { s.present.push(name); localStorage.setItem('current_session', JSON.stringify(s)); return true; } return false; }
};
