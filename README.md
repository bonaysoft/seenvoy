# Seenvoy

See the configs of the [Envoy](https://github.com/envoyproxy/envoy)

## Feature

- Visualization configuration
- Visualization the relation of config

## Preview


## Installation

### For go developer
```go
go install github.com/saltbo/seenvoy@latest
```

### For Homebrew users
```go
brew install saltbo/bin/seenvoy
```

## Usage
```
seenvoy serve -p 8080 -t http://localhost:15000
```


## Develop
```
yarn
yarn dev
```

## Build
```shell
yarn
yarn build
go build -o seenvoy .
```