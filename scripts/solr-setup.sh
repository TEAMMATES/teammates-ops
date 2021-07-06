#!/usr/bin/env sh

# Install Java
sudo apt update
sudo apt install default-jre
sudo apt install lsof

# Download Solr
# You are free to use any version of Solr, but this script will use 8.8.1
curl https://archive.apache.org/dist/lucene/solr/8.8.1/solr-8.8.1.tgz -o solr-8.8.1.tgz
tar xzf solr-8.8.1.tgz

# Start Solr
cd solr-8.8.1
bin/solr start

# Create core to run students collection
bin/solr create -c students -s 2 -rf 2
curl -X POST -H "Content-Type: application/json" --data-binary '{"add-copy-field": {"source": "*", "dest": "_text_"}}' localhost:8983/solr/students/schema

# Create core to run instructors collection
bin/solr create -c instructors -s 2 -rf 2
curl -X POST -H "Content-Type: application/json" --data-binary '{"add-copy-field": {"source": "*", "dest": "_text_"}}' localhost:8983/solr/instructors/schema
