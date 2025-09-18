CREATE OR REPLACE FUNCTION update_request_status(
  p_request_id UUID,
  p_status TEXT,
  p_note TEXT DEFAULT NULL,
  p_attachments JSONB DEFAULT NULL,
  p_user_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_timestamp TIMESTAMP WITH TIME ZONE;
  v_request RECORD;
  v_result JSONB;
BEGIN
  -- Get current timestamp
  v_timestamp := NOW();

  -- Check if request exists and get current data
  SELECT * INTO v_request
  FROM requests
  WHERE id = p_request_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Request not found';
  END IF;

  -- Begin transaction
  BEGIN
    -- Update request status
    UPDATE requests
    SET
      status = p_status,
      updated_at = v_timestamp
    WHERE id = p_request_id;

    -- Insert status history record
    INSERT INTO request_status_history (
      request_id,
      status,
      note,
      attachments,
      created_at,
      created_by
    ) VALUES (
      p_request_id,
      p_status,
      p_note,
      p_attachments,
      v_timestamp,
      p_user_id
    );

    -- Return updated request with status history
    SELECT
      jsonb_build_object(
        'id', r.id,
        'status', r.status,
        'updated_at', r.updated_at,
        'status_history', COALESCE(
          jsonb_agg(
            jsonb_build_object(
              'id', h.id,
              'status', h.status,
              'note', h.note,
              'attachments', h.attachments,
              'created_at', h.created_at,
              'created_by', h.created_by
            ) ORDER BY h.created_at DESC
          ),
          '[]'::jsonb
        )
      ) INTO v_result
    FROM requests r
    LEFT JOIN request_status_history h ON h.request_id = r.id
    WHERE r.id = p_request_id
    GROUP BY r.id;

    RETURN v_result;
  END;
END;
$$;
