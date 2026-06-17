export const db = {
    save(data) {
        const encrypted = btoa(JSON.stringify(data));
        localStorage.setItem('core_' + data.timestamp, encrypted);
    },
    getAll() {
        return Object.keys(localStorage).filter(k => k.startsWith('core_')).map(k => ({
            time: k.split('_')[1],
            data: JSON.parse(atob(localStorage.getItem(k)))
        }));
    }
};
