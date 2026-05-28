# `defineStruct` — Declarative Binary Struct DSL (Proposal)

**Status:** Proposal / Proof of Concept
**Audience:** Anyone touching `libs/@rustymotors/binary` or writing new wire structs
**Companion docs:** [PACKET_SERIALIZATION.md](./PACKET_SERIALIZATION.md), [SERIALIZATION_MIGRATION_MAP.md](./SERIALIZATION_MIGRATION_MAP.md), [../../MCO_PROTOCOL_RFC.md](../MCO_PROTOCOL_RFC.md) *(if mirrored into the repo)*

This document proposes a declarative TypeScript DSL for defining wire-format
structures, intended to live alongside (and eventually replace) the existing
hand-written `Bytable*` subclasses.

It is a *proposal*, not committed work. The goal is to capture the design with
enough concrete detail that a proof-of-concept can be evaluated against one
real struct (`NpsRiffInfo` is a good first candidate) and the team can decide
whether to adopt the pattern more broadly.

---

## 1. Motivation

### 1.1 The pain, by example

`libs/@rustymotors/binary/src/lib/BytableChannelData.ts` is **256 lines of
TypeScript to encode a 256-byte struct**. Roughly:

| Lines | Role |
|------:|------|
| ~28 | Declare each wire field as a wrapped class member (`_raceID`, `_raceName`, …) |
| ~32 | Re-declare the same fields in `_fields[]` for the serialize/deserialize loop |
| ~80 | Hand-written getter/setter pairs, including manual bit masks |
| ~30 | Two static helpers (`_si32`, `_ui32`) that exist only because TS lacks typed scalars |
| ~26 | Class scaffolding, JSON output, name handling |
| ~60 | (the rest is layout comments and constructor wiring) |

The structural issues this creates:

1. **Duplicated source of truth.** Field declarations exist once in the
   class properties and again in the `_fields[]` accessor. If they drift
   (rename, reorder, add, remove), the type system catches *some* of it but
   not all — and wire-layout bugs are silent.

2. **Hand-computed bit masks.**
   ```ts
   set damageMode(val: number) {
       this._byte82.setValue((this._byte82.value & 0xcf) | ((val & 0x03) << 4));
   }
   ```
   `0xcf` is the correct clear-mask for bits 4–5, but nothing in the type
   system enforces that. A `0xc7` typo would compile, type-check, and silently
   corrupt one field forever. The same risk exists in every bitfield setter
   in the codebase.

3. **No round-trip guarantees.** The encode and decode paths are written
   separately for each field; if a getter reads bits 4–5 but the corresponding
   setter writes bits 3–4, both halves compile and the bug only surfaces under
   integration testing.

4. **Boilerplate tax discourages new structs.** Adding a new wire struct is a
   chore, which discourages tightening up loose types in existing handlers.

5. **TypeScript's type system isn't doing any work.** Field types are
   `number`/`boolean`/`string`/etc. — completely disconnected from the wire
   layout. The IDE can't suggest field names while you're filling in a
   struct, and a renamed field doesn't ripple to call sites without a manual
   grep.

### 1.2 What we want instead

- **One source of truth per struct** — the field list is the spec.
- **Computed bit masks** — no possibility of mask typos drifting from declared bit positions.
- **Type-safe accessors derived from the spec** — `cd.flags.nightDriving` should be typed `boolean` without anyone typing the word `boolean`.
- **Trivial round-trip tests** — `encode(decode(bytes))` should be the standard regression test, applied uniformly to every struct.
- **Same language, same debugger, no new build step.** TS in, TS out, runtime construction; no codegen phase, no YAML.
- **An incremental adoption path** — must coexist with the existing `Bytable*` framework. Migration happens struct-by-struct.

---

## 2. Proposed DSL

### 2.1 Defining a struct

