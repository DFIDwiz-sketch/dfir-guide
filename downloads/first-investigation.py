"""Summarize the accompanying synthetic training JSONL; standard library only."""
from collections import Counter
from datetime import datetime
from pathlib import Path
import json
import sys


def load_records(path):
    rows = []
    seen = set()
    for line_no, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        if not line.strip():
            continue
        try:
            row = json.loads(line)
            if not isinstance(row, dict) or row.get("synthetic") is not True:
                raise ValueError("expected a synthetic training record")
            for field in ("record_id", "timestamp", "event_type"):
                if not isinstance(row.get(field), str) or not row[field]:
                    raise ValueError("missing or invalid " + field)
            stamp = datetime.fromisoformat(row["timestamp"].replace("Z", "+00:00"))
            if stamp.utcoffset() is None:
                raise ValueError("timestamp must include timezone")
            if row["record_id"] in seen:
                raise ValueError("duplicate record_id")
            seen.add(row["record_id"])
            rows.append(row)
        except (ValueError, TypeError) as exc:
            raise ValueError(f"line {line_no}: {exc}") from exc
    return sorted(rows, key=lambda r: datetime.fromisoformat(r["timestamp"].replace("Z", "+00:00")))


def main():
    path = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).with_suffix(".jsonl")
    try:
        rows = load_records(path)
    except (OSError, UnicodeError, ValueError) as exc:
        print("Input error:", exc, file=sys.stderr)
        return 2
    print("Records:", len(rows))
    print("Types:", dict(sorted(Counter(r["event_type"] for r in rows).items())))
    print("Windows IDs:", dict(sorted(Counter(r["EventCode"] for r in rows if "EventCode" in r).items())))
    for row in rows:
        subject = row.get("ComputerName", row.get("src_ip", "-"))
        account = row.get("TargetUserName", row.get("SubjectUserName", "-"))
        print(row["timestamp"], row["record_id"], subject, row.get("EventCode", row["event_type"]), account)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
