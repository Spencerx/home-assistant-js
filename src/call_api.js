import Flux from './flux';
import { getters as authGetters } from './modules/auth';

let callApi = function callApi(method, path, parameters=null) {
  const authInfo = Flux.evaluate(authGetters.authInfo);

  const url = `${authInfo.host}/api/${path}`;

  return new Promise(function apiResponse(resolve, reject) {
    const req = new XMLHttpRequest();
    req.open(method, url, true);
    req.setRequestHeader('X-HA-access', authInfo.authToken);

    req.onload = () => {
      if (req.status > 199 && req.status < 300) {
        resolve(JSON.parse(req.responseText));
      } else {
        // see if we got an error back.
        try {
          reject(JSON.parse(req.responseText));
        } catch (err) {
          reject({});
        }
      }
    };

    req.onerror = () => reject({});

    if (parameters) {
      req.send(JSON.stringify(parameters));
    } else {
      req.send();
    }
  });
};

// To make React Native happy
if (typeof __DEMO__ === 'boolean' && __DEMO__) {
  callApi = function demoCallAPI(method, path) {
    return new Promise(function demoAPIResponse(resolve, reject) {

      if (method !== 'GET') {
        throw 'URL not implemented in demo mode: /api/' + path;
      }

      // strip off url arguments:
      if (path.indexOf('?') !== -1) {
        path = path.substr(0, path.indexOf('?'));
      }

      switch (path) {
        case '':
          resolve();
          break;
        case 'components':
          resolve(require('./demo/component_data.js'));
          break;
        case 'services':
          resolve(require('./demo/service_data.js'));
          break;
        case 'events':
          resolve(require('./demo/event_data.js'));
          break;
        case 'states':
          resolve(require('./demo/state_data.js'));
          break;
        case 'history/period':
          resolve(require('./demo/state_history_data.js'));
          break;
        case 'logbook':
          resolve(require('./demo/logbook_data.js'));
          break;
        default:
          throw `URL not implemented in demo mode /api/${path}`;
      }

    });
  };
}

export default callApi;