```ts
import {
    defineStruct,
    i32, u32, u8,
    boolI32,        // C BOOL stored as 4-byte int
    cstring,
    array,
    bitfield, bits, bool,
    pad,
} from "@rustymotors/binary/struct";

export const ChannelData = defineStruct("ChannelData", {
    size: 256,
    endian: "le",
    fields: [
        i32("raceID"),
        cstring("raceName", { len: 64 }),
        i32("entryFee"),
        i32("purseBonusPerPlayer"),
        i32("purseBonusPerRace"),

        bitfield("racerCounts", { backing: "u8" }, [
            bits("maxNPSracers", 4),
            bits("minNPSracers", 4),
        ]),
        bitfield("roundLaps", { backing: "u8" }, [
            bits("numRounds", 4),
            bits("numLaps", 4),
        ]),
        bitfield("flags", { backing: "u8" }, [
            bool("backwardRace"),
            bool("mirrored"),
            bool("nightDriving"),
            bool("weatherDriving"),
            bits("damageMode", 2),
            bool("traffic"),
            bool("handicapped"),
        ]),
        pad(1),

        i32("mode"),
        u32("sponsorBPT"),

        u8("minlevel"),
        u8("maxlevel"),
        u8("requiredBodyClass"),
        u8("maxPowerClass"),

        boolI32("bDisallowNOS"),

        bitfield("statusFlags", { backing: "u8" }, [
            bool("raceInProgress"),
            bits("connectedPlayers", 4),
        ]),
        pad(3),

        u32("hostID"),
        cstring("hostName", { len: 30 }),
        pad(2),

        array("userIDs",  u32(), { len: 6 }),
        array("dbCarIDs", i32(), { len: 6 }),
        array("dbBptIDs", i32(), { len: 6 }),

        u32("majorVersionNum"),
        u32("minorVersionNum"),
        u32("revisionVersionNum"),

        pad(32),
    ],
});
```

That's ~50 lines for a struct that currently takes 256, and the spec lines up
directly with the RFC table for `RoomChannelData` (section 4.6.4).

### 2.2 The resulting API

```ts
// Inferred type — no hand-written interface needed:
//
//   type ChannelDataT = {
//       raceID: number;
//       raceName: string;
//       entryFee: number;
//       purseBonusPerPlayer: number;
//       purseBonusPerRace: number;
//       racerCounts: { maxNPSracers: number; minNPSracers: number };
//       roundLaps:   { numRounds: number; numLaps: number };
//       flags: {
//           backwardRace: boolean;
//           mirrored: boolean;
//           nightDriving: boolean;
//           weatherDriving: boolean;
//           damageMode: number;
//           traffic: boolean;
//           handicapped: boolean;
//       };
//       mode: number;
//       sponsorBPT: number;
//       minlevel: number; maxlevel: number;
//       requiredBodyClass: number; maxPowerClass: number;
//       bDisallowNOS: boolean;
//       statusFlags: { raceInProgress: boolean; connectedPlayers: number };
//       hostID: number;
//       hostName: string;
//       userIDs:  readonly [number, number, number, number, number, number];
//       dbCarIDs: readonly [number, number, number, number, number, number];
//       dbBptIDs: readonly [number, number, number, number, number, number];
//       majorVersionNum: number;
//       minorVersionNum: number;
//       revisionVersionNum: number;
//   };
//
type ChannelDataT = ReturnType<typeof ChannelData.decode>;

// Usage:
const cd = ChannelData.decode(buffer);   // typed plain object
cd.flags.nightDriving = true;            // type-checked field access
cd.userIDs[2] = 0xdeadbeef;

const bytes: Buffer = ChannelData.encode(cd);

// Reflection (for debugging, logging, generated docs):
ChannelData.byteSize;       // 256
ChannelData.layout;         // [{ name, offset, size, kind }, ...]
ChannelData.fieldOffset("hostName"); // 108
```

### 2.3 Validation performed at `defineStruct` time

When `defineStruct` is called (i.e., at module load), the following invariants
are checked, with descriptive throws when they fail:

- Field offsets sum to exactly `size` (or `size` is omitted and computed).
- No two fields claim the same offset range.
- Within a bitfield, the bits sum to ≤ the backing type's width.
- Bit positions inside a bitfield don't overlap.
- Field names are unique within a struct (and within a bitfield).

