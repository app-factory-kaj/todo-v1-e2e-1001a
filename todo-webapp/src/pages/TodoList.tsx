import {
  Alert,
  Box,
  Button,
  Chip,
  ListingTable,
  PageContent,
  PageTitle,
  Tab,
  Tabs,
  TextField,
} from "@wso2/oxygen-ui";
import { Plus } from "@wso2/oxygen-ui-icons-react";
import { useCallback, useEffect, useState, type JSX } from "react";
import { useNavigate } from "react-router";
import { todoApi } from "../api";
import type { components } from "../generated/todo-api";

type Todo = components["schemas"]["Todo"];

const TABS = ["All", "Open", "Completed"] as const;
type TabKey = (typeof TABS)[number];

function completedFilter(tab: TabKey): boolean | undefined {
  if (tab === "Open") return false;
  if (tab === "Completed") return true;
  return undefined;
}

export default function TodoList(): JSX.Element {
  const navigate = useNavigate();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [tab, setTab] = useState<TabKey>("All");
  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const load = useCallback(async (activeTab: TabKey) => {
    setLoading(true);
    setError(null);
    const { data, error: apiError } = await todoApi.GET("/todos", {
      params: { query: { limit: 100, completed: completedFilter(activeTab) } },
    });
    if (apiError) {
      setError("Could not load the todo list.");
      setLoading(false);
      return;
    }
    setTodos(data?.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load(tab);
  }, [load, tab]);

  const handleAdd = async () => {
    const title = newTitle.trim();
    if (!title) return;
    setAdding(true);
    setError(null);
    const { error: apiError } = await todoApi.POST("/todos", { body: { title } });
    setAdding(false);
    if (apiError) {
      setError("Could not add that todo — a title is required.");
      return;
    }
    setNewTitle("");
    await load(tab);
  };

  return (
    <PageContent>
      <PageTitle>
        <PageTitle.Header>Todos</PageTitle.Header>
        <PageTitle.SubHeader>Everything on the shared todo list</PageTitle.SubHeader>
      </PageTitle>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <TextField
          placeholder="What needs doing?"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void handleAdd();
          }}
          fullWidth
        />
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={() => void handleAdd()}
          disabled={adding || newTitle.trim() === ""}
        >
          Add
        </Button>
      </Box>

      <Tabs value={tab} onChange={(_, value: TabKey) => setTab(value)} sx={{ mb: 2 }}>
        {TABS.map((t) => (
          <Tab key={t} label={t} value={t} />
        ))}
      </Tabs>

      <ListingTable.Container sx={{ width: "100%" }} disablePaper>
        <ListingTable>
          <ListingTable.Head>
            <ListingTable.Row>
              <ListingTable.Cell>Title</ListingTable.Cell>
              <ListingTable.Cell>Status</ListingTable.Cell>
            </ListingTable.Row>
          </ListingTable.Head>
          <ListingTable.Body>
            {!loading && todos.length === 0 && (
              <ListingTable.Row>
                <ListingTable.Cell colSpan={2}>
                  <ListingTable.EmptyState
                    title="No todos here"
                    description={tab === "All" ? "Add your first todo above." : `No ${tab.toLowerCase()} todos.`}
                  />
                </ListingTable.Cell>
              </ListingTable.Row>
            )}
            {todos.map((todo) => (
              <ListingTable.Row key={todo.id} clickable hover onClick={() => navigate(`/todos/${todo.id}`)}>
                <ListingTable.Cell>{todo.title}</ListingTable.Cell>
                <ListingTable.Cell>
                  <Chip
                    label={todo.completed ? "Completed" : "Open"}
                    color={todo.completed ? "success" : "default"}
                    size="small"
                  />
                </ListingTable.Cell>
              </ListingTable.Row>
            ))}
          </ListingTable.Body>
        </ListingTable>
      </ListingTable.Container>
    </PageContent>
  );
}
