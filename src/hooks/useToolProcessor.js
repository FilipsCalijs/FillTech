import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/authContext';

const API_BASE = 'http://localhost:5200/api/tools';

/**
 * Универсальный хук для любого AI-инструмента.
 * @param {string} toolName - название инструмента (watermark-remove, bg-remove, etc.)
 *
 * Использование:
 *   const { file, previewUrl, loading, resultUrl, error, handleFileDrop, handleSubmit } = useToolProcessor('watermark-remove');
 */
export function useToolProcessor(toolName) {
  const { currentUser } = useAuth();
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState(null);
  const [error, setError] = useState(null);

  const handleFileDrop = (files) => {
    const f = files[0];
    if (!f) return;
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setResultUrl(null);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!file) return setError('Please upload an image first.');

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const uid = currentUser?.uid;
      const res = await axios.post(`${API_BASE}/${toolName}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-user-uid': uid,
        },
      });

      setResultUrl(res.data.resultUrl ?? res.data.imageUrl);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreviewUrl(null);
    setResultUrl(null);
    setError(null);
  };

  return { file, previewUrl, loading, resultUrl, error, handleFileDrop, handleSubmit, reset };
}
