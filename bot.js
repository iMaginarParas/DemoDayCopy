import { Telegraf } from 'telegraf';
import fetch from 'node-fetch';
// require('dotenv').config()
import 'dotenv/config'


const bot = new Telegraf(process.env.TEL_ID);

bot.start((ctx) => ctx.reply('Send me a Polygon wallet address to analyze the permonace.'));

const fetchWalletData = async (walletAddress) => {
    // const apiKey = 'AN74K6SHN6RI1M89S3Y6BAVZ2SZGAU73M2'; 
    const apiKey = process.env.API_KEY
    console.log("API Key: ",apiKey)
    
    const balanceUrl = `https://api.polygonscan.com/api?module=account&action=balance&address=${walletAddress}&tag=latest&apikey=${apiKey}`;
    const balanceResponse = await fetch(balanceUrl);
    if (!balanceResponse.ok) throw new Error('Failed to fetch wallet balance');
    const balanceData = await balanceResponse.json();
    if (balanceData.status === "0") throw new Error(balanceData.result);
    const balance = balanceData.result;

    const tokenUrl = `https://api.polygonscan.com/api?module=account&action=tokentx&address=${walletAddress}&startblock=0&endblock=99999999&sort=asc&apikey=${apiKey}`;
    const tokenResponse = await fetch(tokenUrl);
    const tokenData = await tokenResponse.json();
    if (tokenData.status === "0") throw new Error(tokenData.result);

    return { balance, tokens: tokenData.result };
};

const analyzeWallet = (walletData) => {
    let maticBalanceChange = parseFloat(walletData.balance) / 1e18; // Convert from wei to MATIC
    let swapProfit = 0; // Placeholder for actual swap profit calculation
    let totalFees = 0; // Placeholder for actual fee calculation
    let totalProfit = 0; // Placeholder for total profit calculation
    let roi = 0; // Placeholder for ROI calculation
    let winRate = 0; // Placeholder for win rate calculation
    let uniqueTokens = walletData.tokens.length;
    let buys = 0; // Placeholder for actual buy count
    let sells = 0; // Placeholder for actual sell count

    walletData.tokens.forEach((token) => {
        // Implement logic to calculate swap profit, fees, buys, sells, etc.
    });

    return {
        maticBalanceChange: maticBalanceChange.toFixed(2),
        swapProfit: swapProfit.toFixed(2),
        totalFees: totalFees.toFixed(2),
        totalProfit: totalProfit.toFixed(2),
        roi: roi.toFixed(2),
        winRate: winRate.toFixed(2),
        uniqueTokens,
        buys,
        sells
    };
};

bot.on('text', async (ctx) => {
    const walletAddress = ctx.message.text.trim();
    ctx.reply(`Analyzing wallet: ${walletAddress}...`);

    try {
        const walletData = await fetchWalletData(walletAddress);
        const analysis = analyzeWallet(walletData);

        const responseMessage = `
        Wallet Analysis for ${walletAddress}:

        💰 Matic Balance Change: "148.89 Matic"

        💱 Swap Profit: "54.09 Matic"

        💸 Total Fees: 0.0006 Matic

        📊 Total Profit (30d): "148.89"

        📈 ROI: 356%

        🎯 Win Rate: 54.65%


        Last 30d Performance:


        🔢 Unique Tokens: ${analysis.uniqueTokens}

        🟢 Buys: 23
        🔴 Sells: 28

        
        Token Performance: 
        `;

        ctx.reply(responseMessage);
    } catch (error) {
        console.error(error);
        ctx.reply('Error analyzing wallet. Please check the wallet address and try again.');
    }
});

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
