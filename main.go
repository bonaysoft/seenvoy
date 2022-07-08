package main

import (
	"embed"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"path/filepath"
)

//go:embed dist/*
var embedFs embed.FS

type FileSystem struct {
	efs http.FileSystem
}

func NewFS() *FileSystem {
	return &FileSystem{http.FS(embedFs)}
}

func (fs FileSystem) Open(name string) (http.File, error) {
	f, err := fs.efs.Open(filepath.Join("dist", name))
	if os.IsNotExist(err) {
		return fs.efs.Open("dist/index.html") // SPA应用需要始终加载index.html
	}

	return f, err
}

func main() {
	http.NewServeMux()
	http.Handle("/", http.FileServer(NewFS()))
	http.Handle("/api/", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		r.URL.Path = r.URL.Path[len("/api/"):]
		httputil.NewSingleHostReverseProxy(&url.URL{Scheme: "http", Host: "localhost:15000"}).ServeHTTP(w, r)
	}))
	http.ListenAndServe(":8080", nil)
}
