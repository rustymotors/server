# ENBF

```
0501013e010100000000013e00227a7551484364613933317558363637653337343741796d78677a3851554b786541630000010043343035314535324242444642323541313836363045323746453731464538384231453138334243314144394141433244324331444436413437393135393734423533394230453139313141353033433142384337374532424643343335464137443243333843433144333238373030344241423637443735343136393036453242413439374246454631363433363833314436424134383343433343453445393432334330423437443231303433303531324144343736463435314238453046333031363238433543453534373538464136334133434345374342413842464432394238314330364346433432313835394435323238423338353841463437000432313736fea31c19
```

```ebnf
<message> ::= <message_header> <field_len> <hex_ascii_string>
<hex_ascii_string> ::= <hex_ascii_digit>+
<hex_ascii_digit> ::= "20" | "21" | "22" | "23" | "24" | "25" | "26" | "27" | "28" | "29" | "2A" | "2a" | "2B" | "2b" | "2C" | "2c" | "2D" | "2d" | "2E" | "2e" | "2F" | "2f" | "30" | "31" | "32" | "33" | "34" | "35" | "36" | "37" | "38" | "39" | "3A" | "3a" | "3B" | "3b" | "3C" | "3c" | "3D" | "3d" | "3E" | "3e" | "3F" | "3f" | "40" | "41" | "42" | "43" | "44" | "45" | "46" | "47" | "48" | "49" | "4A" | "4a" | "4B" | "4b" | "4C" | "4c" | "4D" | "4d" | "4E" | "4e" | "4F" | "4f" | "50" | "51" | "52" | "53" | "54" | "55" | "56" | "57" | "58" | "59" | "5A" | "5a" | "5B" | "5b" | "5C" | "5c" | "5D" | "5d" | "5E" | "5e" | "5F" | "5f" | "60" | "61" | "62" | "63" | "64" | "65" | "66" | "67" | "68" | "69" | "6A" | "6a" | "6B" | "6b" | "6C" | "6c" | "6D" | "6d" | "6E" | "6e" | "6F" | "6f" | "70" | "71" | "72" | "73" | "74" | "75" | "76" | "77" | "78" | "79" | "7A" | "7a" | "7B" | "7b" | "7C" | "7c" | "7D" | "7d" | "7E" | "7e" | "7F" | "7f"
<field_len> ::= <u16>
<message_header> ::= <message_header_v0> | <message_header_v1>
<message_header_v1> ::= <message_header_prefix> <message_version_v1> <message_reserved> <message_checksum>
<message_header_v0> ::= <message_header_prefix> <message_version_v0>
<message_checksum> ::= <u32>
<message_reserved> ::= "0000"
<message_header_prefix> ::= <message_id> <message_len>
<message_version_v1> ::= "0101"
<message_version_v0> ::= "0000"
<message_len> ::= <u16>
<message_id> ::= <u16>
<u32> ::= <u16> <u16>
<u16> ::= <u8> <u8>
<u8> ::= <hex_digit> <hex_digit>
<hex_digit> ::= [0-9] | [A-F] | [a-f]
```
