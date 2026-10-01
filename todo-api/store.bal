import ballerina/time;
import ballerina/uuid;

// In-memory state for the shared todo list. No persistence, no auth: every
// todo lives only in this process's memory for its lifetime.
map<Todo> todoStore = {};
string[] todoOrder = [];

public type TodoPage record {|
    int count;
    string? next;
    string? previous;
    Todo[] data;
|};

function addTodo(string title) returns Todo {
    string id = uuid:createRandomUuid();
    string createdAt = time:utcToString(time:utcNow());
    Todo todo = {id: id, title: title, completed: false, createdAt: createdAt};
    todoStore[id] = todo;
    todoOrder.push(id);
    return todo;
}

function findTodo(string todoId) returns Todo? {
    return todoStore[todoId];
}

function removeTodo(string todoId) returns boolean {
    if !todoStore.hasKey(todoId) {
        return false;
    }
    Todo _ = todoStore.remove(todoId);
    int? idx = todoOrder.indexOf(todoId);
    if idx is int {
        string _ = todoOrder.remove(idx);
    }
    return true;
}

function applyTodoUpdate(string todoId, TodoUpdate update) returns Todo? {
    Todo? existing = todoStore[todoId];
    if existing is () {
        return ();
    }
    Todo current = existing;
    string? newTitle = update?.title;
    if newTitle is string {
        current.title = newTitle;
    }
    boolean? newCompleted = update?.completed;
    if newCompleted is boolean {
        current.completed = newCompleted;
    }
    todoStore[todoId] = current;
    return current;
}

function listTodosPage(boolean? completed, int 'limit, int offset) returns TodoPage {
    Todo[] filtered = [];
    foreach string id in todoOrder {
        Todo? t = todoStore[id];
        if t is Todo && (completed is () || t.completed == completed) {
            filtered.push(t);
        }
    }

    int total = filtered.length();
    int startIdx = offset < total ? offset : total;
    int endIdx = startIdx + 'limit < total ? startIdx + 'limit : total;
    Todo[] page = filtered.slice(startIdx, endIdx);

    string? next = endIdx < total ? buildPageUri(endIdx, 'limit, completed) : ();
    string? previous = ();
    if startIdx > 0 {
        int prevOffset = startIdx - 'limit > 0 ? startIdx - 'limit : 0;
        previous = buildPageUri(prevOffset, 'limit, completed);
    }

    return {count: total, next: next, previous: previous, data: page};
}

function buildPageUri(int offset, int 'limit, boolean? completed) returns string {
    string uri = string `/todos?limit=${'limit}&offset=${offset}`;
    if completed is boolean {
        uri = uri + string `&completed=${completed}`;
    }
    return uri;
}
