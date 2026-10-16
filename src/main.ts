import '@fontsource/fraunces/600.css';
import '@fontsource/fraunces/600-italic.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/600.css';
import 'katex/dist/katex.min.css';
import './style.css';
import { DistributionApp } from './ui/app';

const appRoot = document.querySelector<HTMLDivElement>('#app');
if (appRoot) {
  const app = new DistributionApp(appRoot);
  app.init();
}
