#!/usr/bin/env bash
#
# Prisma schema drift guard.
#
# admin/ and frontend/ are separate git repositories that share one database,
# so the schema and migration history are physically duplicated and have to be
# kept identical by hand. Nothing enforces that today: a migration generated in
# one app and forgotten in the other leaves the second app's migration history
# out of step with the database, and `prisma migrate` then errors there.
#
# This script compares the two and can copy one over the other. It is a guard,
# not a fix — the real fix is a shared package, which is a bigger change than
# two apps of this size warrant.
#
#   ./scripts/schema-sync.sh check   # exit 1 on drift (default)
#   ./scripts/schema-sync.sh sync    # copy THIS repo's schema+migrations to the sibling
#
# The `output` line is excluded from the comparison: each app generates its
# client into its own node_modules, so that line MUST differ.

set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SIBLING_NAME="$([ "$(basename "$HERE")" = "frontend" ] && echo admin || echo frontend)"
SIBLING="$(dirname "$HERE")/$SIBLING_NAME"
MODE="${1:-check}"

if [ ! -d "$SIBLING/prisma" ]; then
	echo "schema-sync: sibling '$SIBLING_NAME' not checked out next to this repo — skipping."
	echo "             (clone both under the same parent directory to enable this check)"
	exit 0
fi

normalise() { sed -E 's|output[[:space:]]*=[[:space:]]*"[^"]*"|output = "<per-app>"|' "$1"; }

schema_drift=0
diff -u <(normalise "$HERE/prisma/schema.prisma") <(normalise "$SIBLING/prisma/schema.prisma") \
	> /tmp/schema-sync.diff 2>&1 || schema_drift=1

migr_drift=0
diff -u <(ls "$HERE/prisma/migrations") <(ls "$SIBLING/prisma/migrations") \
	> /tmp/migr-sync.diff 2>&1 || migr_drift=1

case "$MODE" in
check)
	if [ "$schema_drift" -eq 0 ] && [ "$migr_drift" -eq 0 ]; then
		echo "schema-sync: OK — schema and migrations match $SIBLING_NAME."
		exit 0
	fi
	echo "schema-sync: DRIFT DETECTED against $SIBLING_NAME"
	[ "$schema_drift" -ne 0 ] && { echo; echo "--- schema.prisma ---"; cat /tmp/schema-sync.diff; }
	[ "$migr_drift" -ne 0 ] && { echo; echo "--- migrations/ ---"; cat /tmp/migr-sync.diff; }
	echo
	echo "Both apps talk to the same database. Run './scripts/schema-sync.sh sync'"
	echo "from whichever repo holds the correct version."
	exit 1
	;;
sync)
	echo "schema-sync: copying $(basename "$HERE") -> $SIBLING_NAME"
	# Preserve the sibling's own client output path.
	sibling_output="$(grep -E '^[[:space:]]*output' "$SIBLING/prisma/schema.prisma" || true)"
	cp "$HERE/prisma/schema.prisma" "$SIBLING/prisma/schema.prisma"
	if [ -n "$sibling_output" ]; then
		tmp="$(mktemp)"
		sed -E "s|^[[:space:]]*output.*|$sibling_output|" "$SIBLING/prisma/schema.prisma" > "$tmp"
		mv "$tmp" "$SIBLING/prisma/schema.prisma"
	fi
	rsync -a --delete "$HERE/prisma/migrations/" "$SIBLING/prisma/migrations/"
	echo "schema-sync: done. Run 'bunx prisma generate' in $SIBLING_NAME."
	;;
*)
	echo "usage: $0 [check|sync]" >&2
	exit 2
	;;
esac
