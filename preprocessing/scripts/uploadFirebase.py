import firebase_admin
from firebase_admin import firestore
import yaml
import getCredentials


def initial_book_upload():
    yaml_file = '../extractions/bookInfo.yaml'
    with open(yaml_file, 'r') as file:
        data = yaml.safe_load(file)

    # Get Firestore client
    db = firestore.client()

    id = data['id']
    # Create a new collection and add the document
    collection_ref = db.collection('bookInfo')
    collection_ref.document(id).set(data)

    print('book uploaded successfully!')

def initial_chapters_upload():
    yaml_file = '../extractions/chapterInfo.yaml'
    with open(yaml_file, 'r') as file:
        data = yaml.safe_load(file)

    # Get Firestore client
    db = firestore.client()

    for chapter in data:
        id = chapter['id']
        # Create a new collection and add the document
        collection_ref = db.collection('chapterInfo')
        collection_ref.document(id).set(chapter)

    print('chapters uploaded successfully!')

if __name__ == '__main__':
    initial_setup()
    # initial_book_upload()
    # initial_chapters_upload()