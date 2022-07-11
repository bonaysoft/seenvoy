package main

import (
	"embed"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"path/filepath"
	"strings"

	"github.com/urfave/cli/v2"
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
	app := &cli.App{
		Name:  "seenvoy",
		Usage: "see the configs of the Envoy",
		Flags: []cli.Flag{
			&cli.StringFlag{
				Name:  "addr",
				Value: ":8080",
				Usage: "specify the seenvoy listen address",
			},
			&cli.StringFlag{
				Name:     "target",
				Usage:    "specify the admin URL of the envoy",
				Aliases:  []string{"t"},
				Required: true,
			},
		},
		Action: func(c *cli.Context) error {
			reverseProxy, err := buildReverseProxy(c.String("target"))
			if err != nil {
				return err
			}

			http.NewServeMux()
			http.Handle("/", http.FileServer(NewFS()))
			http.Handle("/api/", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				r.URL.Path = r.URL.Path[len("/api/"):]
				reverseProxy.ServeHTTP(w, r)
			}))

			log.Println("seenvoy listening on", c.String("addr"))
			return http.ListenAndServe(c.String("addr"), nil)
		},
	}

	if err := app.Run(os.Args); err != nil {
		log.Fatal(err)
	}

}

func buildReverseProxy(s string) (*httputil.ReverseProxy, error) {
	if !strings.Contains(s, "://") {
		s = "http://" + s
	}

	target, err := url.Parse(s)
	if err != nil {
		return nil, err
	}

	log.Println("reverse proxy target:", target)
	return httputil.NewSingleHostReverseProxy(target), nil
}
