# Jelastic deploy scripts

Download jelastic cli and login: <https://docs.jelastic.com/cli>

Set Jelastic installation path

example:
```shell script
export JELASTIC_HOME=~/jelastic
```

Login. Authentication will be called after first cli command, for example:
```shell script
$JELASTIC_HOME/environment/control/getenvs
``` 

Deploy applications:
```shell script
./dev-scripts/jelastic/deploy.sh ${service_name}
```
