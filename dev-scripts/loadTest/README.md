# Load tests

First generate private/public RSA pair.
```shell
ssh-keygen -t rsa -b 4096 -m PEM -f jwtRS256.key
# Don't add passphrase
openssl rsa -in jwtRS256.key -pubout -outform PEM -out jwtRS256.key.pub
```

Then add public key to your user settings via UI.
Then set all necessary environment variables.
```text
API_SERVER_URL    - URL of server you are trying to test
OUTPUT_FILE       - Statistics from test will be written to this file
EXAMPLES_PATH     - Path to examples folder with invoice XMLs which load test will be submitting
USER_ID           - Test will be sending requests on behalf of this user
USER_PRIVATE_KEY  - Private key of user USER_ID
LOG_FILE          - File for saving logs from test session
THREAD_NUMBER     - Number of threads sending requests in parallel
ITERATIONS_NUMBER - Number of requests to send by single thread
```

At the end start tests using command
```shell
go run ./cmd/load-test
```
