import { createApp, onUnmounted } from 'vue'
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';

// options为组件的props
export const openDrawer = function (component, options) {
  console.log(options);

  let el = document.createElement('div')
  el.setAttribute('id', 'component')
  options['close'] = () => {
    console.log('closed');
    document.body.removeChild(el)
  }

  document.body.appendChild(el)
  const app = createApp(component, options)
  app.use(Antd);
  app.mount(el)
}
