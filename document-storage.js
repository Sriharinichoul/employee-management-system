
// ==================================================
// EMPLOYEE DOCUMENT STORAGE
// Uses IndexedDB to store employee documents
// ==================================================

// ===============================
// DATABASE CONFIGURATION
// ===============================

const DOCUMENT_DB_NAME = "EmployeeManagementDB";
const DOCUMENT_DB_VERSION = 1;
const DOCUMENT_STORE_NAME = "employeeDocuments";


// ===============================
// OPEN INDEXEDDB DATABASE
// ===============================

function openDocumentDatabase() {

    return new Promise((resolve, reject) => {

        if (!window.indexedDB) {
            reject(new Error("IndexedDB is not supported by this browser."));
            return;
        }

        const request = indexedDB.open(
            DOCUMENT_DB_NAME,
            DOCUMENT_DB_VERSION
        );

        request.onupgradeneeded = function(event) {

            const database = event.target.result;

            if (!database.objectStoreNames.contains(DOCUMENT_STORE_NAME)) {
                database.createObjectStore(
                    DOCUMENT_STORE_NAME,
                    { keyPath: "id" }
                );
            }
        };

        request.onsuccess = function(event) {
            resolve(event.target.result);
        };

        request.onerror = function() {
            reject(request.error || new Error("Unable to open document database."));
        };

        request.onblocked = function() {
            reject(
                new Error(
                    "Database operation is blocked. Close other application tabs and try again."
                )
            );
        };

    });

}


// ===============================
// SAVE EMPLOYEE DOCUMENT
// ===============================

async function saveEmployeeDocumentToDB(employeeId, documentType, file) {

    if (!employeeId || !documentType || !file) {
        throw new Error("Employee ID, document type and file are required.");
    }

    const database = await openDocumentDatabase();

    return new Promise((resolve, reject) => {

        let transaction;

        try {
            transaction = database.transaction(
                DOCUMENT_STORE_NAME,
                "readwrite"
            );

            const store = transaction.objectStore(DOCUMENT_STORE_NAME);

            const documentRecord = {
                id: `${employeeId}_${documentType}`,
                employeeId: employeeId,
                documentType: documentType,
                fileName: file.name,
                mimeType: file.type,
                fileSize: file.size,
                blob: file,
                uploadedAt: new Date().toISOString()
            };

            store.put(documentRecord);

            transaction.oncomplete = function() {
                database.close();
                resolve(true);
            };

            transaction.onerror = function() {
                database.close();
                reject(transaction.error);
            };

            transaction.onabort = function() {
                database.close();
                reject(transaction.error || new Error("Document save was cancelled."));
            };

        } catch (error) {
            database.close();
            reject(error);
        }

    });

}


// ===============================
// GET EMPLOYEE DOCUMENT
// ===============================

async function getEmployeeDocumentFromDB(employeeId, documentType) {

    if (!employeeId || !documentType) {
        throw new Error("Employee ID and document type are required.");
    }

    const database = await openDocumentDatabase();

    return new Promise((resolve, reject) => {

        let transaction;

        try {
            transaction = database.transaction(
                DOCUMENT_STORE_NAME,
                "readonly"
            );

            const store = transaction.objectStore(DOCUMENT_STORE_NAME);

            const request = store.get(
                `${employeeId}_${documentType}`
            );

            let documentRecord = null;

            request.onsuccess = function() {
                documentRecord = request.result || null;
            };

            request.onerror = function() {
                database.close();
                reject(request.error);
            };

            transaction.oncomplete = function() {
                database.close();
                resolve(documentRecord);
            };

            transaction.onerror = function() {
                database.close();
                reject(transaction.error);
            };

            transaction.onabort = function() {
                database.close();
                reject(transaction.error);
            };

        } catch (error) {
            database.close();
            reject(error);
        }

    });

}


// ===============================
// GET ALL DOCUMENTS FOR EMPLOYEE
// ===============================

