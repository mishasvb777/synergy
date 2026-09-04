import { common } from './common';
import { appShell } from './appShell';
import { confirmEmail, login, register } from './login';
import { feed } from './feed';
import { newsDetail } from './newsDetail';
import { operations } from './operations';
import { hr } from './hr';
import { it } from './it';
import { newsManage } from './newsManage';
import { admin } from './admin';
import { forbidden } from './forbidden';
import {
  academy,
  activity,
  benefits,
  communities,
  events,
  knowledge,
  org,
  search,
  support,
  workspace,
} from './sections';

export const locale = {
  common,
  appShell,
  login,
  register,
  confirmEmail,
  feed,
  newsDetail,
  operations,
  hr,
  it,
  newsManage,
  admin,
  forbidden,
  events,
  activity,
  knowledge,
  org,
  academy,
  communities,
  benefits,
  workspace,
  support,
  search,
} as const;

export type Locale = typeof locale;
