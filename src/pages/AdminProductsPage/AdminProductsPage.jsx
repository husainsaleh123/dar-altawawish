import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./AdminProductsPage.module.scss";
import { getAdminProducts, updateAdminProduct } from "../../utilities/admin-api";
import { formatAdminPrice } from "../../utilities/admin-view";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState("");
  const [draftStock, setDraftStock] = useState({});

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      try {
        setIsLoading(true);
        setError("");
        const data = await getAdminProducts();
        if (!isMounted) return;
        setProducts(Array.isArray(data) ? data : []);
        setDraftStock(
          Object.fromEntries(
            (Array.isArray(data) ? data : []).map((product) => [
              product._id,
              String(Math.max(0, Number(product.countInStock) || 0)),
            ])
          )
        );
      } catch (loadError) {
        if (!isMounted) return;
        setError(loadError.message || "Unable to load products.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleStockChange(productId, nextValue) {
    const stockValue = Math.max(0, Number(nextValue) || 0);

    try {
      setSavingId(productId);
      const updated = await updateAdminProduct(productId, { countInStock: stockValue });
      setProducts((current) =>
        current.map((product) => (product._id === productId ? updated : product))
      );
      setDraftStock((current) => ({
        ...current,
        [productId]: String(stockValue),
      }));
    } catch (saveError) {
      setError(saveError.message || "Unable to update stock.");
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
    await handleStockChange(productId, draftStock[productId]);
  }

  return (
    <main className={styles.AdminProductsPage}>
      <section className={styles.header}>
        <div>
          <span className={styles.kicker}>Admin Products</span>
          <h1>All stock items</h1>
          <p>Review every product and adjust stock quantity with quick increment and decrement controls.</p>
        </div>
        <Link to="/admin" className={styles.backButton}>
          Back to dashboard
        </Link>
      </section>

      {error ? <section className={styles.errorBanner}><p>{error}</p></section> : null}
      {isLoading ? <p className={styles.loadingState}>Loading products...</p> : null}

      {!isLoading ? (
        <section className={styles.panel}>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const currentStock = Math.max(0, Number(product.countInStock) || 0);
                  return (
                    <tr key={product._id}>
                      <td>{product.name}</td>
                      <td>{product.category}</td>
                      <td>{formatAdminPrice(product.price)}</td>
                      <td>
                        <div className={styles.stockControl}>
                          <button
                            type="button"
                            disabled={savingId === product._id || currentStock <= 0}
                            onClick={() => handleStockChange(product._id, currentStock - 1)}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="0"
                            inputMode="numeric"
                            value={draftStock[product._id] ?? String(currentStock)}
                            disabled={savingId === product._id}
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
                            disabled={savingId === product._id}
                            onClick={() => handleStockChange(product._id, currentStock + 1)}
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`${styles.badge} ${
                            currentStock < 10 ? styles.badgeWarning : styles.badgeSuccess
                          }`.trim()}
                        >
                          {currentStock < 10 ? "Low stock" : "Healthy"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </main>
  );
}
