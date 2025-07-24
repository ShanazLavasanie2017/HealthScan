import {
  initSentry,
  createPreloadDisplay,
  ensureBrowserCompatibility,
  ensureCameraAccess,
} from "./util/index.mjs";
import CreateShenaiSDK from "./shenai_sdk.mjs";
import { _initEnums } from "./enums/init.js";

initSentry();
createPreloadDisplay("mxcanvas");

async function CheckBrowserAndCreateShenaiSDK(...args) {
  ensureBrowserCompatibility();
  await ensureCameraAccess();
  const sdk = await CreateShenaiSDK(...args);
  _initEnums(sdk);
  return sdk;
}

export { createPreloadDisplay };
export * from "./enums/index.js";

export default CheckBrowserAndCreateShenaiSDK;
