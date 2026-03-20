import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./AdminDashboardPage.module.scss";
import {
  getAdminNotifications,
  getAdminOrders,
  getAdminProducts,
  getAdminUsers,
  markAdminNotificationRead,
  updateAdminOrder,
  updateAdminProduct,
  updateAdminUser,
} from "../../utilities/admin-api";
import {
  formatAdminDate,
  formatAdminPrice,
  getAdminUserDisplayName,
} from "../../utilities/admin-view";

export default function AdminDashboardPage() {
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState("");
  const [draftStock, setDraftStock] = useState({});

  useEffect(() => {
    let isMounted = true;

    async function loadAdminData() {
      try {
        setIsLoading(true);
        setError("");
        const [notificationsData, usersData, productsData, ordersData] = await Promise.all([
          getAdminNotifications(),
          getAdminUsers(),
          getAdminProducts(),
          getAdminOrders(),
        ]);

        if (!isMounted) return;

        setNotifications(Array.isArray(notificationsData) ? notificationsData : []);
        setUsers(Array.isArray(usersData) ? usersData : []);
        setProducts(Array.isArray(productsData) ? productsData : []);
        setOrders(Array.isArray(ordersData) ? ordersData : []);
        setDraftStock(
          Object.fromEntries(
            (Array.isArray(productsData) ? productsData : []).map((product) => [
              product._id,
              String(Math.max(0, Number(product.countInStock) || 0)),
            ])
          )
        );
      } catch (loadError) {
        if (!isMounted) return;
        setError(loadError.message || "Unable to load admin dashboard.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadAdminData();

    return () => {
      isMounted = false;
    };
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications]
  );

  const userPreview = useMemo(() => users.slice(0, 5), [users]);
  const productPreview = useMemo(() => products.slice(0, 6), [products]);
  const orderPreview = useMemo(() => orders.slice(0, 5), [orders]);
  const lowStockProducts = useMemo(
    () => products.filter((product) => Number(product.countInStock) < 10),
    [products]
  );

  async function handleMarkNotificationRead(notificationId) {
    try {
      setSavingId(`notification-${notificationId}`);
      const updated = await markAdminNotificationRead(notificationId);
      setNotifications((current) =>
        current.map((notification) =>
          notification._id === notificationId ? updated : notification
        )
      );
    } catch (saveError) {
      setError(saveError.message || "Unable to update notification.");
    } finally {
      setSavingId("");
    }
  }

  async function handleUserRoleChange(userId, role) {
    try {
      setSavingId(`user-${userId}`);
      const updated = await updateAdminUser(userId, { role });
      setUsers((current) => current.map((user) => (user._id === userId ? updated : user)));
    } catch (saveError) {
      setError(saveError.message || "Unable to update user.");
    } finally {
      setSavingId("");
    }
  }

  async function handleProductStockChange(productId, value) {
    const stockValue = Math.max(0, Number(value) || 0);

    try {
      setSavingId(`product-${productId}`);
      const updated = await updateAdminProduct(productId, { countInStock: stockValue });
      setProducts((current) =>
        current.map((product) => (product._id === productId ? updated : product))
      );
      setDraftStock((current) => ({
        ...current,
        [productId]: String(stockValue),
      }));
    } catch (saveError) {
      setError(saveError.message || "Unable to update product stock.");
    } finally {
      setSavingId("");
    }
  }

  function handleDraftChange(productId, value) {
    if (!/^\d*$/.test(value)) return;
    setDraftStock((current) => ({
      ...current,
      [productId]: value,
    }));
  }

  async function handleDraftCommit(productId) {
    await handleProductStockChange(productId, draftStock[productId]);
  }

  async function handleAdjustProductStock(productId, currentStock, change) {
    await handleProductStockChange(productId, Math.max(0, currentStock + change));
  }

  async function handleOrderStatusChange(orderId, status) {
    try {
      setSavingId(`order-${orderId}`);
      const updated = await updateAdminOrder(orderId, { status });
      setOrders((current) => current.map((order) => (order._id === orderId ? updated : order)));
    } catch (saveError) {
      setError(saveError.message || "Unable to update order.");
    } finally {
      setSavingId("");
    }
  }

  return (
    <main className={styles.AdminDashboardPage}>
      <section className={styles.hero}>
        <div>
          <span className={styles.kicker}>Admin Dashboard</span>
          <h1>Oversee stock, orders, users, and new registrations</h1>
          <p>
            This first version gives you one place to monitor low stock, review customer
            activity, and react to newly registered users.
          </p>
        </div>

        <div className={styles.summaryGrid}>
          <article className={styles.summaryCard}>
            <span>Unread notifications</span>
            <strong>{unreadCount}</strong>
          </article>
          <article className={styles.summaryCard}>
            <span>Registered users</span>
            <strong>{users.length}</strong>
          </article>
          <article className={styles.summaryCard}>
            <span>Low-stock products</span>
            <strong>{lowStockProducts.length}</strong>
          </article>
          <article className={styles.summaryCard}>
            <span>Total orders</span>
            <strong>{orders.length}</strong>
          </article>
        </div>
      </section>

      {error ? (
        <section className={styles.errorBanner}>
          <p>{error}</p>
        </section>
      ) : null}

      {isLoading ? <p className={styles.loadingState}>Loading admin data...</p> : null}

      {!isLoading ? (
        <div className={styles.sections}>
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <span className={styles.sectionLabel}>Notifications</span>
                <h2>New registrations</h2>
              </div>
            </div>

            {!notifications.length ? (
              <p className={styles.emptyState}>No notifications yet.</p>
            ) : (
              <div className={styles.stack}>
                {notifications.map((notification) => (
                  <article
                    key={notification._id}
                    className={`${styles.notificationCard} ${
                      notification.isRead ? styles.notificationRead : ""
                    }`.trim()}
                  >
                    <div>
                      <strong>{notification.title}</strong>
                      <p>{notification.message}</p>
                      <span>{formatAdminDate(notification.createdAt)}</span>
                    </div>
                    <button
                      type="button"
                      className={styles.actionButton}
                      disabled={notification.isRead || savingId === `notification-${notification._id}`}
                      onClick={() => handleMarkNotificationRead(notification._id)}
                    >
                      {notification.isRead ? "Read" : "Mark as read"}
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <span className={styles.sectionLabel}>Users</span>
                <h2>Registered accounts</h2>
              </div>
              <Link to="/admin/users" className={styles.viewAllButton}>
                View all
              </Link>
            </div>

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
                  {userPreview.map((user) => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{[user.countryCode, user.phone].filter(Boolean).join(" ") || "N/A"}</td>
                      <td>
                        <select
                          value={user.role}
                          disabled={savingId === `user-${user._id}`}
                          onChange={(event) => handleUserRoleChange(user._id, event.target.value)}
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

          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <span className={styles.sectionLabel}>Products</span>
                <h2>Stock overview</h2>
              </div>
              <Link to="/admin/products" className={styles.viewAllButton}>
                View all
              </Link>
            </div>

            <div className={styles.productGrid}>
              {productPreview.map((product) => {
                const currentStock = Math.max(0, Number(product.countInStock) || 0);
                return (
                  <article key={product._id} className={styles.productCard}>
                    <div className={styles.productTopRow}>
                      <div>
                        <strong>{product.name}</strong>
                        <p>{product.category}</p>
                      </div>
                      <span
                        className={`${styles.badge} ${
                          currentStock < 10 ? styles.badgeWarning : styles.badgeSuccess
                        }`.trim()}
                      >
                        {currentStock < 10 ? "Low stock" : "Healthy"}
                      </span>
                    </div>

                    <div className={styles.productMeta}>
                      <span>{formatAdminPrice(product.price)}</span>
                      <strong>{currentStock} in stock</strong>
                    </div>

                    <div className={styles.stockControl}>
                      <button
                        type="button"
                        disabled={savingId === `product-${product._id}` || currentStock <= 0}
                        onClick={() => handleAdjustProductStock(product._id, currentStock, -1)}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="0"
                        inputMode="numeric"
                        value={draftStock[product._id] ?? String(currentStock)}
                        disabled={savingId === `product-${product._id}`}
                        onChange={(event) => handleDraftChange(product._id, event.target.value)}
                        onBlur={() => handleDraftCommit(product._id)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            handleDraftCommit(product._id);
                          }
                        }}
                      />
                      <button
                        type="button"
                        disabled={savingId === `product-${product._id}`}
                        onClick={() => handleAdjustProductStock(product._id, currentStock, 1)}
                      >
                        +
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <span className={styles.sectionLabel}>Orders</span>
                <h2>Recent order activity</h2>
              </div>
              <Link to="/admin/orders" className={styles.viewAllButton}>
                View all
              </Link>
            </div>

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
                  {orderPreview.map((order) => (
                    <tr key={order._id}>
                      <td>{order.orderNumber}</td>
                      <td>{getAdminUserDisplayName(order.user || order)}</td>
                      <td>{formatAdminPrice(order.totalPrice)}</td>
                      <td>
                        <select
                          value={order.status}
                          disabled={savingId === `order-${order._id}`}
                          onChange={(event) => handleOrderStatusChange(order._id, event.target.value)}
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
        </div>
      ) : null}
    </main>
  );
}
