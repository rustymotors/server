# Serialization Migration Map

## Overview

This document maps old serialization types to their `Bytable*` replacements.

## ⚠️ Critical: Byte Order (Endianness)

**IMPORTANT**: The codebase uses different byte orders for different protocols:

- **NPS Protocol (LegacyMessage, NPSMessage)**: **Big Endian (BE)**
  - Headers (`legacyHeader`, `NPSHeader`) use `readUInt16BE`/`writeUInt16BE`
  - `BytableHeader` uses BE by default
  - `BytableBuffer.getUint16()`/`getUint32()` default to BE (ignoring the `littleEndian` parameter)

- **Transaction Protocol**: **Little Endian (LE)**
  - Transaction messages use `readUInt16LE`/`writeUInt16LE` directly in their `serialize()`/`deserialize()` methods
  - These classes implement their own serialization using Buffer methods directly
  - They do NOT use `BytableBuffer.getUint16()` helper methods (which default to BE)

**When migrating:**
- ✅ Transaction messages: Continue using `readUInt16LE`/`writeUInt16LE` directly in `serialize()`/`deserialize()` methods
- ✅ NPS messages: Headers use BE; ensure header deserialization uses BE methods
- ⚠️ `BytableBuffer` helper methods (`getUint16`, `getUint32`) default to BE - do not use for transaction messages

## Type Mappings

### 1. SerializedBufferOld → BytableBuffer

**Simple buffer wrapper** - no header, just raw buffer

**Old**:
```typescript
import { SerializedBufferOld } from "rusty-motors-shared";

const msg = new SerializedBufferOld();
msg.deserialize(buffer);
const serialized = msg.serialize();
```

**New**:
```typescript
import { BytableBuffer } from "@rustymotors/binary";

const msg = new BytableBuffer();
msg.deserialize(buffer);
const serialized = msg.serialize();
```

**Properties**:
- `data` → `value` (getter)
- `setBuffer(buffer)` → `setValue(buffer)`
- `size()` → `serializeSize` (getter)
- `getByteSize()` → `serializeSize` (getter)
- `toHexString()` → `serialize().toString("hex")` (or keep method if needed)

### 2. LegacyMessage → BytableMessage + BytableHeader

**Has 4-byte header** (legacyHeader)

**Old**:
```typescript
import { LegacyMessage } from "rusty-motors-shared";

const msg = new LegacyMessage();
msg.setMessageId(123);
msg.setBuffer(data);
const serialized = msg.serialize();
```

**New**:
```typescript
import { BytableMessage, BytableHeader } from "@rustymotors/binary";

const msg = new BytableMessage();
msg.header.setValue(messageId); // or appropriate header field
msg.payload.setValue(data);
const serialized = msg.serialize();
```

**Note**: May need protocol-specific wrapper if header format is specific

### 3. NPSMessage → BytableMessage + BytableHeader

**Has 12-byte header** (NPSHeader)

**Old**:
```typescript
import { NPSMessage } from "rusty-motors-shared";

const msg = new NPSMessage();
msg._doDeserialize(buffer);
const serialized = msg.serialize();
```

**New**:
```typescript
import { BytableMessage, BytableHeader } from "@rustymotors/binary";

const msg = new BytableMessage();
msg.deserialize(buffer);
const serialized = msg.serialize();
```

**Note**: May need protocol-specific wrapper if header format is specific

### 4. BufferSerializer (protocol) → BytableBuffer

**Simple buffer wrapper** - same as SerializedBufferOld

**Old**:
```typescript
import { BufferSerializer } from "rusty-motors-protocol";

class MyPacket extends BufferSerializer {
    // ...
}
```

**New**:
```typescript
import { BytableBuffer } from "@rustymotors/binary";

class MyPacket extends BytableBuffer {
    // ...
}
```

## Common Conversion Patterns

### Pattern 1: Simple Buffer Wrapper

**Before**:
```typescript
const msg = new SerializedBufferOld();
msg.deserialize(buffer);
return msg.serialize();
```

**After**:
```typescript
const msg = new BytableBuffer();
msg.deserialize(buffer);
return msg.serialize();
```

### Pattern 2: Extending SerializedBufferOld

**Before**:
```typescript
export class MyMessage extends SerializedBufferOld {
    _field1: number;
    // ...
}
```

**After**:
```typescript
import { BytableBuffer } from "@rustymotors/binary";

export class MyMessage extends BytableBuffer {
    _field1: number;
    // ...
}
```

### Pattern 3: Converting Between Types

**Before**:
```typescript
const oldMsg = new SerializedBufferOld();
oldMsg.deserialize(buffer);
const newMsg = new BytableMessage();
newMsg.deserialize(oldMsg.serialize());
```

**After**:
```typescript
const msg = new BytableBuffer();
msg.deserialize(buffer);
// Use directly, no conversion needed
```

### Pattern 4: Message with Header

**Before**:
```typescript
const msg = new LegacyMessage();
msg.setMessageId(123);
msg.setBuffer(data);
```

**After**:
```typescript
const msg = new BytableMessage();
// Set header fields appropriately
msg.header.setValue(/* header data */);
msg.payload.setValue(data);
```

## Files to Migrate

### High Priority (Simple Replacements)

1. **SerializedBufferOld → BytableBuffer**:
   - `packages/transactions/src/GenericReplyMessage.ts`
   - `packages/transactions/src/OwnedVehiclesMessage.ts`
   - `packages/transactions/src/PlayerRacingHistoryMessage.ts`
   - `packages/transactions/src/PlayerPhysicalMessage.ts`
   - `packages/transactions/src/PartsAssemblyMessage.ts`
   - `packages/transactions/src/TLoginMessage.ts`
   - `packages/shared/src/TimeStamp.ts`
   - `packages/shared/src/MessageHeader.ts`
   - `src/chat/index.ts`

### Medium Priority (Header Messages)

2. **LegacyMessage → BytableMessage**:
   - `packages/lobby/src/handlers/handleGetMiniUserList.ts`
   - `packages/persona/src/receivePersonaData.ts`
   - `packages/login/src/NPSUserStatus.ts`
   - `packages/persona/src/handlers/getPersonaInfo.ts`

3. **NPSMessage → BytableMessage**:
   - `packages/persona/src/PersonaMapsMessage.ts`
   - `packages/persona/src/handlers/getPersonaInfo.ts`

### Low Priority (Complex/Deprecated)

4. **OldServerMessage** (already deprecated):
   - Keep as-is or migrate if still used

5. **MessageBufferOld**:
   - Migrate to BytableMessage

## Questions to Ask

When encountering unclear cases, ask:
1. Does this need a header? → Use `BytableMessage`
2. Is it just a buffer? → Use `BytableBuffer`
3. What's the header format? → May need protocol-specific wrapper
4. Is this deprecated? → May not need migration

## Migration Checklist

For each file:
- [ ] Replace imports
- [ ] Replace class extends
- [ ] Update property access (`data` → `value`, etc.)
- [ ] Update method calls (`setBuffer` → `setValue`, etc.)
- [ ] Update tests
- [ ] Verify serialization/deserialization still works
- [ ] Check for type conversions between old and new types
