const fs = require('fs');
const Papa = require('papaparse');

function csvToJsonAndReformat(csvFile, fileName) {
  Papa.parse(csvFile, {
    header: true,
    complete: function(results) {

      results.data.forEach((row) => {

        row.DDinterDrugs = [row.drugA, row.drugB];

        delete row.drugA;
        delete row.drugB;
        delete row.DDInterID_A
        delete row.DDInterID_B

      });

      const jsonData = JSON.stringify(results.data, null, 2);
      fs.writeFileSync(fileName, jsonData, 'utf8');

    }
  });
}

function mergeFiles(filePaths,) {
  const mergedContent = [];
  header = "DDInterID_A,drugA,DDInterID_B,drugB,severity"
  mergedContent.push(header)

  for (let i = 0; i < filePaths.length; i++) {
    const fileContent = fs.readFileSync(filePaths[i], 'utf8');
    const lines = fileContent.split('\n').slice(1); 
    mergedContent.push(lines.join('\n'));
  }

  const mergedText = mergedContent.join('\n');
  return(mergedText)
}

const filesToMerge = [
    './DDinter_csv_files/ddinter_downloads_code_A.csv',
    './DDinter_csv_files/ddinter_downloads_code_B.csv',
    './DDinter_csv_files/ddinter_downloads_code_D.csv',
    './DDinter_csv_files/ddinter_downloads_code_H.csv',
    './DDinter_csv_files/ddinter_downloads_code_L.csv',
    './DDinter_csv_files/ddinter_downloads_code_P.csv',
    './DDinter_csv_files/ddinter_downloads_code_R.csv',
    './DDinter_csv_files/ddinter_downloads_code_V.csv'
  ];


const csvFile = mergeFiles(filesToMerge);
csvToJsonAndReformat(csvFile, "DDinter.json")