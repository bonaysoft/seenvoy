# Seenvoy

[![Build](https://github.com/saltbo/seenvoy/actions/workflows/build.yml/badge.svg)](https://github.com/saltbo/seenvoy/actions/workflows/build.yml)

Let's see the configs of the [Envoy](https://github.com/envoyproxy/envoy)

## Feature

- Visualization configuration
- Visualization the relation of config

## Preview


## Installation

### For go developer

> required go1.17

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