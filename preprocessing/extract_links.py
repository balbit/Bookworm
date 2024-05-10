import fitz  # PyMuPDF

def extract_pdf_page_details(pdf_path, page_number):
    # Open the PDF file
    doc = fitz.open(pdf_path)

    # Check if the page number is valid
    if page_number < 0 or page_number >= len(doc):
        print("Invalid page number.")
        return

    # Select the specified page
    page = doc.load_page(page_number)

    # Extract text
    text = page.get_text("text")
    print("Page Text:\n", text)

    # Extract links
    links = page.get_links()
    for link in links:
        print("Found link: ", link)
        if link['kind'] == fitz.LINK_GOTO:  # Check if it's an internal link
            target_page = link['page']
            print(f"Link to page {target_page + 1} found at: {link['from']}")
        elif link['kind'] == fitz.LINK_URI:  # External URL links
            url = link['uri']
            print(f"URL link to {url} found at: {link['from']}")

    # Close the document
    doc.close()

# Example usage
pdf_path = 'books/DDIA.pdf'
page_number = 9  # Typically the first page for table of contents
extract_pdf_page_details(pdf_path, page_number)
