package config

import "github.com/sirupsen/logrus"

var devConfig = Configuration{
	Port: 8080,
	Urls: Urls{
		ApiServer: "http://localhost:8081",
		SlovenskoSkLogin: "https://upvs.dev.filipsladek.com/login?callback=http://localhost:3000/login-callback",
	},
	ClientBuildDir: "web-app/client/build",
	LogLevel: logrus.DebugLevel,
}

var prodConfig = Configuration{
	Port: 80,
	ClientBuildDir: "/client/build",
	Urls: Urls{
		SlovenskoSkLogin: "https://upvs.dev.filipsladek.com/login?callback=https://web-app.dev.filipsladek.com/login-callback",
	},
	LogLevel: logrus.InfoLevel,
}
