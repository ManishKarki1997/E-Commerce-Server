import express, { NextFunction, Request, Response } from "express";
import mcache from "memory-cache";

import {
  BAD_REQUEST_ERROR,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND_ERROR,
  OK_REQUEST,
  UNAUTHORIZED_ERROR,
} from "../helpers/Error";
import { HttpStatusCode } from "../constants/HttpStatusCodes";
import { CategorySchema, UserSchema } from "../validators";
import {
  generateSlug,
  transformJoiErrors,
  transformPrismaErrors,
} from "../helpers";

import prisma from "../db/prisma";
import { UserRoles } from "../constants/UserRoles";
import MemCacheKeys from "../constants/MemCacheKeys";
import { auth, checkIfAdmin } from "../middlewares";

const Router = express.Router();

// fetch all categories
Router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      subCategoriesOnly = false,
      includeSubCategories = false,
      take = 10,
      skip = 0,
    } = (req as any).query;

    const categories = await prisma.category.findMany({
      take: parseInt(take),
      skip: parseInt(skip),
      where: {
        parentId:
          subCategoriesOnly === "false"
            ? {
                not: null,
              }
            : {
                equals: null,
              },
      },
      include: {
        subCategories: includeSubCategories === "true",
      },
    });

    return res.status(HttpStatusCode.OK).send(
      new OK_REQUEST("Categories fetched successfully", {
        categories,
      })
    );
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// fetch single category
Router.get(
  "/single/:slug",
  async (req: Request, res: Response, next: NextFunction) => {
    const { slug } = (req as any).params;

    if (!slug) {
      return next(new BAD_REQUEST_ERROR("Category name not provided"));
    }
    try {
      const {
        includeSubCategories = "true",
        includeProducts = "true",
        take = 10,
        skip = 0,
      } = (req as any).query;

      let key = `${MemCacheKeys.SINGLE_SUB_CATEGORY}-${slug}-${includeProducts}-${take}-${skip}`;
      // let cachedBody = mcache.get(key);

      // if (cachedBody) {
      //   return res.status(HttpStatusCode.OK).send(
      //     new OK_REQUEST("Category fetched successfully", {
      //       category: cachedBody,
      //     })
      //   );
      // }

      const category = await prisma.category.findFirst({
        take: parseInt(take),
        skip: parseInt(skip),
        where: {
          slug,
        },
        include: {
          filters: {
            where: {
              isVisibleToVisitors: true,
            },
            include: {
              filterOptions: true,
            },
          },
          _count: {
            select: {
              subCategories: true,
              products: true,
            },
          },
          subCategories: {
            include: {
              _count: true,
            },
          },
          products:
            includeProducts === "true"
              ? {
                  include: {
                    images: true,
                    productDiscount: true,
                  },
                }
              : false,
        },
      });

      mcache.put(key, category, 300 * 1000);

      return res.status(HttpStatusCode.OK).send(
        new OK_REQUEST("Category fetched successfully", {
          category,
        })
      );
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

// fetch minimal categories
Router.get(
  "/minimalCategories",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { includeSubCategories = false } = (req as any).query;

      let categories = [];

      if (!includeSubCategories) {
        categories = await prisma.category.findMany({
          select: {
            id: true,
            uid: true,
            name: true,
            imageUrl: true,
            slug: true,
          },
          where: {
            parentName: null,
          },
        });
      } else {
        categories = await prisma.category.findMany({
          select: {
            id: true,
            uid: true,
            name: true,
            imageUrl: true,
            slug: true,
          },
        });
      }
      return res.status(HttpStatusCode.OK).send(
        new OK_REQUEST("Minimal categories fetched successfully", {
          categories,
        })
      );
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

// fetch subcategories for a category
Router.get(
  "/subcategories/:categorySlug",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { categorySlug } = req.params;
      const { take = 10, skip = 0 } = (req as any).query;

      const subCategories = await prisma.category.findMany({
        where: {
          parentName: {
            equals: categorySlug,
            mode: "insensitive",
          },
        },
        take: parseInt(take),
        skip: parseInt(skip),
      });

      // if (!subCategories) {
      //   next(new NOT_FOUND_ERROR("Category with that name not found"));
      //   return;
      // }

      return res.status(HttpStatusCode.OK).send(
        new OK_REQUEST("SubCategories fetched successfully", {
          subCategories,
        })
      );
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

// create a category
Router.post(
  "/",
  auth,
  checkIfAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    const isSubCategory = req.body.categorySlug !== undefined ? true : false;
    try {
      const isValidSchema = CategorySchema.validate(req.body, {
        stripUnknown: true,
      });

      if (isValidSchema.error) {
        return next(
          new BAD_REQUEST_ERROR(
            "Invalid category data",
            transformJoiErrors(isValidSchema.error)
          )
        );
      }

      const existingCategory = await prisma.category.findFirst({
        where: {
          name: req.body.name,
          parentName: isSubCategory
            ? {
                equals: req.body.categoryName,
              }
            : null,
        },
      });

      if (existingCategory) {
        next(
          new BAD_REQUEST_ERROR(
            `${
              isSubCategory ? "SubCategory" : "Category"
            } with that name already exists`,
            {
              errors: {
                name: "Category with that name already exists",
              },
            }
          )
        );
        return;
      }

      const category = await prisma.category.create({
        data: {
          name: req.body.name,
          slug: isSubCategory
            ? generateSlug(req.body.name, "", true)
            : generateSlug(req.body.name),
          description: req.body.description,
          imageUrl: req.body.imageUrl,
          parentSlug: isSubCategory ? req.body.categorySlug : null,
          parentName: isSubCategory ? req.body.categoryName : null,
          parent: isSubCategory
            ? {
                connect: {
                  slug: req.body.categorySlug,
                },
              }
            : undefined,
        },
      });

      return res
        .status(HttpStatusCode.OK)
        .send(
          new OK_REQUEST(
            `${
              isSubCategory ? "SubCategory" : "Category"
            } created successfully`,
            { category }
          )
        );
    } catch (error) {
      const errors = transformPrismaErrors(
        error,
        isSubCategory ? "SubCategory" : "Category"
      );
      next(errors);
    }
  }
);

// edit a category
Router.put(
  "/",
  auth,
  checkIfAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { uid } = req.body;

      // declaration merging is not working
      // add middleware to check if the role is admin/superadmin
      // const { role } = (req as any).user;

      // if (role === UserRoles.USER) {
      //   throw new UNAUTHORIZED_ERROR("Permission Denied");
      // }

      const {
        isCategory,
        name,
        slug,
        originalName,
        originalSlug,
        originalParentName,
        originalParentSlug,
      } = req.body;
      let newSlug = slug;
      let newParentName = originalParentName;
      let newParentSlug = originalParentSlug;

      if (isCategory) {
        if (originalName !== name) {
          newSlug = generateSlug(name);
          // update all sub categories to this update category's name
          // i.e. set all related subcategories' parentName and parentSlug
          await prisma.category.updateMany({
            where: {
              parentName: originalName,
            },
            data: {
              parentName: name,
              parentSlug: newSlug,
            },
          });
          // update all products' category Name and slug to the new name and slug
          await prisma.product.updateMany({
            where: {
              categorySlug: originalSlug,
            },
            data: {
              categoryName: name,
              categorySlug: newSlug,
            },
          });
        }
      } else {
        newParentName =
          req.body.parentName === originalParentName
            ? originalParentName
            : req.body.parentName;
        newParentSlug =
          req.body.parentSlug === originalParentSlug
            ? originalParentSlug
            : req.body.parentSlug;
        if (originalName !== name) {
          newSlug = generateSlug(name, "", true);

          // update all products' categorySlug and subCategorySlug to the new slug
          await prisma.product.updateMany({
            where: {
              subCategorySlug: slug,
            },
            data: {
              subCategoryName: name,
              categorySlug: req.body.parentSlug,
              subCategorySlug: newSlug,
            },
          });
        }
      }

      const keysToDelete = [
        "isCategory",
        "slug",
        "originalName",
        "originalSlug",
        "originalParentName",
        "originalParentSlug",
      ];
      const bodyCopy = { ...req.body };
      keysToDelete.forEach((k) => delete bodyCopy[k]);

      const category = await prisma.category.update({
        where: {
          uid,
        },
        data: {
          slug: newSlug,
          name: req.body.name,
          ...bodyCopy,
        },
      });

      return res.status(HttpStatusCode.OK).send(
        new OK_REQUEST("Category updated successfully", {
          category,
        })
      );
    } catch (error) {
      console.log(error);
      const errors = transformPrismaErrors(error, "Category");

      next({
        ...{ error },
        payload: { errors },
        httpCode: HttpStatusCode.BAD_REQUEST,
      });
    }
  }
);

// fetch minimal categories and subcategories for header menu
Router.get(
  "/headerCategories",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const headerCategories = await prisma.category.findMany({
        where: {
          parentName: null,
        },
        select: {
          id: true,
          uid: true,
          name: true,
          slug: true,
          subCategories: {
            select: {
              id: true,
              uid: true,
              name: true,
              slug: true,
            },
          },
        },
      });

      return res.status(HttpStatusCode.OK).send(
        new OK_REQUEST("Header categories fetched successfully", {
          headerCategories,
        })
      );
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

export default Router;
