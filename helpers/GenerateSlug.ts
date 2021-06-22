const generateSlugFromName = (name: string) =>
  name
    .toString()
    .toLowerCase()
    .trim()
    .replace(/&/g, "-and-")
    .replace(/[\s\W-]+/g, "-")
    .replace(/-$/, "");

export default generateSlugFromName;
