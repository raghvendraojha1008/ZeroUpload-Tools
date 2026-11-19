export const SAMPLE_SQL = `-- customers.sql — excerpt from a typical dump
CREATE TABLE customers (
  id INT PRIMARY KEY,
  name VARCHAR(120),
  email VARCHAR(160),
  plan VARCHAR(20),
  mrr DECIMAL(10,2),
  active BOOLEAN,
  signed_up_at TIMESTAMP
);

INSERT INTO customers (id, name, email, plan, mrr, active, signed_up_at) VALUES
  (1, 'Ada Lovelace', 'ada@example.com', 'pro', 49.00, TRUE, '2024-02-11 09:14:00'),
  (2, 'Grace Hopper', 'grace@example.com', 'team', 149.50, TRUE, '2024-03-02 16:40:12'),
  (3, 'Linus T.', NULL, 'free', 0, FALSE, '2023-11-28 21:05:44');

INSERT INTO customers (id, name, email, plan, mrr, active, signed_up_at) VALUES
  (4, 'Margaret Hamilton', 'margaret@example.com', 'pro', 49.00, TRUE, '2024-05-19 11:22:31');
`
