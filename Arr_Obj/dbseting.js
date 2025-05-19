let dbsetting;
const request = indexedDB.open('Setting', 1);

request.onupgradeneeded = (e) => {
    dbsetting = e.target.result;

    const store =dbsetting.createObjectStore('transactions', {
        keyPath: 'id',
        autoIncrement: true
    });

    store.createIndex('')
}