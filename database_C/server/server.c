#include "server.h"

void handleRequest(int socket, Request* request) {
    char response[256];

    DataBase db;
    initializeData(&db);

    if (strcmp(request->method, "SET") == 0) {
        setShortUrl(&db, request->params.shortUrl, request->params.originalUrl);
        sprintf(response, "{\"success\": true}");
    }
    else if (strcmp(request->method, "GET") == 0) {
        const char* shortUrl = getShortUrl(&db, request->params.shortUrl);
        if (shortUrl != NULL) {
            sprintf(response, "\"%s\"", shortUrl);
        }
        else {
            sprintf(response, "null");
        }
    }
    else if (strcmp(request->method, "GET_ALL") == 0) {
        ShortUrlEntry allShortUrls[MAX_STATS];
        int shortUrlsCount = 0;
        getAllShortUrl(&db, allShortUrls, &shortUrlsCount);

        sprintf(response, "[");
        for (int i = 0; i < shortUrlsCount; i++) {
            sprintf(response + strlen(response), "{\"shortUrl\": \"%s\", \"originalUrl\": \"%s\"},", allShortUrls[i].shortUrl, allShortUrls[i].originalUrl);
        }
        sprintf(response + strlen(response), "]");
    }
    else if (strcmp(request->method, "ADD_STATS") == 0) {
        addStat(&db, request->params.ip, request->params.shortUrl, request->params.timesTamp);
        sprintf(response, "{\"success\": true}");
    }
    else if (strcmp(request->method, "GET_STATS") == 0) {
        IpStatsEntry statsByIP;
        getStatsByIP(&db, request->params.ip, &statsByIP);

        sprintf(response, "{\"ip\": \"%s\", \"stats\": [", statsByIP.ip);
        for (int i = 0; i < statsByIP.statsCount; i++) {
            sprintf(response + strlen(response), "{\"shortUrl\": \"%s\", \"originalUrl\": \"%s\"},", statsByIP.stats[i].shortUrl, statsByIP.stats[i].originalUrl);
        }
        sprintf(response + strlen(response), "]}");
    }
    else {
        sprintf(response, "{\"success\": false, \"error\": \"Invalid method\"}");
    }

    write(socket, response, strlen(response));
}

void startServer() {

    int serverSocket, clientSocket;
    int clientLength;
    struct sockaddr_in serverAddress, clientAddress;

    serverSocket = socket(AF_INET, SOCK_STREAM, 0);
    if (serverSocket == INVALID_SOCKET) {
        perror("Error creating socket");
        exit(EXIT_FAILURE);
    }

    serverAddress.sin_family = AF_INET;
    serverAddress.sin_addr.s_addr = INADDR_ANY;
    serverAddress.sin_port = htons(6789);

    if (bind(serverSocket, (struct sockaddr*)&serverAddress, sizeof(serverAddress)) == SOCKET_ERROR) {
        perror("Error binding socket");
        closesocket(serverSocket);
        exit(EXIT_FAILURE);
    }

    if (listen(serverSocket, 5) == SOCKET_ERROR) {
        perror("Error listening on socket");
        closesocket(serverSocket);
        exit(EXIT_FAILURE);
    }

    printf("Server listening on port 6789\n");

    while (1) {
        clientLength = sizeof(clientAddress);
        clientSocket = accept(serverSocket, (struct sockaddr*)&clientAddress, &clientLength);
        if (clientSocket == INVALID_SOCKET) {
            perror("Error accepting client connection");
            continue;
        }
        
        printf("Client connected successfully.\n");

        DWORD threadId;
        HANDLE thread = CreateThread(NULL, 0, ThreadProc, (LPVOID)&clientSocket, 0, &threadId);
        if (thread == NULL) {
            perror("Error creating thread");
            closesocket(clientSocket);
        }
        else {
            CloseHandle(thread);
        }
    }

    CloseHandle(mutex);
}