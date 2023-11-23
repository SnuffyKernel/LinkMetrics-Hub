#include "thread_handling.h"

void threadHandler(int clientSocket) {
    char data[256];
    recv(clientSocket, data, sizeof(data), 0);

    Request request;
    sscanf(data, "{\"method\": \"%s\", \"params\": {\"shortUrl\": \"%[^\"]\", \"originalUrl\": \"%[^\"]\", \"ip\": \"%[^\"]\", \"timesTamp\": \"%[^\"]\"}}", request.method, request.params.shortUrl, request.params.originalUrl, request.params.ip, request.params.timesTamp);

    WaitForSingleObject(mutex, INFINITE);
    handleRequest(clientSocket, &request);
    ReleaseMutex(mutex);

    closesocket(clientSocket);
}

DWORD WINAPI ThreadProc(LPVOID lpParam) {
    int clientSocket = *((int*)lpParam);
    threadHandler(clientSocket);
    return 0;
}

void initializeMutex() {
    mutex = CreateMutex(NULL, FALSE, NULL);
    if (mutex == NULL) {
        perror("Error creating mutex");
        exit(EXIT_FAILURE);
    }
}