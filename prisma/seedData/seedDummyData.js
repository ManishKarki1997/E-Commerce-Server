const categories = require("./categories.json");
const products = require("./products.json");
const filters = require("./filters.json");
const filterOptions = require("./filterOptions.json");

// function that returns an object for filter Options with structure acceptable to the db
// right now, the json file contains the filter options values as array of strings, because it is easier for me to write it
// but it needs to be converted properly to seed in the db, which this function does
const returnFormattedFilterOptions = (
  filterName,
  subCategoryName
) => {
  const filterOptionsForSubCategory = filterOptions.filter(
    (fo) =>
      fo.filterName == filterName && fo.subCategories.includes(subCategoryName)
  );

  const tempValue = filterOptionsForSubCategory.map(fo=>{
  return fo.values.map(v=>({
    name:v
  }))
})

  console.log("temp value ", tempValue.flat());
  
};

returnFormattedFilterOptions("Storage", "Playstation");
