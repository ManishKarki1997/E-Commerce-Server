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
  //  auth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { subCategoryName, categoryName } = (req as any).query;

      const filters = await prisma.filter.findMany({
        where: {
          productId: null,
          categoryName: subCategoryName,
          parentCategoryName: categoryName,
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
      const { filters, categoryName, parentCategoryName, isVisibleToVisitors } =
        req.body;

      const existingFilter = await prisma.filter.findFirst({
        where: {
          categoryName,
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
            parentCategoryName: parentCategoryName,
            isVisibleToVisitors: filter.isVisibleToVisitors,
            category: {
              connect: {
                name: categoryName,
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

export default Router;
