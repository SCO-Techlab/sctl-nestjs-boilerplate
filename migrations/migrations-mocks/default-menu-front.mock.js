const ROLES_MIGRATION = require('./default-roles.mock');

const DEFAULT_MENU_FRONT = {
  createdAt: new Date(),
  updatedAt: new Date(),
  __v: 0
};

const i18n = 'LAYOUT.MENU';

module.exports = [
  {
    label: `${i18n}.HOME.LABEL`,
    items: [
      {
        label: `${i18n}.HOME.ITEMS.DASHBOARD`,
        icon: 'pi pi-chart-bar',
        routerLink: '/',
        order: 1
      }
    ],
    order: 1,
    ...DEFAULT_MENU_FRONT
  },
  {
    label: `PAGES.SEPARATOR`,
    separator: true,
    order: 2,
    ...DEFAULT_MENU_FRONT
  },
  {
    label: `${i18n}.PAGES.LABEL`,
    items: [
      {
        label: `${i18n}.PAGES.ITEMS.DEFAULT-PAGE`,
        icon: 'pi pi-file',
        routerLink: '/pages/default-page',
        order: 1
      }
    ],
    order: 3,
    ...DEFAULT_MENU_FRONT
  },
  {
    label: `ADMINISTRATOR.SEPARATOR`,
    separator: true,
    order: 4,
    roles: [ROLES_MIGRATION.find(role => role.name === 'SUPERADMIN').name, ROLES_MIGRATION.find(role => role.name === 'ADMIN').name],
    ...DEFAULT_MENU_FRONT
  },
  {
    label: `${i18n}.ADMINISTRATOR.LABEL`,
    items: [
      {
        label: `${i18n}.ADMINISTRATOR.ITEMS.USERS`,
        icon: 'pi pi-users',
        routerLink: '/administrator/users',
        order: 1,
        roles: [
          'superadmin',
          'admin'
        ]
      }
    ],
    roles: [ROLES_MIGRATION.find(role => role.name === 'SUPERADMIN').name, ROLES_MIGRATION.find(role => role.name === 'ADMIN').name],
    order: 5,
    ...DEFAULT_MENU_FRONT
  },
  {
    label: `SUPERADMINISTRATOR.SEPARATOR`,
    separator: true,
    order: 6,
    roles: [ROLES_MIGRATION.find(role => role.name === 'SUPERADMIN').name],
    ...DEFAULT_MENU_FRONT
  },
  {
    label: `${i18n}.SUPERADMINISTRATOR.LABEL`,
    items: [
      {
        label: `${i18n}.SUPERADMINISTRATOR.ITEMS.MENU-FRONT`,
        icon: 'pi pi-book',
        routerLink: '/administrator/menu-front',
        order: 1,
        roles: [
          'superadmin'
        ]
      },
      {
        label: `${i18n}.SUPERADMINISTRATOR.ITEMS.PERMISSIONS`,
        icon: 'pi pi-users',
        routerLink: '/administrator/permissions',
        order: 2,
        roles: [
          'superadmin'
        ]
      },
      {
        label: `${i18n}.SUPERADMINISTRATOR.ITEMS.ROLES`,
        icon: 'pi pi-users',
        routerLink: '/administrator/roles',
        order: 3,
        roles: [
          'superadmin'
        ]
      },
      {
        label: 'LAYOUT.MENU.SUPERADMINISTRATOR.ITEMS.SESSIONS',
        icon: 'pi pi-clock',
        routerLink: '/administrator/sessions',
        order: 4,
        roles: [
          'superadmin'
        ]
      }
    ],
    roles: [ROLES_MIGRATION.find(role => role.name === 'SUPERADMIN').name],
    order: 7,
    ...DEFAULT_MENU_FRONT
  },
];