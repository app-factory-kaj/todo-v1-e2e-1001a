screen TodoList "Everything on the shared todo list"
  navbar "Todo App"
  row
    input "What needs doing?"
    button "Add" primary
  tabs "All | Open | Completed"
  table "Title | Status" -> TodoDetail
    row "Buy milk | Open"
    row "Walk the dog | Completed"

screen TodoDetail "Edit, complete, or remove one todo"
  navbar "Todo App"
  card "Todo"
    input "Buy milk"
    checkbox "Completed"
    row
      button "Delete" danger
      right
      button "Save" primary // saves in place, stays on this screen

flow "Manage todos"
  description "Anyone opens the shared list, adds a todo, edits it, flips it complete or incomplete, and removes it"
  TodoList
  TodoDetail
