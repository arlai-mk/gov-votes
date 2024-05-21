#!/bin/bash

npm run main 2> results-"$(date +"%Y%m%d-%H%M").csv"
