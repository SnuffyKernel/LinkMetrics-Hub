package main

import (
	"sync"
	"time"
)

const PORT = 6789

type Request struct {
	Method string `json:"method"`
	Params struct {
		ShortUrl    string    `json:"shortUrl"`
		OriginalUrl string    `json:"originalUrl"`
		IP          string    `json:"ip"`
		Timestamp   time.Time `json:"timestamp"`
	} `json:"params"`
}

type StatEntry struct {
	TimeInterval time.Time `json:"TimeInterval"`
	URL          string    `json:"URL"`
	Count        int       `json:"Count"`
}

type Entry struct {
	Key   string
	Value interface{}
}

type HashTable struct {
	Entries []*Entry
}

type DataBase struct {
	ShortUrls    *HashTable
	Stats        *HashTable
	DataFilePath string
	mu           sync.Mutex
}

func main() {
	startServer()
}
