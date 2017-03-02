var Extract = require('pdf-text-extract');
var Validate = require('validate-vat');
var Promise = require('bluebird');

/**
 * Promisify the validate-vat function to be able to wait for each validation
 */
var checkVatValidation = Promise.promisify(Validate);

/**
 * This array contains all the regexps needed to detect
 * a VAT number alike
 *
 * The FIND_VAT_REGEXP is a regexp generated from this array
 */
const regs = [
  "ATU[0-9]{8}|",
  "BE0[0-9]{9}|",
  "BG[0-9]{9,10}|",
  "CY[0-9]{8}L|",
  "CZ[0-9]{8,10}|",
  "DE[0-9]{9}|",
  "DK[0-9]{8}|",
  "EE[0-9]{9}|",
  "(EL|GR)[0-9]{9}|",
  "ES[0-9A-Z][0-9]{7}[0-9A-Z]|",
  "FI[0-9]{8}|",
  "FR[0-9A-Z]{2}[0-9]{9}|",
  "GB([0-9]{9}([0-9]{3})?|[A-Z]{2}[0-9]{3})|",
  "HU[0-9]{8}|",
  "IE[0-9]S[0-9]{5}L|",
  "IE[0-9]{7}[A-Z]|",
  "IE[0-9]{7}[A-Z]{2}|",
  "IT[0-9]{11}|",
  "LT([0-9]{9}|[0-9]{12})|",
  "LU[0-9]{8}|",
  "LV[0-9]{11}|",
  "MT[0-9]{8}|",
  "NL[0-9]{9}B[0-9]{2}|",
  "PL[0-9]{10}|",
  "PT[0-9]{9}|",
  "RO[0-9]{2,10}|",
  "SE[0-9]{12}|",
  "SI[0-9]{8}|",
  "SK[0-9]{10}"
];
const FIND_VAT_REGEXP = new RegExp(regs.join(''), 'ig');


/**
 * getVat
 * (util) Get the VAT number of a string formatted like :
 * XX99999...
 */
function getVat(input) {
  if (input !== null && input !== undefined && typeof input === 'string') {
    return input.substr(2);
  }
  return null;
}


/**
 * getCountryCode
 * (util) Get the country code of a string formatted like :
 * XX99999...
 */
function getCountryCode(input) {
  if (input !== null && input !== undefined && typeof input === 'string') {
    return input.substr(0, 2);
  }
  return null;
}


/**
 * findVatInString
 * find, using regular expressions, any
 * European VAT full code in a string
 *
 * every "found" element is an array,
 * containing the full vat code as a first value
 */
function findVatInString(str, callback) {
  var vats = [];

  while (found = FIND_VAT_REGEXP.exec(str)) {
    var base    = found[0]
    var country = getCountryCode(base);
    var code    = getVat(base);

    if (country && code) {
      vats.push({countryCode: country, vatNumber: code});
    }
  }
  return vats;
}


/**
 * parseAllThePages
 * -> applies findVatInString for every page
 *
 * the regex [^a-zA-Z0-9] allows to replace
 * every char that isn't a letter or number
 * by nothing
 */
function parseAllThePages(pages) {
  var final = [];

  for (var i = 0; i < pages.length; i++) {
    var res = findVatInString(pages[i].replace(/[^a-zA-Z0-9]/g, ''));
    if (res) {
      final = final.concat(res);
    }
  }
  return final;
}


/**
 * verifyVatNumbers
 *
 * this function is a generator
 * it helps calling the check multiple times
 * and fire the "then" function once all
 * the checks are done.
 *
 * it is transformed using Promise.coroutine to avoid
 * calling this generator multiple times until its end
 */
function* verifyVatNumbers(numbers) {
  var results = [];

  for (var i = 0; i < numbers.length; i++) {
    results.push(yield checkVatValidation(numbers[i].countryCode, numbers[i].vatNumber));
  }
  return results;
}

verifyVatNumbers = Promise.coroutine(verifyVatNumbers);



/**
 * Main function
 *
 *
 * Parameters:
 * - path (string)    = the absolute path of the file
 * - verify (boolean) = if true (recommended), VAT check before return
 * - callback         = the callback function
 */
module.exports = function(path, verify, callback) {
  Extract(path, function(err, pages) {
    if (err) {
      var errorStr = "An error occured while opening the file : " + err;
      callback(errorStr, null);
    }
    else if (verify) {
      /**
       * If the verify is true, call the verifyVatNumbers generator
       * and then do the callback
       */
      verifyVatNumbers(parseAllThePages(pages)).then(function(result) {
        callback(null, result);
      })
      .catch(function(error) {
        callback(error, null);
      });
    }
    else {
      /**
       * else, just return the elements found
       */
      callback(null, parseAllThePages(pages));
    }
  });
}
