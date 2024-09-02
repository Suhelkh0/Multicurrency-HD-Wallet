// Initialize web3 with Infura 
var web3 = new Web3('https://sepolia.infura.io/v3/252ec9128c584fe787f89433dd383828');  //thats goerli api used for texting 
var web3OPT = new Web3('https://polygon-mainnet.infura.io/v3/252ec9128c584fe787f89433dd383828'); // we used avalanche c chain fuji to test avalanche we can replace it with the main net

var createAccountForm = document.getElementById('createAccountForm');  // listener method
if (createAccountForm) {
    createAccountForm.addEventListener('submit', function (event) {
        event.preventDefault();
        createAccount();
    });
}


//create a new account to use the wallet
function createAccount() {              
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;
    var seedPhrase = lightwallet.keystore.generateRandomSeed();

    lightwallet.keystore.createVault({
        password: password,
        seedPhrase: seedPhrase,
        hdPathString: "m/44'/60'/0'/0"
    }, function (err, keyStore) {  
        if (err) throw err;

        keyStore.keyFromPassword(password, function (err, pwDerivedKey) {
            if (err) throw err;
            keyStore.generateNewAddress(pwDerivedKey, 1);
            var addr = keyStore.getAddresses()[0];

            var userData = {
                username: username,
                password: password,
                address: addr,
                seedPhrase: seedPhrase,
                isLoggedIn: true,
                serializedKeystore: keyStore.serialize(),
                transactions: [] 

            };

           //get all the users from LocalStorage    
            var allUsers = JSON.parse(localStorage.getItem('userData')) || [];

            // Check if the username already exists
    var existingUser = allUsers.find(user => user.username === username);
    if (existingUser) {
        document.getElementById('accountAddress').innerText = 'A user with this username already exists. Please choose a different username.';
        return;
    }


            //if there's user logged in do not let creating acc
            var loggedInUser = allUsers.find(user => user.isLoggedIn);
            if (loggedInUser) {
                document.getElementById('accountAddress').innerText = 'You are already logged in. Logout before creating a new account.';
                return;
            }

           //Saves the new added user in localStorage
            allUsers.push(userData);
            localStorage.setItem('userData', JSON.stringify(allUsers));

            document.getElementById('accountAddress').innerText = 'Username: ' + username + ', Account Address: ' + addr;
            document.getElementById('seedPhraseDisplay').innerText = seedPhrase; // Display the seed phrase
        });
    });
}


 // login function

function login() { 
    var username = document.getElementById('loginUsername').value;
    var password = document.getElementById('loginPassword').value;
    var loginResult = document.getElementById('loginResult');
    var loginButton = document.getElementById('submit');

   

    var allUsers = JSON.parse(localStorage.getItem('userData')) || [];

    
    // If any user is logged in already, prevent new login
    var loggedInUser = allUsers.find(user => user.isLoggedIn);
    if (loggedInUser) {
        loginResult.innerText = 'Another user is already logged in. Logout before logging in.';
        return;
    }

    var user = allUsers.find(user => user.username === username && user.password === password);  // check if its the correct username and password

    if (!user) {
        loginResult.innerText = 'Invalid Username or Password';
        return;
    }

    showLoginPopup("Login Successful. Redirecting...");
            setTimeout(function () {
                window.location.href = 'HomePage.html';
            }, 2000);
            user.isLoggedIn = true;
            localStorage.setItem('userData', JSON.stringify(allUsers));
       
    
}

function showLoginPopup(message) {
    var popup = document.createElement("div");
    popup.classList.add("loginPopup");
    popup.innerText = message;

    document.body.appendChild(popup);

    setTimeout(function() {
        popup.style.display = "none";
    }, 2000);
}


function logOut() { // logout 
    var allUsers = JSON.parse(localStorage.getItem('userData')) || [];

    // Find the logged in user and set isLoggedIn to false
    var loggedInUser = allUsers.find(user => user.isLoggedIn);

    
    if (loggedInUser) {
        loggedInUser.isLoggedIn = false;
    }
    

    // Update the localStorage
    localStorage.setItem('userData', JSON.stringify(allUsers));

    window.location.href = 'index.html';  // redirect to LogInPage page
}

async function getUserBalance() {  // display the user balance on the home(index2) page for ETH 
    var allUsers = JSON.parse(localStorage.getItem('userData')) || [];
    var loggedInUser = allUsers.find(user => user.isLoggedIn);

    if (!loggedInUser) {
        console.log('No logged in user found');
        return;
    }

    let balanceWei = await web3.eth.getBalance(loggedInUser.address);
    let balanceEth = web3.utils.fromWei(balanceWei, 'ether');
    
    console.log("Balance: ", balanceEth);
    document.getElementById('walletBalance').innerText = `${balanceEth} ETH`;
}

