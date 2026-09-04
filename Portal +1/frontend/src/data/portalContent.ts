export type PortalLink = {
  title: string;
  path: string;
  kind: 'news' | 'page' | 'service';
  description?: string;
};

export const events = [
  {
    id: 1,
    title: 'Митап домена ИИ: цели 2026',
    summary: 'Обсуждаем обновление командных целей и формат квартальных синхронизаций.',
    when: '27 июля · 18:00',
    place: 'Онлайн · Teams',
    tags: ['Обучение', 'ИИ'],
    cover: '/covers/panda-events.png',
  },
  {
    id: 2,
    title: 'Интенсив по корпоративному порталу',
    summary: 'Практический разбор сервисов Портал+1 для новых сотрудников.',
    when: '29 июля · 11:00',
    place: 'Офис · переговорная А3',
    tags: ['Онбординг'],
    cover: '/covers/panda-office.png',
  },
  {
    id: 3,
    title: 'Киноклуб: летний вайб',
    summary: 'Вечерний просмотр и обсуждение короткометражек от коллег.',
    when: '1 августа · 19:30',
    place: 'Сообщество · Киноклуб',
    tags: ['Сообщества'],
    cover: '/covers/panda-hike.png',
  },
  {
    id: 4,
    title: 'Вебинар Цифровой Академии',
    summary: 'Курс «Эффективная коммуникация в распределённых командах».',
    when: '5 августа · 16:00',
    place: 'Цифровая Академия',
    tags: ['Обучение'],
    cover: '/covers/panda-academy.png',
  },
] as const;

export const activityPosts = [
  {
    id: 1,
    author: 'Александр Широков',
    when: 'около 2 часов назад',
    title: 'Летний вайб-тур в Ижевск',
    body: 'Поделился впечатлениями с выездного митапа команды. Много живых обсуждений, новые знакомства и идеи для внутренних сообществ. Если хотите повторить формат у себя в домене — пишите.',
    community: 'Маркетинг',
  },
  {
    id: 2,
    author: 'Мария Ковалёва',
    when: 'вчера',
    title: 'Благодарность команде поддержки',
    body: 'Отдельное спасибо коллегам из ИТ-поддержки за оперативное восстановление доступа к стенду. Запрос закрыли за 40 минут.',
    community: 'Пароль T1',
  },
  {
    id: 3,
    author: 'Игорь Лебедев',
    when: '2 дня назад',
    title: 'Материалы по охране труда',
    body: 'Выложил чек-лист для удалённых сотрудников в базу знаний. Буду рад правкам и дополнениям.',
    community: 'Охрана труда',
  },
] as const;

export const knowledgeArticles = [
  {
    id: 1,
    title: 'Как оформить отпуск через портал',
    category: 'HR',
    updated: '20 июля 2026',
    file: '/knowledge/vacation.pdf',
    summary: 'Пошаговая инструкция по созданию кадровой заявки на отпуск.',
  },
  {
    id: 2,
    title: 'Подключение к корпоративному VPN',
    category: 'ИТ',
    updated: '18 июля 2026',
    file: '/knowledge/vpn.pdf',
    summary: 'Установка клиента и проверка доступа к внутренним ресурсам.',
  },
  {
    id: 3,
    title: 'Правила публикации новостей',
    category: 'Коммуникации',
    updated: '12 июля 2026',
    file: '/knowledge/news-rules.pdf',
    summary: 'Требования к тексту, согласованию и публикации в ленте.',
  },
  {
    id: 4,
    title: 'Онбординг нового сотрудника',
    category: 'HR',
    updated: '5 июля 2026',
    file: '/knowledge/onboarding.pdf',
    summary: 'Чек-лист первых дней: профиль, сообщества, обучение.',
  },
] as const;

