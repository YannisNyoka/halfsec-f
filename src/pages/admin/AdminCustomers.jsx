import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getAllCustomers, toggleCustomerStatus } from '../../api/customers';
import styles from './AdminCustomers.module.css';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [toggling, setToggling] = useState(null);

  const fetchCustomers = useCallback(async (s = search, p = page) => {
    setLoading(true);
    try {
      const { data } = await getAllCustomers({ search: s, page: p, limit: 20 });
      setCustomers(data.customers);
      setPagination(data.pagination);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCustomers('', 1); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCustomers(search, 1);
  };

  const handleToggle = async (id) => {
    setToggling(id);
    try {
      const { data } = await toggleCustomerStatus(id);
      setCustomers((prev) =>
        prev.map((c) =>
          c._id === id ? { ...c, isActive: data.isActive } : c
        )
      );
    } catch {}
    finally { setToggling(null); }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Customers</h1>
          <p className={styles.sub}>
            {pagination.total || 0} registered customer{pagination.total !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className={styles.searchForm}>
        <div className={styles.searchWrap}>
          <svg className={styles.searchIcon} width="16" height="16"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            className={styles.searchInput}
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary">Search</button>
        {search && (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => { setSearch(''); fetchCustomers('', 1); }}
          >
            Clear
          </button>
        )}
      </form>

      {/* Table */}
      {loading ? (
        <div className="page-loader">
          <div className="spinner" style={{ width: 32, height: 32, borderTopColor: 'var(--color-gold)' }} />
        </div>
      ) : customers.length === 0 ? (
        <div className={styles.empty}>No customers found.</div>
      ) : (
        <>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Joined</th>
                  <th>Orders</th>
                  <th>Total spent</th>
                  <th>Last order</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer._id}>
                    <td>
                      <div className={styles.customerCell}>
                        <div className={styles.avatar}>
                          {customer.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className={styles.customerName}>{customer.name}</div>
                          <div className={styles.customerEmail}>{customer.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className={styles.cell}>
                      {new Date(customer.createdAt).toLocaleDateString('en-ZA', {
                        day: 'numeric', month: 'short', year: '2-digit',
                      })}
                    </td>
                    <td className={styles.cell}>
                      {customer.stats?.totalOrders || 0}
                    </td>
                    <td className={styles.cell}>
                      <span className={styles.spent}>
                        R{(customer.stats?.totalSpent || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className={styles.cell}>
                      {customer.stats?.lastOrderDate
                        ? new Date(customer.stats.lastOrderDate).toLocaleDateString('en-ZA', {
                            day: 'numeric', month: 'short',
                          })
                        : '—'
                      }
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${
                        customer.isActive ? styles.statusActive : styles.statusInactive
                      }`}>
                        {customer.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <Link
                          to={`/admin/customers/${customer._id}`}
                          className="btn btn-ghost btn-sm"
                        >
                          View
                        </Link>
                        <button
                          className={`btn btn-sm ${customer.isActive ? 'btn-ghost' : 'btn-primary'}`}
                          onClick={() => handleToggle(customer._id)}
                          disabled={toggling === customer._id}
                        >
                          {toggling === customer._id
                            ? <span className="spinner" style={{ width: 12, height: 12 }} />
                            : customer.isActive ? 'Deactivate' : 'Activate'
                          }
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className={styles.pagination}>
              <button
                className="btn btn-ghost btn-sm"
                disabled={page <= 1}
                onClick={() => { setPage(p => p - 1); fetchCustomers(search, page - 1); }}
              >
                ← Prev
              </button>
              <span className={styles.pageInfo}>
                Page {page} of {pagination.pages}
              </span>
              <button
                className="btn btn-ghost btn-sm"
                disabled={page >= pagination.pages}
                onClick={() => { setPage(p => p + 1); fetchCustomers(search, page + 1); }}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminCustomers;