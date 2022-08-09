const routes = [
  {
    path: '/',
    component: '@/pages/home/index',
    layout: {
      hideMenu: true,
      hideNav: true,
      hideFooter: true,
    },
    hideInMenu: true,
  },
  {
    path: '/mindMap',
    component: '@/pages/mind/index',
    layout: {
      hideMenu: true,
      hideNav: true,
      hideFooter: true,
    },
    hideInMenu: true,
  },
];
export default routes;