async function getUserBalance2() {  // display the user balance on the home(index2) page for OPT
    var allUsers = JSON.parse(localStorage.getItem('userData')) || [];
    var loggedInUser = allUsers.find(user => user.isLoggedIn);

    if (!loggedInUser) {
        console.log('No logged in user found');
        return;
    }

    let balanceWei = await web3OPT.eth.getBalance(loggedInUser.address);
    let balancePOL = web3OPT.utils.fromWei(balanceWei, 'wei');
    
    console.log("Balance: ", balancePOL);
    document.getElementById('walletBalancePOL').innerText = `${balancePOL} POLYGON`;
}

// This function gets the address of the currently logged in user
function getLoggedInUserAddress() {
    var allUsers = JSON.parse(localStorage.getItem('userData')) || [];
    var loggedInUser = allUsers.find(user => user.isLoggedIn);

    if (!loggedInUser) {
        console.log('No logged in user found');
        return;
    }

    var walletAddressElement = document.getElementById('walletAddress');
    if (walletAddressElement) {
        console.log("User Address: ", loggedInUser.address);
        walletAddressElement.innerText = ` ${loggedInUser.address}`;
    } else {
        console.error('Element with ID "walletAddress" not found');
    }
}



function checkLoginStatus() {
    var allUsers = JSON.parse(localStorage.getItem('userData')) || [];
    var loggedInUser = allUsers.find(user => user.isLoggedIn);

    var signInLink = document.getElementById('signInLink');
    var signOutButton = document.getElementById('signOutButton');

    if (loggedInUser) {
        if (signInLink) {
            signInLink.style.display = 'none'; // Hide Sign In button
        }
        if (signOutButton) {
            signOutButton.style.display = 'block'; // Ensure Sign Out button is visible
        }
        getLoggedInUserAddress();
        getUserBalance();
    } else {
        if (signInLink) {
            signInLink.style.display = 'block'; // Show Sign In button if not logged in
        }
        if (signOutButton) {
            signOutButton.style.display = 'none'; // Hide Sign Out button if not logged in
        }
    }
}




function sendPOLYGONTransaction(toAddress, amountInEther) {
    var allUsers = JSON.parse(localStorage.getItem('userData')) || [];
    var loggedInUser = allUsers.find(user => user.isLoggedIn);
    var password = loggedInUser ? loggedInUser.password : null;

    if (!password) {
        console.log('No logged in user found');
        return;
    }

    var serializedKeystore = loggedInUser.serializedKeystore;
    var ks = lightwallet.keystore.deserialize(serializedKeystore);

    ks.keyFromPassword(password, function (err, pwDerivedKey) {
        if (err) throw err;

        var privateKey = ks.exportPrivateKey(loggedInUser.address, pwDerivedKey);
        var account = web3OPT.eth.accounts.privateKeyToAccount(privateKey);
        web3OPT.eth.accounts.wallet.add(account);

        var transactionParams = {
            from: account.address,
            to: toAddress,
            value: web3OPT.utils.toWei(amountInEther.toString(), "ether"),
            gas: 21000,
            gasPrice: 54340000000
        };

        web3OPT.eth.sendTransaction(transactionParams)
            .on('transactionHash', function(hash){
                console.log("Transaction sent successfully. Transaction hash: ", hash);
                document.getElementById('transactionStatus').innerText = "Transaction sent successfully. Transaction hash: " + hash;

                // Create the Etherscan URL (or Polygon equivalent)
                var etherscanUrl = `https://sepolia.etherscan.io/tx/${hash}`;
                console.log("Etherscan URL: ", etherscanUrl);

                var transactionDetails = {
                    hash: hash,
                    from: account.address,
                    to: toAddress,
                    value: amountInEther,
                    type: "POLYGON",
                    etherscanUrl: etherscanUrl // Store the URL in the transaction details
                };
    
                if(!loggedInUser.transactions) {
                    loggedInUser.transactions = [];
                }
    
                loggedInUser.transactions.push(transactionDetails);

                // Display the Etherscan URL
                var transactionResultDiv = document.getElementById('transactionResult');
                transactionResultDiv.innerHTML = `<p>Transaction Hash: <a href="${etherscanUrl}" target="_blank">${hash}</a></p>`;

                localStorage.setItem('userData', JSON.stringify(allUsers));
            })
            .on('error', function(error){
                console.error(error);
                document.getElementById('transactionStatus').innerText = "Transaction failed. Not enough funds to complete transaction";
            });
    });
}