export const orgUnits = [
  { id: 1, name: 'Дирекция цифровых продуктов', lead: 'Е. Смирнова', people: 48 },
  { id: 2, name: 'Платформенные сервисы', lead: 'А. Петров', people: 36 },
  { id: 3, name: 'Кадровый центр', lead: 'Н. Орлова', people: 22 },
  { id: 4, name: 'ИТ-поддержка', lead: 'Д. Волков', people: 31 },
  { id: 5, name: 'Цифровая Академия', lead: 'С. Иванова', people: 14 },
] as const;

export const academyCourses = [
  {
    id: 1,
    title: 'Основы информационной безопасности',
    duration: '2 часа',
    level: 'Обязательный',
  },
  {
    id: 2,
    title: 'Работа с корпоративным порталом',
    duration: '45 минут',
    level: 'Новичок',
  },
  {
    id: 3,
    title: 'Фасилитация командных встреч',
    duration: '3 часа',
    level: 'Продвинутый',
  },
] as const;

export const communities = [
  { id: 1, name: 'Пароль T1', members: 214, topic: 'Безопасность и доступы' },
  { id: 2, name: 'Маркетинг', members: 96, topic: 'Кампании и бренд' },
  { id: 3, name: 'Охрана труда', members: 143, topic: 'Нормы и инструкции' },
  { id: 4, name: 'Киноклуб', members: 58, topic: 'Культура и досуг' },
  { id: 5, name: 'Конгломерат', members: 77, topic: 'Кросс-доменные инициативы' },
] as const;

export const benefits = [
  {
    id: 1,
    title: 'ДМС и телемедицина',
    desc: 'Полис добровольного медицинского страхования и онлайн-консультации.',
  },
  {
    id: 2,
    title: 'Обучение и конференции',
    desc: 'Компенсация курсов и участие во внешних мероприятиях по согласованию.',
  },
  {
    id: 3,
    title: 'Спорт и wellbeing',
    desc: 'Компенсация фитнеса и корпоративные спортивные события.',
  },
  {
    id: 4,
    title: 'Кафетерий льгот',
    desc: 'Выбор дополнительных опций в рамках годового лимита.',
  },
] as const;

export const workspaceLinks = [
  { title: 'Кадровые сервисы', path: '/operations/hr', desc: 'Отпуск, справки, профиль' },
  { title: 'ИТ-поддержка', path: '/operations/it', desc: 'Инциденты и доступы' },
  { title: 'Управление новостями', path: '/news/manage', desc: 'Для модераторов и админов' },
  { title: 'Пользователи и роли', path: '/admin/users', desc: 'Только администратор' },
] as const;

export const searchablePages: PortalLink[] = [
  { title: 'Новости', path: '/', kind: 'page', description: 'Лента корпоративных новостей' },
  { title: 'События', path: '/events', kind: 'page', description: 'Митапы, вебинары и встречи' },
  { title: 'Активность', path: '/activity', kind: 'page', description: 'Лента постов сотрудников' },
  { title: 'База знаний', path: '/knowledge', kind: 'page', description: 'Инструкции и регламенты' },
  { title: 'Оргструктура', path: '/org', kind: 'page', description: 'Подразделения компании' },
  { title: 'Цифровая Академия', path: '/academy', kind: 'page', description: 'Курсы и обучение' },
  { title: 'Сообщества', path: '/communities', kind: 'page', description: 'Группы по интересам' },
  { title: 'Бенефиты', path: '/benefits', kind: 'page', description: 'Льготы и компенсации' },
  { title: 'Сервисы', path: '/operations', kind: 'service', description: 'Операционные разделы портала' },
  { title: 'Кадровые сервисы', path: '/operations/hr', kind: 'service', description: 'HR-заявки' },
  { title: 'ИТ-поддержка', path: '/operations/it', kind: 'service', description: 'ИТ-тикеты' },
  { title: 'Поддержка портала', path: '/support', kind: 'service', description: 'Помощь по работе портала' },
  { title: 'Мое рабочее пространство', path: '/workspace', kind: 'page', description: 'Быстрые ссылки сотрудника' },
];
