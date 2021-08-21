export const reverseSluggify = (name: string) => {
  if (!name) return "";

  let cleanedName = name;
  if (name.includes("*")) {
    cleanedName = name.replace("*", " & ");
  }

  let x = cleanedName
    .split("")
    .map(
      (x) => `${x.toString()[0].toUpperCase()}${x.substring(1).toLowerCase()}`
    )
    .join("");

  return `${x.toString()[0].toUpperCase()}${x
    .toString()
    .substring(1)
    .toLowerCase()}`;
};

export const getCategorySubCategoryNameFromSlug = (
  category: string,
  subCategory: string
) => {
  const cleanedCategorySlug = category.toString().includes("-and-")
    ? category.toString().replace("-and-", " & ")
    : category;
  const cleanedSubCategorySlug = subCategory.toString().includes("-and-")
    ? subCategory.toString().replace("-and-", " & ")
    : category;

  console.log({
    cleanedSubCategorySlug,
    cleanedCategorySlug,
    category,
    subCategory,
  });
};
