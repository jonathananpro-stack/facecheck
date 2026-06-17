export const db = {
    saveUser: (p) => { 
        const lib = JSON.parse(localStorage.getItem('lib')||'[]'); 
        lib.push(p); localStorage.setItem('lib', JSON.stringify(lib)); 
    },
    findMatch: (desc) => { 
        const lib = JSON.parse(localStorage.getItem('lib')||'[]'); 
        if(lib.length === 0) return null;
        const matcher = new faceapi.FaceMatcher(lib.map(p => new faceapi.LabeledFaceDescriptors(p.name, [new Float32Array(p.descriptor)])), 0.5); 
        const res = matcher.findBestMatch(new Float32Array(desc)); 
        return res.label !== 'unknown' ? {name:res.label} : null; 
    },
    confirmIdentity: (name) => { console.log("Saved Attendance for: " + name); }
};
