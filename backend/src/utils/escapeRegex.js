const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
module.exports = escapeRegex;
