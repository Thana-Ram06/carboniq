export type QueuedUploadStatus = "pending" | "syncing" | "complete" | "failed";

export interface QueuedUpload {
  id: string;
  farmId: string;
  userId: string;
  type: string;
  title: string;
  fieldNotes?: string;
  gpsCoordinate?: { lat: number; lng: number; accuracy?: number };
  fileDataUrl?: string;
  fileType?: string;
  capturedAt: string;
  status: QueuedUploadStatus;
  retryCount: number;
  error?: string;
  createdAt: number;
}

const DB_NAME = "vasudha_offline";
const DB_VERSION = 1;
const STORE = "evidence_queue";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "id" });
        store.createIndex("status", "status");
        store.createIndex("userId", "userId");
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function enqueueUpload(item: Omit<QueuedUpload, "id" | "status" | "retryCount" | "createdAt">): Promise<string> {
  const db = await openDB();
  const id = `q_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const record: QueuedUpload = {
    ...item,
    id,
    status: "pending",
    retryCount: 0,
    createdAt: Date.now(),
  };
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).add(record);
    tx.oncomplete = () => resolve(id);
    tx.onerror = () => reject(tx.error);
  });
}

export async function getPendingUploads(userId: string): Promise<QueuedUpload[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).index("userId").getAll(userId);
      req.onsuccess = () =>
        resolve(
          (req.result as QueuedUpload[])
            .filter((r) => r.status === "pending" || r.status === "failed")
            .sort((a, b) => a.createdAt - b.createdAt)
        );
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

export async function updateUploadStatus(id: string, status: QueuedUploadStatus, error?: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      const store = tx.objectStore(STORE);
      const req = store.get(id);
      req.onsuccess = () => {
        const record = req.result as QueuedUpload;
        if (!record) { resolve(); return; }
        record.status = status;
        if (error) record.error = error;
        if (status === "failed") record.retryCount += 1;
        store.put(record);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      };
    });
  } catch {}
}

export async function removeCompletedUploads(userId: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      const store = tx.objectStore(STORE);
      const req = store.index("userId").openCursor(userId);
      req.onsuccess = () => {
        const cursor = req.result;
        if (!cursor) { resolve(); return; }
        if ((cursor.value as QueuedUpload).status === "complete") {
          cursor.delete();
        }
        cursor.continue();
      };
      tx.onerror = () => reject(tx.error);
    });
  } catch {}
}

export async function getPendingCount(userId: string): Promise<number> {
  const items = await getPendingUploads(userId);
  return items.length;
}
