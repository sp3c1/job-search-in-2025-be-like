package main

import (
	"fmt"
	"net/http"
	"os"

	"github.com/snyk/snyk-code-review-exercise/api"
)

func main() {
	handler := api.New()
	fmt.Println("Server running on http://localhost:3000/")
	// idea: handle graceful exits
	// idea: move from main.go to /server package
	// idea: move the api into internal - unless it is planned to be share
	if err := http.ListenAndServe("localhost:3000", handler); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}
