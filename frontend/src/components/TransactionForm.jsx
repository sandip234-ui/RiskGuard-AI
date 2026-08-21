import React, { useState } from 'react';

const CATEGORIES = [
  'entertainment',
  'food_dining',
  'gas_transport',
  'grocery_net',
  'grocery_pos',
  'health_fitness',
  'home',
  'kids_pets',
  'misc_net',
  'misc_pos',
  'personal_care',
  'shopping_net',
  'shopping_pos',
  'travel',
];

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

const DAYS_OF_WEEK = [
  { value: 0, label: 'Monday' },
  { value: 1, label: 'Tuesday' },
  { value: 2, label: 'Wednesday' },
  { value: 3, label: 'Thursday' },
  { value: 4, label: 'Friday' },
  { value: 5, label: 'Saturday' },
  { value: 6, label: 'Sunday' },
];

const DEFAULT_FORM = {
  amount: '2.86',
  category: 'personal_care',
  transaction_hour: '12',
  day_of_week: 2,
  gender: 'M',
  age: '35',
  city_pop: '100000',
  customer_txn_count: '1561',
  customer_avg_amount: '70.302',
  amount_ratio: '0.041',
  time_since_last_txn: '1522.383',
  distance_km: '24.561',
  has_customer_history: 1,
};

const FormField = ({ label, hint, children, required = false }) => (
  <div className="form-field">
    <label className="form-label">
      {label}
      {required && <span className="form-required">*</span>}
    </label>
    {hint && <span className="form-hint">{hint}</span>}
    {children}
  </div>
);

