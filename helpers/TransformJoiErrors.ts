export default function transformJoiErrors(schemaErrors: any) {
  let errorsObj: any = {};

  schemaErrors.details.forEach((err: any) => {
    errorsObj[err.path[0]] = err.message;
  });

  return { errors: errorsObj };
}
