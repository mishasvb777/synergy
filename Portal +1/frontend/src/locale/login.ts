export const login = {
  brand: 'Портал+1',
  heroTitle: 'Единая точка доступа к новостям и сервисам',
  heroText:
    'Корпоративный контур сотрудника ГК «Иннотех». Минимальный MVP для учебной демонстрации.',
  techStack: 'React · TypeScript · Node.js',
  title: 'Вход',
  subtitle: 'Используйте корпоративную учётную запись',
  loginLabel: 'Логин',
  passwordLabel: 'Пароль',
  submit: 'Продолжить',
  submitting: 'Вход…',
  demoHint: 'Демо: employee / moderator / admin · Password123!',
  errorFallback: 'Ошибка входа',
  noAccount: 'Нет аккаунта?',
  registerLink: 'Зарегистрироваться',
} as const;

export const register = {
  title: 'Регистрация',
  subtitle: 'Создайте учётную запись сотрудника',
  loginLabel: 'Логин',
  emailLabel: 'Email',
  fullNameLabel: 'ФИО',
  passwordLabel: 'Пароль',
  passwordRepeatLabel: 'Повтор пароля',
  submit: 'Зарегистрироваться',
  submitting: 'Отправка…',
  haveAccount: 'Уже есть аккаунт?',
  loginLink: 'Войти',
  successTitle: 'Проверьте почту',
  successText: 'Мы отправили ссылку для подтверждения на',
  openConfirm: 'Открыть ссылку подтверждения',
  demoMailHint:
    'На учебном стенде письмо пишется в консоль сервера и в таблицу email_outbox. Ссылка также показана ниже.',
  resend: 'Отправить письмо ещё раз',
  passwordMismatch: 'Пароли не совпадают',
  errorFallback: 'Ошибка регистрации',
} as const;

export const confirmEmail = {
  title: 'Подтверждение email',
  loading: 'Проверяем ссылку…',
  success: 'Email подтверждён. Теперь можно войти.',
  already: 'Email уже был подтверждён ранее.',
  errorFallback: 'Не удалось подтвердить email',
  toLogin: 'Перейти ко входу',
} as const;
