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
      // height: game.user.isGM ? 600 : "auto",
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
      let userCharacter = await user.character;
      if (userCharacter) {
        user.image = userCharacter.img;
      } else {
        user.image = user.avatar;
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
      this.close();
    });
    $(document).off("keyup.cgw-vibecheck");
    $(document).on("keyup.cgw-vibecheck", (ev) => {
      let key = parseInt(ev.key);
      if (key >= 1 && key <= 6) {
        console.log(key, key >= 1 && key <= 6);
        sendVibeCheckResponse(game.user, key - 1);
        this.close();
      }
    });
  }
  async close(options) {
    $(document).off("keyup.cgw-vibecheck");
    super.close();
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
async function sendVibeCheckResponse(user, responseId) {
  emitSocketEvent({
    type: "vibecheckresponse",
    payload: { user, response: responseId }
  });
}
async function initiateVibeCheck() {
  emitSocketEvent({
    type: "vibecheck",
    payload: { duration: game.settings.get(id, "vibecheckduration") }
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
      displayVibeCheck(payload.duration);
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
async function displayVibeCheck(duration) {
  let vc = VibeCheckPopup.getInstance();
  vc.userResponses = [];
  vc.render(true);
  if (duration > 0) {
    if (!game.user.isGM) {
      setTimeout(() => vc.close(), duration * 1e3);
    } else {
      setTimeout(() => vc.close(), duration * 2 * 1e3);
    }
  }
}
async function handleReactionClick(id2) {
  sendReactionToSocket(id2);
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
        directional: false,
        type: "fontawesome",
        path: "",
        maxWidth: 200,
        maxHeight: 200,
        fontSize: 48
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
        directional: false,
        type: "fontawesome",
        path: "",
        maxWidth: 200,
        maxHeight: 200,
        fontSize: 48
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
        directional: true,
        type: "fontawesome",
        path: "",
        maxWidth: 200,
        maxHeight: 200,
        fontSize: 48
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
        directional: false,
        type: "fontawesome",
        path: "",
        maxWidth: 200,
        maxHeight: 200,
        fontSize: 48
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
        directional: false,
        type: "fontawesome",
        path: "",
        maxWidth: 200,
        maxHeight: 200,
        fontSize: 48
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
        directional: false,
        type: "fontawesome",
        path: "",
        maxWidth: 200,
        maxHeight: 200,
        fontSize: 48
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
        directional: false,
        type: "fontawesome",
        path: "",
        maxWidth: 200,
        maxHeight: 200,
        fontSize: 48
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
        directional: false,
        type: "fontawesome",
        path: "",
        maxWidth: 200,
        maxHeight: 200,
        fontSize: 48
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
        directional: true,
        type: "fontawesome",
        path: "",
        maxWidth: 200,
        maxHeight: 200,
        fontSize: 48
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
        directional: false,
        type: "fontawesome",
        path: "",
        maxWidth: 200,
        maxHeight: 200,
        fontSize: 48
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
        directional: false,
        type: "fontawesome",
        path: "",
        maxWidth: 200,
        maxHeight: 200,
        fontSize: 48
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
        directional: false,
        type: "fontawesome",
        path: "",
        maxWidth: 200,
        maxHeight: 200,
        fontSize: 48
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
        directional: false,
        type: "fontawesome",
        path: "",
        maxWidth: 200,
        maxHeight: 200,
        fontSize: 48
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
        directional: false,
        type: "fontawesome",
        path: "",
        maxWidth: 200,
        maxHeight: 200,
        fontSize: 48
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
        directional: true,
        type: "fontawesome",
        path: "",
        maxWidth: 200,
        maxHeight: 200,
        fontSize: 48
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
        directional: false,
        type: "fontawesome",
        path: "",
        maxWidth: 200,
        maxHeight: 200,
        fontSize: 48
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
        directional: false,
        type: "fontawesome",
        path: "",
        maxWidth: 200,
        maxHeight: 200,
        fontSize: 48
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
        directional: false,
        type: "fontawesome",
        path: "",
        maxWidth: 200,
        maxHeight: 200,
        fontSize: 48
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
        directional: false,
        type: "fontawesome",
        path: "",
        maxWidth: 200,
        maxHeight: 200,
        fontSize: 48
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
        directional: false,
        type: "fontawesome",
        path: "",
        maxWidth: 200,
        maxHeight: 200,
        fontSize: 48
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
        directional: true,
        type: "fontawesome",
        path: "",
        maxWidth: 200,
        maxHeight: 200,
        fontSize: 48
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
        directional: false,
        type: "fontawesome",
        path: "",
        maxWidth: 200,
        maxHeight: 200,
        fontSize: 48
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
        directional: false,
        type: "fontawesome",
        path: "",
        maxWidth: 200,
        maxHeight: 200,
        fontSize: 48
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
        directional: false,
        type: "fontawesome",
        path: "",
        maxWidth: 200,
        maxHeight: 200,
        fontSize: 48
      }
    ]
  }
};
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
  enabled: true,
  type: "",
  path: "",
  maxWidth: 200,
  maxHeight: 200
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
  game.settings.register(id, "vibecheckautoclose", {
    name: "Close vibe check after selection",
    hint: "If this is enabled, players' vibe check popups will close after they make a selection. If this is disabled, it will stay open and they can choose another reaction.",
    scope: "world",
    // "world" = sync to db, "client" = local storage
    config: true,
    // false if you dont want it to show in module config
    type: Boolean,
    // Number, Boolean, String, Object
    default: true,
    onChange: (value) => {
    }
  });
  game.settings.register(id, "vibecheckduration", {
    name: "Vibe check duration",
    hint: "This determines, in seconds, how long players have to respond to a vibe check. The results will display to the GM for twice this duration. 0 = no timeout",
    scope: "world",
    // "world" = sync to db, "client" = local storage
    config: true,
    // false if you dont want it to show in module config
    type: Number,
    // Number, Boolean, String, Object
    default: 10,
    range: {
      min: 0,
      step: 10,
      max: 60
    },
    onChange: (value) => {
    }
  });
  game.settings.register(id, "moduleVersion", {
    scope: "world",
    // "world" = sync to db, "client" = local storage
    config: false,
    // false if you dont want it to show in module config
    type: String,
    // Number, Boolean, String, Object
    default: "1.0.0-alpha4"
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
}
class ReactionEditor extends FormApplication {
  constructor(reactionId, parent) {
    super({});
    __publicField(this, "reactionId");
    __publicField(this, "parent");
    __publicField(this, "loadedJSON", {});
    __publicField(this, "selectedPreset", "default");
    this.reactionId = reactionId;
    this.parent = parent;
  }
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["form", "crowdgoeswild", "reactionEdtior"],
      popOut: true,
      template: `modules/${id}/templates/ReactionEditor.hbs`,
      id: `${id}-reaction-editor`,
      title: "CrowdGoesWild - Reaction Editor",
      width: 600,
      height: "auto",
      submitOnChange: true,
      closeOnSubmit: false,
      resizable: true
    });
  }
  async getData() {
    let reactions = await game.settings.get(id, "reactions");
    let data = reactions.find((reaction) => reaction.id == this.reactionId);
    return data;
  }
  async _updateObject(event, formData) {
    expandObject(formData);
    let reactions = await game.settings.get(id, "reactions");
    let index = reactions.findIndex(
      (reaction) => reaction.id == this.reactionId
    );
    reactions[index] = formData;
    await game.settings.set(id, "reactions", reactions);
    await this.render();
    await this.parent.render();
  }
  switchColors(inputEl1, inputEl2) {
    let v1 = inputEl1.value;
    let v2 = inputEl2.value;
    console.log(inputEl1, inputEl2);
    inputEl1.value = v2;
    inputEl2.value = v1;
  }
  activateListeners(html) {
    super.activateListeners(html);
    html.find(".colorSwitch").on("click", (ev) => {
      ev.stopPropagation();
      let i1 = $(ev.currentTarget).parents(".colors").find(".primaryColor input.color").first().get(0);
      let i2 = $(ev.currentTarget).parents(".colors").find(".secondaryColor input.color").first().get(0);
      console.log(i1, i2);
      this.switchColors(i1, i2);
    });
  }
  // showImportReactionsDialog() {
  //   let d = new Dialog({
  //     title: "Import Reactions",
  //     content: `
  //           <p>Import a set of reactions from a JSON file? All current reactions will be overwritten.</p>
  //           <input type="file" id="importer" name="reactionjson" class="cgw importer">
  //           `,
  //     buttons: {
  //       one: {
  //         icon: '<i class="fas fa-check"></i>',
  //         label: "Import",
  //         callback: () => {
  //           if (this.loadedJSON) {
  //             this.saveReactionSetData(this.loadedJSON);
  //           }
  //         },
  //       },
  //       two: {
  //         icon: '<i class="fas fa-times"></i>',
  //         label: "Cancel",
  //         callback: () => {},
  //       },
  //     },
  //     default: "two",
  //     render: (html) => {
  //       $(html)
  //         .find("#importer")
  //         .on("change", (ev) => {
  //           console.log("Loaded file");
  //           let reader = new FileReader();
  //           reader.onload = (readerEv) => {
  //             try {
  //               let loadedJSON = JSON.parse(readerEv.target.result);
  //               if (this.validateLoadedJSON(loadedJSON)) {
  //                 this.loadedJSON = loadedJSON;
  //               }
  //             } catch (error) {
  //               console.log("Invalid JSON file");
  //               this.loadedJSON = false;
  //             }
  //           };
  //           reader.readAsText(ev.target.files[0]);
  //         });
  //     },
  //     close: (html) => {},
  //   });
  //   d.render(true);
  // }
  // async exportReactions() {
  //   let data = await game.settings.get(moduleId, "reactions");
  //   let dataJSON = JSON.stringify(data);
  //   saveDataToFile(dataJSON, "text/json", "reactions.json");
  // }
  // async saveReactionSetData(data) {
  // await game.settings.set(moduleId, 'reactions', data)
  // }
  // validateLoadedJSON(data) {
  //   let isValid = true;
  //   // make sure it's an array
  //   if (Array.isArray(data)) {
  //     // make sure nobody's slipping in the wrong number of reactions
  //     if (data.length == 6) {
  //       // check each row to make sure it has the right fields
  //       for (const row of data) {
  //         for (const key in ReactionOption) {
  //           if (!(key in row)) {
  //             isValid = false;
  //             console.log(`Invalid JSON data in row ${row.id}: Missing ${key}`);
  //           }
  //         }
  //       }
  //     } else {
  //       isValid = false;
  //     }
  //   }
  //   return isValid;
  // }
  // showLoadPresetDialog() {
  //   let d = new Dialog({
  //     title: "Load Preset",
  //     content: `<p>Load the ${
  //       reactionSets[this.selectedPreset].label
  //     } preset? Any changes you've made to reactions will be lost.</p>`,
  //     buttons: {
  //       one: {
  //         icon: '<i class="fas fa-check"></i>',
  //         label: "Load Preset",
  //         callback: async () => {
  //           await loadReactionsPreset(this.selectedPreset);
  //           this.render(false);
  //         },
  //       },
  //       two: {
  //         icon: '<i class="fas fa-times"></i>',
  //         label: "Cancel",
  //         callback: () => {},
  //       },
  //     },
  //     default: "two",
  //     render: (html) => {},
  //     close: (html) => {},
  //   });
  //   d.render(true);
  // }
}
class ReactionSetupMenu extends Application {
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
      width: 1200,
      // submitOnChange: true,
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
  // switchColors(inputEl1, inputEl2) {
  //   let v1 = inputEl1.value;
  //   let v2 = inputEl2.value;
  //   console.log(inputEl1, inputEl2);
  //   inputEl1.value = v2;
  //   inputEl2.value = v1;
  // }
  // async _updateObject(event, formData) {
  //   const data = expandObject(formData);
  //   let reactions = [];
  //   for (const reaction of Object.values(data)) {
  //     reactions[reaction.id] = reaction;
  //   }
  //   await game.settings.set(moduleId, "reactions", reactions);
  //   await this.render();
  // }
  activateListeners(html) {
    html.find("#resetButton").on("click", (ev) => {
      ev.stopPropagation();
      this.showLoadPresetDialog();
    });
    html.find(".reactionEdit").on("click", (ev) => {
      ev.stopPropagation();
      let reactionEditor = new ReactionEditor(
        ev.currentTarget.dataset.id,
        this
      );
      reactionEditor.render(true);
    });
    html.find("#reactionPreset").on("change", (ev) => {
      ev.stopPropagation();
      this.selectedPreset = ev.currentTarget.value;
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
  var _a, _b, _c;
  let htmlString = "";
  if (reaction.type == "fontawesome") {
    htmlString = `
          <i class="${reaction.style} fa-${reaction.icon} cgw-reaction" 
              data-id=${reaction.id}
              style="
                  color: ${reaction.primaryColor}; 
                  --fa-primary-color: ${reaction.primaryColor};
                  --fa-secondary-color: ${reaction.secondaryColor};
                  font-size: ${reaction.fontSize}px;
              ">
          </i>`;
  } else if (reaction.type == "filepicker" && ["png", "jpg", "jpeg", "webp", "avif", "svg", ".gif"].includes(
    (_a = reaction.path) == null ? void 0 : _a.split(".").pop()
  )) {
    htmlString = `
          <img
            class="cgw-reaction" 
            data-id=${reaction.id}
            src="${reaction.path}"
            style="
              max-width: ${reaction.maxWidth}px;
              max-height: ${reaction.maxHeight}px;
            "
          />`;
  } else if (reaction.type == "filepicker" && ["webm", "mp4", "m4v"].includes((_b = reaction.path) == null ? void 0 : _b.split(".").pop())) {
    htmlString = `
          <video class="cgw-reaction" data-id=${reaction.id} autoplay loop muted
            style="
              max-width: ${reaction.maxWidth}px;
              max-height: ${reaction.maxHeight}px;
            "
          >
            <source src="${reaction.path}" 
            type="video/${(_c = reaction.path) == null ? void 0 : _c.split(".").pop()}"
            />
          </video>
          `;
  }
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
  let $cgwContainer = $(".cgwcontainer");
  $cgwContainer.remove();
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
      $content.find("button.cgwSettings").on("click", (event) => {
        let reactionSetup = new ReactionSetupMenu();
        reactionSetup.render(true);
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
async function registerHelpers() {
  Handlebars.registerHelper("reactionPreview", (reaction) => {
    let html = getReactionHTML(reaction);
    return new Handlebars.SafeString(html);
  });
  Handlebars.registerHelper("last_x", (array, count) => {
    array = array.slice(-count);
    return array;
  });
  Handlebars.registerHelper("add", (input, add) => {
    return parseInt(input) + parseInt(add);
  });
  Handlebars.registerHelper("eq", (arg1, arg2) => {
    return arg1 == arg2;
  });
}
function loadPartials() {
  let partialsList = [
    `modules/${id}/templates/parts/ReactionRow.hbs`,
    `modules/${id}/templates/parts/ReactionButtonBar.hbs`
  ];
  loadTemplates(partialsList);
}
var reExports = {};
var re$3 = {
  get exports() {
    return reExports;
  },
  set exports(v) {
    reExports = v;
  }
};
const SEMVER_SPEC_VERSION = "2.0.0";
const MAX_LENGTH$2 = 256;
const MAX_SAFE_INTEGER$1 = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
9007199254740991;
const MAX_SAFE_COMPONENT_LENGTH = 16;
var constants$1 = {
  SEMVER_SPEC_VERSION,
  MAX_LENGTH: MAX_LENGTH$2,
  MAX_SAFE_INTEGER: MAX_SAFE_INTEGER$1,
  MAX_SAFE_COMPONENT_LENGTH
};
const debug$1 = typeof process === "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...args) => console.error("SEMVER", ...args) : () => {
};
var debug_1 = debug$1;
(function(module, exports) {
  const { MAX_SAFE_COMPONENT_LENGTH: MAX_SAFE_COMPONENT_LENGTH2 } = constants$1;
  const debug2 = debug_1;
  exports = module.exports = {};
  const re2 = exports.re = [];
  const src = exports.src = [];
  const t2 = exports.t = {};
  let R = 0;
  const createToken = (name, value, isGlobal) => {
    const index = R++;
    debug2(name, index, value);
    t2[name] = index;
    src[index] = value;
    re2[index] = new RegExp(value, isGlobal ? "g" : void 0);
  };
  createToken("NUMERICIDENTIFIER", "0|[1-9]\\d*");
  createToken("NUMERICIDENTIFIERLOOSE", "[0-9]+");
  createToken("NONNUMERICIDENTIFIER", "\\d*[a-zA-Z-][a-zA-Z0-9-]*");
  createToken("MAINVERSION", `(${src[t2.NUMERICIDENTIFIER]})\\.(${src[t2.NUMERICIDENTIFIER]})\\.(${src[t2.NUMERICIDENTIFIER]})`);
  createToken("MAINVERSIONLOOSE", `(${src[t2.NUMERICIDENTIFIERLOOSE]})\\.(${src[t2.NUMERICIDENTIFIERLOOSE]})\\.(${src[t2.NUMERICIDENTIFIERLOOSE]})`);
  createToken("PRERELEASEIDENTIFIER", `(?:${src[t2.NUMERICIDENTIFIER]}|${src[t2.NONNUMERICIDENTIFIER]})`);
  createToken("PRERELEASEIDENTIFIERLOOSE", `(?:${src[t2.NUMERICIDENTIFIERLOOSE]}|${src[t2.NONNUMERICIDENTIFIER]})`);
  createToken("PRERELEASE", `(?:-(${src[t2.PRERELEASEIDENTIFIER]}(?:\\.${src[t2.PRERELEASEIDENTIFIER]})*))`);
  createToken("PRERELEASELOOSE", `(?:-?(${src[t2.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${src[t2.PRERELEASEIDENTIFIERLOOSE]})*))`);
  createToken("BUILDIDENTIFIER", "[0-9A-Za-z-]+");
  createToken("BUILD", `(?:\\+(${src[t2.BUILDIDENTIFIER]}(?:\\.${src[t2.BUILDIDENTIFIER]})*))`);
  createToken("FULLPLAIN", `v?${src[t2.MAINVERSION]}${src[t2.PRERELEASE]}?${src[t2.BUILD]}?`);
  createToken("FULL", `^${src[t2.FULLPLAIN]}$`);
  createToken("LOOSEPLAIN", `[v=\\s]*${src[t2.MAINVERSIONLOOSE]}${src[t2.PRERELEASELOOSE]}?${src[t2.BUILD]}?`);
  createToken("LOOSE", `^${src[t2.LOOSEPLAIN]}$`);
  createToken("GTLT", "((?:<|>)?=?)");
  createToken("XRANGEIDENTIFIERLOOSE", `${src[t2.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`);
  createToken("XRANGEIDENTIFIER", `${src[t2.NUMERICIDENTIFIER]}|x|X|\\*`);
  createToken("XRANGEPLAIN", `[v=\\s]*(${src[t2.XRANGEIDENTIFIER]})(?:\\.(${src[t2.XRANGEIDENTIFIER]})(?:\\.(${src[t2.XRANGEIDENTIFIER]})(?:${src[t2.PRERELEASE]})?${src[t2.BUILD]}?)?)?`);
  createToken("XRANGEPLAINLOOSE", `[v=\\s]*(${src[t2.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src[t2.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src[t2.XRANGEIDENTIFIERLOOSE]})(?:${src[t2.PRERELEASELOOSE]})?${src[t2.BUILD]}?)?)?`);
  createToken("XRANGE", `^${src[t2.GTLT]}\\s*${src[t2.XRANGEPLAIN]}$`);
  createToken("XRANGELOOSE", `^${src[t2.GTLT]}\\s*${src[t2.XRANGEPLAINLOOSE]}$`);
  createToken("COERCE", `${"(^|[^\\d])(\\d{1,"}${MAX_SAFE_COMPONENT_LENGTH2}})(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH2}}))?(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH2}}))?(?:$|[^\\d])`);
  createToken("COERCERTL", src[t2.COERCE], true);
  createToken("LONETILDE", "(?:~>?)");
  createToken("TILDETRIM", `(\\s*)${src[t2.LONETILDE]}\\s+`, true);
  exports.tildeTrimReplace = "$1~";
  createToken("TILDE", `^${src[t2.LONETILDE]}${src[t2.XRANGEPLAIN]}$`);
  createToken("TILDELOOSE", `^${src[t2.LONETILDE]}${src[t2.XRANGEPLAINLOOSE]}$`);
  createToken("LONECARET", "(?:\\^)");
  createToken("CARETTRIM", `(\\s*)${src[t2.LONECARET]}\\s+`, true);
  exports.caretTrimReplace = "$1^";
  createToken("CARET", `^${src[t2.LONECARET]}${src[t2.XRANGEPLAIN]}$`);
  createToken("CARETLOOSE", `^${src[t2.LONECARET]}${src[t2.XRANGEPLAINLOOSE]}$`);
  createToken("COMPARATORLOOSE", `^${src[t2.GTLT]}\\s*(${src[t2.LOOSEPLAIN]})$|^$`);
  createToken("COMPARATOR", `^${src[t2.GTLT]}\\s*(${src[t2.FULLPLAIN]})$|^$`);
  createToken("COMPARATORTRIM", `(\\s*)${src[t2.GTLT]}\\s*(${src[t2.LOOSEPLAIN]}|${src[t2.XRANGEPLAIN]})`, true);
  exports.comparatorTrimReplace = "$1$2$3";
  createToken("HYPHENRANGE", `^\\s*(${src[t2.XRANGEPLAIN]})\\s+-\\s+(${src[t2.XRANGEPLAIN]})\\s*$`);
  createToken("HYPHENRANGELOOSE", `^\\s*(${src[t2.XRANGEPLAINLOOSE]})\\s+-\\s+(${src[t2.XRANGEPLAINLOOSE]})\\s*$`);
  createToken("STAR", "(<|>)?=?\\s*\\*");
  createToken("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$");
  createToken("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
})(re$3, reExports);
const opts = ["includePrerelease", "loose", "rtl"];
const parseOptions$2 = (options) => !options ? {} : typeof options !== "object" ? { loose: true } : opts.filter((k) => options[k]).reduce((o, k) => {
  o[k] = true;
  return o;
}, {});
var parseOptions_1 = parseOptions$2;
const numeric = /^[0-9]+$/;
const compareIdentifiers$1 = (a, b) => {
  const anum = numeric.test(a);
  const bnum = numeric.test(b);
  if (anum && bnum) {
    a = +a;
    b = +b;
  }
  return a === b ? 0 : anum && !bnum ? -1 : bnum && !anum ? 1 : a < b ? -1 : 1;
};
const rcompareIdentifiers = (a, b) => compareIdentifiers$1(b, a);
var identifiers$1 = {
  compareIdentifiers: compareIdentifiers$1,
  rcompareIdentifiers
};
const debug = debug_1;
const { MAX_LENGTH: MAX_LENGTH$1, MAX_SAFE_INTEGER } = constants$1;
const { re: re$2, t: t$2 } = reExports;
const parseOptions$1 = parseOptions_1;
const { compareIdentifiers } = identifiers$1;
let SemVer$d = class SemVer {
  constructor(version, options) {
    options = parseOptions$1(options);
    if (version instanceof SemVer) {
      if (version.loose === !!options.loose && version.includePrerelease === !!options.includePrerelease) {
        return version;
      } else {
        version = version.version;
      }
    } else if (typeof version !== "string") {
      throw new TypeError(`Invalid Version: ${version}`);
    }
    if (version.length > MAX_LENGTH$1) {
      throw new TypeError(
        `version is longer than ${MAX_LENGTH$1} characters`
      );
    }
    debug("SemVer", version, options);
    this.options = options;
    this.loose = !!options.loose;
    this.includePrerelease = !!options.includePrerelease;
    const m = version.trim().match(options.loose ? re$2[t$2.LOOSE] : re$2[t$2.FULL]);
    if (!m) {
      throw new TypeError(`Invalid Version: ${version}`);
    }
    this.raw = version;
    this.major = +m[1];
    this.minor = +m[2];
    this.patch = +m[3];
    if (this.major > MAX_SAFE_INTEGER || this.major < 0) {
      throw new TypeError("Invalid major version");
    }
    if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) {
      throw new TypeError("Invalid minor version");
    }
    if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) {
      throw new TypeError("Invalid patch version");
    }
    if (!m[4]) {
      this.prerelease = [];
    } else {
      this.prerelease = m[4].split(".").map((id2) => {
        if (/^[0-9]+$/.test(id2)) {
          const num = +id2;
          if (num >= 0 && num < MAX_SAFE_INTEGER) {
            return num;
          }
        }
        return id2;
      });
    }
    this.build = m[5] ? m[5].split(".") : [];
    this.format();
  }
  format() {
    this.version = `${this.major}.${this.minor}.${this.patch}`;
    if (this.prerelease.length) {
      this.version += `-${this.prerelease.join(".")}`;
    }
    return this.version;
  }
  toString() {
    return this.version;
  }
  compare(other) {
    debug("SemVer.compare", this.version, this.options, other);
    if (!(other instanceof SemVer)) {
      if (typeof other === "string" && other === this.version) {
        return 0;
      }
      other = new SemVer(other, this.options);
    }
    if (other.version === this.version) {
      return 0;
    }
    return this.compareMain(other) || this.comparePre(other);
  }
  compareMain(other) {
    if (!(other instanceof SemVer)) {
      other = new SemVer(other, this.options);
    }
    return compareIdentifiers(this.major, other.major) || compareIdentifiers(this.minor, other.minor) || compareIdentifiers(this.patch, other.patch);
  }
  comparePre(other) {
    if (!(other instanceof SemVer)) {
      other = new SemVer(other, this.options);
    }
    if (this.prerelease.length && !other.prerelease.length) {
      return -1;
    } else if (!this.prerelease.length && other.prerelease.length) {
      return 1;
    } else if (!this.prerelease.length && !other.prerelease.length) {
      return 0;
    }
    let i = 0;
    do {
      const a = this.prerelease[i];
      const b = other.prerelease[i];
      debug("prerelease compare", i, a, b);
      if (a === void 0 && b === void 0) {
        return 0;
      } else if (b === void 0) {
        return 1;
      } else if (a === void 0) {
        return -1;
      } else if (a === b) {
        continue;
      } else {
        return compareIdentifiers(a, b);
      }
    } while (++i);
  }
  compareBuild(other) {
    if (!(other instanceof SemVer)) {
      other = new SemVer(other, this.options);
    }
    let i = 0;
    do {
      const a = this.build[i];
      const b = other.build[i];
      debug("prerelease compare", i, a, b);
      if (a === void 0 && b === void 0) {
        return 0;
      } else if (b === void 0) {
        return 1;
      } else if (a === void 0) {
        return -1;
      } else if (a === b) {
        continue;
      } else {
        return compareIdentifiers(a, b);
      }
    } while (++i);
  }
  // preminor will bump the version up to the next minor release, and immediately
  // down to pre-release. premajor and prepatch work the same way.
  inc(release, identifier) {
    switch (release) {
      case "premajor":
        this.prerelease.length = 0;
        this.patch = 0;
        this.minor = 0;
        this.major++;
        this.inc("pre", identifier);
        break;
      case "preminor":
        this.prerelease.length = 0;
        this.patch = 0;
        this.minor++;
        this.inc("pre", identifier);
        break;
      case "prepatch":
        this.prerelease.length = 0;
        this.inc("patch", identifier);
        this.inc("pre", identifier);
        break;
      case "prerelease":
        if (this.prerelease.length === 0) {
          this.inc("patch", identifier);
        }
        this.inc("pre", identifier);
        break;
      case "major":
        if (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) {
          this.major++;
        }
        this.minor = 0;
        this.patch = 0;
        this.prerelease = [];
        break;
      case "minor":
        if (this.patch !== 0 || this.prerelease.length === 0) {
          this.minor++;
        }
        this.patch = 0;
        this.prerelease = [];
        break;
      case "patch":
        if (this.prerelease.length === 0) {
          this.patch++;
        }
        this.prerelease = [];
        break;
      case "pre":
        if (this.prerelease.length === 0) {
          this.prerelease = [0];
        } else {
          let i = this.prerelease.length;
          while (--i >= 0) {
            if (typeof this.prerelease[i] === "number") {
              this.prerelease[i]++;
              i = -2;
            }
          }
          if (i === -1) {
            this.prerelease.push(0);
          }
        }
        if (identifier) {
          if (compareIdentifiers(this.prerelease[0], identifier) === 0) {
            if (isNaN(this.prerelease[1])) {
              this.prerelease = [identifier, 0];
            }
          } else {
            this.prerelease = [identifier, 0];
          }
        }
        break;
      default:
        throw new Error(`invalid increment argument: ${release}`);
    }
    this.format();
    this.raw = this.version;
    return this;
  }
};
var semver$1 = SemVer$d;
const { MAX_LENGTH } = constants$1;
const { re: re$1, t: t$1 } = reExports;
const SemVer$c = semver$1;
const parseOptions = parseOptions_1;
const parse$6 = (version, options) => {
  options = parseOptions(options);
  if (version instanceof SemVer$c) {
    return version;
  }
  if (typeof version !== "string") {
    return null;
  }
  if (version.length > MAX_LENGTH) {
    return null;
  }
  const r = options.loose ? re$1[t$1.LOOSE] : re$1[t$1.FULL];
  if (!r.test(version)) {
    return null;
  }
  try {
    return new SemVer$c(version, options);
  } catch (er) {
    return null;
  }
};
var parse_1 = parse$6;
const parse$5 = parse_1;
const valid$2 = (version, options) => {
  const v = parse$5(version, options);
  return v ? v.version : null;
};
var valid_1 = valid$2;
const parse$4 = parse_1;
const clean$1 = (version, options) => {
  const s = parse$4(version.trim().replace(/^[=v]+/, ""), options);
  return s ? s.version : null;
};
var clean_1 = clean$1;
const SemVer$b = semver$1;
const inc$1 = (version, release, options, identifier) => {
  if (typeof options === "string") {
    identifier = options;
    options = void 0;
  }
  try {
    return new SemVer$b(
      version instanceof SemVer$b ? version.version : version,
      options
    ).inc(release, identifier).version;
  } catch (er) {
    return null;
  }
};
var inc_1 = inc$1;
const SemVer$a = semver$1;
const compare$b = (a, b, loose) => new SemVer$a(a, loose).compare(new SemVer$a(b, loose));
var compare_1 = compare$b;
const compare$a = compare_1;
const eq$3 = (a, b, loose) => compare$a(a, b, loose) === 0;
var eq_1 = eq$3;
const parse$3 = parse_1;
const eq$2 = eq_1;
const diff$1 = (version1, version2) => {
  if (eq$2(version1, version2)) {
    return null;
  } else {
    const v1 = parse$3(version1);
    const v2 = parse$3(version2);
    const hasPre = v1.prerelease.length || v2.prerelease.length;
    const prefix = hasPre ? "pre" : "";
    const defaultResult = hasPre ? "prerelease" : "";
    for (const key in v1) {
      if (key === "major" || key === "minor" || key === "patch") {
        if (v1[key] !== v2[key]) {
          return prefix + key;
        }
      }
    }
    return defaultResult;
  }
};
var diff_1 = diff$1;
const SemVer$9 = semver$1;
const major$1 = (a, loose) => new SemVer$9(a, loose).major;
var major_1 = major$1;
const SemVer$8 = semver$1;
const minor$1 = (a, loose) => new SemVer$8(a, loose).minor;
var minor_1 = minor$1;
const SemVer$7 = semver$1;
const patch$1 = (a, loose) => new SemVer$7(a, loose).patch;
var patch_1 = patch$1;
const parse$2 = parse_1;
const prerelease$1 = (version, options) => {
  const parsed = parse$2(version, options);
  return parsed && parsed.prerelease.length ? parsed.prerelease : null;
};
var prerelease_1 = prerelease$1;
const compare$9 = compare_1;
const rcompare$1 = (a, b, loose) => compare$9(b, a, loose);
var rcompare_1 = rcompare$1;
const compare$8 = compare_1;
const compareLoose$1 = (a, b) => compare$8(a, b, true);
var compareLoose_1 = compareLoose$1;
const SemVer$6 = semver$1;
const compareBuild$3 = (a, b, loose) => {
  const versionA = new SemVer$6(a, loose);
  const versionB = new SemVer$6(b, loose);
  return versionA.compare(versionB) || versionA.compareBuild(versionB);
};
var compareBuild_1 = compareBuild$3;
const compareBuild$2 = compareBuild_1;
const sort$1 = (list, loose) => list.sort((a, b) => compareBuild$2(a, b, loose));
var sort_1 = sort$1;
const compareBuild$1 = compareBuild_1;
const rsort$1 = (list, loose) => list.sort((a, b) => compareBuild$1(b, a, loose));
var rsort_1 = rsort$1;
const compare$7 = compare_1;
const gt$4 = (a, b, loose) => compare$7(a, b, loose) > 0;
var gt_1 = gt$4;
const compare$6 = compare_1;
const lt$3 = (a, b, loose) => compare$6(a, b, loose) < 0;
var lt_1 = lt$3;
const compare$5 = compare_1;
const neq$2 = (a, b, loose) => compare$5(a, b, loose) !== 0;
var neq_1 = neq$2;
const compare$4 = compare_1;
const gte$3 = (a, b, loose) => compare$4(a, b, loose) >= 0;
var gte_1 = gte$3;
const compare$3 = compare_1;
const lte$3 = (a, b, loose) => compare$3(a, b, loose) <= 0;
var lte_1 = lte$3;
const eq$1 = eq_1;
const neq$1 = neq_1;
const gt$3 = gt_1;
const gte$2 = gte_1;
const lt$2 = lt_1;
const lte$2 = lte_1;
const cmp$1 = (a, op, b, loose) => {
  switch (op) {
    case "===":
      if (typeof a === "object") {
        a = a.version;
      }
      if (typeof b === "object") {
        b = b.version;
      }
      return a === b;
    case "!==":
      if (typeof a === "object") {
        a = a.version;
      }
      if (typeof b === "object") {
        b = b.version;
      }
      return a !== b;
    case "":
    case "=":
    case "==":
      return eq$1(a, b, loose);
    case "!=":
      return neq$1(a, b, loose);
    case ">":
      return gt$3(a, b, loose);
    case ">=":
      return gte$2(a, b, loose);
    case "<":
      return lt$2(a, b, loose);
    case "<=":
      return lte$2(a, b, loose);
    default:
      throw new TypeError(`Invalid operator: ${op}`);
  }
};
var cmp_1 = cmp$1;
const SemVer$5 = semver$1;
const parse$1 = parse_1;
const { re, t } = reExports;
const coerce$1 = (version, options) => {
  if (version instanceof SemVer$5) {
    return version;
  }
  if (typeof version === "number") {
    version = String(version);
  }
  if (typeof version !== "string") {
    return null;
  }
  options = options || {};
  let match = null;
  if (!options.rtl) {
    match = version.match(re[t.COERCE]);
  } else {
    let next;
    while ((next = re[t.COERCERTL].exec(version)) && (!match || match.index + match[0].length !== version.length)) {
      if (!match || next.index + next[0].length !== match.index + match[0].length) {
        match = next;
      }
      re[t.COERCERTL].lastIndex = next.index + next[1].length + next[2].length;
    }
    re[t.COERCERTL].lastIndex = -1;
  }
  if (match === null) {
    return null;
  }
  return parse$1(`${match[2]}.${match[3] || "0"}.${match[4] || "0"}`, options);
};
var coerce_1 = coerce$1;
var iterator;
var hasRequiredIterator;
function requireIterator() {
  if (hasRequiredIterator)
    return iterator;
  hasRequiredIterator = 1;
  iterator = function(Yallist2) {
    Yallist2.prototype[Symbol.iterator] = function* () {
      for (let walker = this.head; walker; walker = walker.next) {
        yield walker.value;
      }
    };
  };
  return iterator;
}
var yallist = Yallist$1;
Yallist$1.Node = Node;
Yallist$1.create = Yallist$1;
function Yallist$1(list) {
  var self = this;
  if (!(self instanceof Yallist$1)) {
    self = new Yallist$1();
  }
  self.tail = null;
  self.head = null;
  self.length = 0;
  if (list && typeof list.forEach === "function") {
    list.forEach(function(item) {
      self.push(item);
    });
  } else if (arguments.length > 0) {
    for (var i = 0, l = arguments.length; i < l; i++) {
      self.push(arguments[i]);
    }
  }
  return self;
}
Yallist$1.prototype.removeNode = function(node) {
  if (node.list !== this) {
    throw new Error("removing node which does not belong to this list");
  }
  var next = node.next;
  var prev = node.prev;
  if (next) {
    next.prev = prev;
  }
  if (prev) {
    prev.next = next;
  }
  if (node === this.head) {
    this.head = next;
  }
  if (node === this.tail) {
    this.tail = prev;
  }
  node.list.length--;
  node.next = null;
  node.prev = null;
  node.list = null;
  return next;
};
Yallist$1.prototype.unshiftNode = function(node) {
  if (node === this.head) {
    return;
  }
  if (node.list) {
    node.list.removeNode(node);
  }
  var head = this.head;
  node.list = this;
  node.next = head;
  if (head) {
    head.prev = node;
  }
  this.head = node;
  if (!this.tail) {
    this.tail = node;
  }
  this.length++;
};
Yallist$1.prototype.pushNode = function(node) {
  if (node === this.tail) {
    return;
  }
  if (node.list) {
    node.list.removeNode(node);
  }
  var tail = this.tail;
  node.list = this;
  node.prev = tail;
  if (tail) {
    tail.next = node;
  }
  this.tail = node;
  if (!this.head) {
    this.head = node;
  }
  this.length++;
};
Yallist$1.prototype.push = function() {
  for (var i = 0, l = arguments.length; i < l; i++) {
    push(this, arguments[i]);
  }
  return this.length;
};
Yallist$1.prototype.unshift = function() {
  for (var i = 0, l = arguments.length; i < l; i++) {
    unshift(this, arguments[i]);
  }
  return this.length;
};
Yallist$1.prototype.pop = function() {
  if (!this.tail) {
    return void 0;
  }
  var res = this.tail.value;
  this.tail = this.tail.prev;
  if (this.tail) {
    this.tail.next = null;
  } else {
    this.head = null;
  }
  this.length--;
  return res;
};
Yallist$1.prototype.shift = function() {
  if (!this.head) {
    return void 0;
  }
  var res = this.head.value;
  this.head = this.head.next;
  if (this.head) {
    this.head.prev = null;
  } else {
    this.tail = null;
  }
  this.length--;
  return res;
};
Yallist$1.prototype.forEach = function(fn, thisp) {
  thisp = thisp || this;
  for (var walker = this.head, i = 0; walker !== null; i++) {
    fn.call(thisp, walker.value, i, this);
    walker = walker.next;
  }
};
Yallist$1.prototype.forEachReverse = function(fn, thisp) {
  thisp = thisp || this;
  for (var walker = this.tail, i = this.length - 1; walker !== null; i--) {
    fn.call(thisp, walker.value, i, this);
    walker = walker.prev;
  }
};
Yallist$1.prototype.get = function(n) {
  for (var i = 0, walker = this.head; walker !== null && i < n; i++) {
    walker = walker.next;
  }
  if (i === n && walker !== null) {
    return walker.value;
  }
};
Yallist$1.prototype.getReverse = function(n) {
  for (var i = 0, walker = this.tail; walker !== null && i < n; i++) {
    walker = walker.prev;
  }
  if (i === n && walker !== null) {
    return walker.value;
  }
};
Yallist$1.prototype.map = function(fn, thisp) {
  thisp = thisp || this;
  var res = new Yallist$1();
  for (var walker = this.head; walker !== null; ) {
    res.push(fn.call(thisp, walker.value, this));
    walker = walker.next;
  }
  return res;
};
Yallist$1.prototype.mapReverse = function(fn, thisp) {
  thisp = thisp || this;
  var res = new Yallist$1();
  for (var walker = this.tail; walker !== null; ) {
    res.push(fn.call(thisp, walker.value, this));
    walker = walker.prev;
  }
  return res;
};
Yallist$1.prototype.reduce = function(fn, initial) {
  var acc;
  var walker = this.head;
  if (arguments.length > 1) {
    acc = initial;
  } else if (this.head) {
    walker = this.head.next;
    acc = this.head.value;
  } else {
    throw new TypeError("Reduce of empty list with no initial value");
  }
  for (var i = 0; walker !== null; i++) {
    acc = fn(acc, walker.value, i);
    walker = walker.next;
  }
  return acc;
};
Yallist$1.prototype.reduceReverse = function(fn, initial) {
  var acc;
  var walker = this.tail;
  if (arguments.length > 1) {
    acc = initial;
  } else if (this.tail) {
    walker = this.tail.prev;
    acc = this.tail.value;
  } else {
    throw new TypeError("Reduce of empty list with no initial value");
  }
  for (var i = this.length - 1; walker !== null; i--) {
    acc = fn(acc, walker.value, i);
    walker = walker.prev;
  }
  return acc;
};
Yallist$1.prototype.toArray = function() {
  var arr = new Array(this.length);
  for (var i = 0, walker = this.head; walker !== null; i++) {
    arr[i] = walker.value;
    walker = walker.next;
  }
  return arr;
};
Yallist$1.prototype.toArrayReverse = function() {
  var arr = new Array(this.length);
  for (var i = 0, walker = this.tail; walker !== null; i++) {
    arr[i] = walker.value;
    walker = walker.prev;
  }
  return arr;
};
Yallist$1.prototype.slice = function(from, to) {
  to = to || this.length;
  if (to < 0) {
    to += this.length;
  }
  from = from || 0;
  if (from < 0) {
    from += this.length;
  }
  var ret = new Yallist$1();
  if (to < from || to < 0) {
    return ret;
  }
  if (from < 0) {
    from = 0;
  }
  if (to > this.length) {
    to = this.length;
  }
  for (var i = 0, walker = this.head; walker !== null && i < from; i++) {
    walker = walker.next;
  }
  for (; walker !== null && i < to; i++, walker = walker.next) {
    ret.push(walker.value);
  }
  return ret;
};
Yallist$1.prototype.sliceReverse = function(from, to) {
  to = to || this.length;
  if (to < 0) {
    to += this.length;
  }
  from = from || 0;
  if (from < 0) {
    from += this.length;
  }
  var ret = new Yallist$1();
  if (to < from || to < 0) {
    return ret;
  }
  if (from < 0) {
    from = 0;
  }
  if (to > this.length) {
    to = this.length;
  }
  for (var i = this.length, walker = this.tail; walker !== null && i > to; i--) {
    walker = walker.prev;
  }
  for (; walker !== null && i > from; i--, walker = walker.prev) {
    ret.push(walker.value);
  }
  return ret;
};
Yallist$1.prototype.splice = function(start, deleteCount, ...nodes) {
  if (start > this.length) {
    start = this.length - 1;
  }
  if (start < 0) {
    start = this.length + start;
  }
  for (var i = 0, walker = this.head; walker !== null && i < start; i++) {
    walker = walker.next;
  }
  var ret = [];
  for (var i = 0; walker && i < deleteCount; i++) {
    ret.push(walker.value);
    walker = this.removeNode(walker);
  }
  if (walker === null) {
    walker = this.tail;
  }
  if (walker !== this.head && walker !== this.tail) {
    walker = walker.prev;
  }
  for (var i = 0; i < nodes.length; i++) {
    walker = insert(this, walker, nodes[i]);
  }
  return ret;
};
Yallist$1.prototype.reverse = function() {
  var head = this.head;
  var tail = this.tail;
  for (var walker = head; walker !== null; walker = walker.prev) {
    var p = walker.prev;
    walker.prev = walker.next;
    walker.next = p;
  }
  this.head = tail;
  this.tail = head;
  return this;
};
function insert(self, node, value) {
  var inserted = node === self.head ? new Node(value, null, node, self) : new Node(value, node, node.next, self);
  if (inserted.next === null) {
    self.tail = inserted;
  }
  if (inserted.prev === null) {
    self.head = inserted;
  }
  self.length++;
  return inserted;
}
function push(self, item) {
  self.tail = new Node(item, self.tail, null, self);
  if (!self.head) {
    self.head = self.tail;
  }
  self.length++;
}
function unshift(self, item) {
  self.head = new Node(item, null, self.head, self);
  if (!self.tail) {
    self.tail = self.head;
  }
  self.length++;
}
function Node(value, prev, next, list) {
  if (!(this instanceof Node)) {
    return new Node(value, prev, next, list);
  }
  this.list = list;
  this.value = value;
  if (prev) {
    prev.next = this;
    this.prev = prev;
  } else {
    this.prev = null;
  }
  if (next) {
    next.prev = this;
    this.next = next;
  } else {
    this.next = null;
  }
}
try {
  requireIterator()(Yallist$1);
} catch (er) {
}
const Yallist = yallist;
const MAX = Symbol("max");
const LENGTH = Symbol("length");
const LENGTH_CALCULATOR = Symbol("lengthCalculator");
const ALLOW_STALE = Symbol("allowStale");
const MAX_AGE = Symbol("maxAge");
const DISPOSE = Symbol("dispose");
const NO_DISPOSE_ON_SET = Symbol("noDisposeOnSet");
const LRU_LIST = Symbol("lruList");
const CACHE = Symbol("cache");
const UPDATE_AGE_ON_GET = Symbol("updateAgeOnGet");
const naiveLength = () => 1;
class LRUCache {
  constructor(options) {
    if (typeof options === "number")
      options = { max: options };
    if (!options)
      options = {};
    if (options.max && (typeof options.max !== "number" || options.max < 0))
      throw new TypeError("max must be a non-negative number");
    this[MAX] = options.max || Infinity;
    const lc = options.length || naiveLength;
    this[LENGTH_CALCULATOR] = typeof lc !== "function" ? naiveLength : lc;
    this[ALLOW_STALE] = options.stale || false;
    if (options.maxAge && typeof options.maxAge !== "number")
      throw new TypeError("maxAge must be a number");
    this[MAX_AGE] = options.maxAge || 0;
    this[DISPOSE] = options.dispose;
    this[NO_DISPOSE_ON_SET] = options.noDisposeOnSet || false;
    this[UPDATE_AGE_ON_GET] = options.updateAgeOnGet || false;
    this.reset();
  }
  // resize the cache when the max changes.
  set max(mL) {
    if (typeof mL !== "number" || mL < 0)
      throw new TypeError("max must be a non-negative number");
    this[MAX] = mL || Infinity;
    trim(this);
  }
  get max() {
    return this[MAX];
  }
  set allowStale(allowStale) {
    this[ALLOW_STALE] = !!allowStale;
  }
  get allowStale() {
    return this[ALLOW_STALE];
  }
  set maxAge(mA) {
    if (typeof mA !== "number")
      throw new TypeError("maxAge must be a non-negative number");
    this[MAX_AGE] = mA;
    trim(this);
  }
  get maxAge() {
    return this[MAX_AGE];
  }
  // resize the cache when the lengthCalculator changes.
  set lengthCalculator(lC) {
    if (typeof lC !== "function")
      lC = naiveLength;
    if (lC !== this[LENGTH_CALCULATOR]) {
      this[LENGTH_CALCULATOR] = lC;
      this[LENGTH] = 0;
      this[LRU_LIST].forEach((hit) => {
        hit.length = this[LENGTH_CALCULATOR](hit.value, hit.key);
        this[LENGTH] += hit.length;
      });
    }
    trim(this);
  }
  get lengthCalculator() {
    return this[LENGTH_CALCULATOR];
  }
  get length() {
    return this[LENGTH];
  }
  get itemCount() {
    return this[LRU_LIST].length;
  }
  rforEach(fn, thisp) {
    thisp = thisp || this;
    for (let walker = this[LRU_LIST].tail; walker !== null; ) {
      const prev = walker.prev;
      forEachStep(this, fn, walker, thisp);
      walker = prev;
    }
  }
  forEach(fn, thisp) {
    thisp = thisp || this;
    for (let walker = this[LRU_LIST].head; walker !== null; ) {
      const next = walker.next;
      forEachStep(this, fn, walker, thisp);
      walker = next;
    }
  }
  keys() {
    return this[LRU_LIST].toArray().map((k) => k.key);
  }
  values() {
    return this[LRU_LIST].toArray().map((k) => k.value);
  }
  reset() {
    if (this[DISPOSE] && this[LRU_LIST] && this[LRU_LIST].length) {
      this[LRU_LIST].forEach((hit) => this[DISPOSE](hit.key, hit.value));
    }
    this[CACHE] = /* @__PURE__ */ new Map();
    this[LRU_LIST] = new Yallist();
    this[LENGTH] = 0;
  }
  dump() {
    return this[LRU_LIST].map((hit) => isStale(this, hit) ? false : {
      k: hit.key,
      v: hit.value,
      e: hit.now + (hit.maxAge || 0)
    }).toArray().filter((h) => h);
  }
  dumpLru() {
    return this[LRU_LIST];
  }
  set(key, value, maxAge) {
    maxAge = maxAge || this[MAX_AGE];
    if (maxAge && typeof maxAge !== "number")
      throw new TypeError("maxAge must be a number");
    const now = maxAge ? Date.now() : 0;
    const len = this[LENGTH_CALCULATOR](value, key);
    if (this[CACHE].has(key)) {
      if (len > this[MAX]) {
        del(this, this[CACHE].get(key));
        return false;
      }
      const node = this[CACHE].get(key);
      const item = node.value;
      if (this[DISPOSE]) {
        if (!this[NO_DISPOSE_ON_SET])
          this[DISPOSE](key, item.value);
      }
      item.now = now;
      item.maxAge = maxAge;
      item.value = value;
      this[LENGTH] += len - item.length;
      item.length = len;
      this.get(key);
      trim(this);
      return true;
    }
    const hit = new Entry(key, value, len, now, maxAge);
    if (hit.length > this[MAX]) {
      if (this[DISPOSE])
        this[DISPOSE](key, value);
      return false;
    }
    this[LENGTH] += hit.length;
    this[LRU_LIST].unshift(hit);
    this[CACHE].set(key, this[LRU_LIST].head);
    trim(this);
    return true;
  }
  has(key) {
    if (!this[CACHE].has(key))
      return false;
    const hit = this[CACHE].get(key).value;
    return !isStale(this, hit);
  }
  get(key) {
    return get(this, key, true);
  }
  peek(key) {
    return get(this, key, false);
  }
  pop() {
    const node = this[LRU_LIST].tail;
    if (!node)
      return null;
    del(this, node);
    return node.value;
  }
  del(key) {
    del(this, this[CACHE].get(key));
  }
  load(arr) {
    this.reset();
    const now = Date.now();
    for (let l = arr.length - 1; l >= 0; l--) {
      const hit = arr[l];
      const expiresAt = hit.e || 0;
      if (expiresAt === 0)
        this.set(hit.k, hit.v);
      else {
        const maxAge = expiresAt - now;
        if (maxAge > 0) {
          this.set(hit.k, hit.v, maxAge);
        }
      }
    }
  }
  prune() {
    this[CACHE].forEach((value, key) => get(this, key, false));
  }
}
const get = (self, key, doUse) => {
  const node = self[CACHE].get(key);
  if (node) {
    const hit = node.value;
    if (isStale(self, hit)) {
      del(self, node);
      if (!self[ALLOW_STALE])
        return void 0;
    } else {
      if (doUse) {
        if (self[UPDATE_AGE_ON_GET])
          node.value.now = Date.now();
        self[LRU_LIST].unshiftNode(node);
      }
    }
    return hit.value;
  }
};
const isStale = (self, hit) => {
  if (!hit || !hit.maxAge && !self[MAX_AGE])
    return false;
  const diff2 = Date.now() - hit.now;
  return hit.maxAge ? diff2 > hit.maxAge : self[MAX_AGE] && diff2 > self[MAX_AGE];
};
const trim = (self) => {
  if (self[LENGTH] > self[MAX]) {
    for (let walker = self[LRU_LIST].tail; self[LENGTH] > self[MAX] && walker !== null; ) {
      const prev = walker.prev;
      del(self, walker);
      walker = prev;
    }
  }
};
const del = (self, node) => {
  if (node) {
    const hit = node.value;
    if (self[DISPOSE])
      self[DISPOSE](hit.key, hit.value);
    self[LENGTH] -= hit.length;
    self[CACHE].delete(hit.key);
    self[LRU_LIST].removeNode(node);
  }
};
class Entry {
  constructor(key, value, length, now, maxAge) {
    this.key = key;
    this.value = value;
    this.length = length;
    this.now = now;
    this.maxAge = maxAge || 0;
  }
}
const forEachStep = (self, fn, node, thisp) => {
  let hit = node.value;
  if (isStale(self, hit)) {
    del(self, node);
    if (!self[ALLOW_STALE])
      hit = void 0;
  }
  if (hit)
    fn.call(thisp, hit.value, hit.key, self);
};
var lruCache = LRUCache;
var range;
var hasRequiredRange;
function requireRange() {
  if (hasRequiredRange)
    return range;
  hasRequiredRange = 1;
  class Range2 {
    constructor(range2, options) {
      options = parseOptions2(options);
      if (range2 instanceof Range2) {
        if (range2.loose === !!options.loose && range2.includePrerelease === !!options.includePrerelease) {
          return range2;
        } else {
          return new Range2(range2.raw, options);
        }
      }
      if (range2 instanceof Comparator2) {
        this.raw = range2.value;
        this.set = [[range2]];
        this.format();
        return this;
      }
      this.options = options;
      this.loose = !!options.loose;
      this.includePrerelease = !!options.includePrerelease;
      this.raw = range2;
      this.set = range2.split("||").map((r) => this.parseRange(r.trim())).filter((c) => c.length);
      if (!this.set.length) {
        throw new TypeError(`Invalid SemVer Range: ${range2}`);
      }
      if (this.set.length > 1) {
        const first = this.set[0];
        this.set = this.set.filter((c) => !isNullSet(c[0]));
        if (this.set.length === 0) {
          this.set = [first];
        } else if (this.set.length > 1) {
          for (const c of this.set) {
            if (c.length === 1 && isAny(c[0])) {
              this.set = [c];
              break;
            }
          }
        }
      }
      this.format();
    }
    format() {
      this.range = this.set.map((comps) => {
        return comps.join(" ").trim();
      }).join("||").trim();
      return this.range;
    }
    toString() {
      return this.range;
    }
    parseRange(range2) {
      range2 = range2.trim();
      const memoOpts = Object.keys(this.options).join(",");
      const memoKey = `parseRange:${memoOpts}:${range2}`;
      const cached = cache2.get(memoKey);
      if (cached) {
        return cached;
      }
      const loose = this.options.loose;
      const hr = loose ? re2[t2.HYPHENRANGELOOSE] : re2[t2.HYPHENRANGE];
      range2 = range2.replace(hr, hyphenReplace(this.options.includePrerelease));
      debug2("hyphen replace", range2);
      range2 = range2.replace(re2[t2.COMPARATORTRIM], comparatorTrimReplace);
      debug2("comparator trim", range2);
      range2 = range2.replace(re2[t2.TILDETRIM], tildeTrimReplace);
      range2 = range2.replace(re2[t2.CARETTRIM], caretTrimReplace);
      range2 = range2.split(/\s+/).join(" ");
      let rangeList = range2.split(" ").map((comp) => parseComparator(comp, this.options)).join(" ").split(/\s+/).map((comp) => replaceGTE0(comp, this.options));
      if (loose) {
        rangeList = rangeList.filter((comp) => {
          debug2("loose invalid filter", comp, this.options);
          return !!comp.match(re2[t2.COMPARATORLOOSE]);
        });
      }
      debug2("range list", rangeList);
      const rangeMap = /* @__PURE__ */ new Map();
      const comparators = rangeList.map((comp) => new Comparator2(comp, this.options));
      for (const comp of comparators) {
        if (isNullSet(comp)) {
          return [comp];
        }
        rangeMap.set(comp.value, comp);
      }
      if (rangeMap.size > 1 && rangeMap.has("")) {
        rangeMap.delete("");
      }
      const result = [...rangeMap.values()];
      cache2.set(memoKey, result);
      return result;
    }
    intersects(range2, options) {
      if (!(range2 instanceof Range2)) {
        throw new TypeError("a Range is required");
      }
      return this.set.some((thisComparators) => {
        return isSatisfiable(thisComparators, options) && range2.set.some((rangeComparators) => {
          return isSatisfiable(rangeComparators, options) && thisComparators.every((thisComparator) => {
            return rangeComparators.every((rangeComparator) => {
              return thisComparator.intersects(rangeComparator, options);
            });
          });
        });
      });
    }
    // if ANY of the sets match ALL of its comparators, then pass
    test(version) {
      if (!version) {
        return false;
      }
      if (typeof version === "string") {
        try {
          version = new SemVer3(version, this.options);
        } catch (er) {
          return false;
        }
      }
      for (let i = 0; i < this.set.length; i++) {
        if (testSet(this.set[i], version, this.options)) {
          return true;
        }
      }
      return false;
    }
  }
  range = Range2;
  const LRU = lruCache;
  const cache2 = new LRU({ max: 1e3 });
  const parseOptions2 = parseOptions_1;
  const Comparator2 = requireComparator();
  const debug2 = debug_1;
  const SemVer3 = semver$1;
  const {
    re: re2,
    t: t2,
    comparatorTrimReplace,
    tildeTrimReplace,
    caretTrimReplace
  } = reExports;
  const isNullSet = (c) => c.value === "<0.0.0-0";
  const isAny = (c) => c.value === "";
  const isSatisfiable = (comparators, options) => {
    let result = true;
    const remainingComparators = comparators.slice();
    let testComparator = remainingComparators.pop();
    while (result && remainingComparators.length) {
      result = remainingComparators.every((otherComparator) => {
        return testComparator.intersects(otherComparator, options);
      });
      testComparator = remainingComparators.pop();
    }
    return result;
  };
  const parseComparator = (comp, options) => {
    debug2("comp", comp, options);
    comp = replaceCarets(comp, options);
    debug2("caret", comp);
    comp = replaceTildes(comp, options);
    debug2("tildes", comp);
    comp = replaceXRanges(comp, options);
    debug2("xrange", comp);
    comp = replaceStars(comp, options);
    debug2("stars", comp);
    return comp;
  };
  const isX = (id2) => !id2 || id2.toLowerCase() === "x" || id2 === "*";
  const replaceTildes = (comp, options) => comp.trim().split(/\s+/).map((c) => {
    return replaceTilde(c, options);
  }).join(" ");
  const replaceTilde = (comp, options) => {
    const r = options.loose ? re2[t2.TILDELOOSE] : re2[t2.TILDE];
    return comp.replace(r, (_, M, m, p, pr) => {
      debug2("tilde", comp, _, M, m, p, pr);
      let ret;
      if (isX(M)) {
        ret = "";
      } else if (isX(m)) {
        ret = `>=${M}.0.0 <${+M + 1}.0.0-0`;
      } else if (isX(p)) {
        ret = `>=${M}.${m}.0 <${M}.${+m + 1}.0-0`;
      } else if (pr) {
        debug2("replaceTilde pr", pr);
        ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
      } else {
        ret = `>=${M}.${m}.${p} <${M}.${+m + 1}.0-0`;
      }
      debug2("tilde return", ret);
      return ret;
    });
  };
  const replaceCarets = (comp, options) => comp.trim().split(/\s+/).map((c) => {
    return replaceCaret(c, options);
  }).join(" ");
  const replaceCaret = (comp, options) => {
    debug2("caret", comp, options);
    const r = options.loose ? re2[t2.CARETLOOSE] : re2[t2.CARET];
    const z = options.includePrerelease ? "-0" : "";
    return comp.replace(r, (_, M, m, p, pr) => {
      debug2("caret", comp, _, M, m, p, pr);
      let ret;
      if (isX(M)) {
        ret = "";
      } else if (isX(m)) {
        ret = `>=${M}.0.0${z} <${+M + 1}.0.0-0`;
      } else if (isX(p)) {
        if (M === "0") {
          ret = `>=${M}.${m}.0${z} <${M}.${+m + 1}.0-0`;
        } else {
          ret = `>=${M}.${m}.0${z} <${+M + 1}.0.0-0`;
        }
      } else if (pr) {
        debug2("replaceCaret pr", pr);
        if (M === "0") {
          if (m === "0") {
            ret = `>=${M}.${m}.${p}-${pr} <${M}.${m}.${+p + 1}-0`;
          } else {
            ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
          }
        } else {
          ret = `>=${M}.${m}.${p}-${pr} <${+M + 1}.0.0-0`;
        }
      } else {
        debug2("no pr");
        if (M === "0") {
          if (m === "0") {
            ret = `>=${M}.${m}.${p}${z} <${M}.${m}.${+p + 1}-0`;
          } else {
            ret = `>=${M}.${m}.${p}${z} <${M}.${+m + 1}.0-0`;
          }
        } else {
          ret = `>=${M}.${m}.${p} <${+M + 1}.0.0-0`;
        }
      }
      debug2("caret return", ret);
      return ret;
    });
  };
  const replaceXRanges = (comp, options) => {
    debug2("replaceXRanges", comp, options);
    return comp.split(/\s+/).map((c) => {
      return replaceXRange(c, options);
    }).join(" ");
  };
  const replaceXRange = (comp, options) => {
    comp = comp.trim();
    const r = options.loose ? re2[t2.XRANGELOOSE] : re2[t2.XRANGE];
    return comp.replace(r, (ret, gtlt, M, m, p, pr) => {
      debug2("xRange", comp, ret, gtlt, M, m, p, pr);
      const xM = isX(M);
      const xm = xM || isX(m);
      const xp = xm || isX(p);
      const anyX = xp;
      if (gtlt === "=" && anyX) {
        gtlt = "";
      }
      pr = options.includePrerelease ? "-0" : "";
      if (xM) {
        if (gtlt === ">" || gtlt === "<") {
          ret = "<0.0.0-0";
        } else {
          ret = "*";
        }
      } else if (gtlt && anyX) {
        if (xm) {
          m = 0;
        }
        p = 0;
        if (gtlt === ">") {
          gtlt = ">=";
          if (xm) {
            M = +M + 1;
            m = 0;
            p = 0;
          } else {
            m = +m + 1;
            p = 0;
          }
        } else if (gtlt === "<=") {
          gtlt = "<";
          if (xm) {
            M = +M + 1;
          } else {
            m = +m + 1;
          }
        }
        if (gtlt === "<") {
          pr = "-0";
        }
        ret = `${gtlt + M}.${m}.${p}${pr}`;
      } else if (xm) {
        ret = `>=${M}.0.0${pr} <${+M + 1}.0.0-0`;
      } else if (xp) {
        ret = `>=${M}.${m}.0${pr} <${M}.${+m + 1}.0-0`;
      }
      debug2("xRange return", ret);
      return ret;
    });
  };
  const replaceStars = (comp, options) => {
    debug2("replaceStars", comp, options);
    return comp.trim().replace(re2[t2.STAR], "");
  };
  const replaceGTE0 = (comp, options) => {
    debug2("replaceGTE0", comp, options);
    return comp.trim().replace(re2[options.includePrerelease ? t2.GTE0PRE : t2.GTE0], "");
  };
  const hyphenReplace = (incPr) => ($0, from, fM, fm, fp, fpr, fb, to, tM, tm, tp, tpr, tb) => {
    if (isX(fM)) {
      from = "";
    } else if (isX(fm)) {
      from = `>=${fM}.0.0${incPr ? "-0" : ""}`;
    } else if (isX(fp)) {
      from = `>=${fM}.${fm}.0${incPr ? "-0" : ""}`;
    } else if (fpr) {
      from = `>=${from}`;
    } else {
      from = `>=${from}${incPr ? "-0" : ""}`;
    }
    if (isX(tM)) {
      to = "";
    } else if (isX(tm)) {
      to = `<${+tM + 1}.0.0-0`;
    } else if (isX(tp)) {
      to = `<${tM}.${+tm + 1}.0-0`;
    } else if (tpr) {
      to = `<=${tM}.${tm}.${tp}-${tpr}`;
    } else if (incPr) {
      to = `<${tM}.${tm}.${+tp + 1}-0`;
    } else {
      to = `<=${to}`;
    }
    return `${from} ${to}`.trim();
  };
  const testSet = (set, version, options) => {
    for (let i = 0; i < set.length; i++) {
      if (!set[i].test(version)) {
        return false;
      }
    }
    if (version.prerelease.length && !options.includePrerelease) {
      for (let i = 0; i < set.length; i++) {
        debug2(set[i].semver);
        if (set[i].semver === Comparator2.ANY) {
          continue;
        }
        if (set[i].semver.prerelease.length > 0) {
          const allowed = set[i].semver;
          if (allowed.major === version.major && allowed.minor === version.minor && allowed.patch === version.patch) {
            return true;
          }
        }
      }
      return false;
    }
    return true;
  };
  return range;
}
var comparator;
var hasRequiredComparator;
function requireComparator() {
  if (hasRequiredComparator)
    return comparator;
  hasRequiredComparator = 1;
  const ANY2 = Symbol("SemVer ANY");
  class Comparator2 {
    static get ANY() {
      return ANY2;
    }
    constructor(comp, options) {
      options = parseOptions2(options);
      if (comp instanceof Comparator2) {
        if (comp.loose === !!options.loose) {
          return comp;
        } else {
          comp = comp.value;
        }
      }
      debug2("comparator", comp, options);
      this.options = options;
      this.loose = !!options.loose;
      this.parse(comp);
      if (this.semver === ANY2) {
        this.value = "";
      } else {
        this.value = this.operator + this.semver.version;
      }
      debug2("comp", this);
    }
    parse(comp) {
      const r = this.options.loose ? re2[t2.COMPARATORLOOSE] : re2[t2.COMPARATOR];
      const m = comp.match(r);
      if (!m) {
        throw new TypeError(`Invalid comparator: ${comp}`);
      }
      this.operator = m[1] !== void 0 ? m[1] : "";
      if (this.operator === "=") {
        this.operator = "";
      }
      if (!m[2]) {
        this.semver = ANY2;
      } else {
        this.semver = new SemVer3(m[2], this.options.loose);
      }
    }
    toString() {
      return this.value;
    }
    test(version) {
      debug2("Comparator.test", version, this.options.loose);
      if (this.semver === ANY2 || version === ANY2) {
        return true;
      }
      if (typeof version === "string") {
        try {
          version = new SemVer3(version, this.options);
        } catch (er) {
          return false;
        }
      }
      return cmp2(version, this.operator, this.semver, this.options);
    }
    intersects(comp, options) {
      if (!(comp instanceof Comparator2)) {
        throw new TypeError("a Comparator is required");
      }
      if (!options || typeof options !== "object") {
        options = {
          loose: !!options,
          includePrerelease: false
        };
      }
      if (this.operator === "") {
        if (this.value === "") {
          return true;
        }
        return new Range2(comp.value, options).test(this.value);
      } else if (comp.operator === "") {
        if (comp.value === "") {
          return true;
        }
        return new Range2(this.value, options).test(comp.semver);
      }
      const sameDirectionIncreasing = (this.operator === ">=" || this.operator === ">") && (comp.operator === ">=" || comp.operator === ">");
      const sameDirectionDecreasing = (this.operator === "<=" || this.operator === "<") && (comp.operator === "<=" || comp.operator === "<");
      const sameSemVer = this.semver.version === comp.semver.version;
      const differentDirectionsInclusive = (this.operator === ">=" || this.operator === "<=") && (comp.operator === ">=" || comp.operator === "<=");
      const oppositeDirectionsLessThan = cmp2(this.semver, "<", comp.semver, options) && (this.operator === ">=" || this.operator === ">") && (comp.operator === "<=" || comp.operator === "<");
      const oppositeDirectionsGreaterThan = cmp2(this.semver, ">", comp.semver, options) && (this.operator === "<=" || this.operator === "<") && (comp.operator === ">=" || comp.operator === ">");
      return sameDirectionIncreasing || sameDirectionDecreasing || sameSemVer && differentDirectionsInclusive || oppositeDirectionsLessThan || oppositeDirectionsGreaterThan;
    }
  }
  comparator = Comparator2;
  const parseOptions2 = parseOptions_1;
  const { re: re2, t: t2 } = reExports;
  const cmp2 = cmp_1;
  const debug2 = debug_1;
  const SemVer3 = semver$1;
  const Range2 = requireRange();
  return comparator;
}
const Range$9 = requireRange();
const satisfies$4 = (version, range2, options) => {
  try {
    range2 = new Range$9(range2, options);
  } catch (er) {
    return false;
  }
  return range2.test(version);
};
var satisfies_1 = satisfies$4;
const Range$8 = requireRange();
const toComparators$1 = (range2, options) => new Range$8(range2, options).set.map((comp) => comp.map((c) => c.value).join(" ").trim().split(" "));
var toComparators_1 = toComparators$1;
const SemVer$4 = semver$1;
const Range$7 = requireRange();
const maxSatisfying$1 = (versions, range2, options) => {
  let max = null;
  let maxSV = null;
  let rangeObj = null;
  try {
    rangeObj = new Range$7(range2, options);
  } catch (er) {
    return null;
  }
  versions.forEach((v) => {
    if (rangeObj.test(v)) {
      if (!max || maxSV.compare(v) === -1) {
        max = v;
        maxSV = new SemVer$4(max, options);
      }
    }
  });
  return max;
};
var maxSatisfying_1 = maxSatisfying$1;
const SemVer$3 = semver$1;
const Range$6 = requireRange();
const minSatisfying$1 = (versions, range2, options) => {
  let min = null;
  let minSV = null;
  let rangeObj = null;
  try {
    rangeObj = new Range$6(range2, options);
  } catch (er) {
    return null;
  }
  versions.forEach((v) => {
    if (rangeObj.test(v)) {
      if (!min || minSV.compare(v) === 1) {
        min = v;
        minSV = new SemVer$3(min, options);
      }
    }
  });
  return min;
};
var minSatisfying_1 = minSatisfying$1;
const SemVer$2 = semver$1;
const Range$5 = requireRange();
const gt$2 = gt_1;
const minVersion$1 = (range2, loose) => {
  range2 = new Range$5(range2, loose);
  let minver = new SemVer$2("0.0.0");
  if (range2.test(minver)) {
    return minver;
  }
  minver = new SemVer$2("0.0.0-0");
  if (range2.test(minver)) {
    return minver;
  }
  minver = null;
  for (let i = 0; i < range2.set.length; ++i) {
    const comparators = range2.set[i];
    let setMin = null;
    comparators.forEach((comparator2) => {
      const compver = new SemVer$2(comparator2.semver.version);
      switch (comparator2.operator) {
        case ">":
          if (compver.prerelease.length === 0) {
            compver.patch++;
          } else {
            compver.prerelease.push(0);
          }
          compver.raw = compver.format();
        case "":
        case ">=":
          if (!setMin || gt$2(compver, setMin)) {
            setMin = compver;
          }
          break;
        case "<":
        case "<=":
          break;
        default:
          throw new Error(`Unexpected operation: ${comparator2.operator}`);
      }
    });
    if (setMin && (!minver || gt$2(minver, setMin))) {
      minver = setMin;
    }
  }
  if (minver && range2.test(minver)) {
    return minver;
  }
  return null;
};
var minVersion_1 = minVersion$1;
const Range$4 = requireRange();
const validRange$1 = (range2, options) => {
  try {
    return new Range$4(range2, options).range || "*";
  } catch (er) {
    return null;
  }
};
var valid$1 = validRange$1;
const SemVer$1 = semver$1;
const Comparator$2 = requireComparator();
const { ANY: ANY$1 } = Comparator$2;
const Range$3 = requireRange();
const satisfies$3 = satisfies_1;
const gt$1 = gt_1;
const lt$1 = lt_1;
const lte$1 = lte_1;
const gte$1 = gte_1;
const outside$3 = (version, range2, hilo, options) => {
  version = new SemVer$1(version, options);
  range2 = new Range$3(range2, options);
  let gtfn, ltefn, ltfn, comp, ecomp;
  switch (hilo) {
    case ">":
      gtfn = gt$1;
      ltefn = lte$1;
      ltfn = lt$1;
      comp = ">";
      ecomp = ">=";
      break;
    case "<":
      gtfn = lt$1;
      ltefn = gte$1;
      ltfn = gt$1;
      comp = "<";
      ecomp = "<=";
      break;
    default:
      throw new TypeError('Must provide a hilo val of "<" or ">"');
  }
  if (satisfies$3(version, range2, options)) {
    return false;
  }
  for (let i = 0; i < range2.set.length; ++i) {
    const comparators = range2.set[i];
    let high = null;
    let low = null;
    comparators.forEach((comparator2) => {
      if (comparator2.semver === ANY$1) {
        comparator2 = new Comparator$2(">=0.0.0");
      }
      high = high || comparator2;
      low = low || comparator2;
      if (gtfn(comparator2.semver, high.semver, options)) {
        high = comparator2;
      } else if (ltfn(comparator2.semver, low.semver, options)) {
        low = comparator2;
      }
    });
    if (high.operator === comp || high.operator === ecomp) {
      return false;
    }
    if ((!low.operator || low.operator === comp) && ltefn(version, low.semver)) {
      return false;
    } else if (low.operator === ecomp && ltfn(version, low.semver)) {
      return false;
    }
  }
  return true;
};
var outside_1 = outside$3;
const outside$2 = outside_1;
const gtr$1 = (version, range2, options) => outside$2(version, range2, ">", options);
var gtr_1 = gtr$1;
const outside$1 = outside_1;
const ltr$1 = (version, range2, options) => outside$1(version, range2, "<", options);
var ltr_1 = ltr$1;
const Range$2 = requireRange();
const intersects$1 = (r1, r2, options) => {
  r1 = new Range$2(r1, options);
  r2 = new Range$2(r2, options);
  return r1.intersects(r2);
};
var intersects_1 = intersects$1;
const satisfies$2 = satisfies_1;
const compare$2 = compare_1;
var simplify = (versions, range2, options) => {
  const set = [];
  let first = null;
  let prev = null;
  const v = versions.sort((a, b) => compare$2(a, b, options));
  for (const version of v) {
    const included = satisfies$2(version, range2, options);
    if (included) {
      prev = version;
      if (!first) {
        first = version;
      }
    } else {
      if (prev) {
        set.push([first, prev]);
      }
      prev = null;
      first = null;
    }
  }
  if (first) {
    set.push([first, null]);
  }
  const ranges = [];
  for (const [min, max] of set) {
    if (min === max) {
      ranges.push(min);
    } else if (!max && min === v[0]) {
      ranges.push("*");
    } else if (!max) {
      ranges.push(`>=${min}`);
    } else if (min === v[0]) {
      ranges.push(`<=${max}`);
    } else {
      ranges.push(`${min} - ${max}`);
    }
  }
  const simplified = ranges.join(" || ");
  const original = typeof range2.raw === "string" ? range2.raw : String(range2);
  return simplified.length < original.length ? simplified : range2;
};
const Range$1 = requireRange();
const Comparator$1 = requireComparator();
const { ANY } = Comparator$1;
const satisfies$1 = satisfies_1;
const compare$1 = compare_1;
const subset$1 = (sub, dom, options = {}) => {
  if (sub === dom) {
    return true;
  }
  sub = new Range$1(sub, options);
  dom = new Range$1(dom, options);
  let sawNonNull = false;
  OUTER:
    for (const simpleSub of sub.set) {
      for (const simpleDom of dom.set) {
        const isSub = simpleSubset(simpleSub, simpleDom, options);
        sawNonNull = sawNonNull || isSub !== null;
        if (isSub) {
          continue OUTER;
        }
      }
      if (sawNonNull) {
        return false;
      }
    }
  return true;
};
const simpleSubset = (sub, dom, options) => {
  if (sub === dom) {
    return true;
  }
  if (sub.length === 1 && sub[0].semver === ANY) {
    if (dom.length === 1 && dom[0].semver === ANY) {
      return true;
    } else if (options.includePrerelease) {
      sub = [new Comparator$1(">=0.0.0-0")];
    } else {
      sub = [new Comparator$1(">=0.0.0")];
    }
  }
  if (dom.length === 1 && dom[0].semver === ANY) {
    if (options.includePrerelease) {
      return true;
    } else {
      dom = [new Comparator$1(">=0.0.0")];
    }
  }
  const eqSet = /* @__PURE__ */ new Set();
  let gt2, lt2;
  for (const c of sub) {
    if (c.operator === ">" || c.operator === ">=") {
      gt2 = higherGT(gt2, c, options);
    } else if (c.operator === "<" || c.operator === "<=") {
      lt2 = lowerLT(lt2, c, options);
    } else {
      eqSet.add(c.semver);
    }
  }
  if (eqSet.size > 1) {
    return null;
  }
  let gtltComp;
  if (gt2 && lt2) {
    gtltComp = compare$1(gt2.semver, lt2.semver, options);
    if (gtltComp > 0) {
      return null;
    } else if (gtltComp === 0 && (gt2.operator !== ">=" || lt2.operator !== "<=")) {
      return null;
    }
  }
  for (const eq2 of eqSet) {
    if (gt2 && !satisfies$1(eq2, String(gt2), options)) {
      return null;
    }
    if (lt2 && !satisfies$1(eq2, String(lt2), options)) {
      return null;
    }
    for (const c of dom) {
      if (!satisfies$1(eq2, String(c), options)) {
        return false;
      }
    }
    return true;
  }
  let higher, lower;
  let hasDomLT, hasDomGT;
  let needDomLTPre = lt2 && !options.includePrerelease && lt2.semver.prerelease.length ? lt2.semver : false;
  let needDomGTPre = gt2 && !options.includePrerelease && gt2.semver.prerelease.length ? gt2.semver : false;
  if (needDomLTPre && needDomLTPre.prerelease.length === 1 && lt2.operator === "<" && needDomLTPre.prerelease[0] === 0) {
    needDomLTPre = false;
  }
  for (const c of dom) {
    hasDomGT = hasDomGT || c.operator === ">" || c.operator === ">=";
    hasDomLT = hasDomLT || c.operator === "<" || c.operator === "<=";
    if (gt2) {
      if (needDomGTPre) {
        if (c.semver.prerelease && c.semver.prerelease.length && c.semver.major === needDomGTPre.major && c.semver.minor === needDomGTPre.minor && c.semver.patch === needDomGTPre.patch) {
          needDomGTPre = false;
        }
      }
      if (c.operator === ">" || c.operator === ">=") {
        higher = higherGT(gt2, c, options);
        if (higher === c && higher !== gt2) {
          return false;
        }
      } else if (gt2.operator === ">=" && !satisfies$1(gt2.semver, String(c), options)) {
        return false;
      }
    }
    if (lt2) {
      if (needDomLTPre) {
        if (c.semver.prerelease && c.semver.prerelease.length && c.semver.major === needDomLTPre.major && c.semver.minor === needDomLTPre.minor && c.semver.patch === needDomLTPre.patch) {
          needDomLTPre = false;
        }
      }
      if (c.operator === "<" || c.operator === "<=") {
        lower = lowerLT(lt2, c, options);
        if (lower === c && lower !== lt2) {
          return false;
        }
      } else if (lt2.operator === "<=" && !satisfies$1(lt2.semver, String(c), options)) {
        return false;
      }
    }
    if (!c.operator && (lt2 || gt2) && gtltComp !== 0) {
      return false;
    }
  }
  if (gt2 && hasDomLT && !lt2 && gtltComp !== 0) {
    return false;
  }
  if (lt2 && hasDomGT && !gt2 && gtltComp !== 0) {
    return false;
  }
  if (needDomGTPre || needDomLTPre) {
    return false;
  }
  return true;
};
const higherGT = (a, b, options) => {
  if (!a) {
    return b;
  }
  const comp = compare$1(a.semver, b.semver, options);
  return comp > 0 ? a : comp < 0 ? b : b.operator === ">" && a.operator === ">=" ? b : a;
};
const lowerLT = (a, b, options) => {
  if (!a) {
    return b;
  }
  const comp = compare$1(a.semver, b.semver, options);
  return comp < 0 ? a : comp > 0 ? b : b.operator === "<" && a.operator === "<=" ? b : a;
};
var subset_1 = subset$1;
const internalRe = reExports;
const constants = constants$1;
const SemVer2 = semver$1;
const identifiers = identifiers$1;
const parse = parse_1;
const valid = valid_1;
const clean = clean_1;
const inc = inc_1;
const diff = diff_1;
const major = major_1;
const minor = minor_1;
const patch = patch_1;
const prerelease = prerelease_1;
const compare = compare_1;
const rcompare = rcompare_1;
const compareLoose = compareLoose_1;
const compareBuild = compareBuild_1;
const sort = sort_1;
const rsort = rsort_1;
const gt = gt_1;
const lt = lt_1;
const eq = eq_1;
const neq = neq_1;
const gte = gte_1;
const lte = lte_1;
const cmp = cmp_1;
const coerce = coerce_1;
const Comparator = requireComparator();
const Range = requireRange();
const satisfies = satisfies_1;
const toComparators = toComparators_1;
const maxSatisfying = maxSatisfying_1;
const minSatisfying = minSatisfying_1;
const minVersion = minVersion_1;
const validRange = valid$1;
const outside = outside_1;
const gtr = gtr_1;
const ltr = ltr_1;
const intersects = intersects_1;
const simplifyRange = simplify;
const subset = subset_1;
var semver = {
  parse,
  valid,
  clean,
  inc,
  diff,
  major,
  minor,
  patch,
  prerelease,
  compare,
  rcompare,
  compareLoose,
  compareBuild,
  sort,
  rsort,
  gt,
  lt,
  eq,
  neq,
  gte,
  lte,
  cmp,
  coerce,
  Comparator,
  Range,
  satisfies,
  toComparators,
  maxSatisfying,
  minSatisfying,
  minVersion,
  validRange,
  outside,
  gtr,
  ltr,
  intersects,
  simplifyRange,
  subset,
  SemVer: SemVer2,
  re: internalRe.re,
  src: internalRe.src,
  tokens: internalRe.t,
  SEMVER_SPEC_VERSION: constants.SEMVER_SPEC_VERSION,
  compareIdentifiers: identifiers.compareIdentifiers,
  rcompareIdentifiers: identifiers.rcompareIdentifiers
};
async function runMigrationChecks() {
  let module = await game.modules.get("crowdgoeswild");
  let installedVersion = module.version;
  console.log(installedVersion);
  if (installedVersion == "#{VERSION}#") {
    console.log(
      "No version number available. Skipping migration. Things might run wonky."
    );
    return;
  } else {
    let oldVersion;
    try {
      oldVersion = await game.settings.get(id, "moduleVersion");
    } catch (error) {
      console.log(
        "moduleVersion setting not registered somehow. Must be pre-1.0.0a4"
      );
      oldVersion = "1.0.0-alpha4";
    }
    console.log("---- Running migration checks ----");
    if (semver.lt(oldVersion, "1.0.0-alpha5")) {
      console.log("Pre-1.0.0-alpha5. Adding updated reaction fields");
      addTypeToReactions(game.settings.get(id, "reactions"));
    } else {
      console.log("No migrations needed.");
    }
    game.settings.set(id, "moduleVersion", installedVersion);
  }
}
async function addTypeToReactions(reactions) {
  let newReactions = reactions.map((reaction) => {
    if (!reaction.type) {
      reaction.type = "fontawesome";
    }
    if (!reaction.path) {
      reaction.path = "";
    }
    if (!reaction.maxWidth) {
      reaction.maxWidth = 200;
    }
    if (!reaction.maxHeight) {
      reaction.maxHeight = 200;
    }
    if (!reaction.fontSize) {
      reaction.fontSize = 48;
    }
    return reaction;
  });
  game.settings.set(id, "reactions", newReactions);
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
      runMigrationChecks();
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
  Hooks.on("updateSetting", async function(oldSetting, newData, opts2) {
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
