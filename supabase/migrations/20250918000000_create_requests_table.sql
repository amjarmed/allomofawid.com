-- Create enum types for request status and priority
CREATE TYPE request_status AS ENUM (
  'PENDING',
  'ACCEPTED',
  'REJECTED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED'
);

CREATE TYPE request_priority AS ENUM (
  'URGENT',
  'HIGH',
  'NORMAL',
  'LOW'
);

CREATE TYPE request_type AS ENUM (
  'NOTIFICATION',
  'ENFORCEMENT',
  'INSPECTION',
  'CONSULTATION',
  'DOCUMENT_SERVICE',
  'OTHER'
);

-- Create requests table
CREATE TABLE requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  huissier_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  type request_type NOT NULL,
  priority request_priority NOT NULL DEFAULT 'NORMAL',
  status request_status NOT NULL DEFAULT 'PENDING',
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 5 AND 200),
  description TEXT NOT NULL CHECK (char_length(description) BETWEEN 10 AND 2000),
  location JSONB NOT NULL,
  attachments JSONB,
  preferred_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  status_history JSONB[] DEFAULT ARRAY[]::JSONB[],

  CONSTRAINT valid_location CHECK (
    jsonb_typeof(location) = 'object' AND
    (location->>'address') IS NOT NULL AND
    (location->>'city') IS NOT NULL
  )
);

-- Create status history table for better querying
CREATE TABLE request_status_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  status request_status NOT NULL,
  note TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create notifications table
CREATE TABLE request_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL CHECK (char_length(title) <= 200),
  message TEXT NOT NULL CHECK (char_length(message) <= 1000),
  metadata JSONB,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add indexes for better query performance
CREATE INDEX idx_requests_user_id ON requests(user_id);
CREATE INDEX idx_requests_huissier_id ON requests(huissier_id);
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_request_notifications_recipient ON request_notifications(recipient_id, read_at);
CREATE INDEX idx_request_status_history_request ON request_status_history(request_id);

-- Add RLS policies
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_notifications ENABLE ROW LEVEL SECURITY;

-- Requests policies
CREATE POLICY "Users can view their own requests"
  ON requests FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = huissier_id);

CREATE POLICY "Users can create their own requests"
  ON requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Only assigned users can update requests"
  ON requests FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() = huissier_id);

-- Status history policies
CREATE POLICY "Users can view status history of their requests"
  ON request_status_history FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM requests
    WHERE requests.id = request_status_history.request_id
    AND (requests.user_id = auth.uid() OR requests.huissier_id = auth.uid())
  ));

CREATE POLICY "Only assigned users can create status history"
  ON request_status_history FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM requests
    WHERE requests.id = request_status_history.request_id
    AND (requests.user_id = auth.uid() OR requests.huissier_id = auth.uid())
  ));

-- Notification policies
CREATE POLICY "Users can view their own notifications"
  ON request_notifications FOR SELECT
  USING (recipient_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON request_notifications FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM requests
      WHERE requests.id = request_notifications.request_id
      AND (requests.user_id = auth.uid() OR requests.huissier_id = auth.uid())
    )
  );

-- Create functions and triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER requests_updated_at
  BEFORE UPDATE ON requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Function to add status history
CREATE OR REPLACE FUNCTION add_status_history()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS NULL OR NEW.status != OLD.status THEN
    INSERT INTO request_status_history (
      request_id,
      status,
      created_by
    ) VALUES (
      NEW.id,
      NEW.status,
      auth.uid()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER request_status_changed
  AFTER UPDATE OF status ON requests
  FOR EACH ROW
  EXECUTE FUNCTION add_status_history();
