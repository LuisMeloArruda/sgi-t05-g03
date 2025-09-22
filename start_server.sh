#!/bin/sh

DIR=$1

python3 -m http.server -d $DIR 8000
