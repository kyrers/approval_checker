# What have I approved?

### Overview

Connect your wallet to:
- See your current ERC20/721/1155 approvals;
- See your full approval history, including revoking approvals;
- Revoke your approvals.

A couple of things to note:
- Only Mainnet and Optimism are implemented, but it is trivial to add another network;
- Approval amounts that are gigantic and close to unlimited, but not quite equal to `type(uint256).max` are still treated as unlimited.
- You'll be using your own Etherscan API keys. This is prepared for the free plan version and works around the rate limits. Incidentally, this is why the app is not deployed on vercel or netlify - they have 10s timeouts on their free plans, which is not enough for some of the requests we make.

### Run this application

1. Create `env` and then fill the needed variables

```
$ cp .env.example .env
```

2. Install dependencies

```
$ npm install
```

3. Run as dev

```
$ npm run dev
```

4. Open `http://localhost:3000`


If you find any bugs, improvements or have any suggestion, feel free to create an issue or reach out to me on [Twitter](https://twitter.com/kyre_rs).

###### [kyrers](https://twitter.com/kyre_rs)
