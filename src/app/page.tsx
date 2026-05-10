"use client";

import { useEffect, useState, useTransition, type SubmitEvent } from "react";
import type { Todo } from "@/types/todo";

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    fetch("/api/todos")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTodos(data);
        } else {
          setError("목록을 불러오지 못했습니다: " + (data?.error ?? "알 수 없는 오류"));
        }
      })
      .catch(() => setError("서버에 연결할 수 없습니다."));
  }, []);

  async function addTodo(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!input.trim()) return;

    setIsAdding(true);
    setError(null);

    try {
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: input.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError("추가 실패: " + (data?.error ?? res.status));
        return;
      }
      setTodos((prev) => [data, ...prev]);
      setInput("");
    } catch {
      setError("서버에 연결할 수 없습니다.");
    } finally {
      setIsAdding(false);
    }
  }

  function toggleComplete(todo: Todo) {
    startTransition(async () => {
      const res = await fetch(`/api/todos/${todo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_completed: !todo.is_completed }),
      });
      if (!res.ok) return;
      const updated: Todo = await res.json();
      setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    });
  }

  async function deleteTodo(id: string) {
    const res = await fetch(`/api/todos/${id}`, { method: "DELETE" });
    if (!res.ok) return;
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  const completedCount = todos.filter((t) => t.is_completed).length;

  return (
    <main className="min-h-screen bg-gray-50 flex items-start justify-center pt-20 px-4">
      <div className="w-full max-w-md">

        {/* 헤더 */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">나의 할 일</h1>
          {todos.length > 0 && (
            <p className="mt-1 text-sm text-gray-400">
              {completedCount}/{todos.length} 완료
            </p>
          )}
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-2 text-red-400 hover:text-red-600">✕</button>
          </div>
        )}

        {/* 입력 폼 */}
        <form onSubmit={addTodo} className="flex gap-2 mb-6">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="할 일을 입력하세요"
            disabled={isAdding}
            className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 placeholder:text-gray-300 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isAdding}
            className="rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-w-[60px]"
          >
            {isAdding ? "..." : "추가"}
          </button>
        </form>

        {/* 할 일 목록 */}
        {todos.length > 0 ? (
          <ul className="space-y-2">
            {todos.map((todo) => (
              <li
                key={todo.id}
                className="flex items-center gap-3 rounded-lg bg-white border border-gray-100 px-4 py-3 shadow-sm"
              >
                <input
                  type="checkbox"
                  checked={todo.is_completed}
                  onChange={() => toggleComplete(todo)}
                  disabled={isPending}
                  className="w-4 h-4 rounded accent-blue-500 cursor-pointer flex-shrink-0"
                />
                <span
                  className={`flex-1 text-sm ${
                    todo.is_completed ? "line-through text-gray-300" : "text-gray-700"
                  }`}
                >
                  {todo.title}
                </span>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="flex-shrink-0 text-gray-300 hover:text-red-400 transition-colors"
                  aria-label="삭제"
                >
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-16 text-gray-300">
            <svg className="w-10 h-10 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-sm">할 일이 없습니다</p>
          </div>
        )}

      </div>
    </main>
  );
}
