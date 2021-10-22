import express, { NextFunction, Request, Response } from "express";
import {
  BAD_REQUEST_ERROR,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND_ERROR,
  OK_REQUEST,
  UNAUTHORIZED_ERROR,
} from "../helpers/Error";
import { HttpStatusCode } from "../constants/HttpStatusCodes";
import sendEmail from "../helpers/SendMail";
import { auth } from "../middlewares";
import { CategorySchema, UserSchema } from "../validators";
import { transformJoiErrors, transformPrismaErrors } from "../helpers";

import prisma from "../db/prisma";
import { UserRoles } from "../constants/UserRoles";

const Router = express.Router();

// fetch all filters
Router.get(
  "/",
  //  auth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = await prisma.filter.findMany({
        where: {
          productId: null,
        },
        include: {
          category: {
            select: {
              imageUrl: true,
            },
          },
        },
      });

      return res.status(HttpStatusCode.OK).send(
        new OK_REQUEST("Filters fetched successfully", {
          filters,
        })
      );
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

// fetch filters for a subcategory
Router.get(
  "/single",
  auth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        subCategoryName,
        categoryName,
        valueNull = "true",
      } = (req as any).query;
      const filters = await prisma.filter.findMany({
        where: {
          productId: null,
          subCategoryName,
          categoryName,
          ...(valueNull === "true" && {
            value: null,
          }),
        },
        include: {
          filterOptions: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return res.status(HttpStatusCode.OK).send(
        new OK_REQUEST("Filters fetched successfully", {
          filters,
        })
      );
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

// create filters
Router.post(
  "/",
  // auth,
  // checkIfAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { filters, categoryName, subCategoryName } = req.body;

      const existingFilter = await prisma.filter.findFirst({
        where: {
          subCategoryName,
        },
      });

      if (existingFilter) {
        return next(
          new BAD_REQUEST_ERROR(
            "Filters for that category already exist. Update the existing ones instead."
          )
        );
      }

      const handleSaveFilter = async (filter: any) => {
        const savedFilter = await prisma.filter.create({
          data: {
            name: filter.name,
            categoryName,
            subCategoryName,
            isVisibleToVisitors: filter.isVisibleToVisitors,
            category: {
              connect: {
                name: subCategoryName,
              },
            },
            filterOptions: {
              create: [
                ...filter.filterOptions.map((option: any) => {
                  return {
                    name: option.name,
                  };
                }),
              ],
            },
          },
          include: {
            filterOptions: true,
          },
        });

        return savedFilter;
      };

      const savedFilters = await Promise.all(
        filters.map(async (f: any) => await handleSaveFilter(f))
      );

      return res.status(HttpStatusCode.OK).send(
        new OK_REQUEST("Filter created successfully", {
          filters: savedFilters,
        })
      );
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

// update filter options
Router.put("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      filters,
      filterOptionsToAdd,
      filtersToDelete,
      filterOptionsToDelete,
      filtersToAdd,
      subCategoryName,
      categoryName,
    } = req.body;

    // const existingCategoryFilter = await prisma.category
    //   .findFirst({
    //     where: {
    //       name: subCategoryName,
    //     },
    //   })
    //   .filters();

    // if (existingCategoryFilter.length > 0) {
    //   return next(
    //     new BAD_REQUEST_ERROR(
    //       "Filters for that category already exist. Update the existing ones instead."
    //     )
    //   );
    // }

    filterOptionsToDelete.length > 0 &&
      (await prisma.filterOption.deleteMany({
        where: {
          id: {
            in: filterOptionsToDelete.map((x: any) => x.id),
          },
        },
      }));

    filtersToDelete.length > 0 &&
      (await prisma.filter.deleteMany({
        where: {
          id: {
            in: filtersToDelete.map((x: any) => x.filterId),
          },
        },
      }));

    const handleSingleFilterAdd = async (filter: any) => {
      return prisma.filter.create({
        data: {
          name: filter.name,
          filterType: filter.filterType,
          categoryName: categoryName,
          subCategoryName: filter.subCategoryName,
          isVisibleToVisitors: filter.isVisibleToVisitors || false,
          category: {
            connect: {
              name: filter.subCategoryName,
            },
          },
          filterOptions: {
            create: [
              ...filter.filterOptions.map((option: any) => {
                return {
                  name: option.name,
                };
              }),
            ],
          },
        },
      });
    };

    const handleSingleFilterOptionAdd = async (option: any) => {
      return prisma.filterOption.create({
        data: {
          name: option.name,
          filter: {
            connect: {
              id: option.filterId,
            },
          },
        },
      });
    };

    // update function for single filter
    const handleSingleFilterUpdate = async (filter: any) => {
      return prisma.filter.update({
        where: {
          id: filter.id,
        },
        data: {
          name: filter.name,
          filterType: filter.filterType,
          categoryName: categoryName,
          subCategoryName,
          isVisibleToVisitors: filter.isVisibleToVisitors || false,
          category: {
            connect: {
              name: subCategoryName,
            },
          },
        },
      });
    };

    filtersToAdd.length > 0 &&
      (await Promise.all(
        filtersToAdd.map(async (f: any) => await handleSingleFilterAdd(f))
      ));

    await Promise.all(
      filters
        .filter((f: any) => f.id !== undefined)
        .map(async (f: any) => await handleSingleFilterUpdate(f))
    );

    filterOptionsToAdd.length > 0 &&
      (await Promise.all(
        filterOptionsToAdd.map(
          async (o: any) => await handleSingleFilterOptionAdd(o)
        )
      ));

    return res.status(HttpStatusCode.OK).send(
      new OK_REQUEST("Filter updated successfully", {
        filter: {},
      })
    );
  } catch (error) {
    console.log(error);
    next(error);
  }
});

export default Router;
