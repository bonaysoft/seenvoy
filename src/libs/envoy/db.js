import Dexie from 'dexie';

export const db = new Dexie('seenvoy');
db.version(4).stores({
    bootstrap: '++',
    listeners: '++, name',
    routes: '++, name',
    clusters: '++, name',
    endpoints: '++, name',
});