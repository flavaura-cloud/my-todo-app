export interface Todo {
  id: string;
  title: string;
  is_completed: boolean;
  created_at: string;
}

export type CreateTodoInput = Pick<Todo, "title">;
export type UpdateTodoInput = Partial<Pick<Todo, "title" | "is_completed">>;
