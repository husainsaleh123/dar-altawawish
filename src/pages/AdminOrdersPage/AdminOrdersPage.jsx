import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./AdminOrdersPage.module.scss";
import { getAdminOrders, updateAdminOrder } from "../../utilities/admin-api";
import {
  formatAdminDate,
  formatAdminPrice,
  getAdminUserDisplayName,
} from "../../utilities/admin-view";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadOrders() {
      try {
        setIsLoading(true);
        setError("");
        const data = await getAdminOrders();
        if (!isMounted) return;
        setOrders(Array.isArray(data) ? data : []);
      } catch (loadError) {
        if (!isMounted) return;
        setError(loadError.message || "Unable to load orders.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadOrders();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleStatusChange(orderId, status) {
    try {
      setSavingId(orderId);
      const updated = await updateAdminOrder(orderId, { status });
      setOrders((current) => current.map((order) => (order._id === orderId ? updated : order)));
    } catch (saveError) {
      setError(saveError.message || "Unable to update order.");
    } finally {
      setSavingId("");
    }
  }

  return (
    <main className={styles.AdminOrdersPage}>
      <section className={styles.header}>
        <div>
          <span className={styles.kicker}>Admin Orders</span>
          <h1>All orders</h1>
          <p>Review full order activity without squeezing everything into the dashboard.</p>
        </div>
        <Link to="/admin" className={styles.backButton}>
          Back to dashboard
        </Link>
      </section>

      {error ? <section className={styles.errorBanner}><p>{error}</p></section> : null}
      {isLoading ? <p className={styles.loadingState}>Loading orders...</p> : null}

      {!isLoading ? (
        <section className={styles.panel}>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Placed</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>{order.orderNumber}</td>
                    <td>{getAdminUserDisplayName(order.user || order)}</td>
                    <td>{formatAdminPrice(order.totalPrice)}</td>
                    <td>
                      <select
                        value={order.status}
                        disabled={savingId === order._id}
                        onChange={(event) => handleStatusChange(order._id, event.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="ready">Ready</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td>{formatAdminDate(order.createdAt)}</td>
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
