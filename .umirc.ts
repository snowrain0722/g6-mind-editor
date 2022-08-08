import { defineConfig } from 'umi';
import routes from './config/routes';
import layout from './config/layout';

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  routes,
  layout,
  fastRefresh: {},
  sass: {}
});
