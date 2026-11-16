// Catalog validation shared with the ByaBadges client.
const own = (object, key) => Object.hasOwn(object, key);
const record = (value) => !!value && typeof value === "object" && !Array.isArray(value);
const validUserId = (id) => /^\d{17,20}$/.test(id);
const validBadgeId = (id) => /^[a-z0-9][a-z0-9_-]{0,63}$/.test(id) && !["constructor", "prototype", "__proto__"].includes(id);
function isHttpsUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}
function validBadgeIcon(value) {
  return isHttpsUrl(value) || /^icons\/[a-zA-Z0-9][a-zA-Z0-9._-]*\.(?:png|webp|gif|jpe?g|svg)$/.test(value);
}
function resolveBadgeIcon(icon, source) {
  if (!validBadgeIcon(icon) || !isHttpsUrl(source)) throw new Error("URL da imagem ou da fonte inv\xE1lida.");
  return new URL(icon, source).href;
}
function validateCatalog(value) {
  if (!record(value) || value.schemaVersion !== 1 || !record(value.badges) || !record(value.users))
    throw new Error("Cat\xE1logo inv\xE1lido: schemaVersion, badges e users s\xE3o obrigat\xF3rios.");
  if (Object.keys(value.badges).length > 1e4 || Object.keys(value.users).length > 1e5)
    throw new Error("O cat\xE1logo excede o limite de entradas.");
  const badges = /* @__PURE__ */ Object.create(null);
  const users = /* @__PURE__ */ Object.create(null);
  for (const [key, entry] of Object.entries(value.badges)) {
    if (!validBadgeId(key) || !record(entry) || typeof entry.name !== "string" || !entry.name.trim() || entry.name.length > 128 || typeof entry.description !== "string" || entry.description.length > 500 || typeof entry.icon !== "string" || entry.icon.length > 2048 || !validBadgeIcon(entry.icon))
      throw new Error(`Defini\xE7\xE3o inv\xE1lida para a badge: ${key}`);
    badges[key] = { name: entry.name.trim(), description: entry.description, icon: entry.icon };
  }
  for (const [id, entries] of Object.entries(value.users)) {
    if (!validUserId(id) || !Array.isArray(entries) || entries.length > 100 || entries.some((key) => typeof key !== "string" || !own(badges, key)))
      throw new Error(`Usu\xE1rio ou atribui\xE7\xF5es inv\xE1lidas: ${id}`);
    users[id] = [...new Set(entries)];
  }
  return { schemaVersion: 1, badges, users };
}
function userBadges(catalog, userId) {
  return (catalog.users[userId] ?? []).map((id) => ({ id, ...catalog.badges[id] }));
}
export {
  isHttpsUrl,
  resolveBadgeIcon,
  userBadges,
  validBadgeIcon,
  validBadgeId,
  validUserId,
  validateCatalog
};
