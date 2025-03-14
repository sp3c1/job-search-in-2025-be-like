## Build Instructions

```bash
copy .env.example .env # example env should have proper configuartion
docker build -t sp3c1:ferovinum .
docker run -it  sp3c1:ferovinum /bin/sh
```

## Approach

I went to setting up internal Socket server, as this seemed to me intially a best tool, to be able to recieve async updates from Server part. I know that give example do not factors it in, but assuming it would ever be one, it would be a prefference here. Obviously nothing wrong here with server part to be in REST or GQL, but gRpc like approach seems more natural in such enviroment.

## Test

Are running as part of docker build, but can also be run outside of it.

```bash
npm run test
```

The most relevalnt test, showcasing the expected IO outputs is in the `./src/services/server/order.test.ts`. You will find matching snapshot in this directory to review under `./src/services/server/__snapshots__/order.test.ts.snap`.

## Running

Whole solution consists of the applications, `cli` and `server`. Main process can be found under `./src/bin/...`. By default the `cli` will run the `server` as child process. If this those not work on target machine, it can be separated by chaning env `SOCKET_INTERNAL` to any other value then `true`. There are some extra logging flags there, but for CLI they sometimes create some unexpected quirks, so they are turned of. Cli authorizes with `APIKEY` and wont allow any commands untill it reaches authorized state.

```bash
npm run start
```

The socket server emits auth prompt back, but at the moment, as per request the errors are suppresed. The suppression happens on client side.

## Exit

Type `exit` or just `Ctrl-X`. Cli should support both.

## DI

As not library was allowed I built simplistic DI connector classes. Obviously as this would grow this would need to reorganised (imports through constructor to happen through props like objects etc). But in normal system, I do not encourage people building their own DI (unless it is golang).

## Rabbit Hole / Learning Point

I did not use the `readline` module before so it was a bit of exploratory mission for me. What I did learn the hard way is that `nodemon` can sevirelly break the `readline` interace in very unobvious ways. I won't tell you how long it took me that it is messing out with output streams, but needless it was enough for me to put rant in the doc. In hindside it seems obvioust. And as for the lesson, when dealing with `readline` and `nodemon` (and potentially alike solution that can polute stream) one needs to set `--no-stdin` flag.

---

## ORIGINAL DESCRIPTION

Ferovinum provides capital to businesses in the wine and spirits industry.
We are in a unique space of aggressive expansion while serving our customers by solving real world
problems. In our work, we value core engineering skills and problem solving abilities. We would like to
work with engineers who are good at understanding fundamentals and working from first principles. It’s
also helpful to be able to discern patterns and make reasonable assumptions. In that respect, we would
like to evaluate your solution to a problem with as few frills attached, like frameworks or libraries, while
giving you the ability to dazzle us with your skills, your ability to think, and your ability to communicate
how you think via the solution. We understand that doing a take home test can be a serious commitment
and a time sink. Hence we aim to provide a taste of the business in this problem. Thank you so much for
your time, we hope you enjoy solving the problem!

### Solution Context

For this problem we’d like to model a simple interaction for our client with the system. We expect you to take 2 hours to solve this problem, and no more than 4 hours.

- The solution is expected as a CLI which takes simple string inputs via STDIN and prints outputs to STDOUT.
- You are expected to NOT use any framework or library for the solution - you’re free to use the standard libraries provided by your language.
- Add a Dockerfile so we can test in isolation.
- We are less interested in the input/output parsing and are more interested in how you model the
  solution.
- We expect the solution to be highly maintainable - any other members of the team should be able
  to quickly digest and begin working on the solution.
- We also expect the solution to be guaranteed to work and expect the code to be extensible.

An accompanying README - explaining your thought process, including any assumptions you’ve made, and how you’ve hought about supporting extensibility, maintainability, and appropriate guarantees - is expected.

You will be invited to pair and extend this solution if you progress to the next stage of the interview. In the problem description below, we use some notations to help simplify communication:

- client:> represents input from stdin into the app (by the client)
- system:< represents output from the app into stdout (by the system)
- [name] represents a variable “name”

Good luck!

### Problem

A client typically sells a specific quantity of a particular product (SKU) to us, and we advance funds on the basis of the products. We would like to expose a simple command for this. You can assume we only deal in wine and whisky for now.

```
client:> sell [sku] [quantity]
```

At a later time they typically repurchase (buy back) some of their stock.

```
client:> buy [sku] [quantity]
```

When our client wants to sell to us, or buy back from us, the system returns an output of several lines followed by a new line to signal the end of output. Each line corresponds to an order that was (historically) accepted in the sequence it was processed by the system.

```
system:< [type] [sku] [quantity] [status]
```

For an order, if there’s remaining stock, we show remaining:<count> as status, otherwise the status is closed. When a client buys back stock, we want to only return available stock, that is, the stock that was sold to us earlier.

The client can only buy back what they’ve sold us so far. If we can partially meet their request (with less stock than they requested), the buy order has the partial (fulfillable) amount.

If we can’t, we don’t do anything - there are no errors, but the transaction never happens. The system is meant to be error free and constantly running.

We want to fulfill requests to buy back stock with the earliest stock that was sold to us (in the order in which we got the requests to sell / FIFO).

The behaviour explained above is evidenced by the following sample IO:

Sample IO (bold lines in output signal changes)

```
client:> sell wine 1000
system<: sell wine 1000 remaining:1000

client:> sell whisky 100
system:< sell wine 1000 remaining:1000
system:< sell whisky 100 remaining:100

client:> buy wine 500
system:< sell wine 1000 remaining:500
system:< sell whisky 100 remaining:100
system:< buy wine 500 closed

client:> buy wine 1000
system:< sell wine 1000 closed
system:< sell whisky 100 remaining:100
system:< buy wine 500 closed
system:< buy wine 500 closed

client:> buy wine 500
system:< sell wine 1000 closed
system:< sell whisky 100 remaining:100
system:< buy wine 500 closed
system:< buy wine 500 closed

client:> sell whisky 100
system:< sell wine 1000 closed
system:< sell whisky 100 remaining:100
system:< buy wine 500 closed
system:< buy wine 500 closed
system:< sell whisky 100 remaining:100

client:> buy whisky 120
system:< sell wine 1000 closed
system:< sell whisky 100 closed
system:< buy wine 500 closed
system:< buy wine 500 closed
system:< sell whisky 100 remaining:80
system:< buy whisky 120 closed
```
