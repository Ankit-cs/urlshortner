const FILENAME = 'shrink_links.csv';

/**
 * Searches for the CSV file in the user's Google Drive.
 * @param {string} accessToken - The Google OAuth access token.
 * @returns {Promise<string|null>} The file ID if found, or null.
 */
export async function findCSVFile(accessToken) {
  const query = encodeURIComponent(`name='${FILENAME}' and trashed=false`);
  const response = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&spaces=drive`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to search for file in Google Drive');
  }

  const data = await response.json();
  if (data.files && data.files.length > 0) {
    return data.files[0].id; // Return the first matching file ID
  }
  return null;
}

/**
 * Creates a new CSV file in Google Drive with the standard headers.
 * @param {string} accessToken - The Google OAuth access token.
 * @returns {Promise<string>} The new file ID.
 */
export async function createCSVFile(accessToken) {
  const metadata = {
    name: FILENAME,
    mimeType: 'text/csv',
  };
  const headers = "Short Code,Original URL,Date\n";
  
  // Multipart upload to set metadata and content at the same time
  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: text/csv\r\n\r\n' +
    headers +
    closeDelimiter;

  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartRequestBody,
  });

  if (!response.ok) {
    throw new Error('Failed to create CSV file in Google Drive');
  }

  const data = await response.json();
  return data.id;
}

/**
 * Downloads the current CSV, appends the new row, and uploads the updated content.
 * @param {string} accessToken - The Google OAuth access token.
 * @param {string} fileId - The ID of the CSV file in Google Drive.
 * @param {Object} linkData - { shortCode, originalUrl, date }
 */
export async function appendCSVRow(accessToken, fileId, linkData) {
  // 1. Download current content
  const getResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!getResponse.ok) {
    throw new Error('Failed to download CSV from Google Drive');
  }

  const currentContent = await getResponse.text();

  // 2. Append new row
  // Escape quotes in URLs if necessary
  const escapedUrl = linkData.originalUrl.includes(',') ? `"${linkData.originalUrl}"` : linkData.originalUrl;
  const newRow = `${linkData.shortCode},${escapedUrl},${linkData.date}\n`;
  const updatedContent = currentContent.endsWith('\n') ? currentContent + newRow : currentContent + '\n' + newRow;

  // 3. Upload updated content
  const patchResponse = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'text/csv',
    },
    body: updatedContent,
  });

  if (!patchResponse.ok) {
    throw new Error('Failed to update CSV in Google Drive');
  }
  
  return true;
}

/**
 * Refreshes the Google Access Token using the Cloudflare Worker.
 */
export async function refreshGoogleToken(refreshToken) {
  const apiUrl = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/refresh-token` : '/api/refresh-token';
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken })
  });

  if (!response.ok) {
    throw new Error('Failed to refresh Google token');
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Convenience function to handle the entire backup flow.
 * Now supports automatic background token refreshing!
 */
export async function backupLinkToDrive(session, linkData) {
  let accessToken = session.provider_token;
  
  const attemptBackup = async (token) => {
    let fileId = await findCSVFile(token);
    if (!fileId) {
      fileId = await createCSVFile(token);
    }
    await appendCSVRow(token, fileId, linkData);
  };

  try {
    await attemptBackup(accessToken);
    console.log('Successfully backed up to Google Drive CSV.');
    return true;
  } catch (error) {
    // If we get a 401 Unauthorized, the token probably expired
    if (session.provider_refresh_token && (error.message.includes('401') || error.message.toLowerCase().includes('failed'))) {
      console.log('Google Drive Token expired, attempting silent refresh...');
      try {
        const freshToken = await refreshGoogleToken(session.provider_refresh_token);
        console.log('Got fresh token, retrying backup...');
        await attemptBackup(freshToken);
        console.log('Successfully backed up to Google Drive CSV after refresh.');
        return true;
      } catch (refreshErr) {
        console.error('Silent refresh failed:', refreshErr);
        return false;
      }
    } else {
      console.error('Google Drive Backup Error:', error);
      return false;
    }
  }
}

/**
 * Fetches and parses the CSV from Google Drive into an array of link objects.
 * Useful as a fallback if the main database fails.
 */
export async function fetchLinksFromDrive(accessToken) {
  const fileId = await findCSVFile(accessToken);
  if (!fileId) return [];

  const getResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!getResponse.ok) {
    throw new Error('Failed to download CSV for reading');
  }

  const csvText = await getResponse.text();
  const lines = csvText.split('\n').filter(line => line.trim() !== '');
  
  if (lines.length <= 1) return []; // Just headers or empty

  const links = [];
  // Skip the first line (headers)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    // Simple CSV parser for "Short Code, Original URL, Date"
    // Handle potential quotes around Original URL
    const match = line.match(/^([^,]+),(".*?"|[^,]+),(.*)$/);
    if (match) {
      links.push({
        shortCode: match[1].trim(),
        targetUrl: match[2].replace(/^"|"$/g, '').trim(),
        createdAt: match[3].trim(),
        clicks: 0 // Backup CSV doesn't track live clicks currently
      });
    }
  }

  // Sort newest first
  return links.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
}
