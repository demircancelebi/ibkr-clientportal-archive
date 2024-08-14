const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const https = require('https');
const crypto = require('crypto');

const ZIP_URL = 'https://download2.interactivebrokers.com/portal/clientportal.gw.zip';
const CLIENTPORTAL_DIR = path.join(__dirname, '..', 'clientportal');
const LATEST_DIR = path.join(CLIENTPORTAL_DIR, 'latest');
const VERSIONS_DIR = path.join(CLIENTPORTAL_DIR, 'versions');
const CHECKSUMS_FILE = path.join(CLIENTPORTAL_DIR, 'checksums.json');

async function downloadFile(url, destinationPath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download file: ${response.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(destinationPath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

async function calculateSHA256(filePath) {
  const fileBuffer = await fsPromises.readFile(filePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

async function updateChecksums(newChecksum) {
  let checksums;
  try {
    const data = await fsPromises.readFile(CHECKSUMS_FILE, 'utf8');
    checksums = JSON.parse(data);
  } catch (error) {
    checksums = { latest: null, versions: [] };
  }

  const now = new Date().toISOString();
  const versionDir = now.replace(/[-:]/g, '').split('.')[0];
  const versionPath = path.join('versions', versionDir, 'clientportal.gw.zip');

  checksums.versions.unshift({
    sha256: newChecksum,
    date: now,
    path: versionPath
  });

  checksums.latest = {
    sha256: newChecksum,
    date: now
  };

  await fsPromises.writeFile(CHECKSUMS_FILE, JSON.stringify(checksums, null, 2));
  return versionDir;
}

async function main() {
  try {
    // Ensure directories exist
    await fsPromises.mkdir(LATEST_DIR, { recursive: true });
    await fsPromises.mkdir(VERSIONS_DIR, { recursive: true });

    const tempFilePath = path.join(LATEST_DIR, 'temp_clientportal.gw.zip');
    await downloadFile(ZIP_URL, tempFilePath);

    const newChecksum = await calculateSHA256(tempFilePath);

    let checksums;
    try {
      const data = await fsPromises.readFile(CHECKSUMS_FILE, 'utf8');
      checksums = JSON.parse(data);
    } catch (error) {
      checksums = { latest: null, versions: [] };
    }

    if (!checksums.latest || newChecksum !== checksums.latest.sha256) {
      console.log('New version detected. Updating repository...');

      const versionDir = await updateChecksums(newChecksum);
      const newVersionDir = path.join(VERSIONS_DIR, versionDir);
      await fsPromises.mkdir(newVersionDir, { recursive: true });

      await fsPromises.rename(tempFilePath, path.join(LATEST_DIR, 'clientportal.gw.zip'));
      await fsPromises.copyFile(path.join(LATEST_DIR, 'clientportal.gw.zip'), path.join(newVersionDir, 'clientportal.gw.zip'));

      console.log('Repository updated successfully.');
    } else {
      console.log('No new version detected.');
      await fsPromises.unlink(tempFilePath);
    }
  } catch (error) {
    console.error('An error occurred:', error);
    process.exit(1);
  }
}

main();