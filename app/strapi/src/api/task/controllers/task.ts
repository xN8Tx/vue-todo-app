/**
 * task controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController("api::task.task", () => ({
  async find(ctx) {
    const { user } = ctx.state;
    const { start = 0, limit = 50, isPinned = false } = ctx.request.query;

    const maxLimit = await strapi.documents("api::task.task").count({
      filters: {
        user: {
          documentId: user.documentId,
        },
        isPinned: isPinned === "true" ? true : false,
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

    const data = await strapi.documents("api::task.task").findMany({
      filters: {
        user: {
          documentId: user.documentId,
        },
        isPinned: isPinned === "true" ? true : false,
      },
      start: Number(start) ?? 0,
      limit: Number(limit) > maxLimit ? maxLimit : (Number(limit) ?? 50),
      ...(isPinned === "true" ? { populate: { list: true } } : {}),
    });

    ctx.body = {
      data,
      pagination: {
        start: Number(start) ?? 0,
        limit: Number(limit) > maxLimit ? maxLimit : (Number(limit) ?? 50),
        maxLimit,
      },
    };
    ctx.status = 200;
  },

  async create(ctx) {
    const { user } = ctx.state;
    const {
      title,
      description,
      list: listDocumentId,
      isPinned,
    } = ctx.request.body;

    const list = await strapi.documents("api::list.list").findOne({
      documentId: listDocumentId,
      filters: { user: { documentId: user.documentId } },
    });

    if (!list) {
      ctx.body = { message: "List not found or access denied" };
      ctx.status = 403;
      return;
    }

    const task = await strapi.documents("api::task.task").create({
      data: {
        title,
        description,
        isPinned,
        list: { documentId: listDocumentId },
        isCompleted: false,
        user: { documentId: user.documentId },
      },
    });

    ctx.body = { data: task };
    ctx.status = 200;
  },

  async delete(ctx) {
    const { id: documentId } = ctx.params;
    const { user } = ctx.state;

    const task = await strapi.documents("api::task.task").findOne({
      documentId,
      filters: { user: { documentId: user.documentId } },
    });

    if (!task) {
      ctx.body = { message: "Task not found or access denied" };
      ctx.status = 403;
      return;
    }

    await strapi.documents("api::task.task").delete({ documentId });
    ctx.body = { message: "Task deleted" };
    ctx.status = 200;
  },

  async update(ctx) {
    const { id: documentId } = ctx.params;
    const { title, description, isCompleted, isPinned } = ctx.request.body;
    const { user } = ctx.state;

    const task = await strapi.documents("api::task.task").findOne({
      documentId,
      filters: { user: { documentId: user.documentId } },
    });

    if (!task) {
      ctx.body = { message: "Task not found or access denied" };
      ctx.status = 403;
      return;
    }

    const updatedTask = await strapi.documents("api::task.task").update({
      documentId,
      data: {
        title,
        description,
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
        isPinned,
      },
      ...(isPinned === "true" ? { populate: { list: true } } : {}),
    });

    ctx.body = { data: updatedTask };
    ctx.status = 200;
  },
}));
