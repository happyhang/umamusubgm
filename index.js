const sqlite3 = require('better-sqlite3');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');

const gamePath = `${process.env.APPDATA}/../LocalLow/Cygames/umamusume`;
const gameMetaDbPath = path.join(gamePath, 'meta'); 
const gameDataPath = path.join(gamePath, 'dat'); 
const outputPath = (process.argv.length && process.argv[2]) || '';

if (!fs.existsSync(outputPath)) {
  throw new Error(chalk.red('Output path does not exist!'));
}

const outputStats = fs.lstatSync(outputPath);
if (!outputStats.isDirectory()) {
  throw new Error(chalk.red('Output path is not a directory. You must specify a directory for output.'));
}

console.log(chalk.yellowBright('G1 Arima Kinen - Turf 2500m, Starts!'));

const db = sqlite3(gameMetaDbPath, { readonly: true });

const bgmList = db.prepare(`SELECT n, h
  FROM a
  WHERE m = 'sound'
  AND n LIKE 'sound/b/%.awb'`)
  .all();

db.close();

console.log(chalk.cyan(`Found ${bgmList.length} BGMs.`));

// n = BGM Path, h = Hash (File stored in OS)
bgmList.forEach(({ n, h }) => {
  const bgmName = n.substring(n.lastIndexOf('/'));
  const hashFolder = h.substring(0, 2);
  const bgmPath = path.join(gameDataPath, hashFolder, h);
  const outputFile = path.join(outputPath, bgmName);

  if (fs.existsSync(outputFile)) {
    console.log(`${bgmName} already exists. Skipping...`);
  } else {
    fs.copyFileSync(bgmPath, outputFile);
    console.log(`${bgmName} copied.`);
  }
});

console.log(chalk.green('1st Place! Enjoy your victory!'));
