import { useEffect, useState } from 'react';
import Modal from './Modal.jsx';
import { fetchGallery, uploadGalleryPhoto } from '../api.js';

export default function GallerySection({ isModerator, token }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [photoModal, setPhotoModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState(null);

  useEffect(() => {
    loadGallery();
  }, []);

  const loadGallery = async () => {
    setLoading(true);
    try {
      const data = await fetchGallery();
      setPhotos(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const submitPhoto = async () => {
    if (!file) {
      alert('Выберите фото');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('caption', caption);
      formData.append('photo', file);
      await uploadGalleryPhoto(formData, token);
      setCaption('');
      setFile(null);
      setPhotoModal(false);
      loadGallery();
    } catch (error) {
      console.error(error);
      alert('Не удалось загрузить фото');
    }
  };

  return (
    <section className="section-page">
      <div className="section-header">
        <div>Галерея</div>
        {isModerator && (
          <button className="header-button" onClick={() => setPhotoModal(true)}>
            +
          </button>
        )}
      </div>

      {loading ? (
        <div className="placeholder">Загрузка...</div>
      ) : (
        <div className="gallery-grid">
          {photos.map((photo) => (
            <button key={photo.id} className="gallery-card" onClick={() => setSelectedPhoto(photo)}>
              {photo.photo && photo.photo.length > 0 ? (
                <img src={photo.photo[0]} alt={photo.caption || 'Фотография'} />
              ) : (
                <div className="gallery-placeholder">Нет фото</div>
              )}
            </button>
          ))}
          {photos.length === 0 && <div className="placeholder">Галерея пока пуста.</div>}
        </div>
      )}

      {selectedPhoto && (
        <Modal title="Фотография" onClose={() => setSelectedPhoto(null)}>
          <img className="gallery-fullimage" src={selectedPhoto.photo[0]} alt={selectedPhoto.caption || 'Фото'} />
          <div className="gallery-caption">{selectedPhoto.caption}</div>
        </Modal>
      )}

      {photoModal && (
        <Modal title="Добавить фото" onClose={() => setPhotoModal(false)}>
          <label>
            Подпись
            <input value={caption} onChange={(event) => setCaption(event.target.value)} />
          </label>
          <label>
            Фото
            <input type="file" accept="image/*" onChange={(event) => setFile(event.target.files[0])} />
          </label>
          <button className="primary-button" onClick={submitPhoto}>
            Добавить
          </button>
        </Modal>
      )}
    </section>
  );
}
