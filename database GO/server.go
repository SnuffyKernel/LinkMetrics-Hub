package main

import (
	"encoding/json"
	"fmt"
	"net"
)

func handleRequest(socket net.Conn, request Request, db *DataBase) {
	var response interface{}

	switch request.Method {
	case "SET":
		db.setShortUrl(request.Params.ShortUrl, request.Params.OriginalUrl)
		response = map[string]bool{"success": true}
	case "GET":
		shortUrl := db.getShortUrl(request.Params.ShortUrl)
		response = shortUrl
	case "ADD_STATS":
		db.addStat(request.Params.IP, request.Params.ShortUrl, request.Params.Timestamp)
		response = map[string]bool{"success": true}
	case "GET_STATS":
		statsByIP := db.getStatsByIP(request.Params.IP)
		response = statsByIP
	default:
		response = map[string]interface{}{"success": false, "error": "Invalid method"}
	}

	responseJSON, err := json.Marshal(response)
	if err != nil {
		fmt.Println("Error marshalling response:", err)
		return
	}

	socket.Write(responseJSON)
}

func startServer() {
	db := NewDataBase()
	server, err := net.Listen("tcp", fmt.Sprintf(":%d", PORT))
	if err != nil {
		fmt.Println("Error starting server:", err)
		return
	}
	defer server.Close()

	fmt.Printf("Server listening on port %d\n", PORT)

	for {
		conn, err := server.Accept()
		if err != nil {
			fmt.Println("Error accepting connection:", err)
			continue
		}

		go func(conn net.Conn) {
			defer conn.Close()

			var data []byte
			buffer := make([]byte, 1024)

			for {
				n, err := conn.Read(buffer)
				if err != nil {
					fmt.Println("Error reading data:", err)
					return
				}
				data = append(data, buffer[:n]...)

				if n < len(buffer) {
					break
				}
			}

			var request Request
			err = json.Unmarshal(data, &request)
			if err != nil {
				fmt.Println("Error unmarshalling request:", err)
				return
			}

			go handleRequest(conn, request, db)
		}(conn)
	}
}
