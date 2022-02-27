#!/usr/bin/env sh

# Install Java
sudo apt update
sudo apt install default-jre
sudo apt install lsof

# Download Solr
# You are free to use any version of Solr, but this script will use 8.11.1
curl https://archive.apache.org/dist/lucene/solr/8.11.1/solr-8.11.1.tgz -o solr-8.11.1.tgz
tar xzf solr-8.11.1.tgz

# Start Solr
cd solr-8.11.1
bin/solr start