These all fail loudly at module load — not at first parse of a real packet —
which means a malformed struct definition is caught the moment you `npm start`,
not the moment a customer connects.

### 2.4 Bit masks are computed

Given a `bitfield` declaration:

```ts
bitfield("flags", { backing: "u8" }, [
    bool("backwardRace"),     //  bit 0    mask 0x01
    bool("mirrored"),         //  bit 1    mask 0x02
    bool("nightDriving"),     //  bit 2    mask 0x04
    bool("weatherDriving"),   //  bit 3    mask 0x08
    bits("damageMode", 2),    //  bits 4-5 mask 0x30
    bool("traffic"),          //  bit 6    mask 0x40
    bool("handicapped"),      //  bit 7    mask 0x80
])
```

The DSL computes each field's shift and mask from its declared position and
width. There is no place in the codebase for a human to write `0xcf` or
`0xc7`, so there is no place for that bug to hide.

---

## 3. Sketch implementation

Just enough to show the shape; the production version would polish
ergonomics, add Float/Double, support nested structs, and (probably) memoize
encoders for hot paths.

```ts
// libs/@rustymotors/binary/src/struct/types.ts

export interface FieldCodec<T> {
    readonly kind: string;
    readonly size: number;            // bytes (0 for bit-level; computed by bitfield)
    read(buf: Buffer, off: number): T;
    write(buf: Buffer, off: number, value: T): void;
}

export interface NamedField<Name extends string, T> {
    readonly name: Name;
    readonly codec: FieldCodec<T>;
}

export type FieldRecord<F extends readonly NamedField<string, unknown>[]> = {
    -readonly [K in F[number] as K["name"]]:
        K extends NamedField<infer _N, infer V> ? V : never;
};
```

```ts
// libs/@rustymotors/binary/src/struct/scalars.ts

import { FieldCodec, NamedField } from "./types.js";

const codec = (size: number,
               read: (b: Buffer, o: number) => number,
               write: (b: Buffer, o: number, v: number) => void): FieldCodec<number> =>
    ({ kind: `scalar_${size}`, size, read, write });

const i32_le: FieldCodec<number> = codec(4,
    (b, o) => b.readInt32LE(o),
    (b, o, v) => { b.writeInt32LE(v, o); });
const u32_le: FieldCodec<number> = codec(4,
    (b, o) => b.readUInt32LE(o),
    (b, o, v) => { b.writeUInt32LE(v, o); });
const u8_:    FieldCodec<number> = codec(1,
    (b, o) => b.readUInt8(o),
    (b, o, v) => { b.writeUInt8(v, o); });

export const i32 = <N extends string>(name: N): NamedField<N, number> =>
    ({ name, codec: i32_le });
export const u32 = <N extends string>(name: N): NamedField<N, number> =>
    ({ name, codec: u32_le });
export const u8 =  <N extends string>(name: N): NamedField<N, number> =>
    ({ name, codec: u8_ });

export const boolI32 = <N extends string>(name: N): NamedField<N, boolean> => ({
    name,
    codec: {
        kind: "boolI32",
        size: 4,
        read: (b, o) => b.readInt32LE(o) !== 0,
        write: (b, o, v) => { b.writeInt32LE(v ? 1 : 0, o); },
    },
});

export const cstring = <N extends string>(name: N, { len }: { len: number }):
    NamedField<N, string> => ({
        name,
        codec: {
            kind: "cstring",
            size: len,
            read: (b, o) => {
                const slice = b.subarray(o, o + len);
                const end = slice.indexOf(0);
                return slice.subarray(0, end < 0 ? len : end).toString("ascii");
            },
            write: (b, o, v) => {
                b.fill(0, o, o + len);
                b.write(v, o, len, "ascii");
            },
        },
    });

export const pad = (n: number): NamedField<"__pad", undefined> => ({
    name: "__pad" as const,
    codec: {
        kind: "pad",
        size: n,
        read: () => undefined,
        write: () => { /* zero-fill handled by caller */ },
    },
});
```

