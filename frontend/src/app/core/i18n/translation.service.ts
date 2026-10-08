import { Injectable } from '@angular/core';

export type LocaleCode = 'pt' | 'es' | 'en';

export interface LanguageOption {
  code: LocaleCode;
  label: string;
  flag: string;
}

const translations: Record<LocaleCode, Record<string, string>> = {
  pt: {
    'app.portal': 'Portal',
    'app.portalCorporate': 'Portal Corporativo',
    'login.title': 'Portal Corporativo',
    'login.subtitle': 'Autenticação com Datasul',
    'login.environment': 'Ambiente',
    'login.username': 'Usuário',
    'login.usernamePlaceholder': 'Informe o usuário Datasul',
    'login.password': 'Senha',
    'login.passwordPlaceholder': 'Informe a senha Datasul',
    'login.submit': 'Entrar',
    'login.submitting': 'Entrando...',
    'login.errorRequired': 'Usuário e senha são obrigatórios.',
    'login.errorInvalid': 'Usuário ou senha inválidos.',
    'shell.dashboard': 'Dashboard',
    'shell.profile': 'Perfil',
    'shell.administrative': 'Administrativo',
    'shell.commercial': 'Comercial',
    'shell.logistics': 'Logística',
    'shell.financial': 'Financeiro',
    'shell.industrial': 'Industrial',
    'shell.it': 'TI',
    'shell.corporatePortal': 'Portal Corporativo',
    'shell.logout': 'Sair',
    'shell.environment': 'Ambiente',
    'dashboard.overview': 'Visão geral',
    'dashboard.profileLink': 'Meu perfil',
    'dashboard.activeUsers': 'Usuários ativos',
    'dashboard.datasulGroups': 'Grupos Datasul',
    'dashboard.applications': 'Aplicações',
    'dashboard.architectureTitle': 'Arquitetura preparada para crescimento',
    'dashboard.architectureItem1': 'Login autorizado pela identidade do Datasul',
    'dashboard.architectureItem2': 'Menu extensível por área',
    'dashboard.architectureItem3': 'Perfil com usuário e grupos',
    'dashboard.architectureItem4': 'Plataforma base para novas aplicações',
    'profile.title': 'Meu perfil',
    'profile.subtitle': 'Dados do usuário',
    'profile.login': 'Login',
    'profile.name': 'Nome',
    'profile.email': 'E-mail',
    'profile.company': 'Empresa',
    'profile.establishment': 'Estabelecimento',
    'profile.groups': 'Grupos Datasul',
    'profile.empty': 'Nenhuma informação de usuário disponível.',
    'language.pt': 'Português',
    'language.es': 'Español',
    'language.en': 'English'
  },
  es: {
    'app.portal': 'Portal',
    'app.portalCorporate': 'Portal corporativo',
    'login.title': 'Portal corporativo',
    'login.subtitle': 'Autenticación con Datasul',
    'login.environment': 'Ambiente',
    'login.username': 'Usuario',
    'login.usernamePlaceholder': 'Ingrese el usuario Datasul',
    'login.password': 'Contraseña',
    'login.passwordPlaceholder': 'Ingrese la contraseña Datasul',
    'login.submit': 'Ingresar',
    'login.submitting': 'Ingresando...',
    'login.errorRequired': 'El usuario y la contraseña son obligatorios.',
    'login.errorInvalid': 'Usuario o contraseña inválidos.',
    'shell.dashboard': 'Panel',
    'shell.profile': 'Perfil',
    'shell.administrative': 'Administrativo',
    'shell.commercial': 'Comercial',
    'shell.logistics': 'Logística',
    'shell.financial': 'Financiero',
    'shell.industrial': 'Industrial',
    'shell.it': 'TI',
    'shell.corporatePortal': 'Portal corporativo',
    'shell.logout': 'Salir',
    'shell.environment': 'Ambiente',
    'dashboard.overview': 'Resumen',
    'dashboard.profileLink': 'Mi perfil',
    'dashboard.activeUsers': 'Usuarios activos',
    'dashboard.datasulGroups': 'Grupos Datasul',
    'dashboard.applications': 'Aplicaciones',
    'dashboard.architectureTitle': 'Arquitectura preparada para crecer',
    'dashboard.architectureItem1': 'Login autorizado por la identidad de Datasul',
    'dashboard.architectureItem2': 'Menú extensible por área',
    'dashboard.architectureItem3': 'Perfil con usuario y grupos',
    'dashboard.architectureItem4': 'Plataforma base para nuevas aplicaciones',
    'profile.title': 'Mi perfil',
    'profile.subtitle': 'Datos del usuario',
    'profile.login': 'Usuario',
    'profile.name': 'Nombre',
    'profile.email': 'Correo',
    'profile.company': 'Empresa',
    'profile.establishment': 'Establecimiento',
    'profile.groups': 'Grupos Datasul',
    'profile.empty': 'No hay información del usuario disponible.',
    'language.pt': 'Portugués',
    'language.es': 'Español',
    'language.en': 'Inglés'
  },
  en: {
    'app.portal': 'Portal',
    'app.portalCorporate': 'Corporate Portal',
    'login.title': 'Corporate Portal',
    'login.subtitle': 'Datasul authentication',
    'login.environment': 'Environment',
    'login.username': 'User',
    'login.usernamePlaceholder': 'Enter Datasul user',
    'login.password': 'Password',
    'login.passwordPlaceholder': 'Enter Datasul password',
    'login.submit': 'Sign in',
    'login.submitting': 'Signing in...',
    'login.errorRequired': 'User and password are required.',
    'login.errorInvalid': 'Invalid user or password.',
    'shell.dashboard': 'Dashboard',
    'shell.profile': 'Profile',
    'shell.administrative': 'Administrative',
    'shell.commercial': 'Commercial',
    'shell.logistics': 'Logistics',
    'shell.financial': 'Financial',
    'shell.industrial': 'Industrial',
    'shell.it': 'IT',
    'shell.corporatePortal': 'Corporate Portal',
    'shell.logout': 'Sign out',
    'shell.environment': 'Environment',
    'dashboard.overview': 'Overview',
    'dashboard.profileLink': 'My profile',
    'dashboard.activeUsers': 'Active users',
    'dashboard.datasulGroups': 'Datasul groups',
    'dashboard.applications': 'Applications',
    'dashboard.architectureTitle': 'Architecture ready for growth',
    'dashboard.architectureItem1': 'Login authorized by Datasul identity',
    'dashboard.architectureItem2': 'Expandable menu by area',
    'dashboard.architectureItem3': 'Profile with user and groups',
    'dashboard.architectureItem4': 'Base platform for new applications',
    'profile.title': 'My profile',
    'profile.subtitle': 'User data',
    'profile.login': 'Login',
    'profile.name': 'Name',
    'profile.email': 'Email',
    'profile.company': 'Company',
    'profile.establishment': 'Establishment',
    'profile.groups': 'Datasul groups',
    'profile.empty': 'No user information available.',
    'language.pt': 'Português',
    'language.es': 'Español',
    'language.en': 'English'
  }
};

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly storageKey = 'portal-language';
  private locale: LocaleCode = 'pt';

  constructor() {
    const savedLocale = localStorage.getItem(this.storageKey) as LocaleCode | null;
    if (savedLocale && savedLocale in translations) {
      this.locale = savedLocale;
    }
  }

  getLanguageOptions(): LanguageOption[] {
    return [
      { code: 'pt', label: 'Português', flag: '🇧🇷' },
      { code: 'es', label: 'Español', flag: '🇪🇸' },
      { code: 'en', label: 'English', flag: '🇺🇸' }
    ];
  }

  getCurrentLocale(): LocaleCode {
    return this.locale;
  }

  setLanguage(locale: LocaleCode): void {
    this.locale = locale;
    localStorage.setItem(this.storageKey, locale);
  }

  t(key: string): string {
    return translations[this.locale][key] ?? translations.pt[key] ?? key;
  }
}
