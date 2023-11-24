#pragma once
#ifndef DATABASE

#define _CRT_SECURE_NO_WARNINGS
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX_URL_LENGTH 256
#define MAX_IP_LENGTH 16
#define MAX_STATS 100
#define HASH_TABLE_SIZE 101

typedef struct {
    char shortUrl[MAX_URL_LENGTH];
    char originalUrl[MAX_URL_LENGTH];
    int count;
    int timeInterval;
    struct ShortUrlEntry* next;
} ShortUrlEntry;

typedef struct {
    char ip[MAX_IP_LENGTH];
    ShortUrlEntry stats[MAX_STATS];
    int statsCount;
    struct IpStatsEntry* next;
} IpStatsEntry;

typedef struct {
    ShortUrlEntry shortUrls[MAX_STATS];
    IpStatsEntry stats[MAX_STATS];
    int shortUrlsCount;
    int statsCount;
    char dataFilePath[MAX_URL_LENGTH];

    ShortUrlEntry* shortUrlHashTable[HASH_TABLE_SIZE];
    IpStatsEntry* statsHashTable[HASH_TABLE_SIZE];
} DataBase;

void initializeData(DataBase* db);
void loadData(DataBase* db);
void saveData(DataBase* db);
void setShortUrl(DataBase* db, const char* shortUrl, const char* originalUrl);
const char* getShortUrl(DataBase* db, const char* shortUrl);
void getAllShortUrl(DataBase* db, ShortUrlEntry* shortUrls, int* shortUrlsCount);
void addStat(DataBase* db, const char* ip, const char* shortUrl, const char* timestamp);
void getStatsByIP(DataBase* db, const char* ip, IpStatsEntry* ipStats);
#endif // !DATABASE
