export const operations = {
  title: 'Операции',
  subtitle: 'Разделы доступны в соответствии с вашей ролью',
  items: {
    hr: {
      title: 'Кадровые сервисы',
      desc: 'Отпуск, справки, профиль',
      path: '/operations/hr',
    },
    it: {
      title: 'ИТ-поддержка',
      desc: 'Инциденты и типовые запросы',
      path: '/operations/it',
    },
    news: {
      title: 'Новости',
      desc: 'Корпоративная лента',
      path: '/',
    },
  },
} as const;