function showTransactionPopup(title, message) {
    var popup = document.createElement("div");
    popup.classList.add("popup");

    var popupContent = document.createElement("div");
    popupContent.classList.add("popup-content");

    var popupTitle = document.createElement("h2");
    popupTitle.innerText = title;

    var popupMessage = document.createElement("p");
    popupMessage.innerText = message;

    var closeButton = document.createElement("button");
    closeButton.innerText = "OK";
    closeButton.onclick = function() {
        popup.style.display = "none";
    };

    popupContent.appendChild(popupTitle);
    popupContent.appendChild(popupMessage);
    popupContent.appendChild(closeButton);
    popup.appendChild(popupContent);

    document.body.appendChild(popup);
}




function sendCoins(event) {  // this function interacts with the html send coins page 
    event.preventDefault(); // prevent form from being submitted normally

    var toAddress = document.getElementById('recipient').value; // get account
    var amountInEther = document.getElementById('amount').value; // get amount
    var coinType = document.getElementById('coin').value; //get coin type

    // depending on which type of coin to choose the specific transaction function for that coin
    if (coinType === 'ETH') {
        sendETHTransaction(toAddress, amountInEther);
    } else if (coinType === 'POLYGON') {
        sendPOLYGONTransaction(toAddress, amountInEther);
    }
}

function getCryptoPrices() {  
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum,matic-network&vs_currencies=usd')
        .then(response => response.json())
        .then(data => {
            const ethPrice = data.ethereum.usd;
            document.getElementById('ethPrice').innerText = `${ethPrice} USD`;
            const polygonPrice = data['matic-network'].usd; // Use 'matic-network' for Polygon
            document.getElementById('polygonPrice').innerText = `${polygonPrice} USD`;
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}



//displays transaction in ( transaction history)
function fetchTransactions() { 
    var allUsers = JSON.parse(localStorage.getItem('userData')) || [];
    var loggedInUser = allUsers.find(user => user.isLoggedIn);

    if (!loggedInUser) {
        console.log('No logged in user found');
        return;
    }

    let transactionList = document.querySelector("#transactionList");
    let transactions = loggedInUser.transactions;

    if (transactions && transactions.length) {
        transactions.forEach((tx) => {
            let transactionElement = document.createElement('div');
            transactionElement.innerHTML = `
                <p><b>Transaction</b></p>
                <p><b>Hash:</b> ${tx.hash}</p>
                <p><b>From:</b> ${tx.from}</p>
                <p><b>To:</b> ${tx.to}</p>
                <p><b>Amount:</b> ${tx.value} ${tx.type}</p>
                <p><b>Timestamp:</b> ${tx.timestamp}</p>
                <p><b>Details:</b> <a href="${tx.link}" target="_blank">Click here to view transaction</a></p>
                <br/>
            `;
            transactionList.appendChild(transactionElement);
        });
    } else {
        console.log('No transactions found for this user');
    }
}



function restoreAccount(seedPhraseInput) {
    // Retrieve all the users from localStorage
    var allUsers = JSON.parse(localStorage.getItem('userData')) || [];

    // Check if there is a user currently logged in
    var loggedInUser = allUsers.find(user => user.isLoggedIn);
    if (loggedInUser) {
        return 'A user is already logged in. Please log out before restoring another account.';
    }

    // Find the user whose seed phrase matches the input seed phrase
    var user = allUsers.find(user => user.seedPhrase === seedPhraseInput.trim());

    if (user) {
        var newPassword = document.getElementById('newPassword').value;

        // Create a new vault with the provided seed phrase and new password
        lightwallet.keystore.createVault({
            password: newPassword,
            seedPhrase: seedPhraseInput.trim(),
            hdPathString: "m/44'/60'/0'/0"
        }, function (err, keyStore) {
            if (err) throw err;

            keyStore.keyFromPassword(newPassword, function (err, pwDerivedKey) {
                if (err) throw err;

                // Generate a new address
                keyStore.generateNewAddress(pwDerivedKey, 1);
                var addr = keyStore.getAddresses()[0];

                // Update the user data with the new password and serialized keystore
                user.password = newPassword;
                user.address = addr;
                user.serializedKeystore = keyStore.serialize();
                // user.isLoggedIn = true; // Do not log the user in automatically

                // Save the updated user data back to localStorage
                localStorage.setItem('userData', JSON.stringify(allUsers));

                document.getElementById('errorMsg').innerText = 'Account restored successfully! Please log in to access your account.';
            });
        });
    } else {
        document.getElementById('errorMsg').innerText = 'No user found with the given seed phrase.';
    }
}




