import { useEffect, useState } from "react";
import api from "../services/api.js";
import Loader from "../components/common/Loader.jsx";
import ErrorState from "../components/common/ErrorState.jsx";
import EmptyState from "../components/common/EmptyState.jsx";

export default function AdminUsers() {
  const [state, setState] = useState({ loading: true, error: null, users: [] });
  const load = async () => {
    setState({ loading: true, error: null, users: [] });
    try {
      const { data } = await api.get("/users");
      setState({ loading: false, error: null, users: data.users });
    } catch (err) {
      setState({ loading: false, error: err.response?.data?.message || "Unable to load users.", users: [] });
    }
  };
  useEffect(() => { load(); }, []);

  if (state.loading) return <Loader text="Loading users..." />;
  if (state.error) return <ErrorState message={state.error} onRetry={load} />;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">All Users</h1>
      {state.users.length === 0 ? (<EmptyState message="No users found." />) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left border-b"><th className="py-2">Name</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead>
            <tbody>
              {state.users.map((u) => (
                <tr key={u._id} className="border-b">
                  <td className="py-2">{u.name}</td><td>{u.email}</td><td>{u.role}</td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
