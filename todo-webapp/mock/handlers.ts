import { http, HttpResponse } from "msw";
import type { components } from "../src/generated/todo-api";

type Todo = components["schemas"]["Todo"];

// State lives in this module, not a server: setupWorker resolves every
// request in the page's own JS context, so a create shows up in the next
// list, a delete removes it, an edit persists — but only across in-app
// navigation. Any full page load (reload, typed URL, a link that leaves the
// SPA) re-runs this module and resets to the seed below. Seeded with the
// rows the wireframe table draws (wireframes.dsl TodoList), one open and one
// completed, plus a couple extra so the Open/Completed tabs each show more
// than one row.
let nextId = 5;
let todos: Todo[] = [
  { id: "1", title: "Buy milk", completed: false, createdAt: "2026-09-28T09:00:00.000Z" },
  { id: "2", title: "Walk the dog", completed: true, createdAt: "2026-09-28T09:05:00.000Z" },
  { id: "3", title: "Write the report", completed: false, createdAt: "2026-09-29T10:00:00.000Z" },
  { id: "4", title: "Pay the rent", completed: true, createdAt: "2026-09-29T11:00:00.000Z" },
];

function parseBool(v: string | null): boolean | undefined {
  if (v === "true") return true;
  if (v === "false") return false;
  return undefined;
}

export const handlers = [
  // List — most-specific first is not a concern here, there is only one
  // collection route and one item route and they don't overlap in shape.
  http.get("/api/todos", ({ request }) => {
    const url = new URL(request.url);
    const limit = Math.min(Number(url.searchParams.get("limit") ?? 20), 100);
    const offset = Number(url.searchParams.get("offset") ?? 0);
    const completed = parseBool(url.searchParams.get("completed"));

    const matching = todos.filter((t) => (completed === undefined ? true : t.completed === completed));
    const page = matching.slice(offset, offset + limit);
    const next = offset + limit < matching.length ? `/todos?limit=${limit}&offset=${offset + limit}` : null;
    const previous = offset > 0 ? `/todos?limit=${limit}&offset=${Math.max(0, offset - limit)}` : null;

    return HttpResponse.json({ count: matching.length, next, previous, data: page });
  }),

  http.post("/api/todos", async ({ request }) => {
    const input = (await request.json()) as { title?: string };
    if (!input?.title || input.title.trim() === "") {
      return HttpResponse.json(
        { code: 400, message: "title is required", description: "A todo's title must not be blank." },
        { status: 400 },
      );
    }
    const created: Todo = {
      id: String(nextId++),
      title: input.title,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    todos = [...todos, created];
    return HttpResponse.json(created, { status: 201 });
  }),

  http.get("/api/todos/:id", ({ params }) => {
    const found = todos.find((t) => t.id === params.id);
    if (!found) {
      return HttpResponse.json({ code: 404, message: "not found", description: "No todo with this id." }, { status: 404 });
    }
    return HttpResponse.json(found);
  }),

  http.patch("/api/todos/:id", async ({ params, request }) => {
    const index = todos.findIndex((t) => t.id === params.id);
    if (index === -1) {
      return HttpResponse.json({ code: 404, message: "not found", description: "No todo with this id." }, { status: 404 });
    }
    const input = (await request.json()) as { title?: string; completed?: boolean };
    if (input.title !== undefined && input.title.trim() === "") {
      return HttpResponse.json(
        { code: 400, message: "title is blank", description: "A todo's title must not be blank." },
        { status: 400 },
      );
    }
    const updated: Todo = {
      ...todos[index],
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.completed !== undefined ? { completed: input.completed } : {}),
    };
    todos = [...todos.slice(0, index), updated, ...todos.slice(index + 1)];
    return HttpResponse.json(updated);
  }),

  http.delete("/api/todos/:id", ({ params }) => {
    const before = todos.length;
    todos = todos.filter((t) => t.id !== params.id);
    return before === todos.length
      ? HttpResponse.json({ code: 404, message: "not found", description: "No todo with this id." }, { status: 404 })
      : new HttpResponse(null, { status: 204 });
  }),
];