```ts
// libs/@rustymotors/binary/src/struct/define.ts

import { FieldRecord, NamedField } from "./types.js";

interface DefineOpts<F extends readonly NamedField<string, unknown>[]> {
    readonly size?: number;
    readonly endian?: "le" | "be";
    readonly fields: F;
}

export interface Struct<T> {
    readonly name: string;
    readonly byteSize: number;
    readonly layout: ReadonlyArray<{ name: string; offset: number; size: number; kind: string }>;
    decode(buf: Buffer, offset?: number): T;
    encode(value: T, into?: Buffer, offset?: number): Buffer;
    fieldOffset(name: string): number;
}

export function defineStruct<
    N extends string,
    F extends readonly NamedField<string, unknown>[],
>(name: N, opts: DefineOpts<F>): Struct<FieldRecord<F>> {

    let offset = 0;
    const layout = opts.fields.map((f) => {
        const entry = { name: f.name, offset, size: f.codec.size, kind: f.codec.kind };
        offset += f.codec.size;
        return entry;
    });
    const totalSize = offset;

    if (opts.size !== undefined && opts.size !== totalSize) {
        throw new Error(
            `defineStruct(${name}): declared size=${opts.size} but fields sum to ${totalSize}`
        );
    }

    const decode = (buf: Buffer, base = 0): FieldRecord<F> => {
        const out: Record<string, unknown> = {};
        for (const f of opts.fields) {
            const entry = layout.find((l) => l.name === f.name)!;
            const val = f.codec.read(buf, base + entry.offset);
            if (!f.name.startsWith("__")) out[f.name] = val;
        }
        return out as FieldRecord<F>;
    };

    const encode = (value: FieldRecord<F>, into?: Buffer, base = 0): Buffer => {
        const buf = into ?? Buffer.alloc(totalSize);
        for (const f of opts.fields) {
            if (f.name.startsWith("__")) continue;
            const entry = layout.find((l) => l.name === f.name)!;
            const v = (value as Record<string, unknown>)[f.name];
            (f.codec as { write: (b: Buffer, o: number, v: unknown) => void })
                .write(buf, base + entry.offset, v);
        }
        return buf;
    };

    return {
        name,
        byteSize: totalSize,
        layout,
        decode,
        encode,
        fieldOffset: (n) => {
            const e = layout.find((l) => l.name === n);
            if (!e) throw new Error(`${name}: unknown field ${n}`);
            return e.offset;
        },
    };
}
```

Bitfields are intentionally elided in the sketch above (they require a small
amount of plumbing to read/write the backing byte and synthesize a
sub-object). The shape is: `bitfield()` returns a `NamedField` whose codec
allocates one slot of the backing width, reads it into a record at decode
time, and ORs the slots back together at encode time. Masks are derived from
the cumulative bit position of each `bits()` / `bool()` entry.

---

## 4. Test pattern

Every struct gets one trivially-generated test:

```ts
import { describe, it, expect } from "vitest";
import { ChannelData } from "../src/messages/ChannelData.js";

describe("ChannelData", () => {
    it("round-trips a typical payload", () => {
        const decoded = {
            raceID: 42,
            raceName: "Drag Strip",
            // ...all other fields...
        };
        expect(ChannelData.decode(ChannelData.encode(decoded))).toEqual(decoded);
    });

    it("layout matches RFC section 4.6.4", () => {
        expect(ChannelData.byteSize).toBe(256);
        expect(ChannelData.fieldOffset("raceName")).toBe(4);
        expect(ChannelData.fieldOffset("entryFee")).toBe(68);
        expect(ChannelData.fieldOffset("hostID")).toBe(104);
        expect(ChannelData.fieldOffset("majorVersionNum")).toBe(212);
    });

    it("rejects malformed buffers at decode time", () => {
        expect(() => ChannelData.decode(Buffer.alloc(100))).toThrow();
    });
});
```

The `layout matches RFC` assertions are mechanical and could be
auto-generated from the RFC tables; that's a future extension.

---

