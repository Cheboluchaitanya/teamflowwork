import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { fetcher } from "../services/api";

const Ctx = createContext(undefined);

export function StoreProvider({ children }) {
  const [data, setData] = useState({
    users: [],
    teams: [],
    projects: [],
    tasks: [],
  });
  const [loading, setLoading] = useState(true);

  const refreshData = useCallback(async () => {
    try {
      const [users, teams, projects, tasks] = await Promise.all([
        fetcher('/users'),
        fetcher('/teams'),
        fetcher('/projects'),
        fetcher('/tasks'),
      ]);
      setData({ users, teams, projects, tasks });
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // ─── Users ────────────────────────────────────────────────
  const addUser = useCallback(async (userData) => {
    try {
      const newUser = await fetcher('/users', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      setData((d) => ({ ...d, users: [...d.users, newUser] }));
      return newUser;
    } catch (error) {
      console.error("Error adding user:", error);
      throw error;
    }
  }, []);

  const updateUser = useCallback(async (userId, updates) => {
    try {
      await fetcher(`/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
      setData((d) => ({
        ...d,
        users: d.users.map((u) => (u.id === userId ? { ...u, ...updates } : u)),
      }));
    } catch (error) {
      console.error("Error updating user:", error);
    }
  }, []);

  const deleteUser = useCallback(async (userId) => {
    try {
      await fetcher(`/users/${userId}`, { method: 'DELETE' });
      setData((d) => ({
        ...d,
        users: d.users.filter((u) => u.id !== userId),
      }));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  }, []);

  // ─── Teams ────────────────────────────────────────────────
  const addTeam = useCallback(async (teamName, leaderId, memberNames = []) => {
    try {
      const result = await fetcher('/teams', {
        method: 'POST',
        body: JSON.stringify({ teamName, leaderId, memberNames }),
      });
      // Refresh all since users were created/updated
      refreshData();
    } catch (error) {
      console.error("Error adding team:", error);
    }
  }, [refreshData]);

  const deleteTeam = useCallback(async (teamId) => {
    try {
      await fetcher(`/teams/${teamId}`, { method: 'DELETE' });
      refreshData();
    } catch (error) {
      console.error("Error deleting team:", error);
    }
  }, [refreshData]);

  // ─── Projects ─────────────────────────────────────────────
  const addProject = useCallback(async (p) => {
    try {
      const newProject = await fetcher('/projects', {
        method: 'POST',
        body: JSON.stringify(p),
      });
      setData((d) => ({ ...d, projects: [...d.projects, newProject] }));
    } catch (error) {
      console.error("Error adding project:", error);
    }
  }, []);

  const acceptProject = useCallback(async (projectId) => {
    try {
      await fetcher(`/projects/${projectId}/accept`, { method: 'POST' });
      setData((d) => ({
        ...d,
        projects: d.projects.map((p) =>
          p.id === projectId ? { ...p, status: "accepted", acceptedAt: Date.now() } : p
        ),
      }));
    } catch (error) {
      console.error("Error accepting project:", error);
    }
  }, []);

  const updateProjectProgress = useCallback(async (projectId, progress) => {
    try {
      await fetcher(`/projects/${projectId}/progress`, {
        method: 'PATCH',
        body: JSON.stringify({ progress }),
      });
      setData((d) => ({
        ...d,
        projects: d.projects.map((p) => {
          if (p.id !== projectId) return p;
          const newStatus = progress === 100 ? "completed" : "in-progress";
          return { ...p, progress, status: newStatus };
        }),
      }));
    } catch (error) {
      console.error("Error updating project progress:", error);
    }
  }, []);

  // ─── Tasks ────────────────────────────────────────────────
  const addTask = useCallback(async (projectId, task) => {
    try {
      const newTask = await fetcher('/tasks', {
        method: 'POST',
        body: JSON.stringify({ ...task, projectId }),
      });
      setData((d) => ({ ...d, tasks: [...d.tasks, newTask] }));
    } catch (error) {
      console.error("Error adding task:", error);
    }
  }, []);

  const submitTask = useCallback(async (taskId, submission) => {
    try {
      await fetcher(`/tasks/${taskId}/submit`, {
        method: 'POST',
        body: JSON.stringify({ submission }),
      });
      setData((d) => ({
        ...d,
        tasks: d.tasks.map((t) =>
          t.id === taskId ? { ...t, status: "completed", submission, submittedAt: Date.now() } : t
        ),
      }));
    } catch (error) {
      console.error("Error submitting task:", error);
    }
  }, []);

  const reviewTask = useCallback(async (taskId, approved) => {
    try {
      await fetcher(`/tasks/${taskId}/review`, {
        method: 'POST',
        body: JSON.stringify({ approved }),
      });
      setData((d) => ({
        ...d,
        tasks: d.tasks.map((t) =>
          t.id === taskId
            ? { ...t, approved, status: approved ? "completed" : "in-progress", reviewedAt: Date.now() }
            : t
        ),
      }));
    } catch (error) {
      console.error("Error reviewing task:", error);
    }
  }, []);

  const reset = useCallback(() => {
    // This would typically involve a backend reset or clearing a demo account
    console.warn("Reset not fully implemented for backend");
  }, []);

  return (
    <Ctx.Provider
      value={{
        ...data,
        loading,
        addUser, updateUser, deleteUser,
        addTeam, deleteTeam,
        addProject, acceptProject, updateProjectProgress,
        addTask, submitTask, reviewTask,
        reset,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}


export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
