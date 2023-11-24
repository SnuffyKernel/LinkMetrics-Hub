package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"time"
)

func NewDataBase() *DataBase {
	db := &DataBase{
		ShortUrls:    NewHashTable(),
		Stats:        NewHashTable(),
		DataFilePath: "database.data",
	}
	db.initializeData()
	return db
}

func NewHashTable() *HashTable {
	return &HashTable{
		Entries: make([]*Entry, 0),
	}
}

func (db *DataBase) initializeData() {
	_, err := os.Stat(db.DataFilePath)
	if err == nil {
		db.loadData()
	} else {
		fmt.Printf("File %s not found. Creating a new one.\n", db.DataFilePath)
		db.saveData()
	}
}

func (db *DataBase) loadData() {
	data, err := ioutil.ReadFile(db.DataFilePath)
	if err != nil {
		fmt.Println("Error loading data:", err)
		return
	}

	err = json.Unmarshal(data, db)
	if err != nil {
		fmt.Println("Error unmarshalling data:", err)
		return
	}
}

func (db *DataBase) saveData() {
	dataToSave, err := json.Marshal(db)
	if err != nil {
		fmt.Println("Error marshalling data:", err)
		return
	}

	err = ioutil.WriteFile(db.DataFilePath, dataToSave, 0644)
	if err != nil {
		fmt.Println("Error saving data:", err)
		return
	}
}

func (db *DataBase) setShortUrl(shortUrl, originalUrl string) {
	db.mu.Lock()
	defer db.mu.Unlock()
	hashedKey := hashString(shortUrl)
	entry := &Entry{Key: hashedKey, Value: originalUrl}
	db.ShortUrls.Entries = append(db.ShortUrls.Entries, entry)
	db.saveData()
}

func (db *DataBase) getShortUrl(shortUrl string) string {
	db.mu.Lock()
	defer db.mu.Unlock()
	hashedKey := hashString(shortUrl)
	for _, entry := range db.ShortUrls.Entries {
		if entry.Key == hashedKey {
			return entry.Value.(string)
		}
	}
	return ""
}

func (db *DataBase) addStat(ip, shortUrl string, timestamp time.Time) {
	db.mu.Lock()
	defer db.mu.Unlock()
	hashedKey := hashString(ip)
	var existingEntry *StatEntry

	for _, entry := range db.Stats.Entries {
		if entry.Key == hashedKey {
			for i := range entry.Value.([]StatEntry) {
				statEntry := &entry.Value.([]StatEntry)[i]
				entryTime := statEntry.TimeInterval.UTC()
				timeDifference := timestamp.Sub(entryTime)
				minutesDifference := timeDifference.Minutes()

				if statEntry.URL == shortUrl && minutesDifference >= 0 && minutesDifference < 1 {
					existingEntry = statEntry
					break
				}
			}

			if existingEntry == nil {
				newEntry := StatEntry{
					TimeInterval: timestamp.UTC(),
					URL:          shortUrl,
					Count:        1,
				}
				entry.Value = append(entry.Value.([]StatEntry), newEntry)
			} else {
				existingEntry.Count++
			}
			db.saveData()
			return
		}
	}

	newEntry := &Entry{
		Key:   hashedKey,
		Value: []StatEntry{{TimeInterval: timestamp.UTC(), URL: shortUrl, Count: 1}},
	}
	db.Stats.Entries = append(db.Stats.Entries, newEntry)
	db.saveData()
}

func (db *DataBase) getStatsByIP(ip string) []StatEntry {
	db.mu.Lock()
	defer db.mu.Unlock()
	hashedKey := hashString(ip)
	for _, entry := range db.Stats.Entries {
		if entry.Key == hashedKey {
			return append([]StatEntry{}, entry.Value.([]StatEntry)...)
		}
	}
	return nil
}

func hashString(s string) string {
	hash := 0
	for _, char := range s {
		hash += int(char)
	}
	return fmt.Sprintf("%d", hash)
}
