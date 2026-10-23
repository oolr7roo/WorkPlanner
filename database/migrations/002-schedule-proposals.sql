CREATE TABLE IF NOT EXISTS workplanner.proposals (
  id text PRIMARY KEY,
  version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
  status text NOT NULL CHECK (status IN ('pending','applied','discarded')),
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
