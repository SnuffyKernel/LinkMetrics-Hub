#include "database.h"

unsigned int hashFunction(const char* key) {
    unsigned int hash = 0;
    while (*key) {
        hash = (hash << 5) + *key++;
    }
    return hash % HASH_TABLE_SIZE;
}

void initializeData(DataBase* db) {
    db->shortUrlsCount = 0;
    db->statsCount = 0;
    strcpy(db->dataFilePath, "database.data");

    for (int i = 0; i < HASH_TABLE_SIZE; i++) {
        db->shortUrlHashTable[i] = NULL;
        db->statsHashTable[i] = NULL;
    }

    loadData(db);

    if (db->shortUrlsCount == 0 && db->statsCount == 0) {
        printf("File %s not found. Creating a new one.\n", db->dataFilePath);
        saveData(db);
    }
}

void loadData(DataBase* db) {
    FILE* file = fopen(db->dataFilePath, "r");
    if (file != NULL) {
        fscanf(file, "{\"shortUrls\": [");
        while (fscanf(file, "{\"shortUrl\": \"%[^\"]\", \"originalUrl\": \"%[^\"]\"},", db->shortUrls[db->shortUrlsCount].shortUrl, db->shortUrls[db->shortUrlsCount].originalUrl) != EOF) {
            db->shortUrlsCount++;
        }
        fscanf(file, "], \"stats\": [");
        while (fscanf(file, "{\"ip\": \"%[^\"]\", \"stats\": [", db->stats[db->statsCount].ip) != EOF) {
            while (fscanf(file, "{\"shortUrl\": \"%[^\"]\", \"originalUrl\": \"%[^\"]\"},", db->stats[db->statsCount].stats[db->stats[db->statsCount].statsCount].shortUrl, db->stats[db->statsCount].stats[db->stats[db->statsCount].statsCount].originalUrl) != EOF) {
                db->stats[db->statsCount].statsCount++;
            }
            fscanf(file, "], \"statsCount\": %d},", &db->stats[db->statsCount].statsCount);
            db->statsCount++;
        }
        fscanf(file, "]}");
        fclose(file);
    }
}

void saveData(DataBase* db) {
    FILE* file = fopen(db->dataFilePath, "w");
    if (file != NULL) {
        fprintf(file, "{\"shortUrls\": [");
        for (int i = 0; i < db->shortUrlsCount; i++) {
            fprintf(file, "{\"shortUrl\": \"%s\", \"originalUrl\": \"%s\"},", db->shortUrls[i].shortUrl, db->shortUrls[i].originalUrl);
        }
        fprintf(file, "], \"stats\": [");
        for (int i = 0; i < db->statsCount; i++) {
            fprintf(file, "{\"ip\": \"%s\", \"stats\": [", db->stats[i].ip);
            for (int j = 0; j < db->stats[i].statsCount; j++) {
                fprintf(file, "{\"shortUrl\": \"%s\", \"originalUrl\": \"%s\"},", db->stats[i].stats[j].shortUrl, db->stats[i].stats[j].originalUrl);
            }
            fprintf(file, "], \"statsCount\": %d},", db->stats[i].statsCount);
        }
        fprintf(file, "]}");
        fclose(file);
    }
}


void setShortUrl(DataBase* db, const char* shortUrl, const char* originalUrl) {
    unsigned int hash = hashFunction(shortUrl);
    db->shortUrlHashTable[hash] = &(db->shortUrls[db->shortUrlsCount]);

    strcpy(db->shortUrls[db->shortUrlsCount].shortUrl, shortUrl);
    strcpy(db->shortUrls[db->shortUrlsCount].originalUrl, originalUrl);
    db->shortUrlsCount++;
    saveData(db);
}

const char* getShortUrl(DataBase* db, const char* shortUrl) {
    unsigned int hash = hashFunction(shortUrl);
    ShortUrlEntry* entry = db->shortUrlHashTable[hash];

    while (entry != NULL) {
        if (strcmp(entry->shortUrl, shortUrl) == 0) {
            return entry->originalUrl;
        }
        entry = entry->next;
    }

    return NULL;
}

void getAllShortUrl(DataBase* db, ShortUrlEntry* shortUrls, int* shortUrlsCount) {
    for (int i = 0; i < db->shortUrlsCount; i++) {
        shortUrls[i] = db->shortUrls[i];
    }
    *shortUrlsCount = db->shortUrlsCount;
}

void addStat(DataBase* db, const char* ip, const char* shortUrl, const char* timestamp) {
    unsigned int hash = hashFunction(ip);

    IpStatsEntry* newEntry = (IpStatsEntry*)malloc(sizeof(IpStatsEntry));
    strcpy(newEntry->ip, ip);
    newEntry->next = db->statsHashTable[hash];

    db->statsHashTable[hash] = newEntry;

    int timeInterval = atoi(timestamp);
    int currentTime = time(NULL);
    int minutesDifference;

    for (int i = 0; i < newEntry->statsCount; i++) {
        minutesDifference = (currentTime - newEntry->stats[i].timeInterval) / 60;
        if (strcmp(newEntry->stats[i].shortUrl, shortUrl) == 0 && minutesDifference < 1) {
            newEntry->stats[i].count++;
            saveData(db);
            return;
        }
    }

    strcpy(newEntry->stats[newEntry->statsCount].shortUrl, shortUrl);
    newEntry->stats[newEntry->statsCount].count = 1;
    newEntry->stats[newEntry->statsCount].timeInterval = timeInterval;
    newEntry->statsCount++;
    saveData(db);
}

void getStatsByIP(DataBase* db, const char* ip, IpStatsEntry* ipStats) {
    unsigned int hash = hashFunction(ip);
    IpStatsEntry* entry = db->statsHashTable[hash];

    while (entry != NULL) {
        if (strcmp(entry->ip, ip) == 0) {
            *ipStats = *entry;
            return;
        }
        entry = entry->next;
    }

    ipStats->statsCount = 0;
}

