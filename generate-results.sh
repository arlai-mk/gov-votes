#!/bin/bash

npm run main > results-"$(date +"%Y%m%d-%H%M").csv"
