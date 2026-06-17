export const db = {
    initSession: (l) => localStorage.setItem('ses', JSON.stringify({ex: l})),
    saveUser: (p) => { const lib = JSON.parse(localStorage.getItem('lib')||'[]'); lib.push(p); localStorage.setItem('lib', JSON.stringify(lib)); },
    findMatch: (desc) => { const lib = JSON.parse(localStorage.getItem('lib')||'[]'); const matcher = new faceapi.FaceMatcher(lib.map(p=>new faceapi.LabeledFaceDescriptors(p.name, [new Float32Array(p.descriptor)])), 0.4); const res = matcher.findBestMatch(desc); return res.label!=='unknown'?{name:res.label}:null; }
};
