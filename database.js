/**
 * FaceCheck v2.0 - Database Engine (Bản Cấu Hình Trường Dữ Liệu Động)
 */

class FaceCheckDB {
    constructor() {
        if (!window.localRAM_Events) window.localRAM_Events = [];
        if (!window.localRAM_Persons) window.localRAM_Persons = [];
        if (!window.localRAM_Participants) window.localRAM_Participants = [];

        // Cấu hình các trường thông tin mặc định (Người quản trị có thể tùy ý mở rộng)
        if (!localStorage.getItem('dynamic_fields')) {
            const defaultFields = ['Họ Tên', 'Quê Quán', 'Cấp Bậc', 'Chức Vụ', 'Đơn Vị Công Tác'];
            localStorage.setItem('dynamic_fields', JSON.stringify(defaultFields));
        }

        if (typeof Dexie !== 'undefined') {
            this.db = new Dexie("FaceCheckDB_v2");
            this.initSchema();
            this.isUsingRAM = false;
        } else {
            this.isUsingRAM = true;
        }
    }

    initSchema() {
        this.db.version(2).stores({
            persons: 'id, createdAt',
            faces: 'id, personId, qualityScore',
            attendance: 'id, personId, eventId, time',
            events: 'id, startTime, location',
            event_participants: 'id, [eventId+personId], checkedIn',
            users: 'username, role'
        });
        this.db.open().catch(() => { this.isUsingRAM = true; });
    }

    async createEvent({ name, startTime, location }) {
        const id = `EVENT-${Math.floor(100000 + Math.random() * 899999)}`;
        const newEvent = { id, name, startTime: Date.parse(startTime) || Date.now(), location, createdAt: Date.now() };
        if (this.isUsingRAM || !this.db || !this.db.isOpen()) { window.localRAM_Events.push(newEvent); return newEvent; }
        try { await this.db.events.put(newEvent); return newEvent; } catch (e) { window.localRAM_Events.push(newEvent); return newEvent; }
    }

    async getAllEvents() {
        if (this.isUsingRAM || !this.db || !this.db.isOpen()) return [...window.localRAM_Events];
        try { return await this.db.events.toArray(); } catch (e) { return window.localRAM_Events; }
    }

    // Ghi nhận cán bộ với cấu trúc dữ liệu động đa biến
    async addPerson(dynamicData) {
        const id = `usr_${Math.random().toString(36).substring(2, 11)}`;
        const personData = { id, ...dynamicData, createdAt: Date.now() };
        
        if (this.isUsingRAM || !this.db || !this.db.isOpen()) {
            window.localRAM_Persons.push(personData);
            return personData;
        }
        try {
            await this.db.persons.put({ id, encryptedPayload: `RAW_DATA:${JSON.stringify(personData)}`, createdAt: Date.now() });
            return personData;
        } catch (e) {
            window.localRAM_Persons.push(personData);
            return personData;
        }
    }

    async getAllPersons() {
        if (this.isUsingRAM || !this.db || !this.db.isOpen()) return window.localRAM_Persons;
        try {
            const rawList = await this.db.persons.toArray();
            return rawList.map(raw => JSON.parse(raw.encryptedPayload.replace("RAW_DATA:", "")));
        } catch (e) { return window.localRAM_Persons; }
    }

    async getPersonById(personId) {
        const ram = window.localRAM_Persons.find(p => p.id === personId);
        if (ram) return ram;
        try {
            const raw = await this.db.persons.get(personId);
            return raw ? JSON.parse(raw.encryptedPayload.replace("RAW_DATA:", "")) : null;
        } catch (e) { return null; }
    }

    async registerParticipant(eventId, personId) {
        const item = { id: `ep_${eventId}_${personId}`, eventId, personId, checkedIn: 0, checkinTime: "" };
        if (this.isUsingRAM || !this.db || !this.db.isOpen()) { window.localRAM_Participants.push(item); return; }
        try { await this.db.event_participants.put(item); } catch (e) { window.localRAM_Participants.push(item); }
    }

    async getEventParticipants(eventId) {
        let mappings = [];
        if (!this.isUsingRAM && this.db && this.db.isOpen()) {
            try { mappings = await this.db.event_participants.where('eventId').equals(eventId).toArray(); } catch (e) {}
        }
        const ramMappings = window.localRAM_Participants.filter(m => m.eventId === eventId);
        const allMappings = [...mappings, ...ramMappings];
        
        const list = [];
        for (const map of allMappings) {
            const person = await this.getPersonById(map.personId);
            if (person) list.push({ ...person, checkedIn: map.checkedIn, checkinTime: map.checkinTime });
        }
        return list;
    }
}

const StorageEngine = new FaceCheckDB();