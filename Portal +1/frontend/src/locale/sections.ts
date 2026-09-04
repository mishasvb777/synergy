export const events = {
  title: 'События',
  subtitle: 'Митапы, вебинары и встречи компании',
} as const;

export const activity = {
  title: 'Активность',
  subtitle: 'Лента постов и благодарностей сотрудников',
  compose: 'Написать в ленту',
  write: 'Написать',
  composeTitle: 'Новая публикация',
  more: 'Подробнее',
  publish: 'Опубликовать',
  publishing: 'Публикация…',
  addPhoto: 'Добавить фото',
  removePhoto: 'Убрать фото',
  titleLabel: 'Заголовок',
  bodyLabel: 'Текст',
  typeLabel: 'Тип',
  communityLabel: 'Сообщество',
  noCommunity: 'Без сообщества',
  filtersTitle: 'Фильтры',
  filters: {
    all: 'Вся активность',
    posts: 'Посты',
    articles: 'Статьи',
    thanks: 'Благодарности',
    news: 'Новости',
  },
  myCommunities: 'Мои сообщества',
  myCommunitiesHint: 'Сообщества, на которые вы подписаны. Можно выйти здесь или добавить новые через поиск.',
  findCommunities: 'Поиск сообществ',
  leave: 'Выйти',
  noCommunities: 'Пока нет подписок',
  emptyFeed: 'Пока нет публикаций по выбранному фильтру',
  notFound: 'Публикация не найдена',
  errors: {
    titleShort: 'Заголовок слишком короткий',
    bodyShort: 'Текст слишком короткий (нужно минимум 10 символов)',
    imageType: 'Можно прикрепить только изображение',
    imageSize: 'Размер фото не больше 2.5 МБ',
    saveFailed: 'Не удалось сохранить публикацию',
  },
} as const;

export const knowledge = {
  title: 'База знаний',
  subtitle: 'Инструкции, регламенты и ответы на типовые вопросы',
  updated: 'обновлено',
  openPdf: 'Открыть PDF',
  downloadPdf: 'Скачать',
  pdfHint: 'Документ-заглушка в формате PDF',
} as const;

export const org = {
  title: 'Оргструктура',
  subtitle: 'Подразделения и руководители',
  lead: 'Руководитель',
  people: 'Сотрудников',
} as const;

export const academy = {
  title: 'Цифровая Академия',
  subtitle: 'Обучение и развитие сотрудников',
  heroTitle: 'Учитесь в удобном темпе',
  heroText: 'Курсы по безопасности, сервисам портала и soft skills доступны всем сотрудникам.',
  duration: 'Длительность',
} as const;

export const communities = {
  title: 'Сообщества',
  subtitle: 'Найдите группу и добавьте её в «Мои сообщества» — или выйдите из ненужной',
  members: 'Участников',
  searchPlaceholder: 'Поиск сообществ…',
  join: 'Вступить',
  leave: 'Выйти',
  myCount: (n: number) => `В «Моих сообществах»: ${n}`,
  nothing: 'Ничего не найдено',
} as const;

export const benefits = {
  title: 'Бенефиты',
  subtitle: 'Льготы и компенсации для сотрудников',
  heroTitle: 'Ваш пакет льгот',
  heroText: 'Выберите опции в рамках корпоративной программы и оформите заявку через кадровые сервисы.',
  toHr: 'Перейти в кадровые сервисы',
} as const;

export const workspace = {
  title: 'Мое рабочее пространство',
  subtitle: 'Быстрый доступ к сервисам, которыми вы пользуетесь чаще всего',
} as const;

export const support = {
  title: 'Поддержка портала',
  subtitle: 'Сообщите о проблеме или предложите улучшение',
  contactsTitle: 'Контакты',
  email: 'portal-support@innotech.local',
  hours: 'Пн–Пт · 09:00–18:00 (МСК)',
  topicLabel: 'Тема',
  messageLabel: 'Сообщение',
  messageHint: 'Опишите ситуацию: что делали и что увидели',
  submit: 'Отправить обращение',
  success: 'Обращение принято и передано в ИТ-поддержку. Смотрите раздел «Мои обращения».',
  goToIt: 'Открыть ИТ-поддержку',
  errorShort: 'Опишите проблему подробнее (не меньше 10 символов)',
  topics: {
    access: 'Проблема с доступом',
    bug: 'Ошибка в интерфейсе',
    idea: 'Идея по улучшению',
    other: 'Другое',
  },
} as const;

export const search = {
  title: 'Поиск',
  titleWithQuery: (q: string) => `Поиск: «${q}»`,
  subtitle: 'Результаты по разделам портала и новостям',
  emptyQuery: 'Введите запрос в строке поиска сверху и нажмите Enter',
  found: (n: number) => `Найдено: ${n}`,
  sections: 'Разделы',
  news: 'Новости',
  nothing: 'Ничего не найдено. Попробуйте другое слово.',
} as const;