const TransactionForm = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.amount || isNaN(Number(formData.amount)))
      errors.amount = 'Enter a valid amount';
    if (formData.transaction_hour === '' || isNaN(Number(formData.transaction_hour)) ||
      Number(formData.transaction_hour) < 0 || Number(formData.transaction_hour) > 23)
      errors.transaction_hour = 'Enter hour 0–23';
    if (!formData.age || isNaN(Number(formData.age)) || Number(formData.age) <= 0)
      errors.age = 'Enter a valid age';
    if (!formData.city_pop || isNaN(Number(formData.city_pop)) || Number(formData.city_pop) <= 0)
      errors.city_pop = 'Enter a valid population';
    if (!formData.customer_txn_count || isNaN(Number(formData.customer_txn_count)))
      errors.customer_txn_count = 'Enter transaction count';
    if (!formData.customer_avg_amount || isNaN(Number(formData.customer_avg_amount)))
      errors.customer_avg_amount = 'Enter average amount';
    if (formData.amount_ratio === '' || isNaN(Number(formData.amount_ratio)))
      errors.amount_ratio = 'Enter amount ratio';
    if (formData.time_since_last_txn === '' || isNaN(Number(formData.time_since_last_txn)))
      errors.time_since_last_txn = 'Enter time since last transaction';
    if (!formData.distance_km || isNaN(Number(formData.distance_km)))
      errors.distance_km = 'Enter distance';
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    const payload = {
      amount: Number(formData.amount),
      category: formData.category,
      transaction_hour: Number(formData.transaction_hour),
      day_of_week: Number(formData.day_of_week),
      gender: formData.gender,
      age: Number(formData.age),
      city_pop: Number(formData.city_pop),
      customer_txn_count: Number(formData.customer_txn_count),
      customer_avg_amount: Number(formData.customer_avg_amount),
      amount_ratio: Number(formData.amount_ratio),
      time_since_last_txn: Number(formData.time_since_last_txn),
      distance_km: Number(formData.distance_km),
      has_customer_history: Number(formData.has_customer_history),
    };

    onSubmit(payload);
  };

  const fieldErr = (name) =>
    validationErrors[name] ? (
      <span className="form-error">{validationErrors[name]}</span>
    ) : null;

  return (
    <div className="card form-card">
      <div className="card-header">
        <div className="card-header-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="5" width="20" height="14" rx="2"/>
            <line x1="2" y1="10" x2="22" y2="10"/>
          </svg>
        </div>
        <div>
          <h2 className="card-title">Transaction Risk Assessment</h2>
          <p className="card-subtitle">Enter transaction details to evaluate fraud risk</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          {/* Row 1 */}
          <FormField label="Amount" hint="Transaction value (₹)" required>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className={`form-input ${validationErrors.amount ? 'input-error' : ''}`}
              placeholder="e.g. 2.86"
              step="0.01"
              min="0"
              disabled={isLoading}
            />
            {fieldErr('amount')}
          </FormField>

          <FormField label="Category" required>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="form-select"
              disabled={isLoading}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Transaction Hour" hint="0 = midnight, 23 = 11 PM" required>
            <input
              type="number"
              name="transaction_hour"
              value={formData.transaction_hour}
              onChange={handleChange}
              className={`form-input ${validationErrors.transaction_hour ? 'input-error' : ''}`}
              placeholder="0–23"
              min="0"
              max="23"
              disabled={isLoading}
            />
            {fieldErr('transaction_hour')}
          </FormField>

          {/* Row 2 */}
          <FormField label="Day of Week" required>
            <select
              name="day_of_week"
              value={formData.day_of_week}
              onChange={handleChange}
              className="form-select"
              disabled={isLoading}
            >
              {DAYS_OF_WEEK.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Gender" required>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="form-select"
              disabled={isLoading}
            >
              <option value="M">Male (M)</option>
              <option value="F">Female (F)</option>
            </select>
          </FormField>

          <FormField label="Age" required>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className={`form-input ${validationErrors.age ? 'input-error' : ''}`}
              placeholder="e.g. 35"
              min="1"
              max="120"
              disabled={isLoading}
            />
            {fieldErr('age')}
          </FormField>

          {/* Row 3 */}
          <FormField label="City Population" required>
            <input
              type="number"
              name="city_pop"
              value={formData.city_pop}
              onChange={handleChange}
              className={`form-input ${validationErrors.city_pop ? 'input-error' : ''}`}
              placeholder="e.g. 100000"
              min="1"
              disabled={isLoading}
            />
            {fieldErr('city_pop')}
          </FormField>

          <FormField label="Customer Transaction Count" required>
            <input
              type="number"
              name="customer_txn_count"
              value={formData.customer_txn_count}
              onChange={handleChange}
              className={`form-input ${validationErrors.customer_txn_count ? 'input-error' : ''}`}
              placeholder="e.g. 1561"
              min="0"
              disabled={isLoading}
            />
            {fieldErr('customer_txn_count')}
          </FormField>

          <FormField label="Customer Avg. Amount (₹)" required>
            <input
              type="number"
              name="customer_avg_amount"
              value={formData.customer_avg_amount}
              onChange={handleChange}
              className={`form-input ${validationErrors.customer_avg_amount ? 'input-error' : ''}`}
              placeholder="e.g. 70.30"
              step="0.01"
              min="0"
              disabled={isLoading}
            />
            {fieldErr('customer_avg_amount')}
          </FormField>

          {/* Row 4 */}
          <FormField label="Amount Ratio" hint="Amount ÷ Customer Avg." required>
            <input
              type="number"
              name="amount_ratio"
              value={formData.amount_ratio}
              onChange={handleChange}
              className={`form-input ${validationErrors.amount_ratio ? 'input-error' : ''}`}
              placeholder="e.g. 0.041"
              step="0.001"
              min="0"
              disabled={isLoading}
            />
            {fieldErr('amount_ratio')}
          </FormField>

          <FormField label="Time Since Last Txn (min)" required>
            <input
              type="number"
              name="time_since_last_txn"
              value={formData.time_since_last_txn}
              onChange={handleChange}
              className={`form-input ${validationErrors.time_since_last_txn ? 'input-error' : ''}`}
              placeholder="e.g. 1522.38"
              step="0.01"
              min="0"
              disabled={isLoading}
            />
            {fieldErr('time_since_last_txn')}
          </FormField>

          <FormField label="Distance (km)" required>
            <input
              type="number"
              name="distance_km"
              value={formData.distance_km}
              onChange={handleChange}
              className={`form-input ${validationErrors.distance_km ? 'input-error' : ''}`}
              placeholder="e.g. 24.56"
              step="0.01"
              min="0"
              disabled={isLoading}
            />
            {fieldErr('distance_km')}
          </FormField>

          {/* Customer History */}
          <FormField label="Customer History" hint="Does the customer have prior history?">
            <div className="toggle-group">
              <button
                type="button"
                className={`toggle-btn ${Number(formData.has_customer_history) === 1 ? 'toggle-active' : 'toggle-inactive'}`}
                onClick={() => !isLoading && setFormData((p) => ({ ...p, has_customer_history: 1 }))}
                disabled={isLoading}
              >
                Yes
              </button>
              <button
                type="button"
                className={`toggle-btn ${Number(formData.has_customer_history) === 0 ? 'toggle-active' : 'toggle-inactive'}`}
                onClick={() => !isLoading && setFormData((p) => ({ ...p, has_customer_history: 0 }))}
                disabled={isLoading}
              >
                No
              </button>
            </div>
          </FormField>
        </div>

        {/* Submit */}
        <div className="form-submit">
          <button
            type="submit"
            className={`btn-analyze ${isLoading ? 'btn-loading' : ''}`}
            disabled={isLoading}
            id="analyze-btn"
          >
            {isLoading ? (
              <>
                <span className="btn-spinner" aria-hidden="true" />
                Analyzing Transaction…
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
                Analyze Transaction
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;
