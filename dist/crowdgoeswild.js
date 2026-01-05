import { gsap, CustomEase, CustomWiggle, Physics2DPlugin } from "/scripts/greensock/esm/all.js";
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
function toArray(arrayLike) {
  const arr = [];
  for (let i = 0, l = arrayLike.length; i < l; i++) {
    arr.push(arrayLike[i]);
  }
  return arr;
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
    resourceUrl += (/\?/.test(resourceUrl) ? "&" : "?") + (/* @__PURE__ */ new Date()).getTime();
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
    if (getContentFromUrl) ;
    else {
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
            inline.insertRule(rule, inline.cssRules.length);
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
function normalizeFontFamily(font) {
  return font.trim().replace(/["']/g, "");
}
function getUsedFonts(node) {
  const fonts = /* @__PURE__ */ new Set();
  function traverse(node2) {
    const fontFamily = node2.style.fontFamily || getComputedStyle(node2).fontFamily;
    fontFamily.split(",").forEach((font) => {
      fonts.add(normalizeFontFamily(font));
    });
    Array.from(node2.children).forEach((child) => {
      if (child instanceof HTMLElement) {
        traverse(child);
      }
    });
  }
  traverse(node);
  return fonts;
}
async function getWebFontCSS(node, options) {
  const rules = await parseWebFontRules(node, options);
  const usedFonts = getUsedFonts(node);
  const cssTexts = await Promise.all(rules.filter((rule) => usedFonts.has(normalizeFontFamily(rule.style.fontFamily))).map((rule) => {
    const baseUrl = rule.parentStyleSheet ? rule.parentStyleSheet.href : null;
    return embedResources(rule.cssText, baseUrl, options);
  }));
  return cssTexts.join("\n");
}
async function getFontEmbedCSS(node, options = {}) {
  return getWebFontCSS(node, options);
}
const moduleId$7 = "crowdgoeswild";
const { ApplicationV2: ApplicationV2$2, HandlebarsApplicationMixin: HandlebarsApplicationMixin$2 } = foundry.applications.api;
class VibeCheckPopup extends HandlebarsApplicationMixin$2(ApplicationV2$2) {
  static instance = null;
  userResponses = [];
  keyupHandler = null;
  static getInstance() {
    if (!this.instance) {
      this.instance = new VibeCheckPopup();
    }
    return this.instance;
  }
  static DEFAULT_OPTIONS = {
    id: "crowdgoeswild-vibe-check",
    classes: ["crowdgoeswild", "vibecheck"],
    tag: "div",
    window: {
      frame: true,
      positioned: true,
      title: "CrowdGoesWild - Vibe Check",
      icon: "fas fa-face-smile",
      controls: [],
      resizable: false
    },
    position: {
      width: 600,
      height: "auto"
    },
    actions: {
      selectReaction: VibeCheckPopup.#onSelectReaction
    }
  };
  static PARTS = {
    content: {
      template: `modules/${moduleId$7}/templates/VibeCheckPopup.hbs`
    }
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const users = game.users?.players.filter((u) => u.active) ?? [];
    const groupedResponses = [];
    for (const user of users) {
      const filteredResponses = [];
      for (const sentResponse of this.userResponses) {
        if (sentResponse.user.id === user.id) {
          filteredResponses.push(sentResponse.response);
        }
      }
      const userCharacter = user.character;
      const userWithImage = user;
      if (userCharacter) {
        userWithImage.image = userCharacter.img ?? user.avatar ?? "";
      } else {
        userWithImage.image = user.avatar ?? "";
      }
      groupedResponses.push({
        user: userWithImage,
        responses: filteredResponses
      });
    }
    return {
      ...context,
      isGM: game.user?.isGM ?? false,
      reactions: await game.settings?.get(moduleId$7, "reactions") ?? [],
      responses: this.userResponses,
      groupedResponses
    };
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async _onRender(context, options) {
    this.keyupHandler = (ev) => {
      const key = parseInt(ev.key);
      if (key >= 1 && key <= 6) {
        sendVibeCheckResponse(game.user, key - 1);
        this.close();
      }
    };
    document.addEventListener("keyup", this.keyupHandler);
  }
  static async #onSelectReaction(event, target) {
    event.preventDefault();
    const reactionId = target.dataset.id;
    if (reactionId) {
      sendVibeCheckResponse(game.user, reactionId);
      this.close();
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async close(options) {
    if (this.keyupHandler) {
      document.removeEventListener("keyup", this.keyupHandler);
      this.keyupHandler = null;
    }
    return super.close(options);
  }
}
async function recordVibeCheckResponse(response) {
  const vc = VibeCheckPopup.getInstance();
  const reaction = await getReactionObject(String(response.response));
  if (reaction) {
    const userResponse = {
      user: response.user,
      response: reaction
    };
    vc.userResponses.push(userResponse);
    vc.render();
  }
}
const moduleId$6 = "crowdgoeswild";
function registerSocketEvents() {
  game.socket.on(`module.${moduleId$6}`, handleSocketEvent);
}
async function emitSocketEvent({ type, payload }) {
  let event = {
    type,
    payload
  };
  await game.socket.emit(`module.${moduleId$6}`, event);
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
    payload: { duration: game.settings.get(moduleId$6, "vibecheckduration") }
  });
}
function handleSocketEvent({ type, payload }) {
  switch (type) {
    case "icon":
      insertSentReaction(payload);
      break;
    case "reload":
      foundry.utils.debouncedReload();
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
async function handleReactionClick(id) {
  sendReactionToSocket(id);
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
        reactionStyle: "fas",
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
        reactionStyle: "fa-duotone",
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
        reactionStyle: "fa-duotone",
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
        reactionStyle: "fa-duotone",
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
        reactionStyle: "fa-duotone",
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
        reactionStyle: "fas",
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
        reactionStyle: "fas",
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
        reactionStyle: "fa-duotone",
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
        reactionStyle: "fa-duotone",
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
        reactionStyle: "fa-duotone",
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
        reactionStyle: "fa-duotone",
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
        reactionStyle: "fas",
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
        reactionStyle: "fa-duotone",
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
        reactionStyle: "fas",
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
        title: "Mug",
        icon: "mug-tea",
        primaryColor: "#87b83d",
        secondaryColor: "#ddbeaa",
        reactionStyle: "fa-duotone",
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
        reactionStyle: "fa-duotone",
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
        reactionStyle: "fa-duotone",
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
        reactionStyle: "fas",
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
        reactionStyle: "fas",
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
        reactionStyle: "fa-duotone",
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
        reactionStyle: "fa-duotone",
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
        reactionStyle: "fa-duotone",
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
        reactionStyle: "fa-duotone",
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
        reactionStyle: "fas",
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
  reactionStyle: "",
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
  await game.settings?.set("crowdgoeswild", "reactions", reactions);
  return;
}
function registerSettings() {
  console.log("Registering CGW Settings");
  game.settings.register("crowdgoeswild", "reactions", {
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
  game.settings.register("crowdgoeswild", "vibecheckautoclose", {
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
  game.settings.register("crowdgoeswild", "vibecheckduration", {
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
  game.settings.register("crowdgoeswild", "moduleVersion", {
    scope: "world",
    // "world" = sync to db, "client" = local storage
    config: false,
    // false if you dont want it to show in module config
    type: String,
    // Number, Boolean, String, Object
    default: "1.0.0-alpha4"
  });
  game.settings.register("crowdgoeswild", "maxdisplayed", {
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
const moduleId$5 = "crowdgoeswild";
const { ApplicationV2: ApplicationV2$1, HandlebarsApplicationMixin: HandlebarsApplicationMixin$1 } = foundry.applications.api;
class ReactionEditor extends HandlebarsApplicationMixin$1(ApplicationV2$1) {
  static DEFAULT_OPTIONS = {
    tag: "form",
    classes: ["crowdgoeswild", "reaction-editor"],
    window: {
      frame: true,
      positioned: true,
      title: "CrowdGoesWild - Reaction Editor",
      icon: "fas fa-edit",
      controls: [],
      resizable: true
    },
    position: {
      width: 600,
      height: "auto"
    },
    form: {
      handler: ReactionEditor.#onFormSubmit,
      submitOnChange: true,
      closeOnSubmit: false
    },
    actions: {
      switchColors: ReactionEditor.#onSwitchColors
    }
  };
  static PARTS = {
    form: {
      template: `modules/${moduleId$5}/templates/ReactionEditor.hbs`
    }
  };
  async getThisReaction() {
    const reactions = await game.settings?.get(moduleId$5, "reactions") ?? [];
    const data = reactions.find((reaction) => reaction.id == this.options.reactionId);
    return data;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const data = await this.getThisReaction();
    if (!data) {
      return context;
    }
    if (data.type && !this.options.classes.includes(data.type)) {
      this.options.classes.push(data.type);
    }
    return {
      ...context,
      ...data,
      // buttons: [
      //     { type: "submit", icon: "fa-solid fa-save", label: "SETTINGS.Save" },
      //     // { type: "reset", action: "reset", icon: "fa-solid fa-undo", label: "SETTINGS.Reset" },
      // ],
      meta: {
        typeOptions: {
          fontawesome: "Font Icon",
          filepicker: "Image/Video"
        },
        effectOptions: {
          "physics-floatUp": "Float Up",
          "physics-drop": "Fall Down",
          "physics-flutterDown": "Flutter Down",
          "physics-toss": "Throw",
          shutdown: "Shutdown"
        },
        styleOptions: {
          "fas": "Solid",
          "fa-duotone": "Duotone",
          "fa-regular": "Regular",
          "fa-light": "Light",
          "fa-thin": "Thin"
        }
      }
    };
  }
  static async #onFormSubmit(event, form, formData) {
    const data = formData.object;
    const reactions = await game.settings?.get(moduleId$5, "reactions") ?? [];
    const index = reactions.findIndex((reaction) => reaction.id == this.options.reactionId);
    if (index !== -1) {
      reactions[index] = data;
      await game.settings?.set(moduleId$5, "reactions", reactions);
      this.render();
      this.options.parent?.render();
    }
  }
  switchColors(inputEl1, inputEl2) {
    const v1 = inputEl1.value;
    const v2 = inputEl2.value;
    inputEl2.value = v1;
    inputEl1.value = v2;
  }
  static async #onSwitchColors(event, target) {
    event.preventDefault();
    event.stopPropagation();
    const colorsContainer = target.closest(".colors");
    if (!colorsContainer) return;
    const primaryPicker = colorsContainer.querySelector(".primaryColor color-picker");
    const secondaryPicker = colorsContainer.querySelector(".secondaryColor color-picker");
    if (primaryPicker && secondaryPicker) {
      this.switchColors(primaryPicker, secondaryPicker);
    }
  }
}
const moduleId$4 = "crowdgoeswild";
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;
class ReactionSetupMenu extends HandlebarsApplicationMixin(ApplicationV2) {
  loadedJSON = {};
  selectedPreset = "default";
  static DEFAULT_OPTIONS = {
    id: "crowdgoeswild-reaction-setup",
    classes: ["crowdgoeswild", "reaction-setup"],
    tag: "div",
    window: {
      frame: true,
      positioned: true,
      title: "CrowdGoesWild - Reaction Setup",
      icon: "fas fa-icons",
      controls: [],
      resizable: true
    },
    position: {
      width: 800,
      height: "auto"
    },
    actions: {
      generatePNGs: ReactionSetupMenu.#onGeneratePNGs,
      loadPreset: ReactionSetupMenu.#onLoadPreset,
      editReaction: ReactionSetupMenu.#onEditReaction,
      importReactions: ReactionSetupMenu.#onShowImportReactionsDialog,
      exportReactions: ReactionSetupMenu.#onExportReactions
    }
  };
  static PARTS = {
    form: {
      template: `modules/${moduleId$4}/templates/ReactionSetup.hbs`
    }
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    return {
      ...context,
      currentReactions: game.settings?.get(moduleId$4, "reactions") ?? [],
      presets: reactionSets,
      selectedPreset: this.selectedPreset
    };
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async _onRender(context, options) {
    const presetSelect = this.element.querySelector("#reactionPreset");
    if (presetSelect) {
      presetSelect.addEventListener("change", (ev) => {
        this.selectedPreset = ev.target.value;
      });
    }
  }
  // Action handlers - static methods that receive the app instance as `this`
  static async #onGeneratePNGs(event, target) {
    event.preventDefault();
    this.close();
    await saveAllReactionPNGs(true);
  }
  static async #onLoadPreset(event, target) {
    event.preventDefault();
    event.stopPropagation();
    this.showLoadPresetDialog();
  }
  static async #onEditReaction(event, target) {
    event.preventDefault();
    event.stopPropagation();
    const reactionId = target.dataset.id;
    if (reactionId) {
      const reactionEditor = new ReactionEditor({ reactionId, parent: this });
      reactionEditor.render({ force: true });
      console.log(reactionEditor);
    }
  }
  static async #onShowImportReactionsDialog(event, target) {
    event.preventDefault();
    event.stopPropagation();
    this.showImportReactionsDialog();
  }
  static async #onExportReactions(event, target) {
    event.preventDefault();
    event.stopPropagation();
    this.exportReactions();
  }
  showImportReactionsDialog() {
    foundry.applications.api.DialogV2.prompt({
      window: { title: "Import Reactions" },
      content: `
        <p>Import a set of reactions from a JSON file? All current reactions will be overwritten.</p>
        <input type="file" id="importer" name="reactionjson" class="cgw importer">
      `,
      ok: {
        label: "Import",
        icon: "fas fa-check",
        callback: async () => {
          if (this.loadedJSON && Object.keys(this.loadedJSON).length > 0) {
            await this.saveReactionSetData(this.loadedJSON);
          }
        }
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (event, dialog) => {
        const importer = dialog.element.querySelector("#importer");
        if (importer) {
          importer.addEventListener("change", (ev) => {
            console.log("Loaded file");
            const reader = new FileReader();
            reader.onload = (readerEv) => {
              try {
                const loadedJSON = JSON.parse(readerEv.target?.result);
                if (this.validateLoadedJSON(loadedJSON)) {
                  this.loadedJSON = loadedJSON;
                }
              } catch (error) {
                console.log("Invalid JSON file");
                this.loadedJSON = {};
              }
            };
            const files = ev.target.files;
            if (files && files[0]) {
              reader.readAsText(files[0]);
            }
          });
        }
      }
    });
  }
  async exportReactions() {
    const data = await game.settings?.get(moduleId$4, "reactions");
    const dataJSON = JSON.stringify(data);
    foundry.utils.saveDataToFile(dataJSON, "text/json", "reactions.json");
  }
  async saveReactionSetData(data) {
    await game.settings?.set(moduleId$4, "reactions", data);
    this.render();
  }
  validateLoadedJSON(data) {
    let isValid = true;
    if (Array.isArray(data)) {
      if (data.length === 6) {
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
    } else {
      isValid = false;
    }
    return isValid;
  }
  showLoadPresetDialog() {
    foundry.applications.api.DialogV2.confirm({
      window: { title: "Load Preset" },
      content: `<p>Load the ${reactionSets[this.selectedPreset].label} preset? Any changes you've made to reactions will be lost.</p>`,
      yes: {
        label: "Load Preset",
        icon: "fas fa-check",
        callback: async () => {
          await loadReactionsPreset(this.selectedPreset);
          this.render();
        }
      },
      no: {
        label: "Cancel",
        icon: "fas fa-times"
      }
    });
  }
}
const moduleId$3 = "crowdgoeswild";
function randomNumber(min, max) {
  return Math.random() * (max - min) + min;
}
function calcAngleDegrees(x, y) {
  return Math.atan2(y, x) * 180 / Math.PI;
}
async function getReactionAsImage(reactionObject) {
  let reactionHTML = await getReactionHTML(reactionObject);
  console.log("Generating PNG for reaction", reactionObject.id, reactionHTML);
  let $interface = $("#interface");
  let $appended = $(reactionHTML).appendTo($interface);
  let iconPNGData;
  try {
    await new Promise((resolve) => setTimeout(resolve, 1e3));
    let appEl = $appended.get(0);
    console.log("appEl for reaction", reactionObject.id, appEl);
    if (appEl) {
      const fontEmbedCSS = await getFontEmbedCSS(appEl);
      console.log(fontEmbedCSS);
    }
    console.log("Generated PNG data for reaction", reactionObject.id, iconPNGData);
  } catch (error) {
    console.error("PNG generation failed for reaction", reactionObject.id, error);
    ui.notifications?.error(
      `Failed to generate PNG for reaction "${reactionObject.icon}". Check console for details.`
    );
  }
  $appended.remove();
  return iconPNGData;
}
async function getReactionObject(reactionId) {
  let reactions = game.settings?.get("crowdgoeswild", "reactions") ?? [];
  let reaction = reactions.find((r) => r.id == reactionId);
  return reaction;
}
function getReactionHTML(reaction) {
  let htmlString = "";
  if (reaction.type == "fontawesome") {
    htmlString = `
          <i class="${reaction.reactionStyle} fa-${reaction.icon} cgw-reaction" 
              data-id=${reaction.id}
              style="
                  color: ${reaction.primaryColor}; 
                  --fa-primary-color: ${reaction.primaryColor};
                  --fa-secondary-color: ${reaction.secondaryColor};
                  font-size: ${reaction.fontSize}px;
              ">
          </i>`;
  } else if (reaction.type == "filepicker" && ["png", "jpg", "jpeg", "webp", "avif", "svg", ".gif"].includes(
    reaction.path?.split(".").pop() ?? ""
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
  } else if (reaction.type == "filepicker" && ["webm", "mp4", "m4v"].includes(reaction.path?.split(".").pop() ?? "")) {
    htmlString = `
          <video class="cgw-reaction" data-id=${reaction.id} autoplay loop muted
            style="
              max-width: ${reaction.maxWidth}px;
              max-height: ${reaction.maxHeight}px;
            "
          >
            <source src="${reaction.path}" 
            type="video/${reaction.path?.split(".").pop()}"
            />
          </video>
          `;
  }
  return htmlString;
}
async function saveAllReactionPNGs(force = false) {
  if (force) {
    ui.notifications?.info(
      `Generating icons for reaction macros. This will take a moment.`,
      { permanent: false }
    );
  }
  let reactions = game.settings?.get("crowdgoeswild", "reactions") ?? [];
  for (const reaction of reactions) {
    const ext = reaction.path?.split(".").pop();
    if (!ext || !["webm", "mp4", "m4v"].includes(ext)) {
      await generateReactionPNG(reaction, force);
    } else {
      console.log("Can't make images for video reactions", reaction);
    }
  }
}
async function generateReactionPNG(reactionObject, force) {
  if (!game.world) return;
  let worldPath = `worlds/${game.world.id}`;
  let iconsPath = `worlds/${game.world.id}/reactionIcons`;
  let world_dirs_list = await foundry.applications.apps.FilePicker.implementation.browse("data", worldPath).then(
    (picker) => picker.dirs
  );
  if (!world_dirs_list.includes(iconsPath)) {
    console.log("Reactions icon folder doesn't exist. Creating it.");
    await foundry.applications.apps.FilePicker.implementation.createDirectory("data", iconsPath);
  }
  let imagesPath = iconsPath;
  let files_list = await foundry.applications.apps.FilePicker.implementation.browse("data", iconsPath).then(
    (picker) => picker.files
  );
  if (!files_list.includes(iconsPath + `/reaction-${reactionObject.id}.png`) || force) {
    console.log("Image does not yet exist or force flag was set. Generating.");
    let imageDataURL = await getReactionAsImage(reactionObject);
    if (!imageDataURL) {
      console.warn("Skipping upload for reaction", reactionObject.id, "- invalid image data");
      return;
    }
    let uploadResponse = await foundry.helpers.media.ImageHelper.uploadBase64(
      imageDataURL,
      `reaction-${reactionObject.id}.png`,
      imagesPath
    );
    if (uploadResponse) return uploadResponse.path;
  } else {
    console.log("Image already exists. Refusing to regenerate.");
  }
  return void 0;
}
async function getReactionPNGUrl(reactionId) {
  return `worlds/${game.world?.id}/reactionIcons/reaction-${reactionId}.png`;
}
async function renderChatButtonBar() {
  let $cgwContainer = $(".cgwcontainer");
  $cgwContainer.remove();
  let $chatForm = $("#chat form");
  if ($chatForm.length === 0) {
    console.warn("CrowdGoesWild: Could not find chat form element to attach reaction bar");
    return;
  }
  let templatePath = `modules/${moduleId$3}/templates/parts/ReactionButtonBar.hbs`;
  let templateData = {
    reactions: game.settings?.get("crowdgoeswild", "reactions") ?? [],
    isGM: game.user?.isGM ?? false
  };
  foundry.applications.handlebars.renderTemplate(templatePath, templateData).then((c) => {
    if (c.length > 0 && $chatForm.length > 0) {
      let $content = $(c);
      $chatForm.after($content);
      $content.find(".reactionbar button").on("click", (event) => {
        console.log("REACTION CLICK", event.target);
        event.preventDefault();
        $(event.currentTarget);
        let dataset = event.currentTarget.dataset;
        let id = dataset.id;
        handleReactionClick(id);
      });
      $content.find(".reactionbar button").on("dragstart", (event) => {
        event.originalEvent?.dataTransfer?.setData(
          "text/plain",
          JSON.stringify({
            id: event.currentTarget.dataset.id,
            type: "reaction"
          })
        );
      });
      $content.find("button.vibecheck").on("click", (event) => {
        console.log("VIBE CHECK");
        initiateVibeCheck();
      });
      $content.find("button.cgwSettings").on("click", (event) => {
        console.log("OPEN SETTINGS");
        let reactionSetup = new ReactionSetupMenu();
        reactionSetup.render({ force: true });
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
        bottom: config.reaction.type == "fontawesome" ? defaults.offscreen : defaults.offscreen - config.reaction.maxHeight / 2
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
        bottom: config.reaction.type == "fontawesome" ? defaults.offscreen : defaults.offscreen - config.reaction.maxHeight / 2
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
      game.togglePause?.(true, { broadcast: true });
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
const moduleId$2 = "crowdgoeswild";
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
    `modules/${moduleId$2}/templates/parts/ReactionRow.hbs`,
    `modules/${moduleId$2}/templates/parts/ReactionButtonBar.hbs`
  ];
  foundry.applications.handlebars.loadTemplates(partialsList);
}
var re = { exports: {} };
var constants;
var hasRequiredConstants;
function requireConstants() {
  if (hasRequiredConstants) return constants;
  hasRequiredConstants = 1;
  const SEMVER_SPEC_VERSION = "2.0.0";
  const MAX_LENGTH = 256;
  const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
  9007199254740991;
  const MAX_SAFE_COMPONENT_LENGTH = 16;
  const MAX_SAFE_BUILD_LENGTH = MAX_LENGTH - 6;
  const RELEASE_TYPES = [
    "major",
    "premajor",
    "minor",
    "preminor",
    "patch",
    "prepatch",
    "prerelease"
  ];
  constants = {
    MAX_LENGTH,
    MAX_SAFE_COMPONENT_LENGTH,
    MAX_SAFE_BUILD_LENGTH,
    MAX_SAFE_INTEGER,
    RELEASE_TYPES,
    SEMVER_SPEC_VERSION,
    FLAG_INCLUDE_PRERELEASE: 1,
    FLAG_LOOSE: 2
  };
  return constants;
}
var debug_1;
var hasRequiredDebug;
function requireDebug() {
  if (hasRequiredDebug) return debug_1;
  hasRequiredDebug = 1;
  const debug = typeof process === "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...args) => console.error("SEMVER", ...args) : () => {
  };
  debug_1 = debug;
  return debug_1;
}
var hasRequiredRe;
function requireRe() {
  if (hasRequiredRe) return re.exports;
  hasRequiredRe = 1;
  (function(module, exports$1) {
    const {
      MAX_SAFE_COMPONENT_LENGTH,
      MAX_SAFE_BUILD_LENGTH,
      MAX_LENGTH
    } = requireConstants();
    const debug = requireDebug();
    exports$1 = module.exports = {};
    const re2 = exports$1.re = [];
    const safeRe = exports$1.safeRe = [];
    const src = exports$1.src = [];
    const t = exports$1.t = {};
    let R = 0;
    const LETTERDASHNUMBER = "[a-zA-Z0-9-]";
    const safeRegexReplacements = [
      ["\\s", 1],
      ["\\d", MAX_LENGTH],
      [LETTERDASHNUMBER, MAX_SAFE_BUILD_LENGTH]
    ];
    const makeSafeRegex = (value) => {
      for (const [token, max] of safeRegexReplacements) {
        value = value.split(`${token}*`).join(`${token}{0,${max}}`).split(`${token}+`).join(`${token}{1,${max}}`);
      }
      return value;
    };
    const createToken = (name, value, isGlobal) => {
      const safe = makeSafeRegex(value);
      const index = R++;
      debug(name, index, value);
      t[name] = index;
      src[index] = value;
      re2[index] = new RegExp(value, isGlobal ? "g" : void 0);
      safeRe[index] = new RegExp(safe, isGlobal ? "g" : void 0);
    };
    createToken("NUMERICIDENTIFIER", "0|[1-9]\\d*");
    createToken("NUMERICIDENTIFIERLOOSE", "\\d+");
    createToken("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${LETTERDASHNUMBER}*`);
    createToken("MAINVERSION", `(${src[t.NUMERICIDENTIFIER]})\\.(${src[t.NUMERICIDENTIFIER]})\\.(${src[t.NUMERICIDENTIFIER]})`);
    createToken("MAINVERSIONLOOSE", `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.(${src[t.NUMERICIDENTIFIERLOOSE]})\\.(${src[t.NUMERICIDENTIFIERLOOSE]})`);
    createToken("PRERELEASEIDENTIFIER", `(?:${src[t.NUMERICIDENTIFIER]}|${src[t.NONNUMERICIDENTIFIER]})`);
    createToken("PRERELEASEIDENTIFIERLOOSE", `(?:${src[t.NUMERICIDENTIFIERLOOSE]}|${src[t.NONNUMERICIDENTIFIER]})`);
    createToken("PRERELEASE", `(?:-(${src[t.PRERELEASEIDENTIFIER]}(?:\\.${src[t.PRERELEASEIDENTIFIER]})*))`);
    createToken("PRERELEASELOOSE", `(?:-?(${src[t.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${src[t.PRERELEASEIDENTIFIERLOOSE]})*))`);
    createToken("BUILDIDENTIFIER", `${LETTERDASHNUMBER}+`);
    createToken("BUILD", `(?:\\+(${src[t.BUILDIDENTIFIER]}(?:\\.${src[t.BUILDIDENTIFIER]})*))`);
    createToken("FULLPLAIN", `v?${src[t.MAINVERSION]}${src[t.PRERELEASE]}?${src[t.BUILD]}?`);
    createToken("FULL", `^${src[t.FULLPLAIN]}$`);
    createToken("LOOSEPLAIN", `[v=\\s]*${src[t.MAINVERSIONLOOSE]}${src[t.PRERELEASELOOSE]}?${src[t.BUILD]}?`);
    createToken("LOOSE", `^${src[t.LOOSEPLAIN]}$`);
    createToken("GTLT", "((?:<|>)?=?)");
    createToken("XRANGEIDENTIFIERLOOSE", `${src[t.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`);
    createToken("XRANGEIDENTIFIER", `${src[t.NUMERICIDENTIFIER]}|x|X|\\*`);
    createToken("XRANGEPLAIN", `[v=\\s]*(${src[t.XRANGEIDENTIFIER]})(?:\\.(${src[t.XRANGEIDENTIFIER]})(?:\\.(${src[t.XRANGEIDENTIFIER]})(?:${src[t.PRERELEASE]})?${src[t.BUILD]}?)?)?`);
    createToken("XRANGEPLAINLOOSE", `[v=\\s]*(${src[t.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})(?:${src[t.PRERELEASELOOSE]})?${src[t.BUILD]}?)?)?`);
    createToken("XRANGE", `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAIN]}$`);
    createToken("XRANGELOOSE", `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAINLOOSE]}$`);
    createToken("COERCEPLAIN", `${"(^|[^\\d])(\\d{1,"}${MAX_SAFE_COMPONENT_LENGTH}})(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?`);
    createToken("COERCE", `${src[t.COERCEPLAIN]}(?:$|[^\\d])`);
    createToken("COERCEFULL", src[t.COERCEPLAIN] + `(?:${src[t.PRERELEASE]})?(?:${src[t.BUILD]})?(?:$|[^\\d])`);
    createToken("COERCERTL", src[t.COERCE], true);
    createToken("COERCERTLFULL", src[t.COERCEFULL], true);
    createToken("LONETILDE", "(?:~>?)");
    createToken("TILDETRIM", `(\\s*)${src[t.LONETILDE]}\\s+`, true);
    exports$1.tildeTrimReplace = "$1~";
    createToken("TILDE", `^${src[t.LONETILDE]}${src[t.XRANGEPLAIN]}$`);
    createToken("TILDELOOSE", `^${src[t.LONETILDE]}${src[t.XRANGEPLAINLOOSE]}$`);
    createToken("LONECARET", "(?:\\^)");
    createToken("CARETTRIM", `(\\s*)${src[t.LONECARET]}\\s+`, true);
    exports$1.caretTrimReplace = "$1^";
    createToken("CARET", `^${src[t.LONECARET]}${src[t.XRANGEPLAIN]}$`);
    createToken("CARETLOOSE", `^${src[t.LONECARET]}${src[t.XRANGEPLAINLOOSE]}$`);
    createToken("COMPARATORLOOSE", `^${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]})$|^$`);
    createToken("COMPARATOR", `^${src[t.GTLT]}\\s*(${src[t.FULLPLAIN]})$|^$`);
    createToken("COMPARATORTRIM", `(\\s*)${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]}|${src[t.XRANGEPLAIN]})`, true);
    exports$1.comparatorTrimReplace = "$1$2$3";
    createToken("HYPHENRANGE", `^\\s*(${src[t.XRANGEPLAIN]})\\s+-\\s+(${src[t.XRANGEPLAIN]})\\s*$`);
    createToken("HYPHENRANGELOOSE", `^\\s*(${src[t.XRANGEPLAINLOOSE]})\\s+-\\s+(${src[t.XRANGEPLAINLOOSE]})\\s*$`);
    createToken("STAR", "(<|>)?=?\\s*\\*");
    createToken("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$");
    createToken("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
  })(re, re.exports);
  return re.exports;
}
var parseOptions_1;
var hasRequiredParseOptions;
function requireParseOptions() {
  if (hasRequiredParseOptions) return parseOptions_1;
  hasRequiredParseOptions = 1;
  const looseOption = Object.freeze({ loose: true });
  const emptyOpts = Object.freeze({});
  const parseOptions = (options) => {
    if (!options) {
      return emptyOpts;
    }
    if (typeof options !== "object") {
      return looseOption;
    }
    return options;
  };
  parseOptions_1 = parseOptions;
  return parseOptions_1;
}
var identifiers;
var hasRequiredIdentifiers;
function requireIdentifiers() {
  if (hasRequiredIdentifiers) return identifiers;
  hasRequiredIdentifiers = 1;
  const numeric = /^[0-9]+$/;
  const compareIdentifiers = (a, b) => {
    const anum = numeric.test(a);
    const bnum = numeric.test(b);
    if (anum && bnum) {
      a = +a;
      b = +b;
    }
    return a === b ? 0 : anum && !bnum ? -1 : bnum && !anum ? 1 : a < b ? -1 : 1;
  };
  const rcompareIdentifiers = (a, b) => compareIdentifiers(b, a);
  identifiers = {
    compareIdentifiers,
    rcompareIdentifiers
  };
  return identifiers;
}
var semver$1;
var hasRequiredSemver$1;
function requireSemver$1() {
  if (hasRequiredSemver$1) return semver$1;
  hasRequiredSemver$1 = 1;
  const debug = requireDebug();
  const { MAX_LENGTH, MAX_SAFE_INTEGER } = requireConstants();
  const { safeRe: re2, t } = requireRe();
  const parseOptions = requireParseOptions();
  const { compareIdentifiers } = requireIdentifiers();
  class SemVer {
    constructor(version, options) {
      options = parseOptions(options);
      if (version instanceof SemVer) {
        if (version.loose === !!options.loose && version.includePrerelease === !!options.includePrerelease) {
          return version;
        } else {
          version = version.version;
        }
      } else if (typeof version !== "string") {
        throw new TypeError(`Invalid version. Must be a string. Got type "${typeof version}".`);
      }
      if (version.length > MAX_LENGTH) {
        throw new TypeError(
          `version is longer than ${MAX_LENGTH} characters`
        );
      }
      debug("SemVer", version, options);
      this.options = options;
      this.loose = !!options.loose;
      this.includePrerelease = !!options.includePrerelease;
      const m = version.trim().match(options.loose ? re2[t.LOOSE] : re2[t.FULL]);
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
        this.prerelease = m[4].split(".").map((id) => {
          if (/^[0-9]+$/.test(id)) {
            const num = +id;
            if (num >= 0 && num < MAX_SAFE_INTEGER) {
              return num;
            }
          }
          return id;
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
        debug("build compare", i, a, b);
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
    inc(release, identifier, identifierBase) {
      switch (release) {
        case "premajor":
          this.prerelease.length = 0;
          this.patch = 0;
          this.minor = 0;
          this.major++;
          this.inc("pre", identifier, identifierBase);
          break;
        case "preminor":
          this.prerelease.length = 0;
          this.patch = 0;
          this.minor++;
          this.inc("pre", identifier, identifierBase);
          break;
        case "prepatch":
          this.prerelease.length = 0;
          this.inc("patch", identifier, identifierBase);
          this.inc("pre", identifier, identifierBase);
          break;
        // If the input is a non-prerelease version, this acts the same as
        // prepatch.
        case "prerelease":
          if (this.prerelease.length === 0) {
            this.inc("patch", identifier, identifierBase);
          }
          this.inc("pre", identifier, identifierBase);
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
        // This probably shouldn't be used publicly.
        // 1.0.0 'pre' would become 1.0.0-0 which is the wrong direction.
        case "pre": {
          const base = Number(identifierBase) ? 1 : 0;
          if (!identifier && identifierBase === false) {
            throw new Error("invalid increment argument: identifier is empty");
          }
          if (this.prerelease.length === 0) {
            this.prerelease = [base];
          } else {
            let i = this.prerelease.length;
            while (--i >= 0) {
              if (typeof this.prerelease[i] === "number") {
                this.prerelease[i]++;
                i = -2;
              }
            }
            if (i === -1) {
              if (identifier === this.prerelease.join(".") && identifierBase === false) {
                throw new Error("invalid increment argument: identifier already exists");
              }
              this.prerelease.push(base);
            }
          }
          if (identifier) {
            let prerelease = [identifier, base];
            if (identifierBase === false) {
              prerelease = [identifier];
            }
            if (compareIdentifiers(this.prerelease[0], identifier) === 0) {
              if (isNaN(this.prerelease[1])) {
                this.prerelease = prerelease;
              }
            } else {
              this.prerelease = prerelease;
            }
          }
          break;
        }
        default:
          throw new Error(`invalid increment argument: ${release}`);
      }
      this.raw = this.format();
      if (this.build.length) {
        this.raw += `+${this.build.join(".")}`;
      }
      return this;
    }
  }
  semver$1 = SemVer;
  return semver$1;
}
var parse_1;
var hasRequiredParse;
function requireParse() {
  if (hasRequiredParse) return parse_1;
  hasRequiredParse = 1;
  const SemVer = requireSemver$1();
  const parse = (version, options, throwErrors = false) => {
    if (version instanceof SemVer) {
      return version;
    }
    try {
      return new SemVer(version, options);
    } catch (er) {
      if (!throwErrors) {
        return null;
      }
      throw er;
    }
  };
  parse_1 = parse;
  return parse_1;
}
var valid_1;
var hasRequiredValid$1;
function requireValid$1() {
  if (hasRequiredValid$1) return valid_1;
  hasRequiredValid$1 = 1;
  const parse = requireParse();
  const valid2 = (version, options) => {
    const v = parse(version, options);
    return v ? v.version : null;
  };
  valid_1 = valid2;
  return valid_1;
}
var clean_1;
var hasRequiredClean;
function requireClean() {
  if (hasRequiredClean) return clean_1;
  hasRequiredClean = 1;
  const parse = requireParse();
  const clean = (version, options) => {
    const s = parse(version.trim().replace(/^[=v]+/, ""), options);
    return s ? s.version : null;
  };
  clean_1 = clean;
  return clean_1;
}
var inc_1;
var hasRequiredInc;
function requireInc() {
  if (hasRequiredInc) return inc_1;
  hasRequiredInc = 1;
  const SemVer = requireSemver$1();
  const inc = (version, release, options, identifier, identifierBase) => {
    if (typeof options === "string") {
      identifierBase = identifier;
      identifier = options;
      options = void 0;
    }
    try {
      return new SemVer(
        version instanceof SemVer ? version.version : version,
        options
      ).inc(release, identifier, identifierBase).version;
    } catch (er) {
      return null;
    }
  };
  inc_1 = inc;
  return inc_1;
}
var diff_1;
var hasRequiredDiff;
function requireDiff() {
  if (hasRequiredDiff) return diff_1;
  hasRequiredDiff = 1;
  const parse = requireParse();
  const diff = (version1, version2) => {
    const v1 = parse(version1, null, true);
    const v2 = parse(version2, null, true);
    const comparison = v1.compare(v2);
    if (comparison === 0) {
      return null;
    }
    const v1Higher = comparison > 0;
    const highVersion = v1Higher ? v1 : v2;
    const lowVersion = v1Higher ? v2 : v1;
    const highHasPre = !!highVersion.prerelease.length;
    const lowHasPre = !!lowVersion.prerelease.length;
    if (lowHasPre && !highHasPre) {
      if (!lowVersion.patch && !lowVersion.minor) {
        return "major";
      }
      if (highVersion.patch) {
        return "patch";
      }
      if (highVersion.minor) {
        return "minor";
      }
      return "major";
    }
    const prefix = highHasPre ? "pre" : "";
    if (v1.major !== v2.major) {
      return prefix + "major";
    }
    if (v1.minor !== v2.minor) {
      return prefix + "minor";
    }
    if (v1.patch !== v2.patch) {
      return prefix + "patch";
    }
    return "prerelease";
  };
  diff_1 = diff;
  return diff_1;
}
var major_1;
var hasRequiredMajor;
function requireMajor() {
  if (hasRequiredMajor) return major_1;
  hasRequiredMajor = 1;
  const SemVer = requireSemver$1();
  const major = (a, loose) => new SemVer(a, loose).major;
  major_1 = major;
  return major_1;
}
var minor_1;
var hasRequiredMinor;
function requireMinor() {
  if (hasRequiredMinor) return minor_1;
  hasRequiredMinor = 1;
  const SemVer = requireSemver$1();
  const minor = (a, loose) => new SemVer(a, loose).minor;
  minor_1 = minor;
  return minor_1;
}
var patch_1;
var hasRequiredPatch;
function requirePatch() {
  if (hasRequiredPatch) return patch_1;
  hasRequiredPatch = 1;
  const SemVer = requireSemver$1();
  const patch = (a, loose) => new SemVer(a, loose).patch;
  patch_1 = patch;
  return patch_1;
}
var prerelease_1;
var hasRequiredPrerelease;
function requirePrerelease() {
  if (hasRequiredPrerelease) return prerelease_1;
  hasRequiredPrerelease = 1;
  const parse = requireParse();
  const prerelease = (version, options) => {
    const parsed = parse(version, options);
    return parsed && parsed.prerelease.length ? parsed.prerelease : null;
  };
  prerelease_1 = prerelease;
  return prerelease_1;
}
var compare_1;
var hasRequiredCompare;
function requireCompare() {
  if (hasRequiredCompare) return compare_1;
  hasRequiredCompare = 1;
  const SemVer = requireSemver$1();
  const compare = (a, b, loose) => new SemVer(a, loose).compare(new SemVer(b, loose));
  compare_1 = compare;
  return compare_1;
}
var rcompare_1;
var hasRequiredRcompare;
function requireRcompare() {
  if (hasRequiredRcompare) return rcompare_1;
  hasRequiredRcompare = 1;
  const compare = requireCompare();
  const rcompare = (a, b, loose) => compare(b, a, loose);
  rcompare_1 = rcompare;
  return rcompare_1;
}
var compareLoose_1;
var hasRequiredCompareLoose;
function requireCompareLoose() {
  if (hasRequiredCompareLoose) return compareLoose_1;
  hasRequiredCompareLoose = 1;
  const compare = requireCompare();
  const compareLoose = (a, b) => compare(a, b, true);
  compareLoose_1 = compareLoose;
  return compareLoose_1;
}
var compareBuild_1;
var hasRequiredCompareBuild;
function requireCompareBuild() {
  if (hasRequiredCompareBuild) return compareBuild_1;
  hasRequiredCompareBuild = 1;
  const SemVer = requireSemver$1();
  const compareBuild = (a, b, loose) => {
    const versionA = new SemVer(a, loose);
    const versionB = new SemVer(b, loose);
    return versionA.compare(versionB) || versionA.compareBuild(versionB);
  };
  compareBuild_1 = compareBuild;
  return compareBuild_1;
}
var sort_1;
var hasRequiredSort;
function requireSort() {
  if (hasRequiredSort) return sort_1;
  hasRequiredSort = 1;
  const compareBuild = requireCompareBuild();
  const sort = (list, loose) => list.sort((a, b) => compareBuild(a, b, loose));
  sort_1 = sort;
  return sort_1;
}
var rsort_1;
var hasRequiredRsort;
function requireRsort() {
  if (hasRequiredRsort) return rsort_1;
  hasRequiredRsort = 1;
  const compareBuild = requireCompareBuild();
  const rsort = (list, loose) => list.sort((a, b) => compareBuild(b, a, loose));
  rsort_1 = rsort;
  return rsort_1;
}
var gt_1;
var hasRequiredGt;
function requireGt() {
  if (hasRequiredGt) return gt_1;
  hasRequiredGt = 1;
  const compare = requireCompare();
  const gt = (a, b, loose) => compare(a, b, loose) > 0;
  gt_1 = gt;
  return gt_1;
}
var lt_1;
var hasRequiredLt;
function requireLt() {
  if (hasRequiredLt) return lt_1;
  hasRequiredLt = 1;
  const compare = requireCompare();
  const lt = (a, b, loose) => compare(a, b, loose) < 0;
  lt_1 = lt;
  return lt_1;
}
var eq_1;
var hasRequiredEq;
function requireEq() {
  if (hasRequiredEq) return eq_1;
  hasRequiredEq = 1;
  const compare = requireCompare();
  const eq = (a, b, loose) => compare(a, b, loose) === 0;
  eq_1 = eq;
  return eq_1;
}
var neq_1;
var hasRequiredNeq;
function requireNeq() {
  if (hasRequiredNeq) return neq_1;
  hasRequiredNeq = 1;
  const compare = requireCompare();
  const neq = (a, b, loose) => compare(a, b, loose) !== 0;
  neq_1 = neq;
  return neq_1;
}
var gte_1;
var hasRequiredGte;
function requireGte() {
  if (hasRequiredGte) return gte_1;
  hasRequiredGte = 1;
  const compare = requireCompare();
  const gte = (a, b, loose) => compare(a, b, loose) >= 0;
  gte_1 = gte;
  return gte_1;
}
var lte_1;
var hasRequiredLte;
function requireLte() {
  if (hasRequiredLte) return lte_1;
  hasRequiredLte = 1;
  const compare = requireCompare();
  const lte = (a, b, loose) => compare(a, b, loose) <= 0;
  lte_1 = lte;
  return lte_1;
}
var cmp_1;
var hasRequiredCmp;
function requireCmp() {
  if (hasRequiredCmp) return cmp_1;
  hasRequiredCmp = 1;
  const eq = requireEq();
  const neq = requireNeq();
  const gt = requireGt();
  const gte = requireGte();
  const lt = requireLt();
  const lte = requireLte();
  const cmp = (a, op, b, loose) => {
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
        return eq(a, b, loose);
      case "!=":
        return neq(a, b, loose);
      case ">":
        return gt(a, b, loose);
      case ">=":
        return gte(a, b, loose);
      case "<":
        return lt(a, b, loose);
      case "<=":
        return lte(a, b, loose);
      default:
        throw new TypeError(`Invalid operator: ${op}`);
    }
  };
  cmp_1 = cmp;
  return cmp_1;
}
var coerce_1;
var hasRequiredCoerce;
function requireCoerce() {
  if (hasRequiredCoerce) return coerce_1;
  hasRequiredCoerce = 1;
  const SemVer = requireSemver$1();
  const parse = requireParse();
  const { safeRe: re2, t } = requireRe();
  const coerce = (version, options) => {
    if (version instanceof SemVer) {
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
      match = version.match(options.includePrerelease ? re2[t.COERCEFULL] : re2[t.COERCE]);
    } else {
      const coerceRtlRegex = options.includePrerelease ? re2[t.COERCERTLFULL] : re2[t.COERCERTL];
      let next;
      while ((next = coerceRtlRegex.exec(version)) && (!match || match.index + match[0].length !== version.length)) {
        if (!match || next.index + next[0].length !== match.index + match[0].length) {
          match = next;
        }
        coerceRtlRegex.lastIndex = next.index + next[1].length + next[2].length;
      }
      coerceRtlRegex.lastIndex = -1;
    }
    if (match === null) {
      return null;
    }
    const major = match[2];
    const minor = match[3] || "0";
    const patch = match[4] || "0";
    const prerelease = options.includePrerelease && match[5] ? `-${match[5]}` : "";
    const build = options.includePrerelease && match[6] ? `+${match[6]}` : "";
    return parse(`${major}.${minor}.${patch}${prerelease}${build}`, options);
  };
  coerce_1 = coerce;
  return coerce_1;
}
var lrucache;
var hasRequiredLrucache;
function requireLrucache() {
  if (hasRequiredLrucache) return lrucache;
  hasRequiredLrucache = 1;
  class LRUCache {
    constructor() {
      this.max = 1e3;
      this.map = /* @__PURE__ */ new Map();
    }
    get(key) {
      const value = this.map.get(key);
      if (value === void 0) {
        return void 0;
      } else {
        this.map.delete(key);
        this.map.set(key, value);
        return value;
      }
    }
    delete(key) {
      return this.map.delete(key);
    }
    set(key, value) {
      const deleted = this.delete(key);
      if (!deleted && value !== void 0) {
        if (this.map.size >= this.max) {
          const firstKey = this.map.keys().next().value;
          this.delete(firstKey);
        }
        this.map.set(key, value);
      }
      return this;
    }
  }
  lrucache = LRUCache;
  return lrucache;
}
var range;
var hasRequiredRange;
function requireRange() {
  if (hasRequiredRange) return range;
  hasRequiredRange = 1;
  const SPACE_CHARACTERS = /\s+/g;
  class Range {
    constructor(range2, options) {
      options = parseOptions(options);
      if (range2 instanceof Range) {
        if (range2.loose === !!options.loose && range2.includePrerelease === !!options.includePrerelease) {
          return range2;
        } else {
          return new Range(range2.raw, options);
        }
      }
      if (range2 instanceof Comparator) {
        this.raw = range2.value;
        this.set = [[range2]];
        this.formatted = void 0;
        return this;
      }
      this.options = options;
      this.loose = !!options.loose;
      this.includePrerelease = !!options.includePrerelease;
      this.raw = range2.trim().replace(SPACE_CHARACTERS, " ");
      this.set = this.raw.split("||").map((r) => this.parseRange(r.trim())).filter((c) => c.length);
      if (!this.set.length) {
        throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
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
      this.formatted = void 0;
    }
    get range() {
      if (this.formatted === void 0) {
        this.formatted = "";
        for (let i = 0; i < this.set.length; i++) {
          if (i > 0) {
            this.formatted += "||";
          }
          const comps = this.set[i];
          for (let k = 0; k < comps.length; k++) {
            if (k > 0) {
              this.formatted += " ";
            }
            this.formatted += comps[k].toString().trim();
          }
        }
      }
      return this.formatted;
    }
    format() {
      return this.range;
    }
    toString() {
      return this.range;
    }
    parseRange(range2) {
      const memoOpts = (this.options.includePrerelease && FLAG_INCLUDE_PRERELEASE) | (this.options.loose && FLAG_LOOSE);
      const memoKey = memoOpts + ":" + range2;
      const cached = cache2.get(memoKey);
      if (cached) {
        return cached;
      }
      const loose = this.options.loose;
      const hr = loose ? re2[t.HYPHENRANGELOOSE] : re2[t.HYPHENRANGE];
      range2 = range2.replace(hr, hyphenReplace(this.options.includePrerelease));
      debug("hyphen replace", range2);
      range2 = range2.replace(re2[t.COMPARATORTRIM], comparatorTrimReplace);
      debug("comparator trim", range2);
      range2 = range2.replace(re2[t.TILDETRIM], tildeTrimReplace);
      debug("tilde trim", range2);
      range2 = range2.replace(re2[t.CARETTRIM], caretTrimReplace);
      debug("caret trim", range2);
      let rangeList = range2.split(" ").map((comp) => parseComparator(comp, this.options)).join(" ").split(/\s+/).map((comp) => replaceGTE0(comp, this.options));
      if (loose) {
        rangeList = rangeList.filter((comp) => {
          debug("loose invalid filter", comp, this.options);
          return !!comp.match(re2[t.COMPARATORLOOSE]);
        });
      }
      debug("range list", rangeList);
      const rangeMap = /* @__PURE__ */ new Map();
      const comparators = rangeList.map((comp) => new Comparator(comp, this.options));
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
      if (!(range2 instanceof Range)) {
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
          version = new SemVer(version, this.options);
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
  range = Range;
  const LRU = requireLrucache();
  const cache2 = new LRU();
  const parseOptions = requireParseOptions();
  const Comparator = requireComparator();
  const debug = requireDebug();
  const SemVer = requireSemver$1();
  const {
    safeRe: re2,
    t,
    comparatorTrimReplace,
    tildeTrimReplace,
    caretTrimReplace
  } = requireRe();
  const { FLAG_INCLUDE_PRERELEASE, FLAG_LOOSE } = requireConstants();
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
    debug("comp", comp, options);
    comp = replaceCarets(comp, options);
    debug("caret", comp);
    comp = replaceTildes(comp, options);
    debug("tildes", comp);
    comp = replaceXRanges(comp, options);
    debug("xrange", comp);
    comp = replaceStars(comp, options);
    debug("stars", comp);
    return comp;
  };
  const isX = (id) => !id || id.toLowerCase() === "x" || id === "*";
  const replaceTildes = (comp, options) => {
    return comp.trim().split(/\s+/).map((c) => replaceTilde(c, options)).join(" ");
  };
  const replaceTilde = (comp, options) => {
    const r = options.loose ? re2[t.TILDELOOSE] : re2[t.TILDE];
    return comp.replace(r, (_, M, m, p, pr) => {
      debug("tilde", comp, _, M, m, p, pr);
      let ret;
      if (isX(M)) {
        ret = "";
      } else if (isX(m)) {
        ret = `>=${M}.0.0 <${+M + 1}.0.0-0`;
      } else if (isX(p)) {
        ret = `>=${M}.${m}.0 <${M}.${+m + 1}.0-0`;
      } else if (pr) {
        debug("replaceTilde pr", pr);
        ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
      } else {
        ret = `>=${M}.${m}.${p} <${M}.${+m + 1}.0-0`;
      }
      debug("tilde return", ret);
      return ret;
    });
  };
  const replaceCarets = (comp, options) => {
    return comp.trim().split(/\s+/).map((c) => replaceCaret(c, options)).join(" ");
  };
  const replaceCaret = (comp, options) => {
    debug("caret", comp, options);
    const r = options.loose ? re2[t.CARETLOOSE] : re2[t.CARET];
    const z = options.includePrerelease ? "-0" : "";
    return comp.replace(r, (_, M, m, p, pr) => {
      debug("caret", comp, _, M, m, p, pr);
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
        debug("replaceCaret pr", pr);
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
        debug("no pr");
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
      debug("caret return", ret);
      return ret;
    });
  };
  const replaceXRanges = (comp, options) => {
    debug("replaceXRanges", comp, options);
    return comp.split(/\s+/).map((c) => replaceXRange(c, options)).join(" ");
  };
  const replaceXRange = (comp, options) => {
    comp = comp.trim();
    const r = options.loose ? re2[t.XRANGELOOSE] : re2[t.XRANGE];
    return comp.replace(r, (ret, gtlt, M, m, p, pr) => {
      debug("xRange", comp, ret, gtlt, M, m, p, pr);
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
      debug("xRange return", ret);
      return ret;
    });
  };
  const replaceStars = (comp, options) => {
    debug("replaceStars", comp, options);
    return comp.trim().replace(re2[t.STAR], "");
  };
  const replaceGTE0 = (comp, options) => {
    debug("replaceGTE0", comp, options);
    return comp.trim().replace(re2[options.includePrerelease ? t.GTE0PRE : t.GTE0], "");
  };
  const hyphenReplace = (incPr) => ($0, from, fM, fm, fp, fpr, fb, to, tM, tm, tp, tpr) => {
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
        debug(set[i].semver);
        if (set[i].semver === Comparator.ANY) {
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
  if (hasRequiredComparator) return comparator;
  hasRequiredComparator = 1;
  const ANY = Symbol("SemVer ANY");
  class Comparator {
    static get ANY() {
      return ANY;
    }
    constructor(comp, options) {
      options = parseOptions(options);
      if (comp instanceof Comparator) {
        if (comp.loose === !!options.loose) {
          return comp;
        } else {
          comp = comp.value;
        }
      }
      comp = comp.trim().split(/\s+/).join(" ");
      debug("comparator", comp, options);
      this.options = options;
      this.loose = !!options.loose;
      this.parse(comp);
      if (this.semver === ANY) {
        this.value = "";
      } else {
        this.value = this.operator + this.semver.version;
      }
      debug("comp", this);
    }
    parse(comp) {
      const r = this.options.loose ? re2[t.COMPARATORLOOSE] : re2[t.COMPARATOR];
      const m = comp.match(r);
      if (!m) {
        throw new TypeError(`Invalid comparator: ${comp}`);
      }
      this.operator = m[1] !== void 0 ? m[1] : "";
      if (this.operator === "=") {
        this.operator = "";
      }
      if (!m[2]) {
        this.semver = ANY;
      } else {
        this.semver = new SemVer(m[2], this.options.loose);
      }
    }
    toString() {
      return this.value;
    }
    test(version) {
      debug("Comparator.test", version, this.options.loose);
      if (this.semver === ANY || version === ANY) {
        return true;
      }
      if (typeof version === "string") {
        try {
          version = new SemVer(version, this.options);
        } catch (er) {
          return false;
        }
      }
      return cmp(version, this.operator, this.semver, this.options);
    }
    intersects(comp, options) {
      if (!(comp instanceof Comparator)) {
        throw new TypeError("a Comparator is required");
      }
      if (this.operator === "") {
        if (this.value === "") {
          return true;
        }
        return new Range(comp.value, options).test(this.value);
      } else if (comp.operator === "") {
        if (comp.value === "") {
          return true;
        }
        return new Range(this.value, options).test(comp.semver);
      }
      options = parseOptions(options);
      if (options.includePrerelease && (this.value === "<0.0.0-0" || comp.value === "<0.0.0-0")) {
        return false;
      }
      if (!options.includePrerelease && (this.value.startsWith("<0.0.0") || comp.value.startsWith("<0.0.0"))) {
        return false;
      }
      if (this.operator.startsWith(">") && comp.operator.startsWith(">")) {
        return true;
      }
      if (this.operator.startsWith("<") && comp.operator.startsWith("<")) {
        return true;
      }
      if (this.semver.version === comp.semver.version && this.operator.includes("=") && comp.operator.includes("=")) {
        return true;
      }
      if (cmp(this.semver, "<", comp.semver, options) && this.operator.startsWith(">") && comp.operator.startsWith("<")) {
        return true;
      }
      if (cmp(this.semver, ">", comp.semver, options) && this.operator.startsWith("<") && comp.operator.startsWith(">")) {
        return true;
      }
      return false;
    }
  }
  comparator = Comparator;
  const parseOptions = requireParseOptions();
  const { safeRe: re2, t } = requireRe();
  const cmp = requireCmp();
  const debug = requireDebug();
  const SemVer = requireSemver$1();
  const Range = requireRange();
  return comparator;
}
var satisfies_1;
var hasRequiredSatisfies;
function requireSatisfies() {
  if (hasRequiredSatisfies) return satisfies_1;
  hasRequiredSatisfies = 1;
  const Range = requireRange();
  const satisfies = (version, range2, options) => {
    try {
      range2 = new Range(range2, options);
    } catch (er) {
      return false;
    }
    return range2.test(version);
  };
  satisfies_1 = satisfies;
  return satisfies_1;
}
var toComparators_1;
var hasRequiredToComparators;
function requireToComparators() {
  if (hasRequiredToComparators) return toComparators_1;
  hasRequiredToComparators = 1;
  const Range = requireRange();
  const toComparators = (range2, options) => new Range(range2, options).set.map((comp) => comp.map((c) => c.value).join(" ").trim().split(" "));
  toComparators_1 = toComparators;
  return toComparators_1;
}
var maxSatisfying_1;
var hasRequiredMaxSatisfying;
function requireMaxSatisfying() {
  if (hasRequiredMaxSatisfying) return maxSatisfying_1;
  hasRequiredMaxSatisfying = 1;
  const SemVer = requireSemver$1();
  const Range = requireRange();
  const maxSatisfying = (versions, range2, options) => {
    let max = null;
    let maxSV = null;
    let rangeObj = null;
    try {
      rangeObj = new Range(range2, options);
    } catch (er) {
      return null;
    }
    versions.forEach((v) => {
      if (rangeObj.test(v)) {
        if (!max || maxSV.compare(v) === -1) {
          max = v;
          maxSV = new SemVer(max, options);
        }
      }
    });
    return max;
  };
  maxSatisfying_1 = maxSatisfying;
  return maxSatisfying_1;
}
var minSatisfying_1;
var hasRequiredMinSatisfying;
function requireMinSatisfying() {
  if (hasRequiredMinSatisfying) return minSatisfying_1;
  hasRequiredMinSatisfying = 1;
  const SemVer = requireSemver$1();
  const Range = requireRange();
  const minSatisfying = (versions, range2, options) => {
    let min = null;
    let minSV = null;
    let rangeObj = null;
    try {
      rangeObj = new Range(range2, options);
    } catch (er) {
      return null;
    }
    versions.forEach((v) => {
      if (rangeObj.test(v)) {
        if (!min || minSV.compare(v) === 1) {
          min = v;
          minSV = new SemVer(min, options);
        }
      }
    });
    return min;
  };
  minSatisfying_1 = minSatisfying;
  return minSatisfying_1;
}
var minVersion_1;
var hasRequiredMinVersion;
function requireMinVersion() {
  if (hasRequiredMinVersion) return minVersion_1;
  hasRequiredMinVersion = 1;
  const SemVer = requireSemver$1();
  const Range = requireRange();
  const gt = requireGt();
  const minVersion = (range2, loose) => {
    range2 = new Range(range2, loose);
    let minver = new SemVer("0.0.0");
    if (range2.test(minver)) {
      return minver;
    }
    minver = new SemVer("0.0.0-0");
    if (range2.test(minver)) {
      return minver;
    }
    minver = null;
    for (let i = 0; i < range2.set.length; ++i) {
      const comparators = range2.set[i];
      let setMin = null;
      comparators.forEach((comparator2) => {
        const compver = new SemVer(comparator2.semver.version);
        switch (comparator2.operator) {
          case ">":
            if (compver.prerelease.length === 0) {
              compver.patch++;
            } else {
              compver.prerelease.push(0);
            }
            compver.raw = compver.format();
          /* fallthrough */
          case "":
          case ">=":
            if (!setMin || gt(compver, setMin)) {
              setMin = compver;
            }
            break;
          case "<":
          case "<=":
            break;
          /* istanbul ignore next */
          default:
            throw new Error(`Unexpected operation: ${comparator2.operator}`);
        }
      });
      if (setMin && (!minver || gt(minver, setMin))) {
        minver = setMin;
      }
    }
    if (minver && range2.test(minver)) {
      return minver;
    }
    return null;
  };
  minVersion_1 = minVersion;
  return minVersion_1;
}
var valid;
var hasRequiredValid;
function requireValid() {
  if (hasRequiredValid) return valid;
  hasRequiredValid = 1;
  const Range = requireRange();
  const validRange = (range2, options) => {
    try {
      return new Range(range2, options).range || "*";
    } catch (er) {
      return null;
    }
  };
  valid = validRange;
  return valid;
}
var outside_1;
var hasRequiredOutside;
function requireOutside() {
  if (hasRequiredOutside) return outside_1;
  hasRequiredOutside = 1;
  const SemVer = requireSemver$1();
  const Comparator = requireComparator();
  const { ANY } = Comparator;
  const Range = requireRange();
  const satisfies = requireSatisfies();
  const gt = requireGt();
  const lt = requireLt();
  const lte = requireLte();
  const gte = requireGte();
  const outside = (version, range2, hilo, options) => {
    version = new SemVer(version, options);
    range2 = new Range(range2, options);
    let gtfn, ltefn, ltfn, comp, ecomp;
    switch (hilo) {
      case ">":
        gtfn = gt;
        ltefn = lte;
        ltfn = lt;
        comp = ">";
        ecomp = ">=";
        break;
      case "<":
        gtfn = lt;
        ltefn = gte;
        ltfn = gt;
        comp = "<";
        ecomp = "<=";
        break;
      default:
        throw new TypeError('Must provide a hilo val of "<" or ">"');
    }
    if (satisfies(version, range2, options)) {
      return false;
    }
    for (let i = 0; i < range2.set.length; ++i) {
      const comparators = range2.set[i];
      let high = null;
      let low = null;
      comparators.forEach((comparator2) => {
        if (comparator2.semver === ANY) {
          comparator2 = new Comparator(">=0.0.0");
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
  outside_1 = outside;
  return outside_1;
}
var gtr_1;
var hasRequiredGtr;
function requireGtr() {
  if (hasRequiredGtr) return gtr_1;
  hasRequiredGtr = 1;
  const outside = requireOutside();
  const gtr = (version, range2, options) => outside(version, range2, ">", options);
  gtr_1 = gtr;
  return gtr_1;
}
var ltr_1;
var hasRequiredLtr;
function requireLtr() {
  if (hasRequiredLtr) return ltr_1;
  hasRequiredLtr = 1;
  const outside = requireOutside();
  const ltr = (version, range2, options) => outside(version, range2, "<", options);
  ltr_1 = ltr;
  return ltr_1;
}
var intersects_1;
var hasRequiredIntersects;
function requireIntersects() {
  if (hasRequiredIntersects) return intersects_1;
  hasRequiredIntersects = 1;
  const Range = requireRange();
  const intersects = (r1, r2, options) => {
    r1 = new Range(r1, options);
    r2 = new Range(r2, options);
    return r1.intersects(r2, options);
  };
  intersects_1 = intersects;
  return intersects_1;
}
var simplify;
var hasRequiredSimplify;
function requireSimplify() {
  if (hasRequiredSimplify) return simplify;
  hasRequiredSimplify = 1;
  const satisfies = requireSatisfies();
  const compare = requireCompare();
  simplify = (versions, range2, options) => {
    const set = [];
    let first = null;
    let prev = null;
    const v = versions.sort((a, b) => compare(a, b, options));
    for (const version of v) {
      const included = satisfies(version, range2, options);
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
  return simplify;
}
var subset_1;
var hasRequiredSubset;
function requireSubset() {
  if (hasRequiredSubset) return subset_1;
  hasRequiredSubset = 1;
  const Range = requireRange();
  const Comparator = requireComparator();
  const { ANY } = Comparator;
  const satisfies = requireSatisfies();
  const compare = requireCompare();
  const subset = (sub, dom, options = {}) => {
    if (sub === dom) {
      return true;
    }
    sub = new Range(sub, options);
    dom = new Range(dom, options);
    let sawNonNull = false;
    OUTER: for (const simpleSub of sub.set) {
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
  const minimumVersionWithPreRelease = [new Comparator(">=0.0.0-0")];
  const minimumVersion = [new Comparator(">=0.0.0")];
  const simpleSubset = (sub, dom, options) => {
    if (sub === dom) {
      return true;
    }
    if (sub.length === 1 && sub[0].semver === ANY) {
      if (dom.length === 1 && dom[0].semver === ANY) {
        return true;
      } else if (options.includePrerelease) {
        sub = minimumVersionWithPreRelease;
      } else {
        sub = minimumVersion;
      }
    }
    if (dom.length === 1 && dom[0].semver === ANY) {
      if (options.includePrerelease) {
        return true;
      } else {
        dom = minimumVersion;
      }
    }
    const eqSet = /* @__PURE__ */ new Set();
    let gt, lt;
    for (const c of sub) {
      if (c.operator === ">" || c.operator === ">=") {
        gt = higherGT(gt, c, options);
      } else if (c.operator === "<" || c.operator === "<=") {
        lt = lowerLT(lt, c, options);
      } else {
        eqSet.add(c.semver);
      }
    }
    if (eqSet.size > 1) {
      return null;
    }
    let gtltComp;
    if (gt && lt) {
      gtltComp = compare(gt.semver, lt.semver, options);
      if (gtltComp > 0) {
        return null;
      } else if (gtltComp === 0 && (gt.operator !== ">=" || lt.operator !== "<=")) {
        return null;
      }
    }
    for (const eq of eqSet) {
      if (gt && !satisfies(eq, String(gt), options)) {
        return null;
      }
      if (lt && !satisfies(eq, String(lt), options)) {
        return null;
      }
      for (const c of dom) {
        if (!satisfies(eq, String(c), options)) {
          return false;
        }
      }
      return true;
    }
    let higher, lower;
    let hasDomLT, hasDomGT;
    let needDomLTPre = lt && !options.includePrerelease && lt.semver.prerelease.length ? lt.semver : false;
    let needDomGTPre = gt && !options.includePrerelease && gt.semver.prerelease.length ? gt.semver : false;
    if (needDomLTPre && needDomLTPre.prerelease.length === 1 && lt.operator === "<" && needDomLTPre.prerelease[0] === 0) {
      needDomLTPre = false;
    }
    for (const c of dom) {
      hasDomGT = hasDomGT || c.operator === ">" || c.operator === ">=";
      hasDomLT = hasDomLT || c.operator === "<" || c.operator === "<=";
      if (gt) {
        if (needDomGTPre) {
          if (c.semver.prerelease && c.semver.prerelease.length && c.semver.major === needDomGTPre.major && c.semver.minor === needDomGTPre.minor && c.semver.patch === needDomGTPre.patch) {
            needDomGTPre = false;
          }
        }
        if (c.operator === ">" || c.operator === ">=") {
          higher = higherGT(gt, c, options);
          if (higher === c && higher !== gt) {
            return false;
          }
        } else if (gt.operator === ">=" && !satisfies(gt.semver, String(c), options)) {
          return false;
        }
      }
      if (lt) {
        if (needDomLTPre) {
          if (c.semver.prerelease && c.semver.prerelease.length && c.semver.major === needDomLTPre.major && c.semver.minor === needDomLTPre.minor && c.semver.patch === needDomLTPre.patch) {
            needDomLTPre = false;
          }
        }
        if (c.operator === "<" || c.operator === "<=") {
          lower = lowerLT(lt, c, options);
          if (lower === c && lower !== lt) {
            return false;
          }
        } else if (lt.operator === "<=" && !satisfies(lt.semver, String(c), options)) {
          return false;
        }
      }
      if (!c.operator && (lt || gt) && gtltComp !== 0) {
        return false;
      }
    }
    if (gt && hasDomLT && !lt && gtltComp !== 0) {
      return false;
    }
    if (lt && hasDomGT && !gt && gtltComp !== 0) {
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
    const comp = compare(a.semver, b.semver, options);
    return comp > 0 ? a : comp < 0 ? b : b.operator === ">" && a.operator === ">=" ? b : a;
  };
  const lowerLT = (a, b, options) => {
    if (!a) {
      return b;
    }
    const comp = compare(a.semver, b.semver, options);
    return comp < 0 ? a : comp > 0 ? b : b.operator === "<" && a.operator === "<=" ? b : a;
  };
  subset_1 = subset;
  return subset_1;
}
var semver;
var hasRequiredSemver;
function requireSemver() {
  if (hasRequiredSemver) return semver;
  hasRequiredSemver = 1;
  const internalRe = requireRe();
  const constants2 = requireConstants();
  const SemVer = requireSemver$1();
  const identifiers2 = requireIdentifiers();
  const parse = requireParse();
  const valid2 = requireValid$1();
  const clean = requireClean();
  const inc = requireInc();
  const diff = requireDiff();
  const major = requireMajor();
  const minor = requireMinor();
  const patch = requirePatch();
  const prerelease = requirePrerelease();
  const compare = requireCompare();
  const rcompare = requireRcompare();
  const compareLoose = requireCompareLoose();
  const compareBuild = requireCompareBuild();
  const sort = requireSort();
  const rsort = requireRsort();
  const gt = requireGt();
  const lt = requireLt();
  const eq = requireEq();
  const neq = requireNeq();
  const gte = requireGte();
  const lte = requireLte();
  const cmp = requireCmp();
  const coerce = requireCoerce();
  const Comparator = requireComparator();
  const Range = requireRange();
  const satisfies = requireSatisfies();
  const toComparators = requireToComparators();
  const maxSatisfying = requireMaxSatisfying();
  const minSatisfying = requireMinSatisfying();
  const minVersion = requireMinVersion();
  const validRange = requireValid();
  const outside = requireOutside();
  const gtr = requireGtr();
  const ltr = requireLtr();
  const intersects = requireIntersects();
  const simplifyRange = requireSimplify();
  const subset = requireSubset();
  semver = {
    parse,
    valid: valid2,
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
    SemVer,
    re: internalRe.re,
    src: internalRe.src,
    tokens: internalRe.t,
    SEMVER_SPEC_VERSION: constants2.SEMVER_SPEC_VERSION,
    RELEASE_TYPES: constants2.RELEASE_TYPES,
    compareIdentifiers: identifiers2.compareIdentifiers,
    rcompareIdentifiers: identifiers2.rcompareIdentifiers
  };
  return semver;
}
var semverExports = requireSemver();
const moduleId$1 = "crowdgoeswild";
async function runMigrationChecks() {
  let module = await game.modules.get("crowdgoeswild");
  let installedVersion = module.version;
  if (installedVersion == "#{VERSION}#") {
    console.log(
      "No version number available. Skipping migration. Things might run wonky."
    );
    return;
  } else {
    let oldVersion;
    try {
      oldVersion = await game.settings.get(moduleId$1, "moduleVersion");
    } catch (error) {
      console.log(
        "moduleVersion setting not registered somehow. Must be pre-1.0.0a4"
      );
      oldVersion = "1.0.0-alpha4";
    }
    console.log("---- Running migration checks ----");
    if (semverExports.lt(oldVersion, "1.0.0-alpha5")) {
      console.log("Pre-1.0.0-alpha5. Adding updated reaction fields");
      addTypeToReactions(game.settings.get(moduleId$1, "reactions"));
    } else {
      console.log("No migrations needed.");
    }
    game.settings.set(moduleId$1, "moduleVersion", installedVersion);
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
  game.settings.set(moduleId$1, "reactions", newReactions);
}
const moduleId = "crowdgoeswild";
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
  Hooks.on("updateSetting", async function(oldSetting, newData, opts) {
    if (oldSetting.key === "crowdgoeswild.reactions") {
      renderChatButtonBar();
    }
  });
  Hooks.on("renderChatLog", async (app, html, data) => {
    renderChatButtonBar();
  });
}
function exposeForMacros() {
  game.modules.get(moduleId).api = {
    sendReaction(reactionId) {
      sendReactionToSocket(reactionId);
    }
  };
}
registerHooks();
animationInit();
//# sourceMappingURL=crowdgoeswild.js.map
