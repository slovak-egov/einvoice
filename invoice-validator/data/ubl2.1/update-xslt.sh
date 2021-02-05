#!/bin/sh

set -ex

mvn -f pom-preprocess.xml generate-resources

mvn -f pom-xslt.xml process-resources
