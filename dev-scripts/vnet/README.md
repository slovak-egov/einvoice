# Vnet deploy scripts

Download jelastic cli and login: <https://docs.jelastic.com/cli>

Set Jelastic installation path

example:
```shell script
export JELASTIC_HOME=~/jelastic
```

deploy applications
```shell script
./dev-scripts/vnet/apiserver-deploy.sh
./dev-scripts/vnet/notificationworker-deploy.sh
./dev-scripts/vnet/web-app-deploy.sh
```
