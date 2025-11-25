const path = require("path");

console.log("__dirname:", __dirname);

const rutaArchivoDinamic = function (nameFile) {
  const mypath = path.join(__dirname, "..", "data", nameFile);
  return mypath;
};

module.exports = {
  rutaArchivoDinamic,
  paths: {
    view: path.join(__dirname, "..", "views") 
  }};