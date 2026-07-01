import firebase_admin
from firebase_admin import credentials, auth, firestore
from app.config import settings
import os
import jwt
import requests
from cryptography.x509 import load_pem_x509_certificate
from cryptography.hazmat.backends import default_backend

# Initialize Firebase App
try:
    if not firebase_admin._apps:
        service_account_val = os.getenv("FIREBASE_SERVICE_ACCOUNT_KEY")
        if service_account_val:
            if os.path.exists(service_account_val):
                cred = credentials.Certificate(service_account_val)
                firebase_admin.initialize_app(cred)
                print("Firebase Admin initialized with service account certificate file.")
            else:
                try:
                    import json
                    service_account_info = json.loads(service_account_val)
                    cred = credentials.Certificate(service_account_info)
                    firebase_admin.initialize_app(cred)
                    print("Firebase Admin initialized with service account JSON string.")
                except Exception as json_err:
                    print(f"Failed to parse service account key as JSON: {json_err}. Falling back to default project ID...")
                    firebase_admin.initialize_app(options={"projectId": settings.FIREBASE_PROJECT_ID})
        else:
            firebase_admin.initialize_app(options={"projectId": settings.FIREBASE_PROJECT_ID})
            print(f"Firebase Admin initialized with project ID: {settings.FIREBASE_PROJECT_ID}")
except Exception as e:
    print(f"Warning: Firebase Admin initialization error: {e}")

db = None
try:
    db = firestore.client()
    print("Firestore client initialized successfully.")
except Exception as e:
    print(f"Warning: Firestore client initialization failed: {e}. Falling back to local database.")
    from app.utils.local_firestore import LocalFirestoreMock
    db = LocalFirestoreMock()

_google_public_keys = {}

def verify_token(id_token: str) -> dict:
    """
    Verifies a Firebase ID token.
    Returns the decoded token dictionary (claims) if valid, raises ValueError otherwise.
    """
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except Exception as sdk_err:
        print(f"Firebase SDK token verification failed: {sdk_err}. Falling back to manual verification...")
        try:
            global _google_public_keys
            header = jwt.get_unverified_header(id_token)
            kid = header.get("kid")
            if not kid:
                raise ValueError("No kid found in token header")
            
            # Fetch and cache Google's public certs
            if kid not in _google_public_keys:
                res = requests.get("https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com")
                if res.status_code == 200:
                    certs = res.json()
                    for k, cert_pem in certs.items():
                        cert = load_pem_x509_certificate(cert_pem.encode(), default_backend())
                        _google_public_keys[k] = cert.public_key()
                else:
                    raise ValueError(f"Failed to fetch Google public keys: HTTP {res.status_code}")
            
            public_key = _google_public_keys.get(kid)
            if not public_key:
                raise ValueError("Matching Google public key not found")
                
            project_id = settings.FIREBASE_PROJECT_ID
            decoded = jwt.decode(
                id_token,
                public_key,
                algorithms=["RS256"],
                audience=project_id,
                issuer=f"https://securetoken.google.com/{project_id}"
            )
            # Ensure "uid" is set from "sub"
            if "sub" in decoded and "uid" not in decoded:
                decoded["uid"] = decoded["sub"]
            print("Token verified successfully using pyjwt manual fallback.")
            return decoded
        except Exception as fallback_err:
            print(f"Manual token verification fallback failed: {fallback_err}")
            raise ValueError(f"Invalid authentication token: {str(fallback_err)}")
