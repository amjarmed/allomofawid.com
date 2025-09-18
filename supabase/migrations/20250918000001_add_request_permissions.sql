-- Enable Row Level Security
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_status_history ENABLE ROW LEVEL SECURITY;

-- Requests table policies
CREATE POLICY "Users can view their own requests"
  ON requests
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    auth.uid() = huissier_id
  );

CREATE POLICY "Users can create their own requests"
  ON requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Only assigned huissier or request owner can update status"
  ON requests
  FOR UPDATE
  USING (
    -- Check if user is the owner or assigned huissier
    (auth.uid() = user_id OR auth.uid() = huissier_id) AND
    -- Only allow updating specific fields
    (
      -- Get old record for comparison
      SELECT CASE
        -- Owner can only cancel their requests if not accepted/in progress
        WHEN auth.uid() = user_id THEN
          OLD.status NOT IN ('ACCEPTED', 'IN_PROGRESS') AND
          NEW.status = 'CANCELLED'
        -- Huissier can update status according to workflow
        WHEN auth.uid() = huissier_id THEN
          CASE OLD.status
            WHEN 'PENDING' THEN NEW.status IN ('ACCEPTED', 'REJECTED')
            WHEN 'ACCEPTED' THEN NEW.status IN ('IN_PROGRESS')
            WHEN 'IN_PROGRESS' THEN NEW.status IN ('COMPLETED')
            ELSE false
          END
        ELSE false
      END
    )
  );

-- Status History table policies
CREATE POLICY "Users can view status history of their requests"
  ON request_status_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM requests
      WHERE requests.id = request_status_history.request_id
      AND (requests.user_id = auth.uid() OR requests.huissier_id = auth.uid())
    )
  );

CREATE POLICY "Only authorized users can add status history"
  ON request_status_history
  FOR INSERT
  WITH CHECK (
    -- Verify request exists and user has permission
    EXISTS (
      SELECT 1 FROM requests
      WHERE requests.id = request_status_history.request_id
      AND (
        -- Owner can only add CANCELLED status
        (requests.user_id = auth.uid() AND request_status_history.status = 'CANCELLED') OR
        -- Huissier can add status updates according to workflow
        (requests.huissier_id = auth.uid() AND (
          (requests.status = 'PENDING' AND request_status_history.status IN ('ACCEPTED', 'REJECTED')) OR
          (requests.status = 'ACCEPTED' AND request_status_history.status = 'IN_PROGRESS') OR
          (requests.status = 'IN_PROGRESS' AND request_status_history.status = 'COMPLETED')
        ))
      )
    ) AND
    -- Ensure creator is the authenticated user
    auth.uid() = request_status_history.created_by
  );
