/**
 * list controller
 */

import { factories } from "@strapi/strapi";
import type { Context } from "koa";

export default factories.createCoreController("api::list.list", () => ({
  async find(ctx: Context) {
    const { user } = ctx.state;
    const { start = 0, limit = 10 } = ctx.request.query;

    const maxLimit = await strapi.documents("api::list.list").count({
      filters: {
        user: {
          documentId: user.documentId,
        },
      },
    });

    if (Number(start) >= maxLimit) {
      ctx.body = {
        data: [],
        pagination: { start: Number(start) ?? 0, limit: maxLimit, maxLimit },
      };
      ctx.status = 200;
      return;
    }

    const data = await strapi.documents("api::list.list").findMany({
      filters: {
        user: {
          documentId: user.documentId,
        },
      },
      start: Number(start) ?? 0,
      limit: Number(limit) > maxLimit ? maxLimit : (Number(limit) ?? 10),
      populate: {
        tasks: {
          populate: {
            list: true,
          },
        },
      },
    });

    ctx.body = {
      data,
      pagination: {
        start: Number(start) ?? 0,
        limit: Number(limit) > maxLimit ? maxLimit : (Number(limit) ?? 10),
        maxLimit,
      },
    };
    ctx.status = 200;
  },
  async create(ctx: Context) {
    const { user } = ctx.state;
    const { title } = ctx.request.body;

    const list = await strapi.documents("api::list.list").create({
      data: {
        title,
        user: {
          documentId: user.documentId,
        },
      },
    });

    ctx.body = { data: list };
    ctx.status = 200;
  },
  async delete(ctx: Context) {
    const { id: documentId } = ctx.params;
    const { user } = ctx.state;

    const list = await strapi.documents("api::list.list").findOne({
      documentId,
      filters: { user: { documentId: user.documentId } },
    });

    if (!list) {
      ctx.body = { message: "List not found" };
      ctx.status = 404;
      return;
    }

    await strapi.documents("api::list.list").delete({ documentId });

    ctx.body = { message: "List deleted" };
    ctx.status = 200;
  },
  async update(ctx: Context) {
    const { id: documentId } = ctx.params;
    const { title } = ctx.request.body;
    const { user } = ctx.state;

    const list = await strapi.documents("api::list.list").findOne({
      documentId,
      filters: { user: { documentId: user.documentId } },
    });

    if (!list) {
      ctx.body = { message: "List not found" };
      ctx.status = 404;
      return;
    }

    const updatedList = await strapi
      .documents("api::list.list")
      .update({ documentId, data: { title } });

    ctx.body = { data: updatedList };
    ctx.status = 200;
  },
}));
