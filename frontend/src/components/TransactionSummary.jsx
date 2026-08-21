import React from 'react';
import { fmt2 } from '../utils/formatters';

const CATEGORY_LABELS = {
  entertainment: 'Entertainment',
  food_dining: 'Food & Dining',
  gas_transport: 'Gas Transport',
  grocery_net: 'Grocery Network',
  grocery_pos: 'Grocery POS',
  health_fitness: 'Health & Fitness',
  home: 'Home',
  kids_pets: 'Kids & Pets',
  misc_net: 'Misc. Online',
  misc_pos: 'Misc. POS',
  personal_care: 'Personal Care',
  shopping_net: 'Shopping Online',
  shopping_pos: 'Shopping POS',
  travel: 'Travel',
};

const SummaryItem = ({ label, value, icon }) => (
  <div className="summary-item">
    <span className="summary-icon" aria-hidden="true">{icon}</span>
    <div className="summary-content">
      <span className="summary-label">{label}</span>
      <span className="summary-value">{value}</span>
    </div>
  </div>
);

const TransactionSummary = ({ transaction }) => {
  if (!transaction) return null;

  const categoryLabel = CATEGORY_LABELS[transaction.category] || transaction.category;
  const genderLabel = transaction.gender === 'M' ? 'Male' : transaction.gender === 'F' ? 'Female' : transaction.gender;
  const historyLabel = transaction.has_customer_history === 1 || transaction.has_customer_history === '1' ? 'Yes' : 'No';

  const items = [
    { label: 'Amount', value: `₹${fmt2(transaction.amount)}`, icon: '₹' },
    { label: 'Category', value: categoryLabel, icon: '🏷' },
    { label: 'Transaction Hour', value: `${transaction.transaction_hour}:00`, icon: '🕐' },
    { label: 'Gender', value: genderLabel, icon: '👤' },
    { label: 'Age', value: transaction.age, icon: '📅' },
    { label: 'Distance', value: `${fmt2(transaction.distance_km)} km`, icon: '📍' },
    { label: 'Customer Transactions', value: `${transaction.customer_txn_count} transactions`, icon: '📊' },
    { label: 'Avg. Transaction', value: `₹${fmt2(transaction.customer_avg_amount)}`, icon: '📈' },
    { label: 'City Population', value: Number(transaction.city_pop).toLocaleString(), icon: '🏙' },
    { label: 'Amount Ratio', value: fmt2(transaction.amount_ratio), icon: '⚖' },
    { label: 'Time Since Last Txn', value: `${fmt2(transaction.time_since_last_txn)} min`, icon: '⏱' },
    { label: 'Customer History', value: historyLabel, icon: '📋' },
  ];

  return (
    <div className="card summary-card">
      <div className="card-header">
        <div className="card-header-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
        </div>
        <div>
          <h3 className="card-title">Analyzed Transaction</h3>
          <p className="card-subtitle">Submitted transaction details</p>
        </div>
      </div>

      <div className="summary-grid">
        {items.map(({ label, value, icon }) => (
          <SummaryItem key={label} label={label} value={value} icon={icon} />
        ))}
      </div>
    </div>
  );
};

export default TransactionSummary;
