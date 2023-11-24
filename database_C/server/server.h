#pragma once
#ifndef SERVER
#define _CRT_SECURE_NO_WARNINGS
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <winsock2.h>
#include "../database/database.h"
#include "../thread_handling/thread_handling.h"
#include "../request.h"

void handleRequest(int socket, Request* request);
void startServer();

#endif // !SERVER