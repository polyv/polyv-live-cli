# Malformed API Document

This document intentionally has no tables and should be handled gracefully by the parser without crashing.

The type generator should:
1. Log this file as a parsing failure
2. Continue processing other files
3. Include this in the parse report

It should NOT:
1. Throw an exception
2. Exit the process
3. Crash the build
