import os
from PyPDF2 import PdfReader, PdfWriter
from io import BytesIO
from pathlib import Path

import getCredentials

def upload_page(pdf_bytes, bucket_name, folder_name, page_number):
    bucket = getCredentials.storage.bucket()
    blob = bucket.blob(f'{folder_name}/page{page_number}.pdf')
    
    blob.upload_from_string(pdf_bytes, content_type='application/pdf')
    print(f'Uploaded page {page_number} to {folder_name}/page{page_number}.pdf')

def split_and_upload_pdf(pdf_path, bucket_name, folder_name):
    reader = PdfReader(pdf_path)
    for page_index, page in enumerate(reader.pages, start=1):
        writer = PdfWriter()
        writer.add_page(page)

        # Save the PDF page to bytes
        pdf_bytes_io = BytesIO()
        writer.write(pdf_bytes_io)
        pdf_bytes_io.seek(0)  # Move to the beginning of the BytesIO stream

        # Upload the PDF bytes
        upload_page(pdf_bytes_io.getvalue(), bucket_name, folder_name, page_index)

def check_already_uploaded(bucket_name, folder_name):
    bucket = getCredentials.storage.bucket()
    blobs = bucket.list_blobs(prefix=f'{folder_name}/')
    return len(list(blobs)) > 0

if __name__ == "__main__":
    pdf_path = '../books/DDIA.pdf'
    bucket_name = 'bookworm-85601.appspot.com'
    book_id = 'book-8Q7HM3'
    folder_name = f'{book_id}'

    if check_already_uploaded(bucket_name, folder_name):
        print(f'Pages already uploaded to {folder_name}/')
        proceed = input("Do you want to proceed? (y/n): ")
        if proceed.lower() == "y":
            split_and_upload_pdf(pdf_path, bucket_name, folder_name)
        else:
            print("Upload cancelled.")
            exit()
    else:
        split_and_upload_pdf(pdf_path, bucket_name, folder_name)
