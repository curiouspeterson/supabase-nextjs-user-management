-- Update employee shift types distribution
WITH numbered_employees AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (ORDER BY id) - 1 as rn
  FROM employees
), 
shift_types AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (ORDER BY name) - 1 as type_index
  FROM shift_types
)
UPDATE employees e
SET default_shift_type_id = st.id
FROM numbered_employees ne
JOIN shift_types st ON (ne.rn % 4) = st.type_index
WHERE e.id = ne.id; 