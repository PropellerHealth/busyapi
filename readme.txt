
How to scale to post request from 1 M users per minute


1. Web server request problem

1 M per minutes web post request is 18 K per second.
Typical web server has capacity to handle 200 -2 000 requests per second. So the application server will have to scale up to at least 9 nodes.
A load distribution server may be needed to distribute the loads to ~9 servers.
Clound server nowdays could elestically scale based on the loading. 

2. Data volumne analysis
The data object sent by the user is ~100 bytes. 
1 M per minutes is about 100 Mb data per minute, 6 Gb per hour, and 144 Gb per day.
It is not realistic to store such large data stream in the memory.
So in this problem, I store the data to a mongo database.

3. Data storage analysis
mongodb could handle 25 K concurrent connection per second. 
Our problem has 18 K per second data writing request. It is close to the limit of mongodb.
It is though problmetic. Every data base connection cost 1 K memory, so it is about 18 Gb memory requirement for database connection alone.
I propose using batch to save the data for every 1 K of data, so the load will become 18 per second, a very small cost.
The caveat is the 1000 row of data will be lost if there is database operation error.
To minimize this problem, the data could first send to a queue such as redis based in memory queue to prevent data loss.
Mongodb sharding may also be a good idea by distribute the writing to seperate data sets.
Database replication is not good idea because we are dealing with writing. So the data has to be written to data replica anyway.

4. load test the server.
The stress test could be done by a loading test tool such as npm loadtest.
loadtest -c 10 --rps 20000 -P '{"patientId":"100","timestamp":"Tue Nov 01 2016 09:11:51 GMT-0500 (CDT)","medication":"Albuterol"}' http://localhost:3000/api/usages
2000 requests per second is ok, with mean latency < 2ms. see log:
[Thu Jul 19 2018 11:27:41 GMT-0500 (CDT)] INFO Requests: 0, requests per second: 0, mean latency: 0 ms
[Thu Jul 19 2018 11:27:46 GMT-0500 (CDT)] INFO Requests: 9381, requests per second: 1877, mean latency: 1.5 ms
[Thu Jul 19 2018 11:27:51 GMT-0500 (CDT)] INFO Requests: 19381, requests per second: 2001, mean latency: 1.2 ms
18000 requests per second starts to see errors with latency around 500ms. It looks the server could handle ~6000 requests per second. see log:
[Thu Jul 19 2018 11:29:19 GMT-0500 (CDT)] INFO Requests: 0, requests per second: 0, mean latency: 0 ms
[Thu Jul 19 2018 11:29:24 GMT-0500 (CDT)] INFO Requests: 26853, requests per second: 5373, mean latency: 157.9 ms
[Thu Jul 19 2018 11:29:29 GMT-0500 (CDT)] INFO Requests: 58499, requests per second: 6330, mean latency: 523.2 ms
[Thu Jul 19 2018 11:29:29 GMT-0500 (CDT)] INFO Errors: 2974, accumulated errors: 2974, 5.1% of total requests
[Thu Jul 19 2018 11:29:34 GMT-0500 (CDT)] INFO Requests: 90993, requests per second: 6498, mean latency: 520.2 ms
[Thu Jul 19 2018 11:29:34 GMT-0500 (CDT)] INFO Errors: 3888, accumulated errors: 6862, 7.5% of total requests
[Thu Jul 19 2018 11:29:39 GMT-0500 (CDT)] INFO Requests: 123709, requests per second: 6542, mean latency: 524.6 ms
[Thu Jul 19 2018 11:29:39 GMT-0500 (CDT)] INFO Errors: 3112, accumulated errors: 9974, 8.1% of total requests


5. repo link https://github.com/mdrosophila/busyapi/tree/qyang


Timeframe
9:30AM - 9:35AM fork the repo and create local repo
9:35AM - 10:30AM read the code and modify busy API
10:30AM - 11:00AM write the log