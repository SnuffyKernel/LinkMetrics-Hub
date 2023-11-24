#pragma once
#ifndef REQUEST
typedef struct {
    char method[10];
    struct {
        char shortUrl[256];
        char originalUrl[256];
        char ip[16];
        char timesTamp[256];
    } params;
} Request;
#endif // !REQUEST
