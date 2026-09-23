import { DriveFile } from '../types';

/**
 * Lists files from the user's Google Drive.
 */
export async function listDriveFiles(
  accessToken: string,
  filterType: 'all' | 'media' | 'projects' = 'all',
  searchQuery: string = ''
): Promise<DriveFile[]> {
  try {
    let q = 'trashed = false';

    if (filterType === 'media') {
      q += " and (mimeType contains 'image/' or mimeType contains 'video/' or mimeType contains 'audio/')";
    } else if (filterType === 'projects') {
      q += " and (name contains '.motioncraft.json' or name contains '.json')";
    }

    if (searchQuery.trim()) {
      const cleanSearch = searchQuery.trim().replace(/'/g, "\\'");
      q += ` and name contains '${cleanSearch}'`;
    }

    const url = new URL('https://www.googleapis.com/drive/v3/files');
    url.searchParams.set(
      'fields',
      'files(id,name,mimeType,thumbnailLink,webViewLink,webContentLink,size,modifiedTime)'
    );
    url.searchParams.set('orderBy', 'modifiedTime desc');
    url.searchParams.set('pageSize', '30');
    url.searchParams.set('q', q);

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData?.error?.message || `Google Drive error: ${res.statusText}`);
    }

    const data = await res.json();
    return data.files || [];
  } catch (error: any) {
    console.error('Failed to list Drive files:', error);
    throw error;
  }
}

/**
 * Uploads a file (project JSON or exported image/media) directly to Google Drive.
 * Uses the Google Drive v3 multipart upload endpoint.
 */
export async function uploadToDrive(
  accessToken: string,
  fileName: string,
  mimeType: string,
  content: string | Blob
): Promise<DriveFile> {
  try {
    const metadata = {
      name: fileName,
      mimeType: mimeType,
      description: 'Created with MotionCraft Animation & Video Editor',
    };

    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    let payload: Blob | string;

    if (typeof content === 'string') {
      // JSON or text or base64 string
      const multipartRequestBody =
        delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        `Content-Type: ${mimeType}\r\n\r\n` +
        content +
        closeDelimiter;

      payload = multipartRequestBody;
    } else {
      // Blob (e.g. captured image or audio)
      const metadataPart = new Blob(
        [
          delimiter +
            'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
            JSON.stringify(metadata) +
            delimiter +
            `Content-Type: ${mimeType}\r\n\r\n`,
        ],
        { type: 'text/plain' }
      );
      const closePart = new Blob([closeDelimiter], { type: 'text/plain' });
      payload = new Blob([metadataPart, content, closePart]);
    }

    const res = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,webContentLink,modifiedTime',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: payload,
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Failed to upload file to Google Drive: ${res.statusText}`);
    }

    const uploaded = await res.json();
    return uploaded;
  } catch (error: any) {
    console.error('Drive upload error:', error);
    throw error;
  }
}

/**
 * Downloads file content from Google Drive.
 */
export async function downloadDriveFile(
  accessToken: string,
  fileId: string
): Promise<string> {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to download Drive file: ${res.statusText}`);
  }

  return res.text();
}

/**
 * Deletes a file from Google Drive (Mandatory explicit confirmation dialog must be shown beforehand)
 */
export async function deleteDriveFile(
  accessToken: string,
  fileId: string
): Promise<void> {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to delete Drive file: ${res.statusText}`);
  }
}
