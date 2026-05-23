const stores = new Map();
export function getStore(name) { if (!stores.has(name)) stores.set(name, new Map()); return stores.get(name); }
export function listRecords(name) { return [...getStore(name).values()]; }
export function getRecord(name, id) { return getStore(name).get(id) ?? null; }
export function setRecord(name, record) { if (!record?.id) throw new Error("record.id required"); getStore(name).set(record.id, record); return record; }
