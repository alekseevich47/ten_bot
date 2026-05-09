import { useEffect, useState } from 'react';
import Modal from './Modal.jsx';
import { fetchFeed, createFeedPost, addFeedComment, addFeedReaction } from '../api.js';

const initialPost = { content: '', videoUrl: '', attachments: [] };

export default function FeedSection({ isModerator, token }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [newPost, setNewPost] = useState(initialPost);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    setLoading(true);
    try {
      const data = await fetchFeed();
      setPosts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const submitPost = async () => {
    try {
      const formData = new FormData();
      formData.append('content', newPost.content);
      formData.append('videoUrl', newPost.videoUrl);
      newPost.attachments.forEach((file) => formData.append('attachments', file));
      await createFeedPost(formData, token);
      setModalOpen(false);
      setNewPost(initialPost);
      loadFeed();
    } catch (error) {
      console.error(error);
      alert('Не удалось добавить пост');
    }
  };

  const submitComment = async (postId) => {
    if (!commentText.trim()) return;
    try {
      await addFeedComment(postId, { author: 'Пользователь', message: commentText });
      setCommentText('');
      loadFeed();
    } catch (error) {
      console.error(error);
    }
  };

  const react = async (postId, type) => {
    try {
      await addFeedReaction(postId, type);
      loadFeed();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <section className="section-page">
      <div className="section-header">
        <div>Лента новостей</div>
        {isModerator && (
          <button className="header-button" onClick={() => setModalOpen(true)}>
            +
          </button>
        )}
      </div>

      {loading ? (
        <div className="placeholder">Загрузка...</div>
      ) : (
        <div className="feed-list">
          {posts.map((post) => {
            const attachments = Array.isArray(post.attachments) ? post.attachments : [];
            const reactions = typeof post.reactions === 'object' && post.reactions ? post.reactions : {};
            const comments = Array.isArray(post.comments) ? post.comments : [];
            return (
              <article key={post.id} className="feed-card">
                <div className="feed-card-text">{post.content}</div>
                {post.videoUrl && (
                  <div className="feed-video">
                    <a href={post.videoUrl} target="_blank" rel="noreferrer">
                      Смотреть видео
                    </a>
                  </div>
                )}
                <div className="feed-images-grid">
                  {attachments.slice(0, 4).map((src, index) => (
                    <img key={`${post.id}-${index}`} src={src} alt="Публикация" />
                  ))}
                </div>
                <div className="feed-footer">
                  <div className="reaction-bar">
                    <button onClick={() => react(post.id, 'like')}>👍 {reactions.like || 0}</button>
                    <button onClick={() => react(post.id, 'love')}>❤️ {reactions.love || 0}</button>
                    <button onClick={() => react(post.id, 'fire')}>🔥 {reactions.fire || 0}</button>
                  </div>
                  <div>{comments.length} комментариев</div>
                </div>
                <div className="comment-row">
                  <input
                    value={commentText}
                    onChange={(event) => setCommentText(event.target.value)}
                    placeholder="Оставить комментарий"
                  />
                  <button onClick={() => submitComment(post.id)}>Отправить</button>
                </div>
              </article>
            );
          })}
          {posts.length === 0 && <div className="placeholder">Постов пока нет.</div>}
        </div>
      )}

      {modalOpen && (
        <Modal title="Добавить пост" onClose={() => setModalOpen(false)}>
          <label>
            Текст поста
            <textarea
              value={newPost.content}
              onChange={(event) => setNewPost({ ...newPost, content: event.target.value })}
              rows="4"
            />
          </label>
          <label>
            Ссылка на видео (опционально)
            <input
              value={newPost.videoUrl}
              onChange={(event) => setNewPost({ ...newPost, videoUrl: event.target.value })}
              placeholder="https://"
            />
          </label>
          <label>
            Фото / видео
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={(event) => setNewPost({ ...newPost, attachments: Array.from(event.target.files) })}
            />
          </label>
          <button className="primary-button" onClick={submitPost}>
            Опубликовать
          </button>
        </Modal>
      )}
    </section>
  );
}
