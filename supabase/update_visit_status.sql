-- Update visit to APPROVED status to test Check In button
UPDATE visits 
SET status = 'APPROVED'
WHERE visitor_id IN (
  SELECT id FROM visitors WHERE email = 'john.doe@example.com'
);

SELECT id, status, checkin_at, checkout_at FROM visits 
WHERE visitor_id IN (
  SELECT id FROM visitors WHERE email = 'john.doe@example.com'
);
