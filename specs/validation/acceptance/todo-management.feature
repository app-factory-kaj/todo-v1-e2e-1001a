Feature: Managing the shared todo list

  @story-1
  Rule: Adding a todo requires a title

    Scenario: Jordan creates a todo
      Given the todo list is empty
      When Jordan adds a todo titled "Buy milk"
      Then the todo list has exactly one todo

    @negative
    Scenario: A blank title is refused
      Given the todo list is empty
      When Jordan tries to add a todo with no title
      Then the todo list still has no todos

  @story-2
  Rule: The todo list shows every todo, open or completed

    Scenario: Priya sees both open and completed todos
      Given Jordan has added a todo titled "Buy milk"
      And Jordan has added a todo titled "Walk the dog" and marked it complete
      When Priya views the todo list
      Then she sees "Buy milk" and "Walk the dog" in the list

  @story-3
  Rule: A todo's title can be corrected after creation

    Scenario: Jordan fixes a typo
      Given Jordan has added a todo titled "Buy mlik"
      When Jordan updates that todo's title to "Buy milk"
      Then the todo list shows a todo titled "Buy milk" and none titled "Buy mlik"

  @story-4
  Rule: A todo can be marked complete

    Scenario: Jordan finishes a task
      Given Jordan has added a todo titled "Buy milk"
      When Jordan marks "Buy milk" complete
      Then the todo list shows "Buy milk" as complete

  @story-5
  Rule: A completed todo can be marked incomplete again

    Scenario: Jordan reopens a todo
      Given Jordan has added a todo titled "Buy milk" and marked it complete
      When Jordan marks "Buy milk" incomplete
      Then the todo list shows "Buy milk" as not complete

  @story-6
  Rule: A todo can be removed from the list

    Scenario: Jordan deletes a todo
      Given Jordan has added a todo titled "Buy milk"
      When Jordan deletes "Buy milk"
      Then the todo list no longer has a todo titled "Buy milk"

    @negative
    Scenario: Deleting one todo leaves the others
      Given Jordan has added a todo titled "Buy milk"
      And Jordan has added a todo titled "Walk the dog"
      When Jordan deletes "Buy milk"
      Then the todo list still has exactly one todo, titled "Walk the dog"
