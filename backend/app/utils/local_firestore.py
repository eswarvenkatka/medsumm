import json
import os
import uuid

class LocalFirestoreDocument:
    def __init__(self, doc_id, data):
        self.id = doc_id
        self.exists = data is not None
        self._data = data or {}

    def to_dict(self):
        return self._data

class LocalFirestoreDocumentRef:
    def __init__(self, collection_mock, doc_id):
        self.collection_mock = collection_mock
        self.id = doc_id

    def get(self):
        data = self.collection_mock.get_doc_data(self.id)
        return LocalFirestoreDocument(self.id, data)

    def set(self, data):
        self.collection_mock.set_doc_data(self.id, data)

    def delete(self):
        self.collection_mock.delete_doc_data(self.id)

    def collection(self, subcollection_name):
        # Handle subcollections (e.g. documents/{id}/chats)
        # Store as path "col_name/doc_id/subcol_name"
        sub_path = f"{self.collection_mock.name}/{self.id}/{subcollection_name}"
        return self.collection_mock.db_mock.collection(sub_path)

class LocalFirestoreQuery:
    def __init__(self, collection_mock, field, op, value):
        self.collection_mock = collection_mock
        self.field = field
        self.op = op
        self.value = value

    def get(self):
        docs = []
        all_data = self.collection_mock.get_all_docs_data()
        for doc_id, data in all_data.items():
            if data.get(self.field) == self.value:
                docs.append(LocalFirestoreDocument(doc_id, data))
        return docs

class LocalFirestoreCollectionRef:
    def __init__(self, db_mock, name):
        self.db_mock = db_mock
        self.name = name

    def document(self, doc_id=None):
        if doc_id is None:
            doc_id = str(uuid.uuid4())
        return LocalFirestoreDocumentRef(self, doc_id)

    def get_doc_data(self, doc_id):
        return self.db_mock.read_data(self.name, doc_id)

    def set_doc_data(self, doc_id, data):
        self.db_mock.write_data(self.name, doc_id, data)

    def delete_doc_data(self, doc_id):
        self.db_mock.delete_data(self.name, doc_id)

    def get_all_docs_data(self):
        return self.db_mock.read_all_collection_data(self.name)

    def get(self):
        docs = []
        all_data = self.get_all_docs_data()
        for doc_id, data in all_data.items():
            docs.append(LocalFirestoreDocument(doc_id, data))
        return docs

    def where(self, field, op, value):
        return LocalFirestoreQuery(self, field, op, value)

class LocalFirestoreMock:
    def __init__(self, file_path="local_firestore.json"):
        self.file_path = file_path
        if not os.path.exists(self.file_path):
            with open(self.file_path, "w", encoding="utf-8") as f:
                json.dump({}, f)

    def _load(self):
        try:
            with open(self.file_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}

    def _save(self, data):
        try:
            with open(self.file_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
        except Exception:
            pass

    def collection(self, name):
        return LocalFirestoreCollectionRef(self, name)

    def read_data(self, col_name, doc_id):
        db_data = self._load()
        return db_data.get(col_name, {}).get(doc_id)

    def write_data(self, col_name, doc_id, data):
        db_data = self._load()
        if col_name not in db_data:
            db_data[col_name] = {}
        db_data[col_name][doc_id] = data
        self._save(db_data)

    def delete_data(self, col_name, doc_id):
        db_data = self._load()
        if col_name in db_data and doc_id in db_data[col_name]:
            db_data[col_name].pop(doc_id, None)
            self._save(db_data)

    def read_all_collection_data(self, col_name):
        db_data = self._load()
        return db_data.get(col_name, {})
