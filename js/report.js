export const Report = {
    exportCSV: () => {
        const logs = JSON.parse(localStorage.getItem('attendance_logs') || '[]');
        let csv = 'Tên,Thời gian\n';
        logs.forEach(log => { csv += `${log.name},${log.time}\n`; });
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'diem_danh_' + new Date().toLocaleDateString() + '.csv';
        a.click();
    }
};