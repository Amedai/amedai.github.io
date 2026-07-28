import styles from './Faq.module.scss';
import { useState, useEffect } from 'react';
import api from '../../api';

const FAQ_API_URL = 'api/faq/gonka2026';

function transformFaqFromApi(apiData) {
  const values = apiData?.values?.[0]?.values;
  if (!Array.isArray(values)) return [];
  return values.map((section) => ({
    id: section.id,
    tabName: section.sectionName,
    questions: (section.items || []).map((item, index) => ({
      id: index,
      question: item.question,
      answer: item.answer,
    })),
  }));
}

function Faq() {
  const [faqList, setFaqList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [openItem, setOpenItem] = useState(null);

  useEffect(() => {
    api
      .get(FAQ_API_URL)
      .then((response) => {
        const list = transformFaqFromApi(response.data);
        setFaqList(list);
        setError(null);
      })
      .catch((err) => {
        console.error('Ошибка загрузки FAQ:', err);
        setError(err);
        setFaqList([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleTab = (index) => {
    if (index !== activeTab) {
      setActiveTab(index);
      setOpenItem(null);
    }
  };

  const handleToggle = (index) => {
    setOpenItem(openItem === index ? null : index);
  };

  if (loading) {
    return (
      <section className={styles.faq} id="faq">
        <div className={styles.container}>
          <h2 className={styles.title}>Вопросы и ответы</h2>
          <p className={styles.loading}>Загрузка…</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.faq} id="faq">
        <div className={styles.container}>
          <h2 className={styles.title}>Вопросы и ответы</h2>
          <p className={styles.error}>Не удалось загрузить раздел. Попробуйте позже.</p>
        </div>
      </section>
    );
  }

  if (!faqList.length) {
    return null;
  }

  return (
    <section className={styles.faq} id="faq">
      <div className={styles.container}>
        <h2 className={styles.title}>Вопросы и ответы</h2>

        <div className={styles.tabs}>
          {faqList.map((item) => (
            <button
              key={item.id}
              className={`${styles.tab} ${activeTab === item.id ? styles.tabActive : ''}`}
              onClick={() => handleTab(item.id)}
            >
              {item.tabName}
            </button>
          ))}
        </div>

        <div className={styles.list}>
          {faqList
            .filter((item) => item.id === activeTab)
            .map((item) =>
              item.questions.map((q) => (
                <div
                  key={q.id}
                  className={`${styles.item} ${openItem === q.id ? styles.itemOpen : ''}`}
                >
                  <button
                    className={styles.question}
                    onClick={() => handleToggle(q.id)}
                  >
                    <span>{q.question}</span>
                    <span className={styles.arrow} />
                  </button>
                  <div
                    className={styles.answer}
                    dangerouslySetInnerHTML={{ __html: q.answer }}
                  />
                </div>
              ))
            )}
        </div>
      </div>
    </section>
  );
}

export default Faq;
