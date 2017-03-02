# node-pdf-vat-finder
A package to find a european VAT finder in a pdf file

## Get started with the example

  `$ npm install`
  
  `$ node example.js <PATH_TO_PDF_FILE>`

No pdf file for testing is furnished.

## Compatibility

Built for JS ES2015

Tested with node.js v7.1.0

## How to use the module

`invoiceParser(filePath, checkValidity, function(err, res){...});`

`filePath` (String)  = Absolute path to the PDF file.

`checkValidity` (Boolean) = Wether or not to check if the vat numbers found are registered.

I highly recommend setting the checkValidity to `true`, since those numbers have a simple format that can be used for other reasons (like an IBAN for a bank account)
