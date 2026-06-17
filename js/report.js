export const Report = {
    exportCSV: () => { const logs = JSON.parse(localStorage.getItem('attendance_logs') || '[]'); let csv = 'Tên,Thời gian\n'; logs.forEach(l => csv += `${l.name},${l.time}\n`); const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], {type: 'text/csv'})); a.download = 'diem_danh.csv'; a.click(); }
};
