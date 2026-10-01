# Todo App — PRD

## Problem Statement

People juggling a short list of day-to-day tasks often reach for scraps of
paper or scattered notes apps that are either too heavyweight (accounts,
sync, sharing) or too unstructured to reliably track what still needs doing.
They want a single, always-available place to jot a task down, see what's
outstanding, and check it off — without signing in or setting anything up.

## Solution

A lightweight todo app: a single-page web app backed by a REST API service
that lets anyone open it and immediately create, view, update, complete, and
delete todo items. There are no accounts and no persistence beyond the
running service's memory — it's a fast, frictionless task list, not a
system of record.

## Actors

- **User** — anyone who opens the web app. There are no accounts, roles, or
sign-in; every visitor acts as the same single anonymous User against one
shared list of todos.

## User Stories

1. As a User, I want to create a new todo with a title, so that I can
 capture something I need to do.
2. As a User, I want to view the list of all todos, so that I can see
 everything that's outstanding and done.
3. As a User, I want to update a todo's details, so that I can correct or
 refine it after creating it.
4. As a User, I want to mark a todo as complete, so that I can track my
 progress.
5. As a User, I want to mark a completed todo back as incomplete, so that I
 can reopen something I checked off by mistake or need to redo.
6. As a User, I want to delete a todo, so that I can remove items I no
 longer need to track.

## Product Decisions

- **Sign-in:** none. The product has no authentication of any kind — every
visitor uses the same shared list.
- **Scope of the list:** a single shared todo list, not scoped per visitor
or per session, since there are no accounts to scope by. *assumed*
- **Storage:** todos are held in the API service's memory only; nothing
persists across a restart, and there is no database or other platform
resource.
- **Todo fields:** a title (required) and an optional description.
*assumed*
- **External services:** none — the product integrates with no third-party
service.

## Out of Scope

- User accounts, sign-in, or any per-user permissions.
- Persistent storage (database, file, or otherwise) — data does not survive
a service restart.
- Multi-user collaboration, sharing, or per-user/private lists.
- Notifications or reminders of any kind.
- Due dates, priorities, categories, or tags on a todo.
- Search, filtering, or sorting beyond the plain list view.

## Open Questions

*(none — the idea statement and this interview settled every decision the
PRD needed.)*