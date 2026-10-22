/**
 * Translation DOM Guard:
 * Prevents React hydration & unmount errors caused by Google Translate or browser translation extensions
 * modifying text nodes and DOM hierarchies before React reconciles.
 */
export const domTranslationGuardScript = `
if (typeof Node === "function" && Node.prototype && !window.__domTranslationGuard) {
  window.__domTranslationGuard = true;
  var originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function (child) {
    if (child.parentNode !== this) {
      if (console) console.error("Prevented React removeChild crash on translated node", child, this);
      return child;
    }
    return originalRemoveChild.apply(this, arguments);
  };
  var originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function (newNode, referenceNode) {
    if (referenceNode && referenceNode.parentNode !== this) {
      if (console) console.error("Prevented React insertBefore crash on translated node", referenceNode, this);
      return newNode;
    }
    return originalInsertBefore.apply(this, arguments);
  };
}
`;
