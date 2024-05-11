from firebase_admin import credentials, storage
import firebase_admin

cred = credentials.Certificate('../../common/keys/firebase_key.json')
firebase_admin.initialize_app(cred, {
    'storageBucket': 'bookworm-85601.appspot.com'
})
print('Firebase credentials loaded successfully!')
