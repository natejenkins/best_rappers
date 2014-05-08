// Adapted from http://golang.org/doc/articles/wiki/
// and http://stackoverflow.com/questions/14086063/serve-homepage-and-static-content-from-root

// This is an attempt at writing the server in Go.  It was simply much faster for me to write it in Ruby + Sinatra.
// Would be nice to see this completed.
package main

import (
    "fmt"
    "net/http"
)

func serveSingle(pattern string, filename string) {
    http.HandleFunc(pattern, func(w http.ResponseWriter, r *http.Request) {
        http.ServeFile(w, r, filename)
    })
}

func handler(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "Hi there, I love %s!", r.URL.Path[1:])
}

func main() {
    //http.HandleFunc("/", homeHandler)
    serveSingle("/", "index.html")
    serveSingle("/best_rappers.js", "best_rappers.js")
    serveSingle("/best_rappers.json", "best_rappers.json")
    serveSingle("/best_rappers.css", "best_rappers.css")
    http.ListenAndServe(":8080", nil)
}