#!/bin/bash
# Copy remaining login files
cp packages/login/src/NPSUserStatus.ts packages/authentication/src/login/ 2>/dev/null
cp packages/login/src/NPS_LOGIN_COMMANDS.ts packages/authentication/src/login/ 2>/dev/null
cp packages/login/src/NPS_LOGINCLIENT_COMMANDS.ts packages/authentication/src/login/ 2>/dev/null
cp packages/login/src/premadeLogin.ts packages/authentication/src/login/ 2>/dev/null

# Copy remaining persona files
cp packages/persona/src/*.ts packages/authentication/src/persona/ 2>/dev/null
cp packages/persona/src/handlers/*.ts packages/authentication/src/persona/handlers/ 2>/dev/null

echo "Files copied"
