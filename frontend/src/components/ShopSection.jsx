import { useEffect, useState } from 'react';
import Modal from './Modal.jsx';
import {
  fetchShop,
  fetchProduct,
  createShopItem,
  updateShopItem,
  deleteShopItem,
} from '../api.js';

export default function ShopSection({ isModerator, token }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailId, setDetailId] = useState(null);
  const [detailItem, setDetailItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: '', sku: '', description: '', sizes: '', price: '' });
  const [files, setFiles] = useState([]);

  useEffect(() => {
    loadShop();
  }, []);

  const loadShop = async () => {
    setLoading(true);
    try {
      const data = await fetchShop();
      setItems(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openDetail = async (id) => {
    setDetailId(id);
    try {
      const item = await fetchProduct(id);
      setDetailItem(item);
    } catch (error) {
      console.error(error);
    }
  };

  const openForm = (item) => {
    if (item) {
      setEditMode(true);
      setFormData({
        name: item.name || '',
        sku: item.sku || '',
        description: item.description || '',
        sizes: item.sizes || '',
        price: item.price || '',
      });
      setDetailId(item.id);
    } else {
      setEditMode(false);
      setFormData({ name: '', sku: '', description: '', sizes: '', price: '' });
      setDetailId(null);
    }
    setFiles([]);
    setModalOpen(true);
  };

  const saveItem = async () => {
    try {
      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('sku', formData.sku);
      payload.append('description', formData.description);
      payload.append('sizes', formData.sizes);
      payload.append('price', formData.price);
      files.forEach((file) => payload.append('images', file));

      if (editMode && detailId) {
        await updateShopItem(detailId, payload, token);
      } else {
        await createShopItem(payload, token);
      }
      setModalOpen(false);
      loadShop();
    } catch (error) {
      console.error(error);
      alert('Не удалось сохранить товар');
    }
  };

  const removeItem = async (id) => {
    if (!window.confirm('Удалить товар?')) return;
    try {
      await deleteShopItem(id, token);
      setDetailId(null);
      setDetailItem(null);
      loadShop();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <section className="section-page">
      <div className="section-header">
        <div>Магазин экипировки</div>
        {isModerator && (
          <button className="header-button" onClick={() => openForm(null)}>
            +
          </button>
        )}
      </div>

      {loading ? (
        <div className="placeholder">Загрузка...</div>
      ) : (
        <div className="grid-shop">
          {items.map((item) => (
            <button key={item.id} className="shop-card" onClick={() => openDetail(item.id)}>
              <div className="shop-card-title">{item.name}</div>
              {item.images && item.images.length > 0 ? (
                <img src={item.images[0]} alt={item.name} className="shop-card-image" />
              ) : (
                <div className="shop-card-placeholder">Нет фото</div>
              )}
              <div className="shop-card-price">{item.price} ₽</div>
            </button>
          ))}
          {items.length === 0 && <div className="placeholder">Товары не найдены.</div>}
        </div>
      )}

      {detailItem && (
        <Modal title={detailItem.name} onClose={() => setDetailItem(null)}>
          <div className="shop-detail">
            <div className="shop-sku">Артикул: #{detailItem.sku}</div>
            <div className="shop-gallery">
              {(detailItem.images || []).map((src, index) => (
                <img key={index} src={src} alt={`Товар ${index + 1}`} />
              ))}
            </div>
            <div className="shop-description">{detailItem.description}</div>
            <div>Размеры: {detailItem.sizes}</div>
            <div className="shop-price">{detailItem.price} ₽</div>
            <button className="primary-button">Купить</button>
            {isModerator && (
              <div className="shop-controls">
                <button className="secondary-button" onClick={() => openForm(detailItem)}>
                  Редактировать
                </button>
                <button className="secondary-button" onClick={() => removeItem(detailItem.id)}>
                  Удалить
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {modalOpen && (
        <Modal title={editMode ? 'Редактирование товара' : 'Добавить товар'} onClose={() => setModalOpen(false)}>
          <label>
            Название
            <input value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} />
          </label>
          <label>
            Артикул
            <input value={formData.sku} onChange={(event) => setFormData({ ...formData, sku: event.target.value })} />
          </label>
          <label>
            Размеры
            <input value={formData.sizes} onChange={(event) => setFormData({ ...formData, sizes: event.target.value })} />
          </label>
          <label>
            Описание
            <textarea
              value={formData.description}
              onChange={(event) => setFormData({ ...formData, description: event.target.value })}
              rows="4"
            />
          </label>
          <label>
            Цена
            <input
              type="number"
              value={formData.price}
              onChange={(event) => setFormData({ ...formData, price: event.target.value })}
            />
          </label>
          <label>
            Фото товара
            <input type="file" multiple accept="image/*" onChange={(event) => setFiles(Array.from(event.target.files))} />
          </label>
          <button className="primary-button" onClick={saveItem}>
            Подтвердить
          </button>
        </Modal>
      )}
    </section>
  );
}
