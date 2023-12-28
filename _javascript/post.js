import { basic, initSidebar, initTopbar } from './modules/layouts';
import {
  loadImg,
  imgPopup,
  initLocaleDatetime,
  initClipboard,
  toc,
  highlightLines,
  runCpp,
  runJavascript,
  runPython,
  runRust
} from './modules/plugins';

initSidebar();
initTopbar();
loadImg();
imgPopup();
initLocaleDatetime();
initClipboard();
toc();
basic();
highlightLines();
runCpp();
runJavascript();
runPython();
runRust();
