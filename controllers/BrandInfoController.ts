import express, { NextFunction, Request, Response } from "express";
import {
  BAD_REQUEST_ERROR,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND_ERROR,
  OK_REQUEST,
} from "../helpers/Error";
import { HttpStatusCode } from "../constants/HttpStatusCodes";
import prisma from "../db/prisma";

const Router = express.Router();

// get brand info
Router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const brandInfo = await prisma.brandInfo.findFirst({
      include: {
        location: true,
        contactNumber: true,
        socialMedias: true,
        seo: true,
      },
    });

    return next(
      new OK_REQUEST("Brand info fetched successfully", {
        brandInfo,
      })
    );
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// add basic brand info  - name, subtitle, description and logo
Router.post(
  "/",
  //  auth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, subtitle, description, logo } = req.body;

      const alreadyPresentBrandInfo: any = await prisma.brandInfo.findFirst();
      if (alreadyPresentBrandInfo) {
        return next(
          new BAD_REQUEST_ERROR("Brand info already present. Cannot proceed.")
        );
      }

      await prisma.brandInfo.create({
        data: {
          name,
          subtitle,
          description,
          logo,
        },
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

// add/update all brand info items- locations, contact numbers, SEOs, social medias
Router.put(
  "/single",
  // auth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        actionType,
        schemaName,
        payload,
      }: { actionType: string; schemaName: string; payload: any } = req.body;

      const alreadyPresentBrandInfo: any = await prisma.brandInfo.findFirst({
        include: {
          location: true,
          seo: true,
        },
      });

      if (schemaName === "NUMBER") {
        let res;
        if (actionType === "ADD") {
          res = await prisma.phoneNumber.create({
            data: {
              number: payload.number,
              brandInfoId: alreadyPresentBrandInfo.id,
            },
          });
        } else if (actionType === "UPDATE") {
          res = await prisma.phoneNumber.update({
            where: {
              id: payload.id,
            },
            data: {
              number: payload.number,
            },
          });
        }

        return next(
          new OK_REQUEST("Success", {
            number: res,
          })
        );
      } else if (schemaName === "SOCIAL_MEDIA") {
        const res = await prisma.brandInfo.update({
          where: {
            id: alreadyPresentBrandInfo.id,
          },
          data: {
            socialMedias: {
              [actionType === "UPDATE" ? "update" : "create"]:
                actionType === "UPDATE"
                  ? {
                      data: {
                        ...payload,
                        brandInfoId: undefined,
                      },
                      where: {
                        id: payload.id,
                      },
                    }
                  : {
                      ...payload,
                      brandInfoId: undefined,
                    },
            },
          },
        });
        return next(
          new OK_REQUEST("Success", {
            socialMedia: res,
          })
        );
      } else if (schemaName === "LOCATION") {
        const savedLocation = await prisma.brandInfo.update({
          where: {
            id: alreadyPresentBrandInfo.id,
          },
          data: {
            location: {
              [alreadyPresentBrandInfo.location ? "update" : "create"]: {
                state:
                  payload.state ||
                  alreadyPresentBrandInfo.location?.state ||
                  "",
                street:
                  payload.street ||
                  alreadyPresentBrandInfo.location?.street ||
                  "",
                zone:
                  payload.zone || alreadyPresentBrandInfo.location?.zone || "",
                city:
                  payload.city || alreadyPresentBrandInfo.location?.city || "",
                country:
                  payload.country ||
                  alreadyPresentBrandInfo.location?.country ||
                  "",
                district:
                  payload.district ||
                  alreadyPresentBrandInfo.location?.district ||
                  "",
              },
            },
          },
        });
        return next(new OK_REQUEST("Success", { location: savedLocation }));
      } else if (schemaName === "SEO") {
        let savedSeo;

        if (alreadyPresentBrandInfo.seo) {
          savedSeo = await prisma.sEO.update({
            where: {
              id: alreadyPresentBrandInfo.seo.id,
            },
            data: {
              ...payload,
            },
          });
        } else {
          savedSeo = await prisma.sEO.create({
            data: {
              brandInfoId: alreadyPresentBrandInfo.id,
              ...payload,
            },
          });
        }

        return next(
          new OK_REQUEST("SEO updated successfully", {
            seo: savedSeo,
          })
        );
      } else if (schemaName === "BRAND_INFO") {
        let savedBrandInfo;

        if (alreadyPresentBrandInfo) {
          savedBrandInfo = await prisma.brandInfo.update({
            where: {
              id: alreadyPresentBrandInfo.id,
            },
            data: {
              ...payload,
            },
          });
        } else {
          savedBrandInfo = await prisma.brandInfo.create({
            data: {
              ...payload,
            },
          });
        }

        return next(
          new OK_REQUEST("SEO updated successfully", {
            brandInfo: savedBrandInfo,
          })
        );
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

// delete brand info items
Router.delete(
  "/single",
  // auth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { schemaName, id }: { schemaName: string; id: string } = (
        req as any
      ).query;

      if (schemaName === "NUMBER") {
        await prisma.phoneNumber.delete({
          where: {
            id: parseInt(id),
          },
        });
      } else if (schemaName === "SOCIAL_MEDIA") {
        await prisma.socialMedia.delete({
          where: {
            id: parseInt(id),
          },
        });
      }

      return next(new OK_REQUEST("Item deleted successfully", {}));
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

export default Router;
