import axios from 'axios';
import { API_BASE_URL } from '../config/api';

export async function uploadToGoogleDrive(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    interface UploadResponse {
      url: string;
    }

    const response = await axios.post<UploadResponse>(`${API_BASE_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.status === 200 && response.data.url) {
      return response.data.url;
    } else {
      throw new Error('Falha ao fazer upload do arquivo');
    }
  } catch (error) {
    console.error('Erro ao fazer upload do arquivo para o Google Drive:', error);
    throw error;
  }
}

