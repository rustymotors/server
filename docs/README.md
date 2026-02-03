# MCOS Documentation

This directory contains all project documentation organized by topic.

## Quick Links

- [Server Setup](server.md) - How to configure and run the server
- [Client Setup](client.md) - How to connect the game client
- [Request Flow](flow.md) - How requests are processed through the system

## Documentation Structure

### [architecture/](architecture/)
Design decisions, architectural patterns, and system organization.

- [MASTER_DESIGN.md](architecture/MASTER_DESIGN.md) - Primary architecture document (source of truth)
- [VOLATILITY_LAYERS.md](architecture/VOLATILITY_LAYERS.md) - Layer architecture and dependency rules
- [PACKAGE_STRUCTURE.md](architecture/PACKAGE_STRUCTURE.md) - libs/ vs packages/ organization guide
- [ARCHITECTURE_EVALUATION.md](architecture/ARCHITECTURE_EVALUATION.md) - Architecture assessment
- [ARCHITECTURE_GROUP_ANALYSIS.md](architecture/ARCHITECTURE_GROUP_ANALYSIS.md) - Document relationships
- [PACKAGE_ORGANIZATION_ANALYSIS.md](architecture/PACKAGE_ORGANIZATION_ANALYSIS.md) - Package structure analysis
- [ALL_DOCS_REVIEW.md](architecture/ALL_DOCS_REVIEW.md) - Documentation meta-analysis
- [refactoring/](architecture/refactoring/) - Refactoring plans and migration guides

### [protocol/](protocol/)
Binary protocol specifications and serialization guides.

- [PACKET_SERIALIZATION.md](protocol/PACKET_SERIALIZATION.md) - Binary protocol and message formats
- [MCO_PROTOCOL_RFC.md](MCO_PROTOCOL_RFC.md) - Protocol RFC specification
- [RFC_SERVER_COMPARISON_NOTES.md](RFC_SERVER_COMPARISON_NOTES.md) - RFC comparison notes
- [PROTOCOL_BINARY_OVERLAP.md](protocol/PROTOCOL_BINARY_OVERLAP.md) - Serialization overlap analysis
- [SERIALIZATION_MIGRATION_MAP.md](protocol/SERIALIZATION_MIGRATION_MAP.md) - Migration guide
- [SHARED_PACKAGES_ANALYSIS.md](protocol/SHARED_PACKAGES_ANALYSIS.md) - Shared packages analysis
- [packets.md](protocol/packets.md) - Packet diagrams

### [handlers/](handlers/)
Guide for implementing protocol message handlers.

- [ADDING_HANDLERS.md](handlers/ADDING_HANDLERS.md) - Step-by-step handler implementation

### [testing/](testing/)
Testing strategies and session replay documentation.

- [CRITICAL_TEST_COVERAGE.md](testing/CRITICAL_TEST_COVERAGE.md) - Test coverage gaps and priorities
- [SESSION_FIXTURES.md](testing/SESSION_FIXTURES.md) - Session recording overview
- [TESTING_WITH_SESSIONS.md](testing/TESTING_WITH_SESSIONS.md) - Session replay testing guide

### [maintenance/](maintenance/)
Operational tasks and improvement tracking.

- [QUICK_WINS.md](maintenance/QUICK_WINS.md) - Quick fix checklist
- [LOGGING_ANALYSIS.md](maintenance/LOGGING_ANALYSIS.md) - Logging system improvements

### [reference/](reference/)
External references and data exports.

- [pkware/](reference/pkware/) - PKWare compression reference
- [export.psql](reference/export.psql) - Database export

### [technical/](technical/)
Technical notes and implementation details.

- [README.md](technical/README.md) - Technical overview
- [internal_notes.md](technical/internal_notes.md) - Internal implementation notes
- [external_notes.md](technical/external_notes.md) - External references

## Contributing to Documentation

When adding new documentation:

1. Choose the appropriate subdirectory based on topic
2. Use clear, descriptive filenames (UPPERCASE for major docs, lowercase for notes)
3. Update this index with a link to the new document
4. Cross-reference related documents where applicable
