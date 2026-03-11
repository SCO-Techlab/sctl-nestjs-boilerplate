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
        icon: 'pi pi-home',
        routerLink: '/',
        order: 1
      }
    ],
    order: 1,
    ...DEFAULT_MENU_FRONT
  },
];