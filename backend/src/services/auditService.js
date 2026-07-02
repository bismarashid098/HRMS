const AuditLog = require("../models/AuditLog");

const parseUserAgent = (ua = "") => {
  let browser = "Unknown", os = "Unknown", device = "Desktop";
  if (/edg\//i.test(ua)) browser = "Edge";
  else if (/chrome/i.test(ua)) browser = "Chrome";
  else if (/firefox/i.test(ua)) browser = "Firefox";
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = "Safari";
  else if (/msie|trident/i.test(ua)) browser = "IE";
  else if (/opr\//i.test(ua)) browser = "Opera";

  if (/android/i.test(ua)) os = "Android";
  else if (/iphone|ipad/i.test(ua)) os = "iOS";
  else if (/windows/i.test(ua)) os = "Windows";
  else if (/mac os/i.test(ua)) os = "macOS";
  else if (/linux/i.test(ua)) os = "Linux";

  if (/mobile/i.test(ua)) device = "Mobile";
  else if (/tablet|ipad/i.test(ua)) device = "Tablet";

  return { browser, os, device };
};

const getChangedFields = (oldObj, newObj) => {
  if (!oldObj || !newObj) return [];
  return Object.keys(newObj).filter(
    (k) => JSON.stringify(oldObj[k]) !== JSON.stringify(newObj[k])
  );
};

/**
 * Log an audit event.
 *
 * @param {Object} req   - Express request (used for user, IP, user-agent)
 * @param {Object} data
 *   @param {string}  data.module      - Module name
 *   @param {string}  data.action      - Action type
 *   @param {string}  [data.recordId]  - ID of the affected record
 *   @param {string}  [data.recordName]- Human name of the affected record
 *   @param {Object}  [data.oldValues] - State before the action
 *   @param {Object}  [data.newValues] - State after the action
 *   @param {string}  data.description - Human-readable summary
 *   @param {Object}  [data.userOverride] - Used for failed-login where req.user is null
 */
const logAudit = async (req, data) => {
  try {
    const ua = req?.headers?.["user-agent"] || "";
    const { browser, os, device } = parseUserAgent(ua);
    const rawIp = req?.ip || req?.connection?.remoteAddress || "Unknown";
    const ip = rawIp.replace("::ffff:", "");

    const userSrc = data.userOverride || req?.user;

    const changedFields = getChangedFields(data.oldValues, data.newValues);

    await AuditLog.create({
      user: userSrc?._id || null,
      userName: userSrc?.name || data.userOverride?.name || "System",
      userRole: userSrc?.role || data.userOverride?.role || "System",
      module: data.module,
      action: data.action,
      recordId: data.recordId ? String(data.recordId) : undefined,
      recordName: data.recordName,
      description: data.description,
      oldValues: data.oldValues || null,
      newValues: data.newValues || null,
      changedFields,
      ip,
      userAgent: ua.slice(0, 400),
      browser,
      os,
      device,
    });
  } catch (err) {
    // Never crash the main request due to audit failure
    console.error("[AuditLog]", err.message);
  }
};

module.exports = { logAudit };
