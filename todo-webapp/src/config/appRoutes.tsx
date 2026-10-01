import { type RouteProps, Navigate } from "react-router";
import AppLayout from "../layouts/AppLayout";
import TodoList from "../pages/TodoList";
import TodoDetail from "../pages/TodoDetail";

export interface AppRoute extends Omit<RouteProps, "children"> {
  children?: AppRoute[];
  label?: string;
}

const appRoutes: AppRoute[] = [
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/todos" replace /> },
      { path: "/todos", element: <TodoList />, label: "Todos" },
      { path: "/todos/:todoId", element: <TodoDetail />, label: "Todo" },
    ],
  },
];

export default appRoutes;
