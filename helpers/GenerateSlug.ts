const generateSlugFromName = (name: string, suffix:string) => {
  const cleanedName = name
    .toString()
    .toLowerCase()
    .trim()
    .replace(/&/g, "-and-")
    .replace(/[\s\W-]+/g, "-")
    .replace(/-$/, "");

    const cleanedSuffix = suffix
    .toString()
    .toLowerCase()
    .trim()
    .replace(/&/g, "-and-")
    .replace(/[\s\W-]+/g, "-")
    .replace(/-$/, "");

    return `${cleanedName}-${cleanedSuffix}`

}

export default generateSlugFromName;
