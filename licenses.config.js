module.exports = {
  isValidLicense: (license) => {
    const valid = new RegExp(
      "\\b(mit|apache\\b.*2|bsd|isc|unlicense|mpl-2.0|CC-BY-4.0|0BSD)\\b",
      "i"
    );
    return valid.test(license);
  },
};
