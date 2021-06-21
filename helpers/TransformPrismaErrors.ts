export default (error: any, modelName: string) => {
  let errors: { [k: string]: any } = {};
  error.meta.target.forEach((m: string | number) => {
    errors[m] = `${modelName} with that ${m} already exists`;
  });
  return errors;
};
