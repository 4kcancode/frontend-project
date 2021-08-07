import { types } from "mobx-state-tree";
import * as xpath from "xpath-range";

import NormalizationMixin from "../mixins/Normalization";
import RegionsMixin from "../mixins/Regions";
import WithStatesMixin from "../mixins/WithStates";
import { RichTextModel } from "../tags/object/RichText/model";

import { HighlightMixin } from "../mixins/HighlightMixin";
import Registry from "../core/Registry";
import { AreaMixin } from "../mixins/AreaMixin";
import Utils from "../utils";
import { isDefined } from "../utils/utilities";
import { findRangeNative } from "../utils/selection-tools";

const GlobalOffsets = types.model("GlobalOffset", {
  start: types.number,
  end: types.number,
});

const Model = types
  .model("RichTextRegionModel", {
    type: "richtextregion",
    object: types.late(() => types.reference(RichTextModel)),

    startOffset: types.integer,
    endOffset: types.integer,
    start: types.string,
    end: types.string,
    text: types.maybeNull(types.string),
    isText: types.optional(types.boolean, false),
    globalOffsets: types.maybeNull(GlobalOffsets),
  })
  .volatile(() => ({
    hideable: true,
  }))
  .views(self => ({
    get parent () {
      return self.object;
    },
    getRegionElement () {
      return self._spans?.[0];
    },
  }))
  .actions(self => ({
    beforeDestroy () {
      try{
        self.removeHighlight();
      } catch(e) {
        console.warn(e);
      }
    },

    serialize () {
      let res = {
        value: {},
      };

      if (self.isText) {
        Object.assign(res.value, {
          start: self.startOffset,
          end: self.endOffset,
        });
      } else {
        Object.assign(res.value, {
          start: self.start,
          end: self.end,
          startOffset: self.startOffset,
          endOffset: self.endOffset,
        });
      }

      if (self.object.savetextresult === "yes" && isDefined(self.text)) {
        res.value["text"] = self.text;
      }

      return res;
    },

    updateOffsets (startOffset, endOffset) {
      Object.assign(self, { startOffset, endOffset });
    },

    updateGlobalOffsets (start, end) {
      self.globalOffsets = GlobalOffsets.create({
        start,
        end,
      });
    },

    rangeFromGlobalOffset () {
      if (self.globalOffsets) {
        return findRangeNative(self.globalOffsets.start, self.globalOffsets.end, self._getRootNode());
      }

      return self._getRange();
    },

    // For external XPath updates
    updateXPath (normedRange) {
      if (self.isText) return;
      if (!isDefined(normedRange)) return;

      self.start = normedRange.start ?? self.start;
      self.end = normedRange.end ?? self.end;
      self.startOffset = normedRange.startOffset ?? self.startOffset;
      self.endOffset = normedRange.endOffset ?? self.endOffset;
    },

    _getRange ({ useOriginalContent = false, useCache = true } = {}) {
      const rootNode = self._getRootNode(useOriginalContent);
      const hasCache = isDefined(self._cachedRange) && !useOriginalContent && useCache;
      const rootNodeExists = hasCache && (rootNode && !rootNode.contains(self._cachedRange.commonAncestorContainer));

      if (useOriginalContent) console.log({ rootNode, hasCache, rootNodeExists });

      if (hasCache === false || rootNodeExists) {
        const foundRange = self._createNativeRange(useOriginalContent);

        // Skip cache for original content tag
        if (useOriginalContent || useCache === false) return foundRange;

        return (self._cachedRange = foundRange);
      }

      return self._cachedRange;
    },

    _getRootNode (originalContent = false) {
      const rootNode = originalContent
        ? self.parent.originalContentRef
        : self.parent.rootNodeRef;

      return rootNode.current;
    },

    _createNativeRange (useOriginalContent = false) {
      const rootNode = self._getRootNode(useOriginalContent);

      if (rootNode === undefined) return undefined;

      const { start, startOffset, end, endOffset } = self;

      try {
        if (self.isText) {
          const { startContainer, endContainer } = Utils.Selection.findRange(startOffset, endOffset, rootNode);
          const range = document.createRange();

          range.setStart(startContainer.node, startContainer.position);
          range.setEnd(endContainer.node, endContainer.position);

          self.text = range.toString();

          return range;
        }

        return xpath.toRange(start, startOffset, end, endOffset, rootNode);
      } catch (err) {
        if (rootNode) console.log(err, rootNode, [startOffset, endOffset]);
      }

      return undefined;
    },
  }));

const RichTextRegionModel = types.compose(
  "RichTextRegionModel",
  WithStatesMixin,
  RegionsMixin,
  AreaMixin,
  NormalizationMixin,
  Model,
  HighlightMixin,
);

Registry.addRegionType(RichTextRegionModel, "text");
Registry.addRegionType(RichTextRegionModel, "hypertext");
Registry.addRegionType(RichTextRegionModel, "richtext");

export { RichTextRegionModel };
