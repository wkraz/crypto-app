# Crypto Price Graph Application

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [API Integration](#api-integration)
- [Contributing](#contributing)
- [License](#license)

## Overview
The Crypto Price Graph Application is a web-based tool that allows users to visualize the price trends of various cryptocurrencies. Users can search for specific coins, view common cryptocurrencies, and analyze price data over different timeframes. This project demonstrates my skills in React, Next.js, and API integration.

## Features
- **Search Bar**: Users can search for any cryptocurrency to display its price graph.
- **Common Coins**: Quick access to popular cryptocurrencies like Bitcoin, Ethereum, and Solana.
- **Dynamic Graph**: View price trends over different timeframes (1D, 1W, 1M, 1Y, All).
- **Key Metrics**: Display essential metrics such as market cap, current price, 7-day price trend, and liquidity.
- **Safety Score**: Uses key metrics to determine the relative safety of a coin, and explains the rationale behind it to the user.
- **Predictive Metrics**: Features many comprehensive prediction metrics that the user can choose between. 

## Technologies Used
- **Frontend**: 
  - React
  - Next.js
  - Tailwind CSS
- **API**: 
  - CoinGecko API for cryptocurrency data
- **Development Tools**: 
  - Node.js
  - npm

## Installation
To run this project locally, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/wkraz/crypto-app.git
   cd crypto-app
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`.

## Usage
- Use the search bar at the top to find a cryptocurrency.
- Click on any of the common coins displayed below the search bar for quick access.
- Select a timeframe to view the price graph.
- Key metrics will be displayed on the left side of the graph.
- The safety score will be displayed under the key metrics. Click on the safety score section to see an explanation of the numbers that went into the calculation.
- Click on `predict` to see a list of predictive metrics that directly extend the graph based on trained ML algorithms.

## API Integration
This application integrates with the CoinGecko API to fetch real-time cryptocurrency data. The API endpoints used include:
- `/coins/{id}/market_chart?vs_currency=usd&days={days}`: Fetches market chart data for a specific coin.
- `/coins/{id}`: Fetches detailed information about a specific coin.

## Contributing
Contributions are welcome! If you have suggestions for improvements or features, please fork the repository and submit a pull request.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

Feel free to reach out if you have any questions or need further assistance!
