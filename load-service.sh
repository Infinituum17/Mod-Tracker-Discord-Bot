#!/bin/bash

echo "Loading SystemCTL modtracker service"

sudo systemctl start modtracker

echo "Started modtracker service!"

sudo journalctl -u modtracker