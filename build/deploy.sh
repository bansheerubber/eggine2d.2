#!/bin/bash
./build.sh -s
scp -r ./client politics@bansheerubber.com:~/mafia/build/client/
scp -r ./out politics@bansheerubber.com:~/mafia/build/out/