var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { gsap, CustomEase, CustomWiggle, Physics2DPlugin } from "/scripts/greensock/esm/all.js";
const crowdgoeswild = "";
const id = "crowdgoeswild";
function resolveUrl(url, baseUrl) {
  if (url.match(/^[a-z]+:\/\//i)) {
    return url;
  }
  if (url.match(/^\/\//)) {
    return window.location.protocol + url;
  }
  if (url.match(/^[a-z]+:/i)) {
    return url;
  }
  const doc = document.implementation.createHTMLDocument();
  const base = doc.createElement("base");
  const a = doc.createElement("a");
  doc.head.appendChild(base);
  doc.body.appendChild(a);
  if (baseUrl) {
    base.href = baseUrl;
  }
  a.href = url;
  return a.href;
}
const uuid = (() => {
  let counter = 0;
  const random = () => (
    // eslint-disable-next-line no-bitwise
    `0000${(Math.random() * 36 ** 4 << 0).toString(36)}`.slice(-4)
  );
  return () => {
    counter += 1;
    return `u${random()}${counter}`;
  };
})();
function toArray(arrayLike) {
  const arr = [];
  for (let i = 0, l = arrayLike.length; i < l; i++) {
    arr.push(arrayLike[i]);
  }
  return arr;
}
function px(node, styleProperty) {
  const win = node.ownerDocument.defaultView || window;
  const val = win.getComputedStyle(node).getPropertyValue(styleProperty);
  return val ? parseFloat(val.replace("px", "")) : 0;
}
function getNodeWidth(node) {
  const leftBorder = px(node, "border-left-width");
  const rightBorder = px(node, "border-right-width");
  return node.clientWidth + leftBorder + rightBorder;
}
function getNodeHeight(node) {
  const topBorder = px(node, "border-top-width");
  const bottomBorder = px(node, "border-bottom-width");
  return node.clientHeight + topBorder + bottomBorder;
}
function getImageSize(targetNode, options = {}) {
  const width = options.width || getNodeWidth(targetNode);
  const height = options.height || getNodeHeight(targetNode);
  return { width, height };
}
function getPixelRatio() {
  let ratio;
  let FINAL_PROCESS;
  try {
    FINAL_PROCESS = process;
  } catch (e) {
  }
  const val = FINAL_PROCESS && FINAL_PROCESS.env ? FINAL_PROCESS.env.devicePixelRatio : null;
  if (val) {
    ratio = parseInt(val, 10);
    if (Number.isNaN(ratio)) {
      ratio = 1;
    }
  }
  return ratio || window.devicePixelRatio || 1;
}
const canvasDimensionLimit = 16384;
function checkCanvasDimensions(canvas) {
  if (canvas.width > canvasDimensionLimit || canvas.height > canvasDimensionLimit) {
    if (canvas.width > canvasDimensionLimit && canvas.height > canvasDimensionLimit) {
      if (canvas.width > canvas.height) {
        canvas.height *= canvasDimensionLimit / canvas.width;
        canvas.width = canvasDimensionLimit;
      } else {
        canvas.width *= canvasDimensionLimit / canvas.height;
        canvas.height = canvasDimensionLimit;
      }
    } else if (canvas.width > canvasDimensionLimit) {
      canvas.height *= canvasDimensionLimit / canvas.width;
      canvas.width = canvasDimensionLimit;
    } else {
      canvas.width *= canvasDimensionLimit / canvas.height;
      canvas.height = canvasDimensionLimit;
    }
  }
}
function createImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decode = () => resolve(img);
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.src = url;
  });
}
async function svgToDataURL(svg) {
  return Promise.resolve().then(() => new XMLSerializer().serializeToString(svg)).then(encodeURIComponent).then((html) => `data:image/svg+xml;charset=utf-8,${html}`);
}
async function nodeToDataURL(node, width, height) {
  const xmlns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(xmlns, "svg");
  const foreignObject = document.createElementNS(xmlns, "foreignObject");
  svg.setAttribute("width", `${width}`);
  svg.setAttribute("height", `${height}`);
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  foreignObject.setAttribute("width", "100%");
  foreignObject.setAttribute("height", "100%");
  foreignObject.setAttribute("x", "0");
  foreignObject.setAttribute("y", "0");
  foreignObject.setAttribute("externalResourcesRequired", "true");
  svg.appendChild(foreignObject);
  foreignObject.appendChild(node);
  return svgToDataURL(svg);
}
const isInstanceOfElement = (node, instance) => {
  if (node instanceof instance)
    return true;
  const nodePrototype = Object.getPrototypeOf(node);
  if (nodePrototype === null)
    return false;
  return nodePrototype.constructor.name === instance.name || isInstanceOfElement(nodePrototype, instance);
};
function formatCSSText(style) {
  const content = style.getPropertyValue("content");
  return `${style.cssText} content: '${content.replace(/'|"/g, "")}';`;
}
function formatCSSProperties(style) {
  return toArray(style).map((name) => {
    const value = style.getPropertyValue(name);
    const priority = style.getPropertyPriority(name);
    return `${name}: ${value}${priority ? " !important" : ""};`;
  }).join(" ");
}
function getPseudoElementStyle(className, pseudo, style) {
  const selector = `.${className}:${pseudo}`;
  const cssText = style.cssText ? formatCSSText(style) : formatCSSProperties(style);
  return document.createTextNode(`${selector}{${cssText}}`);
}
function clonePseudoElement(nativeNode, clonedNode, pseudo) {
  const style = window.getComputedStyle(nativeNode, pseudo);
  const content = style.getPropertyValue("content");
  if (content === "" || content === "none") {
    return;
  }
  const className = uuid();
  try {
    clonedNode.className = `${clonedNode.className} ${className}`;
  } catch (err) {
    return;
  }
  const styleElement = document.createElement("style");
  styleElement.appendChild(getPseudoElementStyle(className, pseudo, style));
  clonedNode.appendChild(styleElement);
}
function clonePseudoElements(nativeNode, clonedNode) {
  clonePseudoElement(nativeNode, clonedNode, ":before");
  clonePseudoElement(nativeNode, clonedNode, ":after");
}
const WOFF = "application/font-woff";
const JPEG = "image/jpeg";
const mimes = {
  woff: WOFF,
  woff2: WOFF,
  ttf: "application/font-truetype",
  eot: "application/vnd.ms-fontobject",
  png: "image/png",
  jpg: JPEG,
  jpeg: JPEG,
  gif: "image/gif",
  tiff: "image/tiff",
  svg: "image/svg+xml",
  webp: "image/webp"
};
function getExtension(url) {
  const match = /\.([^./]*?)$/g.exec(url);
  return match ? match[1] : "";
}
function getMimeType(url) {
  const extension = getExtension(url).toLowerCase();
  return mimes[extension] || "";
}
function getContentFromDataUrl(dataURL) {
  return dataURL.split(/,/)[1];
}
function isDataUrl(url) {
  return url.search(/^(data:)/) !== -1;
}
function makeDataUrl(content, mimeType) {
  return `data:${mimeType};base64,${content}`;
}
async function fetchAsDataURL(url, init, process2) {
  const res = await fetch(url, init);
  if (res.status === 404) {
    throw new Error(`Resource "${res.url}" not found`);
  }
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onloadend = () => {
      try {
        resolve(process2({ res, result: reader.result }));
      } catch (error) {
        reject(error);
      }
    };
    reader.readAsDataURL(blob);
  });
}
const cache = {};
function getCacheKey(url, contentType, includeQueryParams) {
  let key = url.replace(/\?.*/, "");
  if (includeQueryParams) {
    key = url;
  }
  if (/ttf|otf|eot|woff2?/i.test(key)) {
    key = key.replace(/.*\//, "");
  }
  return contentType ? `[${contentType}]${key}` : key;
}
async function resourceToDataURL(resourceUrl, contentType, options) {
  const cacheKey = getCacheKey(resourceUrl, contentType, options.includeQueryParams);
  if (cache[cacheKey] != null) {
    return cache[cacheKey];
  }
  if (options.cacheBust) {
    resourceUrl += (/\?/.test(resourceUrl) ? "&" : "?") + new Date().getTime();
  }
  let dataURL;
  try {
    const content = await fetchAsDataURL(resourceUrl, options.fetchRequestInit, ({ res, result }) => {
      if (!contentType) {
        contentType = res.headers.get("Content-Type") || "";
      }
      return getContentFromDataUrl(result);
    });
    dataURL = makeDataUrl(content, contentType);
  } catch (error) {
    dataURL = options.imagePlaceholder || "";
    let msg = `Failed to fetch resource: ${resourceUrl}`;
    if (error) {
      msg = typeof error === "string" ? error : error.message;
    }
    if (msg) {
      console.warn(msg);
    }
  }
  cache[cacheKey] = dataURL;
  return dataURL;
}
async function cloneCanvasElement(canvas) {
  const dataURL = canvas.toDataURL();
  if (dataURL === "data:,") {
    return canvas.cloneNode(false);
  }
  return createImage(dataURL);
}
async function cloneVideoElement(video, options) {
  if (video.currentSrc) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = video.clientWidth;
    canvas.height = video.clientHeight;
    ctx === null || ctx === void 0 ? void 0 : ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataURL2 = canvas.toDataURL();
    return createImage(dataURL2);
  }
  const poster = video.poster;
  const contentType = getMimeType(poster);
  const dataURL = await resourceToDataURL(poster, contentType, options);
  return createImage(dataURL);
}
async function cloneIFrameElement(iframe) {
  var _a;
  try {
    if ((_a = iframe === null || iframe === void 0 ? void 0 : iframe.contentDocument) === null || _a === void 0 ? void 0 : _a.body) {
      return await cloneNode(iframe.contentDocument.body, {}, true);
    }
  } catch (_b) {
  }
  return iframe.cloneNode(false);
}
async function cloneSingleNode(node, options) {
  if (isInstanceOfElement(node, HTMLCanvasElement)) {
    return cloneCanvasElement(node);
  }
  if (isInstanceOfElement(node, HTMLVideoElement)) {
    return cloneVideoElement(node, options);
  }
  if (isInstanceOfElement(node, HTMLIFrameElement)) {
    return cloneIFrameElement(node);
  }
  return node.cloneNode(false);
}
const isSlotElement = (node) => node.tagName != null && node.tagName.toUpperCase() === "SLOT";
async function cloneChildren(nativeNode, clonedNode, options) {
  var _a, _b;
  let children = [];
  if (isSlotElement(nativeNode) && nativeNode.assignedNodes) {
    children = toArray(nativeNode.assignedNodes());
  } else if (isInstanceOfElement(nativeNode, HTMLIFrameElement) && ((_a = nativeNode.contentDocument) === null || _a === void 0 ? void 0 : _a.body)) {
    children = toArray(nativeNode.contentDocument.body.childNodes);
  } else {
    children = toArray(((_b = nativeNode.shadowRoot) !== null && _b !== void 0 ? _b : nativeNode).childNodes);
  }
  if (children.length === 0 || isInstanceOfElement(nativeNode, HTMLVideoElement)) {
    return clonedNode;
  }
  await children.reduce((deferred, child) => deferred.then(() => cloneNode(child, options)).then((clonedChild) => {
    if (clonedChild) {
      clonedNode.appendChild(clonedChild);
    }
  }), Promise.resolve());
  return clonedNode;
}
function cloneCSSStyle(nativeNode, clonedNode) {
  const targetStyle = clonedNode.style;
  if (!targetStyle) {
    return;
  }
  const sourceStyle = window.getComputedStyle(nativeNode);
  if (sourceStyle.cssText) {
    targetStyle.cssText = sourceStyle.cssText;
    targetStyle.transformOrigin = sourceStyle.transformOrigin;
  } else {
    toArray(sourceStyle).forEach((name) => {
      let value = sourceStyle.getPropertyValue(name);
      if (name === "font-size" && value.endsWith("px")) {
        const reducedFont = Math.floor(parseFloat(value.substring(0, value.length - 2))) - 0.1;
        value = `${reducedFont}px`;
      }
      if (isInstanceOfElement(nativeNode, HTMLIFrameElement) && name === "display" && value === "inline") {
        value = "block";
      }
      if (name === "d" && clonedNode.getAttribute("d")) {
        value = `path(${clonedNode.getAttribute("d")})`;
      }
      targetStyle.setProperty(name, value, sourceStyle.getPropertyPriority(name));
    });
  }
}
function cloneInputValue(nativeNode, clonedNode) {
  if (isInstanceOfElement(nativeNode, HTMLTextAreaElement)) {
    clonedNode.innerHTML = nativeNode.value;
  }
  if (isInstanceOfElement(nativeNode, HTMLInputElement)) {
    clonedNode.setAttribute("value", nativeNode.value);
  }
}
function cloneSelectValue(nativeNode, clonedNode) {
  if (isInstanceOfElement(nativeNode, HTMLSelectElement)) {
    const clonedSelect = clonedNode;
    const selectedOption = Array.from(clonedSelect.children).find((child) => nativeNode.value === child.getAttribute("value"));
    if (selectedOption) {
      selectedOption.setAttribute("selected", "");
    }
  }
}
function decorate(nativeNode, clonedNode) {
  if (isInstanceOfElement(clonedNode, Element)) {
    cloneCSSStyle(nativeNode, clonedNode);
    clonePseudoElements(nativeNode, clonedNode);
    cloneInputValue(nativeNode, clonedNode);
    cloneSelectValue(nativeNode, clonedNode);
  }
  return clonedNode;
}
async function ensureSVGSymbols(clone, options) {
  const uses = clone.querySelectorAll ? clone.querySelectorAll("use") : [];
  if (uses.length === 0) {
    return clone;
  }
  const processedDefs = {};
  for (let i = 0; i < uses.length; i++) {
    const use = uses[i];
    const id2 = use.getAttribute("xlink:href");
    if (id2) {
      const exist = clone.querySelector(id2);
      const definition = document.querySelector(id2);
      if (!exist && definition && !processedDefs[id2]) {
        processedDefs[id2] = await cloneNode(definition, options, true);
      }
    }
  }
  const nodes = Object.values(processedDefs);
  if (nodes.length) {
    const ns = "http://www.w3.org/1999/xhtml";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("xmlns", ns);
    svg.style.position = "absolute";
    svg.style.width = "0";
    svg.style.height = "0";
    svg.style.overflow = "hidden";
    svg.style.display = "none";
    const defs = document.createElementNS(ns, "defs");
    svg.appendChild(defs);
    for (let i = 0; i < nodes.length; i++) {
      defs.appendChild(nodes[i]);
    }
    clone.appendChild(svg);
  }
  return clone;
}
async function cloneNode(node, options, isRoot) {
  if (!isRoot && options.filter && !options.filter(node)) {
    return null;
  }
  return Promise.resolve(node).then((clonedNode) => cloneSingleNode(clonedNode, options)).then((clonedNode) => cloneChildren(node, clonedNode, options)).then((clonedNode) => decorate(node, clonedNode)).then((clonedNode) => ensureSVGSymbols(clonedNode, options));
}
const URL_REGEX = /url\((['"]?)([^'"]+?)\1\)/g;
const URL_WITH_FORMAT_REGEX = /url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g;
const FONT_SRC_REGEX = /src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;
function toRegex(url) {
  const escaped = url.replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1");
  return new RegExp(`(url\\(['"]?)(${escaped})(['"]?\\))`, "g");
}
function parseURLs(cssText) {
  const urls = [];
  cssText.replace(URL_REGEX, (raw, quotation, url) => {
    urls.push(url);
    return raw;
  });
  return urls.filter((url) => !isDataUrl(url));
}
async function embed(cssText, resourceURL, baseURL, options, getContentFromUrl) {
  try {
    const resolvedURL = baseURL ? resolveUrl(resourceURL, baseURL) : resourceURL;
    const contentType = getMimeType(resourceURL);
    let dataURL;
    if (getContentFromUrl) {
      const content = await getContentFromUrl(resolvedURL);
      dataURL = makeDataUrl(content, contentType);
    } else {
      dataURL = await resourceToDataURL(resolvedURL, contentType, options);
    }
    return cssText.replace(toRegex(resourceURL), `$1${dataURL}$3`);
  } catch (error) {
  }
  return cssText;
}
function filterPreferredFontFormat(str, { preferredFontFormat }) {
  return !preferredFontFormat ? str : str.replace(FONT_SRC_REGEX, (match) => {
    while (true) {
      const [src, , format] = URL_WITH_FORMAT_REGEX.exec(match) || [];
      if (!format) {
        return "";
      }
      if (format === preferredFontFormat) {
        return `src: ${src};`;
      }
    }
  });
}
function shouldEmbed(url) {
  return url.search(URL_REGEX) !== -1;
}
async function embedResources(cssText, baseUrl, options) {
  if (!shouldEmbed(cssText)) {
    return cssText;
  }
  const filteredCSSText = filterPreferredFontFormat(cssText, options);
  const urls = parseURLs(filteredCSSText);
  return urls.reduce((deferred, url) => deferred.then((css) => embed(css, url, baseUrl, options)), Promise.resolve(filteredCSSText));
}
async function embedProp(propName, node, options) {
  var _a;
  const propValue = (_a = node.style) === null || _a === void 0 ? void 0 : _a.getPropertyValue(propName);
  if (propValue) {
    const cssString = await embedResources(propValue, null, options);
    node.style.setProperty(propName, cssString, node.style.getPropertyPriority(propName));
    return true;
  }
  return false;
}
async function embedBackground(clonedNode, options) {
  if (!await embedProp("background", clonedNode, options)) {
    await embedProp("background-image", clonedNode, options);
  }
  if (!await embedProp("mask", clonedNode, options)) {
    await embedProp("mask-image", clonedNode, options);
  }
}
async function embedImageNode(clonedNode, options) {
  const isImageElement = isInstanceOfElement(clonedNode, HTMLImageElement);
  if (!(isImageElement && !isDataUrl(clonedNode.src)) && !(isInstanceOfElement(clonedNode, SVGImageElement) && !isDataUrl(clonedNode.href.baseVal))) {
    return;
  }
  const url = isImageElement ? clonedNode.src : clonedNode.href.baseVal;
  const dataURL = await resourceToDataURL(url, getMimeType(url), options);
  await new Promise((resolve, reject) => {
    clonedNode.onload = resolve;
    clonedNode.onerror = reject;
    const image = clonedNode;
    if (image.decode) {
      image.decode = resolve;
    }
    if (image.loading === "lazy") {
      image.loading = "eager";
    }
    if (isImageElement) {
      clonedNode.srcset = "";
      clonedNode.src = dataURL;
    } else {
      clonedNode.href.baseVal = dataURL;
    }
  });
}
async function embedChildren(clonedNode, options) {
  const children = toArray(clonedNode.childNodes);
  const deferreds = children.map((child) => embedImages(child, options));
  await Promise.all(deferreds).then(() => clonedNode);
}
async function embedImages(clonedNode, options) {
  if (isInstanceOfElement(clonedNode, Element)) {
    await embedBackground(clonedNode, options);
    await embedImageNode(clonedNode, options);
    await embedChildren(clonedNode, options);
  }
}
function applyStyle(node, options) {
  const { style } = node;
  if (options.backgroundColor) {
    style.backgroundColor = options.backgroundColor;
  }
  if (options.width) {
    style.width = `${options.width}px`;
  }
  if (options.height) {
    style.height = `${options.height}px`;
  }
  const manual = options.style;
  if (manual != null) {
    Object.keys(manual).forEach((key) => {
      style[key] = manual[key];
    });
  }
  return node;
}
const cssFetchCache = {};
async function fetchCSS(url) {
  let cache2 = cssFetchCache[url];
  if (cache2 != null) {
    return cache2;
  }
  const res = await fetch(url);
  const cssText = await res.text();
  cache2 = { url, cssText };
  cssFetchCache[url] = cache2;
  return cache2;
}
async function embedFonts(data, options) {
  let cssText = data.cssText;
  const regexUrl = /url\(["']?([^"')]+)["']?\)/g;
  const fontLocs = cssText.match(/url\([^)]+\)/g) || [];
  const loadFonts = fontLocs.map(async (loc) => {
    let url = loc.replace(regexUrl, "$1");
    if (!url.startsWith("https://")) {
      url = new URL(url, data.url).href;
    }
    return fetchAsDataURL(url, options.fetchRequestInit, ({ result }) => {
      cssText = cssText.replace(loc, `url(${result})`);
      return [loc, result];
    });
  });
  return Promise.all(loadFonts).then(() => cssText);
}
function parseCSS(source) {
  if (source == null) {
    return [];
  }
  const result = [];
  const commentsRegex = /(\/\*[\s\S]*?\*\/)/gi;
  let cssText = source.replace(commentsRegex, "");
  const keyframesRegex = new RegExp("((@.*?keyframes [\\s\\S]*?){([\\s\\S]*?}\\s*?)})", "gi");
  while (true) {
    const matches = keyframesRegex.exec(cssText);
    if (matches === null) {
      break;
    }
    result.push(matches[0]);
  }
  cssText = cssText.replace(keyframesRegex, "");
  const importRegex = /@import[\s\S]*?url\([^)]*\)[\s\S]*?;/gi;
  const combinedCSSRegex = "((\\s*?(?:\\/\\*[\\s\\S]*?\\*\\/)?\\s*?@media[\\s\\S]*?){([\\s\\S]*?)}\\s*?})|(([\\s\\S]*?){([\\s\\S]*?)})";
  const unifiedRegex = new RegExp(combinedCSSRegex, "gi");
  while (true) {
    let matches = importRegex.exec(cssText);
    if (matches === null) {
      matches = unifiedRegex.exec(cssText);
      if (matches === null) {
        break;
      } else {
        importRegex.lastIndex = unifiedRegex.lastIndex;
      }
    } else {
      unifiedRegex.lastIndex = importRegex.lastIndex;
    }
    result.push(matches[0]);
  }
  return result;
}
async function getCSSRules(styleSheets, options) {
  const ret = [];
  const deferreds = [];
  styleSheets.forEach((sheet) => {
    if ("cssRules" in sheet) {
      try {
        toArray(sheet.cssRules || []).forEach((item, index) => {
          if (item.type === CSSRule.IMPORT_RULE) {
            let importIndex = index + 1;
            const url = item.href;
            const deferred = fetchCSS(url).then((metadata) => embedFonts(metadata, options)).then((cssText) => parseCSS(cssText).forEach((rule) => {
              try {
                sheet.insertRule(rule, rule.startsWith("@import") ? importIndex += 1 : sheet.cssRules.length);
              } catch (error) {
                console.error("Error inserting rule from remote css", {
                  rule,
                  error
                });
              }
            })).catch((e) => {
              console.error("Error loading remote css", e.toString());
            });
            deferreds.push(deferred);
          }
        });
      } catch (e) {
        const inline = styleSheets.find((a) => a.href == null) || document.styleSheets[0];
        if (sheet.href != null) {
          deferreds.push(fetchCSS(sheet.href).then((metadata) => embedFonts(metadata, options)).then((cssText) => parseCSS(cssText).forEach((rule) => {
            inline.insertRule(rule, sheet.cssRules.length);
          })).catch((err) => {
            console.error("Error loading remote stylesheet", err);
          }));
        }
        console.error("Error inlining remote css file", e);
      }
    }
  });
  return Promise.all(deferreds).then(() => {
    styleSheets.forEach((sheet) => {
      if ("cssRules" in sheet) {
        try {
          toArray(sheet.cssRules || []).forEach((item) => {
            ret.push(item);
          });
        } catch (e) {
          console.error(`Error while reading CSS rules from ${sheet.href}`, e);
        }
      }
    });
    return ret;
  });
}
function getWebFontRules(cssRules) {
  return cssRules.filter((rule) => rule.type === CSSRule.FONT_FACE_RULE).filter((rule) => shouldEmbed(rule.style.getPropertyValue("src")));
}
async function parseWebFontRules(node, options) {
  if (node.ownerDocument == null) {
    throw new Error("Provided element is not within a Document");
  }
  const styleSheets = toArray(node.ownerDocument.styleSheets);
  const cssRules = await getCSSRules(styleSheets, options);
  return getWebFontRules(cssRules);
}
async function getWebFontCSS(node, options) {
  const rules = await parseWebFontRules(node, options);
  const cssTexts = await Promise.all(rules.map((rule) => {
    const baseUrl = rule.parentStyleSheet ? rule.parentStyleSheet.href : null;
    return embedResources(rule.cssText, baseUrl, options);
  }));
  return cssTexts.join("\n");
}
async function embedWebFonts(clonedNode, options) {
  const cssText = options.fontEmbedCSS != null ? options.fontEmbedCSS : options.skipFonts ? null : await getWebFontCSS(clonedNode, options);
  if (cssText) {
    const styleNode = document.createElement("style");
    const sytleContent = document.createTextNode(cssText);
    styleNode.appendChild(sytleContent);
    if (clonedNode.firstChild) {
      clonedNode.insertBefore(styleNode, clonedNode.firstChild);
    } else {
      clonedNode.appendChild(styleNode);
    }
  }
}
async function toSvg(node, options = {}) {
  const { width, height } = getImageSize(node, options);
  const clonedNode = await cloneNode(node, options, true);
  await embedWebFonts(clonedNode, options);
  await embedImages(clonedNode, options);
  applyStyle(clonedNode, options);
  const datauri = await nodeToDataURL(clonedNode, width, height);
  return datauri;
}
async function toCanvas(node, options = {}) {
  const { width, height } = getImageSize(node, options);
  const svg = await toSvg(node, options);
  const img = await createImage(svg);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const ratio = options.pixelRatio || getPixelRatio();
  const canvasWidth = options.canvasWidth || width;
  const canvasHeight = options.canvasHeight || height;
  canvas.width = canvasWidth * ratio;
  canvas.height = canvasHeight * ratio;
  if (!options.skipAutoScale) {
    checkCanvasDimensions(canvas);
  }
  canvas.style.width = `${canvasWidth}`;
  canvas.style.height = `${canvasHeight}`;
  if (options.backgroundColor) {
    context.fillStyle = options.backgroundColor;
    context.fillRect(0, 0, canvas.width, canvas.height);
  }
  context.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas;
}
async function toPng(node, options = {}) {
  const canvas = await toCanvas(node, options);
  return canvas.toDataURL();
}
const _VibeCheckPopup = class extends Application {
  constructor() {
    super(...arguments);
    __publicField(this, "userResponses", []);
  }
  static getInstance() {
    if (!this.instance) {
      this.instance = new _VibeCheckPopup();
    }
    return this.instance;
  }
  /**
   * override
   */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["form", "crowdgoeswild", "vibecheck"],
      popOut: true,
      template: `modules/${id}/templates/VibeCheckPopup.hbs`,
      id: `${id}-vibe-check`,
      title: "CrowdGoesWild - Vibe Check",
      width: 600,
      height: "auto"
    });
  }
  async getData() {
    let users = await game.users.players.filter((u) => u.active);
    let groupedResponses = [];
    for (const user of users) {
      let filteredResponses = [];
      for (const sentResponse of this.userResponses) {
        if (sentResponse.user._id == user.id) {
          filteredResponses.push(sentResponse.response);
        }
      }
      let userResponses = {
        user,
        responses: filteredResponses
      };
      groupedResponses.push(userResponses);
    }
    let data = {
      isGM: game.user.isGM,
      reactions: await game.settings.get(id, "reactions"),
      responses: this.userResponses,
      groupedResponses
    };
    return data;
  }
  activateListeners(html) {
    html.find("button.reaction").on("click", (ev) => {
      sendVibeCheckResponse(game.user, ev.currentTarget.dataset.id);
    });
  }
};
let VibeCheckPopup = _VibeCheckPopup;
__publicField(VibeCheckPopup, "instance");
async function recordVibeCheckResponse(response) {
  let vc = VibeCheckPopup.getInstance();
  let reaction = await getReactionObject(response.response);
  let user = response.user;
  response = {
    user,
    response: reaction
  };
  vc.userResponses.push(response);
  vc.render(false);
}
function registerSocketEvents() {
  game.socket.on(`module.${id}`, handleSocketEvent);
}
async function emitSocketEvent({ type, payload }) {
  let event = {
    type,
    payload
  };
  await game.socket.emit(`module.${id}`, event);
  handleSocketEvent(event);
}
async function sendReactionToSocket(reactionId) {
  emitSocketEvent({
    type: "icon",
    payload: reactionId
  });
}
async function reloadAllClients() {
  emitSocketEvent({
    type: "reload",
    payload: ""
  });
}
async function sendVibeCheckResponse(user, responseId) {
  emitSocketEvent({
    type: "vibecheckresponse",
    payload: { user, response: responseId }
  });
}
async function initiateVibeCheck() {
  emitSocketEvent({
    type: "vibecheck",
    payload: ""
  });
}
function handleSocketEvent({ type, payload }) {
  switch (type) {
    case "icon":
      insertSentReaction(payload);
      break;
    case "reload":
      debouncedReload();
      break;
    case "vibecheck":
      displayVibeCheck();
      break;
    case "vibecheckresponse":
      recordVibeCheckResponse(payload);
      break;
    default:
      throw new Error("unknown type");
  }
}
async function insertSentReaction(reactionId) {
  let reaction = await getReactionObject(reactionId);
  let htmlString = await getReactionHTML(reaction);
  let $fullScreen = $("#interface");
  let $added = $(htmlString).appendTo($fullScreen);
  gsap.effects[reaction.effect]($added, {
    parent: $fullScreen,
    reaction
  });
}
async function displayVibeCheck() {
  let vc = VibeCheckPopup.getInstance();
  vc.userResponses = [];
  vc.render(true);
}
async function handleReactionClick(id2) {
  sendReactionToSocket(id2);
}
function randomNumber(min, max) {
  return Math.random() * (max - min) + min;
}
function calcAngleDegrees(x, y) {
  return Math.atan2(y, x) * 180 / Math.PI;
}
async function getReactionAsImage(reactionObject) {
  let reactionHTML = await getReactionHTML(reactionObject);
  let $interface = $("#interface");
  let $appended = $(reactionHTML).appendTo($interface);
  $appended.css({ zIndex: "-10000" });
  let iconPNGData;
  try {
    iconPNGData = await toPng($appended.get(0));
  } catch (error) {
    console.error("oops, something went wrong!", error);
  }
  $appended.remove();
  return iconPNGData;
}
async function getReactionObject(reactionId) {
  let reactions = await game.settings.get(id, "reactions");
  let reaction = reactions.find((r) => r.id == reactionId);
  return reaction;
}
function getReactionHTML(reaction) {
  let htmlString = `
        <i class="${reaction.style} fa-${reaction.icon} cgw-reaction" 
            data-id=${reaction.id}
            style="
                color: ${reaction.primaryColor}; 
                --fa-primary-color: ${reaction.primaryColor};
                --fa-secondary-color: ${reaction.secondaryColor};
            ">
        </i>`;
  return htmlString;
}
async function saveAllReactionPNGs(force = false) {
  if (force) {
    ui.notifications.info(
      `Generating icons for reaction macros. This will take a moment.`,
      { permanent: false }
    );
  }
  let reactions = await game.settings.get(id, "reactions");
  for (const reaction of reactions) {
    await generateReactionPNG(reaction, force);
  }
}
async function generateReactionPNG(reactionObject, force) {
  let worldPath = `worlds/${game.world.id}`;
  let iconsPath = `worlds/${game.world.id}/reactionIcons`;
  let world_dirs_list = await FilePicker.browse("data", worldPath).then(
    (picker) => picker.dirs
  );
  if (!world_dirs_list.includes(iconsPath)) {
    console.log("Reactions icon folder doesn't exist. Creating it.");
    await FilePicker.createDirectory("data", iconsPath);
  }
  let imagesPath = iconsPath;
  let files_list = await FilePicker.browse("data", iconsPath).then(
    (picker) => picker.files
  );
  if (!files_list.includes(iconsPath + `/reaction-${reactionObject.id}.png`) || force) {
    console.log("Image does not yet exist or force flag was set. Generating.");
    let imageDataURL = await getReactionAsImage(reactionObject);
    let uploadResponse = await ImageHelper.uploadBase64(
      imageDataURL,
      `reaction-${reactionObject.id}.png`,
      imagesPath
    );
    return uploadResponse.path;
  } else {
    console.log("Image already exists. Refusing to regenerate.");
    return;
  }
}
async function getReactionPNGUrl(reactionId) {
  return `worlds/${game.world.id}/reactionIcons/reaction-${reactionId}.png`;
}
async function renderChatButtonBar() {
  let $chatForm = $("#chat-form");
  let $reactionBar = $(".cgw.reactionbar");
  $reactionBar.remove();
  let templatePath = `modules/${id}/templates/parts/ReactionButtonBar.hbs`;
  let templateData = {
    reactions: await game.settings.get(id, "reactions"),
    isGM: game.user.isGM
  };
  renderTemplate(templatePath, templateData).then((c) => {
    if (c.length > 0) {
      let $content = $(c);
      $chatForm.after($content);
      $content.find(".reactionbar button").on("click", (event) => {
        event.preventDefault();
        $(event.currentTarget);
        let dataset = event.currentTarget.dataset;
        let id2 = dataset.id;
        handleReactionClick(id2);
      });
      $content.find(".reactionbar button").on("dragstart", (event) => {
        event.originalEvent.dataTransfer.setData(
          "text/plain",
          JSON.stringify({
            id: event.currentTarget.dataset.id,
            type: "reaction"
          })
        );
      });
      $content.find("button.vibecheck").on("click", (event) => {
        initiateVibeCheck();
      });
    }
  }).catch((e) => console.error(e));
}
function animationInit() {
  gsap.registerPlugin(CustomEase, CustomWiggle, Physics2DPlugin);
  CustomWiggle.create("wiggle", {
    wiggles: 5,
    type: "uniform",
    duration: 10
  });
  CustomWiggle.create("shake", {
    wiggles: 8,
    type: "easeOut",
    duration: 1
  });
  CustomWiggle.create("flutter", {
    wiggles: 6,
    type: "uniform",
    duration: 30
  });
  registerEffects();
}
function registerEffects() {
  let defaults = {
    edgePaddingPercentage: 20,
    offscreen: -50
  };
  gsap.registerEffect({
    name: "fadeAndRemove",
    effect: (targets, config) => {
      let tl = gsap.timeline();
      tl.to(targets, {
        duration: config.duration,
        opacity: 0
      }).call(() => {
        $(targets).remove();
      });
      return tl;
    },
    defaults: { duration: 2 },
    extendTimeline: true
  });
  gsap.registerEffect({
    name: "physics-floatUp",
    effect: (targets, config) => {
      let tl = gsap.timeline({
        defaults: {
          duration: 5
        }
      });
      let $fullScreen = config.parent;
      let edgePaddingPixels = $fullScreen.width() * (defaults.edgePaddingPercentage / 100);
      let xStart = edgePaddingPixels;
      let xEnd = $fullScreen.width() - edgePaddingPixels;
      let xFrom = randomNumber(xStart, xEnd);
      $fullScreen.height();
      gsap.set(targets, {
        left: xFrom,
        bottom: defaults.offscreen
      });
      let randomLife = randomNumber(1, 5);
      tl.to(
        targets,
        {
          x: randomNumber(-40, 40),
          scale: randomNumber(0.95, 1.25),
          rotation: randomNumber(-10, 10),
          duration: 10,
          ease: "wiggle"
        },
        0
      );
      tl.to(
        targets,
        {
          duration: 30,
          physics2D: {
            velocity: 200,
            angle: "random(250, 290)",
            // angle: ,
            gravity: -100
          }
        },
        0
      ).fadeAndRemove(targets, {}, randomLife);
      return tl;
    }
  });
  gsap.registerEffect({
    name: "floatUp",
    effect: (targets, config) => {
      let tl = gsap.timeline({
        defaults: {
          duration: 5
        }
      });
      let $fullScreen = config.parent;
      let edgePaddingPixels = $fullScreen.width() * (defaults.edgePaddingPercentage / 100);
      let xStart = edgePaddingPixels;
      let xEnd = $fullScreen.width() - edgePaddingPixels;
      let xFrom = randomNumber(xStart, xEnd);
      let yEnd = $fullScreen.height();
      gsap.set(targets, {
        left: xFrom,
        bottom: defaults.offscreen
      });
      let randomLife = randomNumber(1, 5);
      tl.to(
        targets,
        {
          x: randomNumber(-40, 40),
          scale: randomNumber(0.95, 1.25),
          rotation: randomNumber(-10, 10),
          duration: 10,
          ease: "wiggle"
        },
        0
      ).to(
        targets,
        {
          y: yEnd * -1,
          ease: "easeOut",
          duration: 8
        },
        0
      ).fadeAndRemove(targets, {}, randomLife);
      return tl;
    }
  });
  gsap.registerEffect({
    name: "drop",
    effect: (targets, config) => {
      let tl = gsap.timeline({
        defaults: {
          duration: 5
        }
      });
      let $fullScreen = config.parent;
      let edgePaddingPixels = $fullScreen.width() * (defaults.edgePaddingPercentage / 100);
      let xStart = edgePaddingPixels;
      let xEnd = $fullScreen.width() - edgePaddingPixels;
      let xFrom = randomNumber(xStart, xEnd);
      gsap.set(targets, {
        left: xFrom,
        top: defaults.offscreen * -1
      });
      tl.to(
        targets,
        {
          top: $fullScreen.height() + defaults.offscreen * -1,
          ease: "none",
          duration: 1
        },
        0
      ).fadeAndRemove(targets);
      return tl;
    }
  });
  gsap.registerEffect({
    name: "physics-drop",
    effect: (targets, config) => {
      let tl = gsap.timeline({
        defaults: {
          duration: 5
        }
      });
      let $fullScreen = config.parent;
      let edgePaddingPixels = $fullScreen.width() * (defaults.edgePaddingPercentage / 100);
      let xStart = edgePaddingPixels;
      let xEnd = $fullScreen.width() - edgePaddingPixels;
      let xFrom = randomNumber(xStart, xEnd);
      gsap.set(targets, {
        left: xFrom,
        top: defaults.offscreen
      });
      tl.to(
        targets,
        {
          duration: 30,
          physics2D: {
            velocity: 0,
            // velocity: 600,
            // angle: "random(250, 290)",
            angle: 0,
            gravity: 500
          }
        },
        0
      ).fadeAndRemove(targets);
      return tl;
    }
  });
  gsap.registerEffect({
    name: "physics-flutterDown",
    effect: (targets, config) => {
      let tl = gsap.timeline();
      let $fullScreen = config.parent;
      let edgePaddingPixels = $fullScreen.width() * (defaults.edgePaddingPercentage / 100);
      let xStart = edgePaddingPixels;
      let xEnd = $fullScreen.width() - edgePaddingPixels;
      let xFrom = randomNumber(xStart, xEnd);
      tl.fromTo(
        targets,
        {
          left: xFrom,
          // top: 300,
          top: defaults.offscreen,
          transformOrigin: "0 -500px",
          rotation: "random(0, 20)",
          scaleX: "random([-1, 1])"
        },
        {
          rotation: "random([-60, -30, 30, 60])",
          ease: "flutter",
          duration: 30
        },
        0
      );
      tl.to(
        targets,
        {
          duration: 30,
          top: $fullScreen.height() + 100
          // physics2D: {
          //   velocity: 0,
          //   angle: 0,
          //   gravity: 50,
          // },
        },
        0
      ).fadeAndRemove(targets);
    }
  });
  gsap.registerEffect({
    name: "physics-toss",
    effect: (targets, config) => {
      let tl = gsap.timeline();
      let $fullScreen = config.parent;
      let edgePaddingPixels = $fullScreen.width() * (defaults.edgePaddingPercentage / 100);
      let xStart = edgePaddingPixels;
      let xEnd = $fullScreen.width() - edgePaddingPixels;
      let xFrom = randomNumber(xStart, xEnd);
      let center = { x: $fullScreen.width() / 2, y: $fullScreen.height() / 2 };
      let angleToCenter = calcAngleDegrees(xFrom - center.x, $fullScreen.height()) + 180;
      let directionRatio = gsap.utils.mapRange(180, 360, -1, 1, angleToCenter);
      directionRatio = directionRatio > 0 ? 1 : -1;
      let gravity = 600;
      let velocityBase = $fullScreen.height() * 0.6 + 320;
      let velocity = randomNumber(velocityBase * 0.85, velocityBase * 1.15);
      gsap.set(targets, {
        left: xFrom,
        bottom: defaults.offscreen
      });
      if (config.reaction.directional) {
        gsap.set(targets, {
          scaleX: directionRatio
        });
      }
      tl.to(
        targets,
        {
          rotation: 360 * directionRatio,
          duration: 1,
          repeat: -1,
          ease: "none"
        },
        0
      ).to(
        targets,
        {
          duration: 30,
          physics2D: {
            velocity,
            // velocity: 600,
            // angle: "random(250, 290)",
            angle: angleToCenter + randomNumber(-10, 10),
            gravity
          }
        },
        0
      ).fadeAndRemove(targets);
      return tl;
    }
  });
  gsap.registerEffect({
    name: "shutdown",
    effect: (targets, config) => {
      let tl = gsap.timeline();
      let $fullScreen = config.parent;
      let $modalBG = $('<div class="cgw modal"></div>').appendTo($fullScreen);
      gsap.set($modalBG, {
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: config.reaction.secondaryColor,
        backdropFilter: "blur(5px)",
        position: "absolute",
        zIndex: 1e3
      });
      gsap.set(targets, {
        left: "50%",
        top: "50%",
        xPercent: -50,
        yPercent: -50,
        fontSize: "50vh"
      });
      game.togglePause(true);
      tl.to(targets, {
        rotation: 5,
        // duration: 10,
        // repeat: -1,
        ease: "shake"
      }).fadeAndRemove(targets, { duration: 1 }, 4).fadeAndRemove($modalBG, { duration: 1 }, 4);
      return tl;
    }
  });
}
const reactionSets = {
  default: {
    label: "Default",
    reactions: [
      {
        id: "0",
        speed: "1",
        enabled: "true",
        title: "Like",
        icon: "heart",
        primaryColor: "#eb34b1",
        secondaryColor: "",
        style: "fas",
        effect: "physics-floatUp",
        directional: false
      },
      {
        id: "1",
        speed: "1",
        enabled: "true",
        title: "OMG",
        icon: "triangle-exclamation",
        primaryColor: "#c52525",
        secondaryColor: "#efaa4b",
        style: "fa-duotone",
        effect: "physics-floatUp",
        directional: false
      },
      {
        id: "2",
        speed: "1",
        enabled: "true",
        title: "Axe",
        icon: "axe",
        primaryColor: "#5f7e96",
        secondaryColor: "#c1c1c1",
        style: "fa-duotone",
        effect: "physics-toss",
        directional: true
      },
      {
        id: "3",
        speed: "1",
        enabled: "true",
        title: "droplet",
        icon: "droplet",
        primaryColor: "#a4fbf7",
        secondaryColor: "#00a6ff",
        style: "fa-duotone",
        effect: "physics-drop",
        directional: false
      },
      {
        id: "4",
        speed: "1",
        enabled: "true",
        title: "fire",
        icon: "fire",
        primaryColor: "#dd0000",
        secondaryColor: "#f5c767",
        style: "fa-duotone",
        effect: "physics-floatUp",
        directional: false
      },
      {
        id: "5",
        speed: "1",
        enabled: "true",
        title: "x",
        icon: "times",
        primaryColor: "#dd0000",
        secondaryColor: "rgba(255,255,255,0.6)",
        style: "fas",
        effect: "shutdown",
        directional: false
      }
    ]
  },
  sciFantasy: {
    label: "Sci-Fantasy",
    reactions: [
      {
        id: "0",
        speed: "1",
        enabled: "true",
        title: "Like",
        icon: "heart",
        primaryColor: "#eb34b1",
        secondaryColor: "",
        style: "fas",
        effect: "physics-floatUp",
        directional: false
      },
      {
        id: "1",
        speed: "1",
        enabled: "true",
        title: "Warning",
        icon: "siren",
        primaryColor: "#5b7b8e",
        secondaryColor: "#e60404",
        style: "fa-duotone",
        effect: "physics-floatUp",
        directional: false
      },
      {
        id: "2",
        speed: "1",
        enabled: "true",
        title: "Laser Sword",
        icon: "sword-laser",
        primaryColor: "#7a7a7a",
        secondaryColor: "#51e367",
        style: "fa-duotone",
        effect: "physics-toss",
        directional: true
      },
      {
        id: "3",
        speed: "1",
        enabled: "true",
        title: "Space Station",
        icon: "space-station-moon-construction",
        primaryColor: "#cfcfcf",
        secondaryColor: "#585858",
        style: "fa-duotone",
        effect: "physics-drop",
        directional: false
      },
      {
        id: "4",
        speed: "1",
        enabled: "true",
        title: "Ship",
        icon: "starship-freighter",
        primaryColor: "#5f6d7e",
        secondaryColor: "#aeaeae",
        style: "fa-duotone",
        effect: "physics-toss",
        directional: false
      },
      {
        id: "5",
        speed: "1",
        enabled: "true",
        title: "x",
        icon: "square-xmark",
        primaryColor: "#dd0000",
        secondaryColor: "rgba(255,255,255,0.6)",
        style: "fas",
        effect: "shutdown",
        directional: false
      }
    ]
  },
  cozy: {
    label: "Cozy",
    reactions: [
      {
        id: "0",
        speed: "1",
        enabled: "true",
        title: "Like",
        icon: "leaf",
        primaryColor: "#a8df35",
        secondaryColor: "#6c9733",
        style: "fa-duotone",
        effect: "physics-flutterDown",
        directional: false
      },
      {
        id: "1",
        speed: "1",
        enabled: "true",
        title: "OMG",
        icon: "triangle-exclamation",
        primaryColor: "#f5ad42",
        secondaryColor: "",
        style: "fas",
        effect: "physics-floatUp",
        directional: false
      },
      {
        id: "2",
        speed: "1",
        enabled: "true",
        title: "Axe",
        icon: "mug-tea",
        primaryColor: "#87b83d",
        secondaryColor: "#ddbeaa",
        style: "fa-duotone",
        effect: "physics-floatUp",
        directional: true
      },
      {
        id: "3",
        speed: "1",
        enabled: "true",
        title: "droplet",
        icon: "droplet",
        primaryColor: "#a4fbf7",
        secondaryColor: "#6bc7fe",
        style: "fa-duotone",
        effect: "physics-drop",
        directional: false
      },
      {
        id: "4",
        speed: "1",
        enabled: "true",
        title: "fire",
        icon: "candle-holder",
        primaryColor: "#f5efc5",
        secondaryColor: "#eb8c34",
        style: "fa-duotone",
        effect: "physics-floatUp",
        directional: false
      },
      {
        id: "5",
        speed: "1",
        enabled: "true",
        title: "x",
        icon: "times",
        primaryColor: "#dd0000",
        secondaryColor: "rgba(255,255,255,0.6)",
        style: "fas",
        effect: "shutdown",
        directional: false
      }
    ]
  },
  tavern: {
    label: "Tavern",
    reactions: [
      {
        id: "0",
        speed: "1",
        enabled: "true",
        title: "Like",
        icon: "heart",
        primaryColor: "#eb34b1",
        secondaryColor: "",
        style: "fas",
        effect: "physics-floatUp",
        directional: false
      },
      {
        id: "1",
        speed: "1",
        enabled: "true",
        title: "OMG",
        icon: "triangle-exclamation",
        primaryColor: "#c52525",
        secondaryColor: "#efaa4b",
        style: "fa-duotone",
        effect: "physics-floatUp",
        directional: false
      },
      {
        id: "2",
        speed: "1",
        enabled: "true",
        title: "Axe",
        icon: "axe",
        primaryColor: "#5f7e96",
        secondaryColor: "#c1c1c1",
        style: "fa-duotone",
        effect: "physics-toss",
        directional: true
      },
      {
        id: "3",
        speed: "1",
        enabled: "true",
        title: "Beer",
        icon: "beer-mug",
        primaryColor: "#fee2a0",
        secondaryColor: "#69432c",
        style: "fa-duotone",
        effect: "physics-toss",
        directional: false
      },
      {
        id: "4",
        speed: "1",
        enabled: "true",
        title: "Meat",
        icon: "meat",
        primaryColor: "#ae4020",
        secondaryColor: "#fbe7bd",
        style: "fa-duotone",
        effect: "physics-floatUp",
        directional: false
      },
      {
        id: "5",
        speed: "1",
        enabled: "true",
        title: "x",
        icon: "times",
        primaryColor: "#dd0000",
        secondaryColor: "rgba(255,255,255,0.6)",
        style: "fas",
        effect: "shutdown",
        directional: false
      }
    ]
  }
};
class ReactionSetupMenu extends FormApplication {
  constructor() {
    super(...arguments);
    // constructor(exampleOption) {
    //     super(exampleOption);
    // }
    __publicField(this, "loadedJSON", {});
    __publicField(this, "selectedPreset", "default");
  }
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["form", "crowdgoeswild", "reactionSetup"],
      popOut: true,
      template: `modules/${id}/templates/ReactionSetup.hbs`,
      id: `${id}-reaction-setup`,
      title: "CrowdGoesWild - Reaction Setup",
      width: 900,
      submitOnChange: true,
      closeOnSubmit: false,
      resizable: true
    });
  }
  async getData() {
    let data = {
      currentReactions: [],
      presets: reactionSets,
      selectedPreset: this.selectedPreset
    };
    data.currentReactions = game.settings.get(id, "reactions");
    return data;
  }
  switchColors(inputEl1, inputEl2) {
    let v1 = inputEl1.value;
    let v2 = inputEl2.value;
    console.log(inputEl1, inputEl2);
    inputEl1.value = v2;
    inputEl2.value = v1;
  }
  async _updateObject(event, formData) {
    const data = expandObject(formData);
    let reactions = [];
    for (const reaction of Object.values(data)) {
      reactions[reaction.id] = reaction;
    }
    await game.settings.set(id, "reactions", reactions);
    await this.render();
  }
  activateListeners(html) {
    super.activateListeners(html);
    html.find("#generateButton").on("click", async (ev) => {
      this.close();
      await saveAllReactionPNGs(true);
      reloadAllClients();
    });
    html.find("#resetButton").on("click", (ev) => {
      this.showLoadPresetDialog();
    });
    html.find("#exportButton").on("click", (ev) => {
      this.exportReactions();
    });
    html.find("#importButton").on("click", (ev) => {
      this.showImportReactionsDialog();
    });
    html.find("#reactionPreset").on("change", (ev) => {
      ev.stopPropagation();
      this.selectedPreset = ev.currentTarget.value;
    });
    html.find(".colorSwitch").on("click", (ev) => {
      ev.stopPropagation();
      let i1 = $(ev.target).parents(".reactionRow").find(".primaryColor input.color").first().get(0);
      let i2 = $(ev.target).parents(".reactionRow").find(".secondaryColor input.color").first().get(0);
      this.switchColors(i1, i2);
    });
  }
  showImportReactionsDialog() {
    let d = new Dialog({
      title: "Import Reactions",
      content: `
            <p>Import a set of reactions from a JSON file? All current reactions will be overwritten.</p>
            <input type="file" id="importer" name="reactionjson" class="cgw importer">
            `,
      buttons: {
        one: {
          icon: '<i class="fas fa-check"></i>',
          label: "Import",
          callback: () => {
            if (this.loadedJSON) {
              this.saveReactionSetData(this.loadedJSON);
            }
          }
        },
        two: {
          icon: '<i class="fas fa-times"></i>',
          label: "Cancel",
          callback: () => {
          }
        }
      },
      default: "two",
      render: (html) => {
        $(html).find("#importer").on("change", (ev) => {
          console.log("Loaded file");
          let reader = new FileReader();
          reader.onload = (readerEv) => {
            try {
              let loadedJSON = JSON.parse(readerEv.target.result);
              if (this.validateLoadedJSON(loadedJSON)) {
                this.loadedJSON = loadedJSON;
              }
            } catch (error) {
              console.log("Invalid JSON file");
              this.loadedJSON = false;
            }
          };
          reader.readAsText(ev.target.files[0]);
        });
      },
      close: (html) => {
      }
    });
    d.render(true);
  }
  async exportReactions() {
    let data = await game.settings.get(id, "reactions");
    let dataJSON = JSON.stringify(data);
    saveDataToFile(dataJSON, "text/json", "reactions.json");
  }
  async saveReactionSetData(data) {
  }
  validateLoadedJSON(data) {
    let isValid = true;
    if (Array.isArray(data)) {
      if (data.length == 6) {
        for (const row of data) {
          for (const key in ReactionOption) {
            if (!(key in row)) {
              isValid = false;
              console.log(`Invalid JSON data in row ${row.id}: Missing ${key}`);
            }
          }
        }
      } else {
        isValid = false;
      }
    }
    return isValid;
  }
  showLoadPresetDialog() {
    let d = new Dialog({
      title: "Load Preset",
      content: `<p>Load the ${reactionSets[this.selectedPreset].label} preset? Any changes you've made to reactions will be lost.</p>`,
      buttons: {
        one: {
          icon: '<i class="fas fa-check"></i>',
          label: "Load Preset",
          callback: async () => {
            await loadReactionsPreset(this.selectedPreset);
            this.render(false);
          }
        },
        two: {
          icon: '<i class="fas fa-times"></i>',
          label: "Cancel",
          callback: () => {
          }
        }
      },
      default: "two",
      render: (html) => {
      },
      close: (html) => {
      }
    });
    d.render(true);
  }
}
const ReactionOption = {
  id: 0,
  title: "",
  icon: "",
  primaryColor: "",
  secondaryColor: "",
  style: "",
  speed: 0,
  effect: "",
  directional: false,
  enabled: true
};
async function loadReactionsPreset(presetName) {
  let reactions = reactionSets[presetName].reactions;
  await game.settings.set(id, "reactions", reactions);
  return;
}
function registerSettings() {
  console.log("Registering CGW Settings");
  game.settings.register(id, "reactions", {
    name: "Reaction",
    hint: "The list of reactions usable by your players",
    scope: "world",
    // "world" = sync to db, "client" = local storage
    config: false,
    // false if you dont want it to show in module config
    type: Array,
    // Number, Boolean, String, Object
    default: reactionSets["default"].reactions,
    onChange: (value) => {
    }
  });
  game.settings.register(id, "maxdisplayed", {
    name: "Maximum Simultaneous Reactions",
    hint: `Turn this down if you're running into performance issues from players spamming reactions.`,
    scope: "client",
    config: false,
    type: Number,
    range: {
      min: 10,
      max: 200,
      step: 5
    },
    default: 200
  });
  game.settings.registerMenu(id, "reactionSetup", {
    name: "Reactions",
    label: "Configure Available Reactions",
    // The text label used in the button
    hint: "Use this menu to create up to eight reactions for your players to use during play.",
    icon: "fas fa-bars",
    // A Font Awesome icon used in the submenu button
    type: ReactionSetupMenu,
    // A FormApplication subclass
    restricted: true
    // Restrict this submenu to gamemaster only?
  });
}
async function registerHelpers() {
  Handlebars.registerHelper("reactionPreview", (reaction) => {
    let html = getReactionHTML(reaction);
    return new Handlebars.SafeString(html);
  });
  Handlebars.registerHelper("last_x", (array, count) => {
    array = array.slice(-count);
    return array;
  });
}
function loadPartials() {
  let partialsList = [
    `modules/${id}/templates/parts/ReactionRow.hbs`,
    `modules/${id}/templates/parts/ReactionButtonBar.hbs`
  ];
  loadTemplates(partialsList);
}
function registerHooks() {
  Hooks.once("init", async function() {
    console.log("CrowdGoesWild Init");
    registerSocketEvents();
    registerSettings();
    loadPartials();
    registerHelpers();
  });
  Hooks.once("ready", async function() {
    if (game.user.isGM) {
      saveAllReactionPNGs();
    }
    exposeForMacros();
  });
  Hooks.on("hotbarDrop", async function(bar, data, slot) {
    if (data.type == "reaction") {
      let reactionId = data.id;
      let droppedReaction = await getReactionObject(reactionId);
      let newMacro = await Macro.create({
        name: `Reaction - ${droppedReaction.title}`,
        type: "script",
        scope: "global",
        img: await getReactionPNGUrl(reactionId),
        command: `game.modules.get('crowdgoeswild').api.sendReaction(${reactionId})`
      });
      game.user.assignHotbarMacro(newMacro, slot);
    }
  });
  Hooks.on("updateSetting", async function(oldSetting, newData, opts) {
    if (oldSetting.key === "crowdgoeswild.reactions") {
      renderChatButtonBar();
    }
  });
  Hooks.on("renderSidebarTab", async (app, html, data) => {
    console.log("Rendered sidebar tab");
    if (app.tabName !== "chat")
      return;
    renderChatButtonBar();
  });
}
function exposeForMacros() {
  game.modules.get(id).api = {
    sendReaction(reactionId) {
      sendReactionToSocket(reactionId);
    }
  };
}
game;
registerHooks();
animationInit();
//# sourceMappingURL=crowdgoeswild.js.map
