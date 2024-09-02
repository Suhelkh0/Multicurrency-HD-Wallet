const API_KEY = '6e419d54-cc6b-4701-b90b-a1c89fcef389';
const ETH_NODE_URL = 'eth-sepolia.nownodes.io';
const ETH_EXPLORER_URL = 'https://ethbook-sepolia.nownodes.io';

const LTC_NODE_URL = 'https://ltc-testnet.nownodes.io/v1';
const LTC_EXPLORER_URL = 'https://ltcbook-testnet.nownodes.io/v1';

// Function to create or restore an account
function createOrRestoreAccount(mnemonic, coin) {
  let url, nodeUrl;
  
  if (coin === 'ETH') {
    url = `${ETH_NODE_URL}/account/create?mnemonic=${mnemonic}&coin=${coin}&key=${API_KEY}`;
    nodeUrl = ETH_NODE_URL;
  } else if (coin === 'LTC') {
    url = `${LTC_NODE_URL}/account/create?mnemonic=${mnemonic}&coin=${coin}&key=${API_KEY}`;
    nodeUrl = LTC_NODE_URL;
  } else {
    throw new Error('Invalid coin specified');
  }

  return fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        return {
          address: data.data.address,
          nodeUrl: nodeUrl
        };
      } else {
        throw new Error(data.error);
      }
    });
}

// Function to check balances
function checkBalances(coin, nodeUrl) {
  let url;

  if (coin === 'ETH') {
    url = `${ETH_NODE_URL}/account/balance?coin=${coin}&key=${API_KEY}`;
  } else if (coin === 'LTC') {
    url = `${LTC_NODE_URL}/account/balance?coin=${coin}&key=${API_KEY}`;
  } else {
    throw new Error('Invalid coin specified');
  }

  return fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        const balances = data.data.balances;
        return balances;
      } else {
        throw new Error(data.error);
      }
    });
}

// Function to send a signed transaction
function sendSignedTransaction(coin, recipient, amount, nodeUrl) {
  let url;

  if (coin === 'ETH') {
    url = `${ETH_NODE_URL}/transaction/send?coin=${coin}&recipient=${recipient}&amount=${amount}&key=${API_KEY}`;
  } else if (coin === 'LTC') {
    url = `${LTC_NODE_URL}/transaction/send?coin=${coin}&recipient=${recipient}&amount=${amount}&key=${API_KEY}`;
  } else {
    throw new Error('Invalid coin specified');
  }

  return fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        return data.data.txid;
      } else {
        throw new Error(data.error);
      }
    });
}
  
  // Function to send an Ethereum transaction using MetaMask
  function sendETHTransaction(toAddress, amountInEther) { 
    var allUsers = JSON.parse(localStorage.getItem('userData')) || [];
    var loggedInUser = allUsers.find(user => user.isLoggedIn);
    var password = loggedInUser ? loggedInUser.password : null;

    if (!password) {
        document.getElementById('transactionStatus').innerText = "No logged in user found";
        return;
    }

    var senderAddress = loggedInUser.address.toLowerCase();
    var recipientAddress = toAddress.toLowerCase();

    if (senderAddress === recipientAddress) {
        document.getElementById('transactionStatus').innerText = "Cannot send to yourself";
        return;
    }

    var serializedKeystore = loggedInUser.serializedKeystore;
    var ks = lightwallet.keystore.deserialize(serializedKeystore);
    ks.keyFromPassword(password, function (err, pwDerivedKey) {
        if (err) throw err;
        var privateKey = ks.exportPrivateKey(loggedInUser.address, pwDerivedKey);
        var account = web3.eth.accounts.privateKeyToAccount(privateKey);
        web3.eth.accounts.wallet.add(account);

        var transactionParams = {
            from: account.address,
            to: toAddress,
            value: web3.utils.toWei(amountInEther.toString(), "ether"),
            gas: 21000,
            gasPrice: 54340000000
        };

        web3.eth.sendTransaction(transactionParams)
            .on('transactionHash', function(hash) {
                console.log("Transaction sent successfully. Transaction hash: ", hash);
                var etherscanUrl = `https://sepolia.etherscan.io/tx/${hash}`;
                document.getElementById('transactionStatus').innerHTML = `Transaction sent successfully.<br>Transaction hash: <a href="${etherscanUrl}" target="_blank">${hash}</a>`;

                var transactionDetails = {
                    hash: hash,
                    from: account.address,
                    to: toAddress,
                    value: amountInEther,
                    type: "ETH",
                    etherscanUrl: etherscanUrl // Save the Etherscan URL
                };

                if(!loggedInUser.transactions) {
                    loggedInUser.transactions = [];
                }
    
                loggedInUser.transactions.push(transactionDetails);
                localStorage.setItem('userData', JSON.stringify(allUsers));

                var ToUser = allUsers.find(user => user.address === toAddress);
                if (ToUser && !ToUser.transactions) {
                    ToUser.transactions = [];
                }
                if (ToUser) {
                    ToUser.transactions.push(transactionDetails);
                }
                localStorage.setItem('userData', JSON.stringify(allUsers));
            })
            .on('error', function(error){
                console.error(error);
                document.getElementById('transactionStatus').innerText = "Transaction failed. Not enough funds to complete transaction";
            });
    });
}

  
// Function to display transaction history
function displayTransactionHistory(coin, nodeUrl) {
  getTransactionHistory(coin, nodeUrl)
    .then(transactions => {
      const transactionListElement = document.getElementById('transactionList');
      transactionListElement.innerHTML = '';

      transactions.forEach(transaction => {
        const transactionElement = document.createElement('div');
        transactionElement.classList.add('transaction');
        transactionElement.innerHTML = `
          <h3>Transaction ID: ${transaction.txid}</h3>
          <p>Amount: ${transaction.amount}</p>
          <p>Sender: ${transaction.sender}</p>
          <p>Recipient: ${transaction.recipient}</p>
          <p>Timestamp: ${transaction.timestamp}</p>
        `;

        transactionListElement.appendChild(transactionElement);
      });
    })
    .catch(error => {
      console.error('Failed to fetch transaction history:', error);
    });
}


