export const db = {
    // Lưu nhân sự vào LocalStorage (thay vì IndexedDB để đơn giản hóa cho bản này)
    save: (person) => {
        const list = JSON.parse(localStorage.getItem('library') || '[]');
        list.push(person);
        localStorage.setItem('library', JSON.stringify(list));
    },
    getAll: () => JSON.parse(localStorage.getItem('library') || '[]'),
    clear: () => localStorage.setItem('library', '[]')
};