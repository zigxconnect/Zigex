/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-c008c882'], (function (workbox) { 'use strict';

  importScripts();
  self.skipWaiting();
  workbox.clientsClaim();

  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "/_next/build-manifest.json",
    "revision": "001ab71131e4a21158a8517cb06264e7"
  }, {
    "url": "/_next/react-loadable-manifest.json",
    "revision": "ee49746709e0aaf034139c45261d3af4"
  }, {
    "url": "/_next/server/middleware-build-manifest.js",
    "revision": "c1bdb3b6b2ddfa577860930fb73d87de"
  }, {
    "url": "/_next/server/middleware-react-loadable-manifest.js",
    "revision": "2b1d467ac3f71048767efaf03a8e634a"
  }, {
    "url": "/_next/server/next-font-manifest.js",
    "revision": "f7097bf7c93c1cbb4c118491ca6d2b04"
  }, {
    "url": "/_next/server/next-font-manifest.json",
    "revision": "d51420cd4aa5d37d6719849cf36d0d6f"
  }, {
    "url": "/_next/static/chunks/_app-pages-browser_node_modules_next_dist_client_dev_noop-turbopack-hmr_js.js",
    "revision": "80e63b796f69389ce193786a5ad73b8f"
  }, {
    "url": "/_next/static/chunks/app-pages-internals.js",
    "revision": "733ed3a3807aa689e64cc97a021bdff7"
  }, {
    "url": "/_next/static/chunks/app/(auth)/layout.js",
    "revision": "ee0db20c929aa6124067df511589d874"
  }, {
    "url": "/_next/static/chunks/app/(dashboard)/dashboard/page.js",
    "revision": "5db45ce0840f34df6861f7aa2bcaf1fd"
  }, {
    "url": "/_next/static/chunks/app/(dashboard)/feed/layout.js",
    "revision": "ed07f982d4c6590e300b3290a583c545"
  }, {
    "url": "/_next/static/chunks/app/api/auth/login/route.js",
    "revision": "1be0cc4fe73627ee2facf79926e6493a"
  }, {
    "url": "/_next/static/chunks/app/layout.js",
    "revision": "ad86134d98ec453a803ae8864b408faa"
  }, {
    "url": "/_next/static/chunks/polyfills.js",
    "revision": "846118c33b2c0e922d7b3a7676f81f6f"
  }, {
    "url": "/_next/static/chunks/webpack.js",
    "revision": "cdb53ec689ae88cf215064b27bbd6095"
  }, {
    "url": "/_next/static/css/app/layout.css",
    "revision": "d8e32543b10cea2104ca35ef86d3b48e"
  }, {
    "url": "/_next/static/webpack/209049292222e2b2.webpack.hot-update.json",
    "revision": "development"
  }, {
    "url": "/_next/static/webpack/app/layout.209049292222e2b2.hot-update.js",
    "revision": "development"
  }, {
    "url": "/_next/static/webpack/webpack.209049292222e2b2.hot-update.js",
    "revision": "development"
  }], {
    "ignoreURLParametersMatching": [/ts/]
  });
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute("/", new workbox.NetworkFirst({
    "cacheName": "start-url",
    plugins: [{
      cacheWillUpdate: async ({
        request,
        response,
        event,
        state
      }) => {
        if (response && response.type === 'opaqueredirect') {
          return new Response(response.body, {
            status: 200,
            statusText: 'OK',
            headers: response.headers
          });
        }
        return response;
      }
    }]
  }), 'GET');
  workbox.registerRoute(/.*/i, new workbox.NetworkOnly({
    "cacheName": "dev",
    plugins: []
  }), 'GET');

}));
