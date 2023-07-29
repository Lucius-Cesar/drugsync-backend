const fs = require('fs');
const Papa = require('papaparse');

function mergeFiles(filePaths, outputFilePath) {
  const mergedContent = [];
  header = "DDInterIDA,drugA,DDInterID_B,drugB,severity"
  mergedContent.push(header)

  for (let i = 0; i < filePaths.length; i++) {
    const fileContent = fs.readFileSync(filePaths[i], 'utf8');
    const lines = fileContent.split('\n').slice(1); 
    mergedContent.push(lines.join('\n'));
  }

  const mergedText = mergedContent.join('\n');
  fs.writeFileSync(outputFilePath, mergedText, 'utf8');
  console.log('CSV complete file created');
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


mergeFiles(filesToMerge, 'DDinter.csv');
  