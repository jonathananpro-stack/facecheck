export const db = {
    initSession: (n, l) => localStorage.setItem('current_session', JSON.stringify({expected: l, present: []})),
    saveUser: (p) => { const lib = JSON.parse(localStorage.getItem('library')||'[]'); lib.push(p); localStorage.setItem('library', JSON.stringify(lib)); },
    findMatch: (desc) => { const lib = JSON.parse(localStorage.getItem('library')||'[]'); const matcher = new faceapi.FaceMatcher(lib.map(p => new faceapi.LabeledFaceDescriptors(p.name, [new Float32Array(Object.values(p.descriptor))])), 0.4); const res = matcher.findBestMatch(desc); return res.label !== 'unknown' ? {name: res.label} : null; }
};
