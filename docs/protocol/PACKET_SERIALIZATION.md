# Packet Serialization Guide

This document describes the binary protocol serialization system used by MCOS. The architecture follows SOLID principles, separating serialization concerns from business logic.

## Architecture Overview

### Class Hierarchy

```
BytableBase (abstract)
    └── Bytable
        └── BytableMessage (main message class)
            └── BytableStructure (for nested structures)

BytableObject (interface)
    ├── BytableDword (4-byte integer)
    ├── BytableWord (2-byte integer)
    ├── BytableByte (1-byte integer)
    ├── BytableBuffer (raw binary data)
    ├── BytableContainer (length-prefixed data)
    ├── BytableShortContainer (2-byte length prefix)
    ├── BytableCString (null-terminated string)
    └── BytableData (raw data)
```

### Key Files

| File | Purpose |
|------|---------|
| `libs/@rustymotors/binary/src/lib/BytableMessage.ts` | Main message class |
| `libs/@rustymotors/binary/src/lib/BytableHeader.ts` | Header parsing |
| `libs/@rustymotors/binary/src/lib/types.ts` | BytableObject interface |

## Header Formats

MCOS uses two header versions based on protocol requirements.

### Version 0 (Raw/Legacy - 4 bytes)

Used for simple NPS protocol messages.

| Offset | Size | Field | Description |
|--------|------|-------|-------------|
| 0 | 2 | messageId | Message type identifier (big-endian) |
| 2 | 2 | messageLength | Total message length including header |

### Version 1 (Game Protocol - 12 bytes)

Used for game messages with additional validation.

| Offset | Size | Field | Description |
|--------|------|-------|-------------|
| 0 | 2 | messageId | Message type identifier (big-endian) |
| 2 | 2 | messageLength | Total message length including header |
| 4 | 2 | versionMarker | Always 0x0101 |
| 6 | 2 | reserved | Reserved for future use |
| 8 | 4 | checksum | Message checksum |

## Field Types Reference

The `BytableFieldTypes` registry defines available field types:

| Type Name | Class | Size | Description |
|-----------|-------|------|-------------|
| `Dword` | BytableDword | 4 bytes | Unsigned 32-bit integer (big-endian) |
| `Short` | BytableWord | 2 bytes | Unsigned 16-bit integer (big-endian) |
| `Boolean` | BytableByte | 1 byte | Boolean as single byte |
| `Buffer` | BytableBuffer | Variable | Raw binary buffer (consumes remaining data) |
| `String` | BytableContainer | 4 + length | Length-prefixed string (4-byte length) |
| `PrefixedString2` | BytableShortContainer | 2 + length | Length-prefixed string (2-byte length) |
| `CString` | BytableCString | Variable | Null-terminated string |
| `ZeroTerminatedString` | BytableContainer | Variable | Zero-terminated string |
| `Container` | BytableContainer | 4 + length | Generic length-prefixed container |
| `Raw` | BytableData | Variable | Raw data without length prefix |
| `Structure` | BytableStructure | Variable | Nested structure with its own field order |

## Using BytableMessage

### Creating a Message

```typescript
import { BytableMessage } from '@rustymotors/binary';

// Create a version 0 (raw) message
const message = new BytableMessage(0);

// Or create a version 1 (game) message
const gameMessage = new BytableMessage(1);
```

### Defining Field Structure with setSerializeOrder()

The `setSerializeOrder()` method defines the packet structure for serialization and deserialization:

```typescript
const message = new BytableMessage(0);

message.setSerializeOrder([
    { name: 'userId', field: 'Dword' },      // 4 bytes
    { name: 'userName', field: 'String' },   // 4-byte length + string
    { name: 'flags', field: 'Short' },       // 2 bytes
    { name: 'extra', field: 'Buffer' },      // Remaining bytes
]);
```

### Deserializing Incoming Data

```typescript
// Receive raw buffer from socket
const rawData: Buffer = /* ... */;

// Create message and define structure
const incomingMessage = new BytableMessage(0);
incomingMessage.setSerializeOrder([
    { name: 'commId', field: 'Dword' },
    { name: 'riffName', field: 'String' },
    { name: 'slotNumber', field: 'Dword' },
]);

// Deserialize - this parses header and fields
incomingMessage.deserialize(rawData);

// Access field values
const commId = incomingMessage.getFieldValueByName('commId') as Buffer;
const commIdValue = commId.readInt32BE();
```

### Building Response Messages

