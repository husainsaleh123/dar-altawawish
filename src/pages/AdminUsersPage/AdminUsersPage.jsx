import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./AdminUsersPage.module.scss";
import { getAdminUsers, updateAdminUser } from "../../utilities/admin-api";
import { formatAdminDate } from "../../utilities/admin-view";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadUsers() {
      try {
        setIsLoading(true);
        setError("");
        const data = await getAdminUsers();
        if (!isMounted) return;
        setUsers(Array.isArray(data) ? data : []);
      } catch (loadError) {
        if (!isMounted) return;
        setError(loadError.message || "Unable to load users.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleRoleChange(userId, role) {
    try {
      setSavingId(userId);
      const updated = await updateAdminUser(userId, { role });
      setUsers((current) => current.map((user) => (user._id === userId ? updated : user)));
    } catch (saveError) {
      setError(saveError.message || "Unable to update user.");
    } finally {
      setSavingId("");
    }
  }

  return (
    <main className={styles.AdminUsersPage}>
      <section className={styles.header}>
        <div>
          <span className={styles.kicker}>Admin Users</span>
          <h1>All registered users</h1>
          <p>See every account in one place and manage who has admin access.</p>
        </div>
        <Link to="/admin" className={styles.backButton}>
          Back to dashboard
        </Link>
      </section>

      {error ? <section className={styles.errorBanner}><p>{error}</p></section> : null}
      {isLoading ? <p className={styles.loadingState}>Loading users...</p> : null}

      {!isLoading ? (
        <section className={styles.panel}>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{[user.countryCode, user.phone].filter(Boolean).join(" ") || "N/A"}</td>
                    <td>
                      <select
                        value={user.role}
                        disabled={savingId === user._id}
                        onChange={(event) => handleRoleChange(user._id, event.target.value)}
                      >
                        <option value="customer">Customer</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>{formatAdminDate(user.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </main>
  );
}
