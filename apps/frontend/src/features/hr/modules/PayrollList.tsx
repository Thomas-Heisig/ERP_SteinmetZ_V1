// SPDX-License-Identifier: MIT
// apps/frontend/src/features/hr/modules/PayrollList.tsx

import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../../../utils/formatting';
import styles from './PayrollList.module.css';

interface PayrollRecord {
  id: string;
  employee_id: string;
  month: string;
  year: number;
  gross_salary: number;
  net_salary: number;
  bonuses: number;
  income_tax: number;
  pension_insurance: number;
  health_insurance: number;
  unemployment_insurance: number;
  church_tax: number;
  solidarity_surcharge: number;
  other_deductions: number;
  payment_status: 'pending' | 'processed' | 'failed' | 'reversed';
  payment_date?: string;
  created_at: string;
}

interface PayrollListProps {
  year?: number;
  month?: string;
}

export const PayrollList: React.FC<PayrollListProps> = ({ year = new Date().getFullYear(), month }) => {
  const [payroll, setPayroll] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchPayroll();
  }, [year, month, page, limit]);

  const fetchPayroll = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        year: year.toString(),
        page: page.toString(),
        limit: limit.toString(),
      });

      if (month) {
        params.append('month', month);
      }

      const response = await fetch(`/api/hr/payroll?${params}`);
      const data = await response.json();

      if (data.success) {
        setPayroll(data.data.data);
        setTotal(data.data.total);
      }
    } catch (error) {
      console.error('Failed to fetch payroll:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const params = new URLSearchParams({ year: year.toString() });
      if (month) params.append('month', month);

      const response = await fetch(`/api/hr/payroll/export/csv?${params}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `payroll-${year}-${month || 'all'}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to export CSV:', error);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Lohnabrechnung</h2>
        <button onClick={handleExportCSV} className={styles.exportBtn}>
          Als CSV exportieren
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading...</div>
      ) : (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Mitarbeiter-ID</th>
                  <th>Monat</th>
                  <th>Bruttoeinkommen</th>
                  <th>Steuern</th>
                  <th>Sozialversicherung</th>
                  <th>Nettoeinkommen</th>
                  <th>Status</th>
                  <th>Zahlungsdatum</th>
                </tr>
              </thead>
              <tbody>
                {payroll.map((record) => (
                  <tr key={record.id}>
                    <td>{record.employee_id.substring(0, 8)}</td>
                    <td>{record.month}/{record.year}</td>
                    <td className={styles.number}>{formatCurrency(record.gross_salary)}</td>
                    <td className={styles.number}>{formatCurrency((record.income_tax || 0) + (record.church_tax || 0) + (record.solidarity_surcharge || 0))}</td>
                    <td className={styles.number}>{formatCurrency((record.pension_insurance || 0) + (record.health_insurance || 0) + (record.unemployment_insurance || 0))}</td>
                    <td className={styles.number + ' ' + styles.bold}>{formatCurrency(record.net_salary)}</td>
                    <td>
                      <span className={`${styles.status} ${styles[record.payment_status]}`}>
                        {record.payment_status}
                      </span>
                    </td>
                    <td>{record.payment_date || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.pagination}>
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className={styles.paginationBtn}
            >
              Previous
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className={styles.paginationBtn}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default PayrollList;