```typescript
// Create response message
const response = new BytableMessage(0);
response.setSerializeOrder([
    { name: 'commId', field: 'Dword' },
    { name: 'port', field: 'Dword' },
]);

// Set message ID in header
response.header.setId(0x214);

// Set field values
response.setFieldValueByName('commId', commIdValue);
response.setFieldValueByName('port', 7003);

// Serialize to buffer for sending
const responseBuffer = response.serialize();
```

### Factory Functions

Two factory functions simplify message creation:

```typescript
import { createRawMessage, createGameMessage } from '@rustymotors/binary';

// Create version 0 message (optionally deserialize buffer)
const rawMsg = createRawMessage(buffer);

// Create version 1 message (optionally deserialize buffer)
const gameMsg = createGameMessage(buffer);
```

### Converting from RawMessage

```typescript
import { BytableMessage, RawMessage } from '@rustymotors/binary';

const raw = new RawMessage();
raw.id = 0x20c;
raw.data = serializedBody;

const bytable = BytableMessage.FromRawMessage(raw);
```

## Serialization Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                    INCOMING MESSAGE                              │
├─────────────────────────────────────────────────────────────────┤
│  1. Receive raw Buffer from socket                              │
│  2. Create BytableMessage instance                              │
│  3. Define field structure with setSerializeOrder()             │
│  4. Call deserialize(buffer)                                    │
│     └── Header parsed first (4 or 12 bytes)                     │
│     └── Fields parsed in order defined                          │
│  5. Access fields via getFieldValueByName()                     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    HANDLER PROCESSING                            │
├─────────────────────────────────────────────────────────────────┤
│  1. Extract values from incoming message                        │
│  2. Perform business logic (database queries, etc.)             │
│  3. Prepare response data                                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    OUTGOING MESSAGE                              │
├─────────────────────────────────────────────────────────────────┤
│  1. Create new BytableMessage instance                          │
│  2. Define field structure with setSerializeOrder()             │
│  3. Set header message ID via header.setId()                    │
│  4. Set field values via setFieldValueByName()                  │
│  5. Call serialize() to get Buffer                              │
│  6. Send buffer to socket via MessageQueue                      │
└─────────────────────────────────────────────────────────────────┘
```

## Common Message IDs

| ID | Name | Direction | Description |
|----|------|-----------|-------------|
| 0x0100 | NPS_USER_LOGIN | Client→Server | User login request |
| 0x0106 | PT_OPEN_COMM_CHANNEL | Client→Server | Open communication channel |
| 0x0214 | NPS_CHANNEL_GRANTED | Server→Client | Channel grant response |
| 0x020c | USER_JOINED_CHANNEL | Server→Client | User joined notification |
| 0x0217 | NPS_TRACKING_PING | Client→Server | Keep-alive ping |
| 0x0230 | NPS_OK_TO_LOGIN | Server→Client | Login accepted |
| 0x1101 | ENCRYPTED_COMMAND | Both | Encrypted message wrapper |

## Packet Validation

Messages are validated before processing:

```typescript
// Valid message ID range: 0x100-0x1301
// Invalid range: 0x902-0x1000 (reserved)

function isPacketValid(data: Buffer): boolean {
    if (data.length < 4) return false;

    const msgCode = data.readUInt16BE();

    if (msgCode > 0x1301 || msgCode < 0x100) return false;
    if (msgCode >= 0x902 && msgCode <= 0x1000) return false;

    return true;
}
```

## Best Practices

1. **Always define field order before deserializing** - Call `setSerializeOrder()` before `deserialize()`

2. **Use appropriate field types** - Match field types to protocol specification:
   - Fixed integers: `Dword` (4 bytes), `Short` (2 bytes)
   - Strings: `String` (with length prefix) or `CString` (null-terminated)
   - Variable data at end: `Buffer` (consumes remaining)

3. **Handle Buffer values correctly** - Field values are returned as Buffers:
   ```typescript
   const value = message.getFieldValueByName('field') as Buffer;
   const intValue = value.readInt32BE(); // For Dword
   const strValue = value.toString();    // For String
   ```

4. **Set version appropriately**:
   - Version 0 for simple NPS messages
   - Version 1 for game protocol messages with checksums

5. **Use factory functions** when creating standard messages:
   ```typescript
   const msg = createRawMessage(buffer);  // Version 0
   const msg = createGameMessage(buffer); // Version 1
   ```

## See Also

- [Adding Handlers](../handlers/ADDING_HANDLERS.md) - How to create message handlers
- [CLAUDE.md](../../CLAUDE.md) - Project overview and commands
