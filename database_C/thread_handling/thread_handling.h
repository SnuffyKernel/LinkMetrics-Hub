#pragma once
#ifndef thread_handling
#define _CRT_SECURE_NO_WARNINGS
#include <stdio.h>
#include <winsock2.h>
#include <windows.h>
#include "../request.h"

HANDLE mutex;

void threadHandler(int clientSocket);
DWORD WINAPI ThreadProc(LPVOID lpParam);
void initializeMutex();
#endif // !thread_handling
