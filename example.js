var path = require('path');
var invoiceParser = require('vat-number-finder');

/**
 * printElements
 *
 * print the different elements of a vat object
 * depending on the return value or not
 */
function printElements(vats) {
  for (var i = 0; i < vats.length; i++) {
    console.log('\n\x1b[32m', "VAT information for " + vats[i].countryCode + vats[i].vatNumber + '\x1b[0m');
    console.log("\tCountry code: " + vats[i].countryCode + "\n\tVAT code: " + vats[i].vatNumber);

    if (vats[i].requestDate) {
      console.log("\tIs valid ?: " + vats[i].valid);
      if (vats[i].valid) {
        console.log("\tCompany name: " + vats[i].name + "\n\tCompany address: " + vats[i].address);
      }
    }
  }
  console.log("");
}


/**
 * Simple example of a use of vat-number-finder
 */

if (process.argv.length > 2) {
  var filePath = path.join(__dirname, process.argv[2]);
  console.log("file = ", filePath);
  invoiceParser(filePath, true, function(err, res) {
    if (err) {
      console.log(err);
    } else {
      printElements(res);
    }
  });
}
else {
  console.log("\n\tUsage: node example.js <PATH>\n");
}
