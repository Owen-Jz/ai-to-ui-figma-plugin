"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));

  // src/code.ts
  function hexToRgb(hex) {
    hex = hex.replace(/^#/, "");
    if (hex.length === 3) {
      hex = hex.split("").map((c) => c + c).join("");
    }
    if (hex.length === 8) {
      hex = hex.substring(0, 6);
    }
    const bigint = parseInt(hex, 16);
    return {
      r: (bigint >> 16 & 255) / 255,
      g: (bigint >> 8 & 255) / 255,
      b: (bigint & 255) / 255
    };
  }
  function hexToAlpha(hex) {
    hex = hex.replace(/^#/, "");
    if (hex.length === 8) {
      return parseInt(hex.substring(6, 8), 16) / 255;
    }
    return 1;
  }
  function getPlaceholderImageUrl(keyword, width = 400, height = 300) {
    const keywords = {
      "avatar": "portrait,face",
      "hero": "landscape,nature",
      "product": "product,minimal",
      "team": "people,team",
      "office": "office,workspace",
      "nature": "nature,landscape",
      "tech": "technology,computer",
      "food": "food,restaurant",
      "travel": "travel,adventure",
      "abstract": "abstract,pattern"
    };
    const searchTerm = keywords[keyword.toLowerCase()] || keyword;
    return `https://source.unsplash.com/${width}x${height}/?${encodeURIComponent(searchTerm)}`;
  }
  function mapFontWeight(weight) {
    const weightMap = {
      "Light": "Light",
      "Regular": "Regular",
      "Medium": "Medium",
      "SemiBold": "SemiBold",
      "Bold": "Bold",
      "ExtraBold": "ExtraBold"
    };
    return weightMap[weight || "Regular"] || "Regular";
  }
  async function loadImageFromUrl(url) {
    try {
      const response = await fetch(url);
      if (!response.ok)
        return null;
      const arrayBuffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const imageHash = figma.createImage(uint8Array).hash;
      return imageHash;
    } catch (error) {
      console.error("Failed to load image:", error);
      return null;
    }
  }
  function applyCommonStyles(node, data) {
    if (data.fills && data.fills.length > 0) {
      const paints = data.fills.map((fill) => {
        var _a;
        if (fill.type === "SOLID" && fill.color) {
          const rgb = hexToRgb(fill.color);
          return {
            type: "SOLID",
            color: rgb,
            opacity: (_a = fill.opacity) != null ? _a : hexToAlpha(fill.color)
          };
        }
        return { type: "SOLID", color: { r: 0.5, g: 0.5, b: 0.5 } };
      });
      node.fills = paints;
    }
    if (data.opacity !== void 0) {
      node.opacity = data.opacity;
    }
  }
  function applyGeometryStyles(node, data) {
    var _a, _b;
    if (data.strokes && data.strokes.length > 0) {
      const strokePaints = data.strokes.map((stroke) => {
        var _a2;
        const rgb = hexToRgb(stroke.color);
        return {
          type: "SOLID",
          color: rgb,
          opacity: (_a2 = stroke.opacity) != null ? _a2 : 1
        };
      });
      node.strokes = strokePaints;
      node.strokeWeight = (_a = data.strokeWeight) != null ? _a : 1;
      node.strokeAlign = (_b = data.strokeAlign) != null ? _b : "INSIDE";
    }
    if (data.cornerRadius !== void 0) {
      node.cornerRadius = data.cornerRadius;
    }
    if (data.topLeftRadius !== void 0)
      node.topLeftRadius = data.topLeftRadius;
    if (data.topRightRadius !== void 0)
      node.topRightRadius = data.topRightRadius;
    if (data.bottomLeftRadius !== void 0)
      node.bottomLeftRadius = data.bottomLeftRadius;
    if (data.bottomRightRadius !== void 0)
      node.bottomRightRadius = data.bottomRightRadius;
    if (data.effects && data.effects.length > 0) {
      const figmaEffects = data.effects.map((effect) => {
        var _a2, _b2, _c, _d;
        if (effect.type === "DROP_SHADOW" || effect.type === "INNER_SHADOW") {
          const shadowEffect = effect;
          const rgb = hexToRgb(shadowEffect.color);
          const alpha = hexToAlpha(shadowEffect.color);
          return {
            type: shadowEffect.type,
            color: __spreadProps(__spreadValues({}, rgb), { a: alpha }),
            offset: (_a2 = shadowEffect.offset) != null ? _a2 : { x: 0, y: 4 },
            radius: shadowEffect.radius,
            spread: (_b2 = shadowEffect.spread) != null ? _b2 : 0,
            visible: (_c = shadowEffect.visible) != null ? _c : true,
            blendMode: "NORMAL"
          };
        } else {
          const blurEffect = effect;
          return {
            type: blurEffect.type,
            radius: blurEffect.radius,
            visible: (_d = blurEffect.visible) != null ? _d : true
          };
        }
      });
      node.effects = figmaEffects;
    }
  }
  function isInAutoLayoutParent(node) {
    const parent = node.parent;
    if (parent && "layoutMode" in parent) {
      return parent.layoutMode !== "NONE";
    }
    return false;
  }
  function applySizing(node, data, isAppended = false) {
    const canUseFillHug = isAppended && isInAutoLayoutParent(node);
    if (data.width === "fill") {
      if (canUseFillHug && "layoutSizingHorizontal" in node) {
        node.layoutSizingHorizontal = "FILL";
      }
    } else if (data.width === "hug") {
      if ("layoutSizingHorizontal" in node) {
        node.layoutSizingHorizontal = "HUG";
      }
    } else if (typeof data.width === "number") {
      if ("resize" in node) {
        node.resize(data.width, node.height);
      }
      if ("layoutSizingHorizontal" in node) {
        node.layoutSizingHorizontal = "FIXED";
      }
    }
    if (data.height === "fill") {
      if (canUseFillHug && "layoutSizingVertical" in node) {
        node.layoutSizingVertical = "FILL";
      }
    } else if (data.height === "hug") {
      if ("layoutSizingVertical" in node) {
        node.layoutSizingVertical = "HUG";
      }
    } else if (typeof data.height === "number") {
      if ("resize" in node) {
        node.resize(node.width, data.height);
      }
      if ("layoutSizingVertical" in node) {
        node.layoutSizingVertical = "FIXED";
      }
    }
    if ("minWidth" in node && data.minWidth !== void 0) {
      node.minWidth = data.minWidth;
    }
    if ("maxWidth" in node && data.maxWidth !== void 0) {
      node.maxWidth = data.maxWidth;
    }
    if ("minHeight" in node && data.minHeight !== void 0) {
      node.minHeight = data.minHeight;
    }
    if ("maxHeight" in node && data.maxHeight !== void 0) {
      node.maxHeight = data.maxHeight;
    }
  }
  async function createFrame(data, parent) {
    var _a, _b, _c, _d, _e;
    const frame = figma.createFrame();
    frame.name = data.name || "Frame";
    if (!data.absolute) {
      frame.layoutMode = data.layoutMode || "VERTICAL";
      frame.primaryAxisAlignItems = data.primaryAxisAlignItems || "MIN";
      frame.counterAxisAlignItems = data.counterAxisAlignItems || "MIN";
      frame.itemSpacing = (_a = data.itemSpacing) != null ? _a : 0;
      if (data.padding) {
        frame.paddingTop = (_b = data.padding.top) != null ? _b : 0;
        frame.paddingRight = (_c = data.padding.right) != null ? _c : 0;
        frame.paddingBottom = (_d = data.padding.bottom) != null ? _d : 0;
        frame.paddingLeft = (_e = data.padding.left) != null ? _e : 0;
      }
      frame.primaryAxisSizingMode = data.primaryAxisSizingMode || "AUTO";
      frame.counterAxisSizingMode = data.counterAxisSizingMode || "AUTO";
    }
    applyCommonStyles(frame, data);
    applyGeometryStyles(frame, data);
    if (typeof data.width === "number") {
      frame.resize(data.width, frame.height);
    }
    if (typeof data.height === "number") {
      frame.resize(frame.width, data.height);
    }
    if (data.children && data.children.length > 0) {
      for (const childData of data.children) {
        const result = await createNodeWithData(childData, frame);
        if (result) {
          frame.appendChild(result.node);
          applySizing(result.node, result.data, true);
        }
      }
    }
    if (data.width === "hug" && "layoutSizingHorizontal" in frame) {
      frame.layoutSizingHorizontal = "HUG";
    }
    if (data.height === "hug" && "layoutSizingVertical" in frame) {
      frame.layoutSizingVertical = "HUG";
    }
    if (data.absolute && data.x !== void 0 && data.y !== void 0) {
      frame.x = data.x;
      frame.y = data.y;
    }
    return { node: frame, data };
  }
  async function createText(data, parent) {
    const text = figma.createText();
    text.name = data.name || "Text";
    const fontFamily = data.fontFamily || "Inter";
    const fontStyle = mapFontWeight(data.fontWeight);
    let loadedFont = { family: fontFamily, style: fontStyle };
    try {
      await figma.loadFontAsync({ family: fontFamily, style: fontStyle });
    } catch (e) {
      try {
        await figma.loadFontAsync({ family: "Inter", style: "Regular" });
        loadedFont = { family: "Inter", style: "Regular" };
      } catch (e2) {
        await figma.loadFontAsync({ family: "Roboto", style: "Regular" });
        loadedFont = { family: "Roboto", style: "Regular" };
      }
    }
    text.fontName = loadedFont;
    text.characters = data.characters || "Text";
    if (data.fontSize) {
      text.fontSize = data.fontSize;
    }
    if (data.textColor) {
      const rgb = hexToRgb(data.textColor);
      text.fills = [{ type: "SOLID", color: rgb }];
    }
    if (data.textAlign) {
      text.textAlignHorizontal = data.textAlign;
    }
    if (data.lineHeight !== void 0) {
      if (data.lineHeight === "AUTO") {
        text.lineHeight = { unit: "AUTO" };
      } else {
        text.lineHeight = { unit: "PIXELS", value: data.lineHeight };
      }
    }
    if (data.letterSpacing !== void 0) {
      text.letterSpacing = { unit: "PIXELS", value: data.letterSpacing };
    }
    if (data.textDecoration) {
      text.textDecoration = data.textDecoration;
    }
    return { node: text, data };
  }
  async function createImage(data, parent) {
    const rect = figma.createRectangle();
    rect.name = data.name || "Image";
    const width = typeof data.width === "number" ? data.width : 400;
    const height = typeof data.height === "number" ? data.height : 300;
    rect.resize(width, height);
    if (data.cornerRadius !== void 0) {
      rect.cornerRadius = data.cornerRadius;
    }
    if (data.src) {
      let imageUrl = data.src;
      if (!data.src.startsWith("http")) {
        imageUrl = getPlaceholderImageUrl(data.src, width, height);
      }
      const imageHash = await loadImageFromUrl(imageUrl);
      if (imageHash) {
        rect.fills = [{
          type: "IMAGE",
          imageHash,
          scaleMode: "FILL"
        }];
      } else {
        rect.fills = [{
          type: "SOLID",
          color: { r: 0.9, g: 0.9, b: 0.9 }
        }];
      }
    }
    return { node: rect, data };
  }
  function createRectangle(data, parent) {
    const rect = figma.createRectangle();
    rect.name = data.name || "Rectangle";
    const width = typeof data.width === "number" ? data.width : 100;
    const height = typeof data.height === "number" ? data.height : 100;
    rect.resize(width, height);
    applyCommonStyles(rect, data);
    applyGeometryStyles(rect, data);
    return { node: rect, data };
  }
  async function createNodeWithData(data, parent) {
    switch (data.type) {
      case "FRAME":
        return await createFrame(data, parent);
      case "TEXT":
        return await createText(data, parent);
      case "IMAGE":
        return await createImage(data, parent);
      case "RECTANGLE":
        return createRectangle(data, parent);
      default:
        console.warn(`Unknown node type: ${data.type}`);
        return null;
    }
  }
  async function createRootNode(data) {
    const result = await createNodeWithData(data);
    if (!result)
      return null;
    return result.node;
  }
  figma.showUI(__html__, {
    width: 420,
    height: 600,
    themeColors: true
  });
  figma.ui.onmessage = async (msg) => {
    if (msg.type === "build" && msg.data) {
      try {
        const rootNode = await createRootNode(msg.data);
        if (rootNode) {
          const viewportCenter = figma.viewport.center;
          rootNode.x = viewportCenter.x - rootNode.width / 2;
          rootNode.y = viewportCenter.y - rootNode.height / 2;
          figma.currentPage.appendChild(rootNode);
          figma.currentPage.selection = [rootNode];
          figma.viewport.scrollAndZoomIntoView([rootNode]);
          figma.ui.postMessage({
            type: "success",
            message: `\u2728 Design created successfully! ${countNodes(msg.data)} nodes generated.`
          });
        } else {
          figma.ui.postMessage({
            type: "error",
            message: "Failed to create the design. Please check your JSON structure."
          });
        }
      } catch (error) {
        console.error("Build error:", error);
        figma.ui.postMessage({
          type: "error",
          message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`
        });
      }
    }
  };
  function countNodes(data) {
    let count = 1;
    if (data.children) {
      for (const child of data.children) {
        count += countNodes(child);
      }
    }
    return count;
  }
})();