async function getAllEmployeeDocuments(employeeId) {

    if (!employeeId) {
        throw new Error("Employee ID is required.");
    }

    const database = await openDocumentDatabase();

    return new Promise((resolve, reject) => {

        let transaction;

        try {
            transaction = database.transaction(
                DOCUMENT_STORE_NAME,
                "readonly"
            );

            const store = transaction.objectStore(DOCUMENT_STORE_NAME);
            const request = store.getAll();

            request.onsuccess = function() {

                const employeeDocuments = (request.result || []).filter(
                    documentRecord =>
                        documentRecord.employeeId === employeeId
                );

                resolve(employeeDocuments);
            };

            request.onerror = function() {
                reject(request.error);
            };

            transaction.oncomplete = function() {
                database.close();
            };

            transaction.onerror = function() {
                database.close();
                reject(transaction.error);
            };

            transaction.onabort = function() {
                database.close();
                reject(transaction.error);
            };

        } catch (error) {
            database.close();
            reject(error);
        }

    });

}


// ===============================
// VIEW EMPLOYEE DOCUMENT
// ===============================

async function viewEmployeeDocument(employeeId, documentType) {

    // Open a blank tab immediately to avoid popup blockers.
    const previewWindow = window.open("about:blank", "_blank");

    if (!previewWindow) {
        alert("Please allow pop-ups to view this document.");
        return;
    }

    try {

        const documentRecord = await getEmployeeDocumentFromDB(
            employeeId,
            documentType
        );

        if (!documentRecord || !documentRecord.blob) {
            previewWindow.close();
            alert("Document not found.");
            return;
        }

        const fileURL = URL.createObjectURL(documentRecord.blob);

        previewWindow.location.href = fileURL;

        // Release the temporary URL after some time.
        setTimeout(() => {
            URL.revokeObjectURL(fileURL);
        }, 60000);

    } catch (error) {

        console.error("Error viewing document:", error);

        previewWindow.close();

        alert("Unable to open the document.");
    }

}


// ===============================
// DOWNLOAD EMPLOYEE DOCUMENT
// ===============================

async function downloadEmployeeDocument(employeeId, documentType) {

    try {

        const documentRecord = await getEmployeeDocumentFromDB(
            employeeId,
            documentType
        );

        if (!documentRecord || !documentRecord.blob) {
            alert("Document not found.");
            return;
        }

        const fileURL = URL.createObjectURL(documentRecord.blob);

        const downloadLink = document.createElement("a");

        downloadLink.href = fileURL;
        downloadLink.download =
            documentRecord.fileName || "employee-document";

        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        setTimeout(() => {
            URL.revokeObjectURL(fileURL);
        }, 1000);

    } catch (error) {

        console.error("Error downloading document:", error);

        alert("Unable to download the document.");
    }

}


// ===============================
// DELETE EMPLOYEE DOCUMENT
// ===============================

async function deleteEmployeeDocument(employeeId, documentType) {

    if (!employeeId || !documentType) {
        throw new Error("Employee ID and document type are required.");
    }

    const database = await openDocumentDatabase();

    return new Promise((resolve, reject) => {

        let transaction;

        try {
            transaction = database.transaction(
                DOCUMENT_STORE_NAME,
                "readwrite"
            );

            const store = transaction.objectStore(DOCUMENT_STORE_NAME);

            store.delete(`${employeeId}_${documentType}`);

            transaction.oncomplete = function() {
                database.close();
                resolve(true);
            };

            transaction.onerror = function() {
                database.close();
                reject(transaction.error);
            };

            transaction.onabort = function() {
                database.close();
                reject(transaction.error);
            };

        } catch (error) {
            database.close();
            reject(error);
        }

    });

}


// ===============================
// MAKE FUNCTIONS AVAILABLE GLOBALLY
// ===============================

window.openDocumentDatabase = openDocumentDatabase;

window.saveEmployeeDocumentToDB = saveEmployeeDocumentToDB;

window.getEmployeeDocumentFromDB = getEmployeeDocumentFromDB;

window.getAllEmployeeDocuments = getAllEmployeeDocuments;

window.viewEmployeeDocument = viewEmployeeDocument;

window.downloadEmployeeDocument = downloadEmployeeDocument;

window.deleteEmployeeDocument = deleteEmployeeDocument;
