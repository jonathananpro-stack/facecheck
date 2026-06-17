export const Report = {
    saveRecord: (n, u, s) => {
        const logs = JSON.parse(localStorage.getItem('logs')||'[]');
        logs.push({name:n, time: new Date().toLocaleTimeString()});
        localStorage.setItem('logs', JSON.stringify(logs));
    },
    downloadCSV: () => {
        const logs = JSON.parse(localStorage.getItem('logs')||'[]');
        let csv = "Tên,Thời gian\n" + logs.map(l => `${l.name},${l.time}`).join("\n");
        const a = document.createElement('a'); a.href = 'data:text/csv,' + encodeURI(csv); a.download = 'bao_cao.csv'; a.click();
    }
};
