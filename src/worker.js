import { analyze } from './science.js';
self.onmessage = ({ data }) => {
  try { self.postMessage({ result: analyze(data.parsed, data.config) }); }
  catch (e) { self.postMessage({ error: e.message }); }
};