## 5. Migration plan

The proposal is deliberately *additive*. Nothing in
`libs/@rustymotors/binary/src/lib/` needs to change for this to land.

**Phase 0 — Land the DSL.**
- New code in `libs/@rustymotors/binary/src/struct/`.
- Export from `@rustymotors/binary` alongside the existing `Bytable*` exports.
- No behavioral change to existing code paths.

**Phase 1 — Port one struct as a vertical slice.**
- `NpsRiffInfo` is a good candidate (157 lines, no bitfields → easy first cut).
- Add round-trip and offset tests as described in §4.
- Wire the new struct into one handler that currently uses the old class.
- Keep the old class in place; this is a real-traffic A/B.

**Phase 2 — Port `BytableChannelData` (the bitfield case).**
- Proves the bitfield codepath under real conditions.
- Lets us measure file-size delta (predicted: ~256 → ~50 lines).

**Phase 3 — Adoption.**
- New structs use `defineStruct` by default.
- Existing structs migrate opportunistically: every PR that touches a
  `Bytable*` struct ports it across.

**Phase 4 — Removal (optional, ~6 months later).**
- If `defineStruct` has won by usage, delete the now-orphan `Bytable*`
  subclasses. The base classes (`BytableMessage`, headers) may still be
  useful for framing; that's a separate decision.

---

## 6. Open questions

- **Nested structs.** `ChannelData` is referenced inside other messages; the
  DSL needs a `struct()` field type that embeds one `Struct<T>` inside
  another, sharing offset bookkeeping. Probably a one-evening extension.
- **Variable-length fields.** NPS Pascal-strings (length-prefixed) and
  variable-count arrays need a `lenField` pointer (e.g.,
  `array("parts", Part, { lenField: "noParts" })`). The encoder has to
  resolve forward references; the decoder is straightforward.
- **Endianness mixing.** NPS is BE, MCOTS is LE, and the framing header is
  itself LE around an inner BE NPS payload. The DSL handles this if each
  field carries its endianness, or if structs can opt-in to BE/LE and nested
  structs override.
- **Header types.** `BytableHeader` and `BytableServerHeader` have
  protocol-specific quirks (the v0 vs v257 split). They're probably worth
  porting later, not first.
- **Hot-path performance.** The reflective decode loop allocates an object
  per call. For high-frequency packets (race position updates) we may want
  the DSL to *compile* the spec to a hand-written function at definition
  time (`new Function("buf", "off", "return { ... }")`). Easy follow-up if
  profiling justifies it.
- **Tooling for RFC sync.** The RFC has structured layout tables for every
  struct; the long-term play is a small script that diffs RFC offsets against
  `Struct.layout` and warns when they drift. Out of scope here.

---

## 7. What this proposal explicitly does NOT do

- Replace `BytableMessage` framing (the outer envelope). The DSL targets
  message *payloads*, not the framing layer.
- Introduce a new build step, codegen phase, or DSL parser. The "DSL" is
  just ordinary TypeScript function calls.
- Generate non-TS output. Once the spec is structured (the `Struct.layout`
  array), emitting Go or C++ parsers from it is a follow-on project, not a
  prerequisite.
- Change the wire format of anything. By construction, encode/decode must
  produce bytes byte-for-byte identical to the existing `Bytable*` output —
  enforced by porting tests that round-trip captured packets through both
  implementations and compare.

---

## 8. Next concrete step

If this proposal is accepted in principle, the next commit is:

1. `libs/@rustymotors/binary/src/struct/{types,scalars,define}.ts` —
   the DSL itself, scalars + cstring + pad + array only (no bitfield yet).
2. `libs/@rustymotors/binary/src/struct/index.ts` — public exports.
3. A port of `NpsRiffInfo` (or another bitfield-free struct) as
   `libs/@rustymotors/binary/src/struct/structs/NpsRiffInfo.ts`.
4. A round-trip test and a layout-assertion test.

Total: ~400–500 net new lines, no removals, no behavior changes elsewhere.
Mergeable as a single PR. Reviewable in one sitting.
