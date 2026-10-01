import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  FormControlLabel,
  PageContent,
  PageTitle,
  Stack,
  TextField,
} from "@wso2/oxygen-ui";
import { useCallback, useEffect, useState, type JSX } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router";
import { todoApi } from "../api";

export default function TodoDetail(): JSX.Element {
  const { todoId } = useParams<{ todoId: string }>();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    if (!todoId) return;
    setLoading(true);
    setNotFound(false);
    const { data, error: apiError, response } = await todoApi.GET("/todos/{todoId}", {
      params: { path: { todoId } },
    });
    if (apiError || !data) {
      if (response.status === 404) setNotFound(true);
      else setError("Could not load this todo.");
      setLoading(false);
      return;
    }
    setTitle(data.title);
    setCompleted(data.completed);
    setLoading(false);
  }, [todoId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSave = async () => {
    if (!todoId) return;
    const trimmed = title.trim();
    if (!trimmed) {
      setError("A title is required.");
      return;
    }
    setSaving(true);
    setError(null);
    setSaved(false);
    const { data, error: apiError } = await todoApi.PATCH("/todos/{todoId}", {
      params: { path: { todoId } },
      body: { title: trimmed, completed },
    });
    setSaving(false);
    if (apiError || !data) {
      setError("Could not save — a title is required.");
      return;
    }
    setTitle(data.title);
    setCompleted(data.completed);
    setSaved(true);
  };

  const handleDelete = async () => {
    if (!todoId) return;
    setDeleting(true);
    setError(null);
    const { error: apiError } = await todoApi.DELETE("/todos/{todoId}", {
      params: { path: { todoId } },
    });
    setDeleting(false);
    if (apiError) {
      setError("Could not delete this todo.");
      return;
    }
    navigate("/todos");
  };

  return (
    <PageContent>
      <PageTitle>
        <PageTitle.BackButton component={<RouterLink to="/todos" />} />
        <PageTitle.Header>Todo</PageTitle.Header>
        <PageTitle.SubHeader>Edit, complete, or remove one todo</PageTitle.SubHeader>
      </PageTitle>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {saved && !error && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Saved.
        </Alert>
      )}
      {notFound && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          This todo no longer exists.
        </Alert>
      )}

      {!notFound && (
        <Card>
          <CardHeader title="Todo" />
          <CardContent>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label="Title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setSaved(false);
                }}
                disabled={loading}
                fullWidth
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={completed}
                    onChange={(e) => {
                      setCompleted(e.target.checked);
                      setSaved(false);
                    }}
                    disabled={loading}
                  />
                }
                label="Completed"
              />
              <Stack direction="row" justifyContent="space-between">
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => void handleDelete()}
                  disabled={loading || deleting}
                >
                  Delete
                </Button>
                <Button
                  variant="contained"
                  onClick={() => void handleSave()}
                  disabled={loading || saving || title.trim() === ""}
                >
                  Save
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      )}
    </PageContent>
  );
}
