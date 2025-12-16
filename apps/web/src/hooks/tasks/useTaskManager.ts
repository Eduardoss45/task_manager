import { useCallback, useState, useRef } from "react";
import { toast } from "sonner";
import { api } from "@/services/api";
import type { Task } from "@/types/task";
import type { AvailableUser } from "@/types/available-user";

export function useTaskManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const invalidateTask = (taskId: string) => {
    delete taskCache.current[taskId];
  };

  const invalidateAllTasks = () => {
    taskCache.current = {};
  };

  const fetchTasks = useCallback(async (page = 1, size = 10) => {
    if (page <= 0 || size <= 0) return;

    try {
      setLoading(true);
      const res = await api.get(`api/tasks?page=${page}&size=${size}`, {
        withCredentials: true,
      });
      setTasks(res.data.items ?? res.data);
    } catch (err: any) {
      setError(err.message);
      toast.error("Erro ao carregar tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  const taskCache = useRef<Record<string, Task>>({});

  const getTask = useCallback(async (id: string) => {
    if (taskCache.current[id]) return taskCache.current[id];

    const res = await api.get(`api/tasks/${id}`, { withCredentials: true });
    taskCache.current[id] = res.data;
    return res.data;
  }, []);

  const usersCache = useRef<AvailableUser[] | null>(null);
  const usersPromise = useRef<Promise<AvailableUser[]> | null>(null);

  const getUsers = useCallback(async (): Promise<AvailableUser[]> => {
    if (usersCache.current) {
      return usersCache.current;
    }

    if (usersPromise.current) {
      return usersPromise.current;
    }

    usersPromise.current = api
      .get("/api/auth/users", { withCredentials: true })
      .then(res => {
        const users = res.data.availableUsers ?? [];
        usersCache.current = users;
        return users;
      })
      .catch(() => {
        toast.error("Erro ao carregar usuários");
        return [];
      })
      .finally(() => {
        usersPromise.current = null;
      });

    return usersPromise.current;
  }, []);

  const createTask = async (data: Partial<Task>) => {
    try {
      const res = await api.post("api/tasks", data, { withCredentials: true });

      invalidateAllTasks();
      toast.success("Task criada com sucesso");

      return res.data;
    } catch {
      toast.error("Erro ao criar task");
    }
  };

  const updateTask = async (id: string, data: Partial<Task>) => {
    try {
      await api.put(`api/tasks/${id}`, data, { withCredentials: true });
      invalidateTask(id);
      toast.success("Task atualizada");
    } catch {
      toast.error("Erro ao atualizar task");
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await api.delete(`api/tasks/${id}`, { withCredentials: true });
      invalidateAllTasks();
      toast.success("Task removida");
      return true;
    } catch {
      toast.error("Erro ao remover task");
      return false;
    }
  };

  const addComment = async (taskId: string, content: string) => {
    try {
      await api.post(`api/tasks/${taskId}/comments`, { content }, { withCredentials: true });

      invalidateTask(taskId);
      toast.success("Comentário adicionado");
    } catch {
      toast.error("Erro ao adicionar comentário");
    }
  };

  const getComments = async (taskId: string, page = 1, size = 10) => {
    const res = await api.get(`api/tasks/${taskId}/comments?page=${page}&size=${size}`, {
      withCredentials: true,
    });
    return res.data;
  };

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
    addComment,
    getComments,
    getUsers,
    invalidateTask,
    invalidateAllTasks,
  };
}
